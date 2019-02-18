
import unicore from '@/services/unicore';
import Vue from 'vue';
import analysisConfig from '@/config/analysis-config';
import { jobStatus, isRunning } from '@/common/job-status';
import { getComputerProjectCombo } from '@/common/utils';
import db from '@/services/db';
import visualizationConfig from '@/config/visualization-config';
import store from '@/services/store';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import difference from 'lodash/difference';
import last from 'lodash/last';


async function analysisProducedResults(analysisWithFiles) {
  const analysisWDUrl = get(analysisWithFiles, '_links.workingDirectory.href');
  const imagesList = analysisWithFiles.children.filter(file => file.match('.png'));
  const configFileBlob = await unicore.getFiles(`${analysisWDUrl}/files/${analysisConfig.configFileName}`);
  const configFileJson = await new Response(configFileBlob).json();
  const analysisRequested = configFileJson.list_analysis.length;
  return analysisRequested === imagesList.length;
}

function simulationProducedResults(simulationWithFiles) {
  const simulationFiles = simulationWithFiles.children;
  const hasReport = simulationFiles.some(file => file.match('.bbp'));
  return simulationFiles.includes('/out.dat') && hasReport;
}

async function getUrlList() {
  const networkJobUrls = await unicore.getAllJobs(store.state.currentComputer);

  // compare saved list and sorted list
  const savedJobUrls = await db.getAllJobsSortedList() || [];

  let listToFetch = null;
  // sorting with lodash to avoid mutation
  if (savedJobUrls.length && isEqual(sortBy(networkJobUrls), sortBy(savedJobUrls))) {
    // use saved
    listToFetch = savedJobUrls;
  } else {
    const newJobsArray = difference(networkJobUrls, savedJobUrls);
    console.debug('New jobs found', newJobsArray.length);
    listToFetch = newJobsArray.concat(savedJobUrls);
  }
  return listToFetch;
}

async function startReloadJob(simulationJob, prevComputerProjectCombo, analysisInfo) {
  /* fetch job information and if it's running use polling until it ends */
  // when move to other page, cancel the refresh
  if (prevComputerProjectCombo !== getComputerProjectCombo()) return;

  const jobToUpdate = analysisInfo || simulationJob;
  const jobUrl = get(jobToUpdate, '_links.self.href');
  const updateJobInfo = await unicore.getJobProperties(jobUrl);

  // already classified and saved
  if (updateJobInfo.children) {
    if (analysisInfo) Vue.set(simulationJob, 'analysisStatus', updateJobInfo.status);
    return;
  }

  if (isRunning(updateJobInfo.status)) {
    setTimeout(() => {
      this.startReloadJob(simulationJob, prevComputerProjectCombo, analysisInfo);
    }, store.state.pollInterval);
    // upload icon in case status has changed
    if (analysisInfo) {
      if (updateJobInfo.status !== simulationJob.analysisStatus) {
        Vue.set(simulationJob, 'analysisStatus', updateJobInfo.status);
      }
    } else if (simulationJob.status !== updateJobInfo.status) {
      Vue.set(simulationJob, 'status', updateJobInfo.status);
    }
  } else {
    // after the simulation is finished check if the results were correct
    if (updateJobInfo.status !== jobStatus.successful) return;
    const [updatedJobWithFiles] = await unicore.populateJobsWithFiles([jobUrl]);
    const jobProducedResults = analysisInfo
      ? await analysisProducedResults(updatedJobWithFiles)
      : simulationProducedResults(updatedJobWithFiles);

    let newAnalysisStatus = null;
    let newSimulationStatus = updateJobInfo.status;

    if (analysisInfo) {
      if (!jobProducedResults) newAnalysisStatus = jobStatus.failed;
      else { newAnalysisStatus = jobStatus.successful; }
      Vue.set(simulationJob, 'analysisStatus', newAnalysisStatus);
    } else if (!jobProducedResults) {
      newSimulationStatus = jobStatus.failed;
      newAnalysisStatus = jobStatus.block;
      Vue.set(simulationJob, 'status', newSimulationStatus);
    }
    updatedJobWithFiles.analysisStatus = newAnalysisStatus;
    db.addJob(updatedJobWithFiles);
  }
}

