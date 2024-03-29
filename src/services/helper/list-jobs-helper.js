
import Vue from 'vue';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import difference from 'lodash/difference';
import last from 'lodash/last';
import unicore from '@/services/unicore';
import analysisConfig from '@/config/analysis-config';
import { jobStatus, isRunning } from '@/common/job-status';
import { getComputerUrlCombo } from '@/common/utils';
import { errorMessages } from '@/common/constants';
import db from '@/services/db';
import store from '@/services/store';


async function analysisProducedResults(analysisWithFiles) {
  const analysisWDUrl = get(analysisWithFiles, '_links.workingDirectory.href');
  const imagesList = analysisWithFiles.children.filter(file => file.endsWith('.png'));
  const configFileBlob = await unicore.getFiles(`${analysisWDUrl}/files/${analysisConfig.configFileName}`);
  const configFileJson = await new Response(configFileBlob).json();
  // TODO: remove this backward compatibility of configFileJson.plots_config
  let imgReqCount = Object.keys(configFileJson.basic_plots_config || configFileJson.plots_config).length;
  imgReqCount += get(configFileJson, 'lfp_plots_config.points.length', 0);
  return imgReqCount === imagesList.length;
}

function simulationProducedResults(simulationWithFiles) {
  const simulationFiles = simulationWithFiles.children;
  return simulationFiles.includes('/out.dat');
}

async function getSimulationUrlList() {
  const networkJobUrls = await unicore.getSimUrls(store.state.fullConfig.computer, store.state.fullConfig.circuitName);

  if (!networkJobUrls) return null; // error in the network

  // compare saved list and sorted list
  const savedJobUrls = await db.getAllJobsSortedList() || [];

  let listToFetch = [];
  // sorting with lodash to avoid mutation

  if (!savedJobUrls.length) {
    return networkJobUrls;
  }

  // use saved
  listToFetch = savedJobUrls;
  // if new jobs
  const newJobsArray = difference(networkJobUrls, savedJobUrls);
  if (newJobsArray.length) {
    console.debug('New jobs found', newJobsArray.length);
    listToFetch = newJobsArray.concat(savedJobUrls);
  }
  // if jobs were deleted
  const removedJobsArray = difference(savedJobUrls, networkJobUrls);
  if (listToFetch.length && removedJobsArray.length) {
    console.debug('Removing deleted jobs from list', removedJobsArray);
    removedJobsArray.forEach((removedJob) => {
      listToFetch.splice(listToFetch.indexOf(removedJob), 1);
      unicore.deleteJob(removedJob);
    });
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
  // fetch job information and if it's running use polling until it ends
  const jobToUpdate = analysisInfo || simulationJob;
  const jobUrl = get(jobToUpdate, '_links.self.href');
  const updateJobInfo = await unicore.getJobProperties(jobUrl);

  if (!updateJobInfo) return;

  let newStatus = updateJobInfo.status;

  // already classified and saved
  if (updateJobInfo.wasClassified) {
    if (analysisInfo) Vue.set(simulationJob, 'analysisStatus', updateJobInfo.status);
    return;
  }

  if (isRunning(updateJobInfo.status)) {
    setTimeout(() => {
      // a way to stop polling when change computer
      if (paramCombo !== getComputerUrlCombo()) return;
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
  updatedSimulation.wasClassified = true;

  console.debug(`Classifying ${updatedSimulation.id} [${updatedSimulation.status}]`);
  db.addJob(updatedSimulation);
  return updatedSimulation;
}

async function getSimulationsWithFiles(cbEach) {
  // to know if the function should stop because the page changed
  const paramCombo = getComputerUrlCombo();
  const simulations = [];
  const allJobs = [];
  const jobsList = await getSimulationUrlList();

  if (!jobsList) return null;

  const promiseArray = jobsList.map(async (jobUrl) => {
    const jobInfo = await unicore.getJobProperties(jobUrl);
    if (!jobInfo) return;
    // if has wasClassified it is saved in localStorage
    if (!jobInfo.wasClassified) {
      await unicore.getAndSetChildren(jobInfo);
      // stop if page changed
      if (paramCombo !== getComputerUrlCombo()) return;
      classifyJob(jobInfo, paramCombo);
    }
    // TODO: this is a workaround until the queryparam fetch jobs with AND
    allJobs.push(jobInfo);
    if (!jobInfo.tags.includes(store.state.fullConfig.circuitName)) return;
    simulations.push(jobInfo);
    // if job is running poll the status
    if (isRunning(jobInfo.status)) { startReloadJob(jobInfo, paramCombo); }
    if (cbEach) { cbEach(jobInfo); }
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
        startReloadJob(simulationWithFiles, getComputerUrlCombo(), analysisInfo).catch((error) => {
          // this will prevent the error of cancel by user to be thrown more without catching it
          if (!error.message.includes(errorMessages.CANCELED_REQUEST)) {
            throw new Error(`Starting reload job ${error}`);
          }
          return null;
        });
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
