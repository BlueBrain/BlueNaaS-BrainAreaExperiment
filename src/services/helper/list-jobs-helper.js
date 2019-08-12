
import unicore from '@/services/unicore';
import Vue from 'vue';
import analysisConfig from '@/config/analysis-config';
import {
  jobStatus, isRunning,
} from '@/common/job-status';
import { getComputerUrlCombo } from '@/common/utils';
import db from '@/services/db';
import store from '@/services/store';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import difference from 'lodash/difference';
import last from 'lodash/last';


async function analysisProducedResults(analysisWithFiles) {
  const analysisWDUrl = get(analysisWithFiles, '_links.workingDirectory.href');
  const imagesList = analysisWithFiles.children.filter(file => file.endsWith('.png'));
  const configFileBlob = await unicore.getFiles(`${analysisWDUrl}/files/${analysisConfig.configFileName}`);
  const configFileJson = await new Response(configFileBlob).json();
  let imgReqCount = Object.keys(configFileJson.plots_config).length;
  imgReqCount += get(configFileJson, 'lfp_plots_config.points.length', 0);
  return imgReqCount === imagesList.length;
}

function simulationProducedResults(simulationWithFiles) {
  const simulationFiles = simulationWithFiles.children;
  return simulationFiles.includes('/out.dat');
}

async function getSimulationUrlList() {
  const networkJobUrls = await unicore.getSimUrls(store.state.currentComputer, store.state.currentCircuit);

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

function setJobStatus(simulationJob, isAnalysis, status) {
  // upload icon in case status has changed
  if (isAnalysis) {
    Vue.set(simulationJob, 'analysisStatus', status);
  } else {
    Vue.set(simulationJob, 'status', status);
    if (status === jobStatus.SUCCESSFUL) {
      // show no analysis was run yet
      Vue.set(simulationJob, 'analysisStatus', null);
    }
  }
}

async function startReloadJob(simulationJob, paramCombo, analysisInfo) {
  /* fetch job information and if it's running use polling until it ends */
  // when move to other page, cancel the refresh
  const jobToUpdate = analysisInfo || simulationJob;
  const jobUrl = get(jobToUpdate, '_links.self.href');
  const updateJobInfo = await unicore.getJobProperties(jobUrl);
  let newStatus = updateJobInfo.status;

  // already classified and saved
  if (updateJobInfo.children) {
    if (analysisInfo) Vue.set(simulationJob, 'analysisStatus', updateJobInfo.status);
    return;
  }

  if (isRunning(updateJobInfo.status)) {
    setTimeout(() => {
      if (paramCombo !== getComputerUrlCombo()) {
        // a way to stop polling when change computer
        return;
      }
      startReloadJob(simulationJob, paramCombo, analysisInfo);
    }, store.state.pollInterval);
  } else if (updateJobInfo.status === jobStatus.SUCCESSFUL) {
    // after the simulation or analysis is finished check if the results were correct
    const [updatedJobWithFiles] = await unicore.populateJobsUrlWithFiles([jobUrl]);
    const jobProducedResults = analysisInfo
      ? await analysisProducedResults(updatedJobWithFiles)
      : simulationProducedResults(updatedJobWithFiles);

    newStatus = jobProducedResults ? jobStatus.SUCCESSFUL : jobStatus.FAILED;
    updatedJobWithFiles.status = newStatus;
    db.addJob(updatedJobWithFiles);
  }
  setJobStatus(simulationJob, !!analysisInfo, newStatus);
}

function saveFullJobList(jobsWithFiles) {
  const sortedAllJobWithFiles = sortBy(jobsWithFiles, 'submissionTime').reverse();
  const sortedJobsUrlToSave = sortedAllJobWithFiles.map(jobPopulated => get(jobPopulated, '_links.self.href'));
  if (!sortedJobsUrlToSave.length || sortedJobsUrlToSave.includes(undefined)) return;
  db.setAllJobsSortedList(sortedJobsUrlToSave);
}

function classifyJob(jobExpandedInfo) {
  function getSimCorrectStatus(simulation) {
    if (
      !simulationProducedResults(simulation)
      && simulation.status === jobStatus.SUCCESSFUL
    ) { // do not produce any output file - simulation failed
      return jobStatus.FAILED;
    }
    return simulation.status;
  }

  const updatedSimulation = jobExpandedInfo;
  updatedSimulation.status = getSimCorrectStatus(updatedSimulation);

  console.debug(`Classifying ${updatedSimulation.id} [${updatedSimulation.status}]`);
  db.addJob(updatedSimulation);
  return updatedSimulation;
}

async function getSimulationsWithFiles(cbEach) {
  const simulations = [];
  const allJobs = [];
  const jobsList = await getSimulationUrlList();
  const promiseArray = jobsList.map(async (jobUrl) => {
    const jobInfo = await unicore.getJobProperties(jobUrl);
    // if has children it was already classified and saved in localStorage
    if (!jobInfo.children || !jobInfo.children.length) {
      await unicore.getAndSetChildren(jobInfo);
      classifyJob(jobInfo);
    }
    // TODO: this is a workaround until the queryparam fetch jobs with AND
    allJobs.push(jobInfo);
    if (!jobInfo.tags.includes(store.state.currentCircuit)) return false;
    simulations.push(jobInfo);
    // if job is running poll the status
    if (isRunning(jobInfo.status)) { startReloadJob(jobInfo, getComputerUrlCombo()); }
    if (cbEach) { cbEach(jobInfo); }
    return true;
  });

  await Promise.all(promiseArray);
  // save full list of all jobs sorted for compare next time
  saveFullJobList(allJobs);
  return simulations;
}

async function fetchAnalysisInfo(simulationListWithFiles, cbEach) {
  async function getAnalysisAndStatus(simulationWithFiles) {
    let newAnalysisStatus = jobStatus.BLOCK;
    let analysisInfo = null;
    if (simulationWithFiles.status === jobStatus.SUCCESSFUL) {
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
        startReloadJob(simulationWithFiles, getComputerUrlCombo(), analysisInfo);
        newAnalysisStatus = jobStatus.LOADING;
      } else {
        newAnalysisStatus = null;
      }
    }

    if (cbEach) cbEach(simulationWithFiles, newAnalysisStatus);

    const resultObj = {
      simulationWithFiles,
      newAnalysisStatus,
      analysisInfo,
    };

    return resultObj;
  }

  const analysisAndStatusInfoProm = simulationListWithFiles.map(getAnalysisAndStatus);
  const analysisAndStatusInfo = await Promise.all(analysisAndStatusInfoProm);
  return analysisAndStatusInfo;
}

export default {
  saveFullJobList,
  fetchAnalysisInfo,
  simulationProducedResults,
  analysisProducedResults,
  startReloadJob,
  getSimulationUrlList,
  getSimulationsWithFiles,
};

export {
  simulationProducedResults,
  analysisProducedResults,
};
