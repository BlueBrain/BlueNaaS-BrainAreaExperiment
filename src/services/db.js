
import localforage from 'localforage';
import packageJson from '@/../package.json';
import { urlToComputerAndId } from '@/services/unicore';
import { jobStatus } from '@/common/job-status';
import { getComputerProjectCircuitCombo } from '@/common/utils';
import { storageConstants } from '@/common/constants';
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

function getSavedComputerAndMappings(circuit) {
  // not using the store because at the begining store is not ready and I need this to instanciate it
  const computerSaved = localStorage.getItem(`${storageConstants.COMPUTER_PREFIX}-${circuit}`);
  const groupSaved = localStorage.getItem(`${storageConstants.GROUP_PREFIX}-${circuit}`);
  const computerUserGroupsMap = localStorage.getItem(`${storageConstants.MAPPING_PREFIX}-${circuit}`) || '';
  return { computerSaved, groupSaved, computerUserGroupsMap };
}

function setSavedComputerAndMappings(computer, currentGroup, groupsAvailable) {
  const circuit = store.state.fullConfig.circuitName;
  localStorage.setItem(`${storageConstants.COMPUTER_PREFIX}-${circuit}`, computer);
  localStorage.setItem(`${storageConstants.GROUP_PREFIX}-${circuit}`, currentGroup);
  localStorage.setItem(`${storageConstants.MAPPING_PREFIX}-${circuit}`, `${computer}-${groupsAvailable}`);
}

export function setAuth(userAuth) {
  localStorage.setItem(storageConstants.AUTH, userAuth);
}

export function getAuth() {
  return localStorage.getItem(storageConstants.AUTH);
}

export function setSavedUrl(url) {
  localStorage.setItem(storageConstants.SAVED_URL, url);
}

export function getSavedUrl() {
  return localStorage.getItem(storageConstants.SAVED_URL);
}

export default {
  addJob,
  getJob,
  getJobByUrl,
  getAllJobsSortedList,
  setAllJobsSortedList,
  deleteJob,
  getSavedConfig,
  setSavedConfig,
  getSavedComputerAndMappings,
  setSavedComputerAndMappings,
};

export {
  getSavedComputerAndMappings,
  setSavedComputerAndMappings,
};

/* eslint-enable no-underscore-dangle */
