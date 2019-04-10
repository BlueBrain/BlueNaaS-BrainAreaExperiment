
import localforage from 'localforage';

import packageJson from '@/../package.json';
import { urlToComputerAndId } from '@/services/unicore';
import { jobStatus } from '@/common/job-status';
import store from '@/services/store';

function getSavedSimConfigName() {
  return `simConfig-${store.state.currentCircuit}`;
}

(function cleanStorage() {
  const savedVersion = localStorage.getItem('appVersion');
  if (savedVersion && savedVersion !== packageJson.version) {
    console.warn('Cleaning saved data due new application was release');
    localforage.clear();
    localStorage.clear();
  } else if (!savedVersion) {
    console.debug('App version', packageJson.version);
    localStorage.setItem('appVersion', packageJson.version);
  }
}());

/* eslint-disable no-underscore-dangle */

function getJob(combinedId) {
  return localforage.getItem(combinedId);
}

async function addJob(jobInfo) {
  function createIdAndDetails(job) {
    const id = job.id || urlToComputerAndId(job._links.self.href).id;
    const computer = job.computer || urlToComputerAndId(job._links.self.href).computer;
    const uniqueId = id + computer + store.state.userGroup;
    return {
      id: uniqueId,
      details: job,
    };
  }
  if (
    jobInfo.status === jobStatus.SUCCESSFUL ||
    jobInfo.status === jobStatus.FAILED
  ) {
    const jobToSave = createIdAndDetails(jobInfo);
    console.debug('[db] Creating new job in DB...');
    await localforage.setItem(jobToSave.id, jobToSave.details);
  }
}

function getJobByUrl(url) {
  const info = urlToComputerAndId(url);
  return getJob(info.id + info.computer + store.state.userGroup);
}

async function saveSimConfiguration(bc, unicore) {
  try {
    await localforage.setItem(getSavedSimConfigName(), { bc, unicore });
  } catch (err) {
    console.error('saving configuration', err);
  }
}

async function retrievePreviousConfig() {
  return await localforage.getItem(getSavedSimConfigName()) || {};
}

function cleanPreviousConfig() {
  return localforage.removeItem(getSavedSimConfigName());
}

function getAllJobsSortedList() {
  return localforage.getItem(`allJobsSorted${store.state.currentComputer}`);
}

function setAllJobsSortedList(jobUrlList) {
  return localforage.setItem(`allJobsSorted${store.state.currentComputer}`, jobUrlList);
}

function deleteJob(url) {
  const { id } = urlToComputerAndId(url);
  const combinedId = id + store.state.currentComputer + store.state.userGroup;
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

export default {
  addJob,
  getJob,
  getJobByUrl,
  getAllJobsSortedList,
  saveSimConfiguration,
  setAllJobsSortedList,
  retrievePreviousConfig,
  deleteJob,
  cleanPreviousConfig,
  saveCollabIdForViz,
  getCollabIdForViz,
};

/* eslint-enable no-underscore-dangle */
