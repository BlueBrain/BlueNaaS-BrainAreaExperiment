
import localforage from 'localforage';
import packageJson from '@/../package.json';
import { urlToComputerAndId } from '@/services/unicore';
import { jobStatus } from '@/common/job-status';
import { getComputerProjectCircuitCombo } from '@/common/utils';
import store from '@/services/store';


(function cleanStorage() {
  const savedVersion = localStorage.getItem('simUILauncherVersion');
  if (savedVersion && savedVersion !== packageJson.version) {
    console.warn('Cleaning saved data due new application was release');
    localforage.clear();
    localStorage.clear();
  } else if (!savedVersion) {
    console.debug('App version', packageJson.version);
    localStorage.setItem('simUILauncherVersion', packageJson.version);
  }
}());

/* eslint-disable no-underscore-dangle */

function getJob(combinedId) {
  return localforage.getItem(combinedId);
}

async function addJob(jobInfo) {
  function createIdAndDetails(job) {
    const id = job.id || urlToComputerAndId(job._links.self.href).id;
    const prefix = id;
    const uniqueId = getComputerProjectCircuitCombo(prefix);
    return {
      id: uniqueId,
      details: job,
    };
  }

  if (
    jobInfo.status !== jobStatus.SUCCESSFUL &&
    jobInfo.status !== jobStatus.FAILED
  ) { return; }

  const jobToSave = createIdAndDetails(jobInfo);
  console.debug('[db] Creating new job in DB...');
  await localforage.setItem(jobToSave.id, jobToSave.details);
}

function getJobByUrl(url) {
  const { id } = urlToComputerAndId(url);
  const prefix = id;
  return getJob(getComputerProjectCircuitCombo(prefix));
}

function getAllJobsSortedList() {
  const prefix = 'allJobsSorted';
  return localforage.getItem(getComputerProjectCircuitCombo(prefix));
}

function setAllJobsSortedList(jobUrlList) {
  const prefix = 'allJobsSorted';
  return localforage.setItem(getComputerProjectCircuitCombo(prefix), jobUrlList);
}

function deleteJob(url) {
  const { id } = urlToComputerAndId(url);
  const prefix = id;

  const combinedId = getComputerProjectCircuitCombo(prefix);
  getAllJobsSortedList().then((savedList) => {
    savedList.splice(savedList.findIndex(savedUrl => savedUrl === url), 1);
    setAllJobsSortedList(savedList);
  });
  return localforage.removeItem(combinedId);
}

function saveCollabIdForViz(collabId) {
  localforage.setItem('collabIdForViz', collabId);
}

function getCollabIdForViz() {
  return localforage.getItem('collabIdForViz');
}

function getConfigName(itemName) {
  return `sim-config-${store.state.fullConfig.circuitName}-${itemName}`;
}

function getSavedConfig(itemName) {
  const configName = getConfigName(itemName);
  return localforage.getItem(configName);
}

function setSavedConfig(itemName, params) {
  const configName = getConfigName(itemName);
  return localforage.setItem(configName, params);
}


export default {
  addJob,
  getJob,
  getJobByUrl,
  getAllJobsSortedList,
  setAllJobsSortedList,
  deleteJob,
  saveCollabIdForViz,
  getCollabIdForViz,
  getSavedConfig,
  setSavedConfig,
};

/* eslint-enable no-underscore-dangle */