function classifyJob(jobExpandedInfo) {
  const updatedSimulation = jobExpandedInfo;
  if (!Object.keys(updatedSimulation).length) return updatedSimulation;
  if (updatedSimulation.children.includes(`/${analysisConfig.configFileName}`)) {
    // it is an analysis that should be removed
    updatedSimulation.isAnalysis = true;
  } else if (updatedSimulation.name.startsWith(visualizationConfig.jobNamePrefix)) {
    updatedSimulation.isVisualization = true;
  } else if (updatedSimulation.children.includes('/BlueConfig')) {
    updatedSimulation.isSimulation = true;
    if (
      !simulationProducedResults(updatedSimulation)
      && updatedSimulation.status === jobStatus.successful
    ) { // do not produce any output file - simulation failed
      updatedSimulation.status = jobStatus.failed;
    }
  } else if (updatedSimulation.children.includes('/wasImported')) {
    updatedSimulation.isSimulation = true;
    if (!isRunning(updatedSimulation.status)) updatedSimulation.status = jobStatus.failed;
  } else {
    // is another type of job run outside sim launcher ui. Not showing it.
    updatedSimulation.isOther = true;
  }
  db.addJob(updatedSimulation);
  console.debug(`Classifing ${updatedSimulation.id} [${!!updatedSimulation.isSimulation}]`);
  return updatedSimulation;
}

function filterOnlySimulations(jobsWithFiles) {
  // return job information and a list of files as children []
  const displayEverything = localStorage.getItem('displayAll') === 'true';
  // 'hack' in case you want to see all the jobs not only simulation from one computer
  if (displayEverything) { console.warn('Using displayAll flag'); }
  const simulations = jobsWithFiles.filter((jobExpandedInfo) => {
    if (displayEverything) return true;
    if (jobExpandedInfo.isSimulation) return true;
    // when add a new condition remember to add also into populateJobsWithFiles
    if (
      jobExpandedInfo.isAnalysis
      || jobExpandedInfo.isVisualization
      || jobExpandedInfo.isOther
    ) return false;

    const updatedSimulation = classifyJob(jobExpandedInfo);
    const { isSimulation } = updatedSimulation;
    return isSimulation;
  });
  return simulations;
}

const saveFullJobList = (allJobWithFiles) => {
  const sortedAllJobWithFiles = sortBy(allJobWithFiles, 'submissionTime').reverse();
  const sortedJobsUrlToSave = sortedAllJobWithFiles.map(jobPopulated => get(jobPopulated, '_links.self.href'));
  if (!sortedJobsUrlToSave.length) return;
  db.setAllJobsSortedList(sortedJobsUrlToSave);
};

const fetchAnalysisInfo = async (simulationListWithFiles) => {
  const getAnalysisAndStatus = async (simulationWithFiles) => {
    let newAnalysisStatus = jobStatus.block;
    let analysisInfo = null;
    if (simulationWithFiles.status === jobStatus.successful) {
      /*
       * get the location of the analysis based on the mapping file
       * that we save in the simulation and then the validation image
       */
      const analysisArray = await unicore.getAssociatedLocation(
        analysisConfig.analysisConnectionFileName,
        get(simulationWithFiles, '_links.workingDirectory.href'),
      );

      analysisInfo = last(analysisArray);
      if (analysisArray.length) {
        // fetch and fill data. If is running will poll data
        startReloadJob(simulationWithFiles, getComputerProjectCombo(), analysisInfo);
        newAnalysisStatus = jobStatus.loading;
      } else {
        newAnalysisStatus = null;
      }
    }
    return {
      simulationWithFiles,
      newAnalysisStatus,
      analysisInfo,
    };
  };

  const analysisAndStatusInfoProm = simulationListWithFiles.map(getAnalysisAndStatus);
  const analysisAndStatusInfo = await Promise.all(analysisAndStatusInfoProm);
  return analysisAndStatusInfo;
};

export default {
  saveFullJobList,
  fetchAnalysisInfo,
  filterOnlySimulations,
  simulationProducedResults,
  analysisProducedResults,
  startReloadJob,
  getUrlList,
};

export {
  simulationProducedResults,
  analysisProducedResults,
};