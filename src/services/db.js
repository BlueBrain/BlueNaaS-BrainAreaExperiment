
import localforage from 'localforage';

import packageJson from '@/../package.json';
import { urlToComputerAndId } from '@/services/unicore';
import { jobStatus } from '@/assets/job-status';
import store from '@/services/store';

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

function deleteJob(combinedId) {
  console.log('[db] Deleting job from DB...');
  return localforage.removeItem(combinedId);
}

async function addJob(jobInfo) {
  function createIdAndDetails(job) {
    const id = job.id || urlToComputerAndId(job._links.self.href).id;
    const computer = job.computer || urlToComputerAndId(job._links.self.href).computer;
    const project = store.state.userProject;
    const uniqueId = id + computer + project;
    return {
      id: uniqueId,
      details: job,
    };
  }
  if (
    jobInfo.status === jobStatus.successful ||
    jobInfo.status === jobStatus.failed
  ) {
    const jobToSave = createIdAndDetails(jobInfo);
    console.debug('[db] Creating new job in DB...');
    await localforage.setItem(jobToSave.id, jobToSave.details);
  }
}

function getJobByUrl(url) {
  const info = urlToComputerAndId(url);
  return getJob(info.id + info.computer + store.state.userProject);
}

async function saveSimConfiguration(bc, unicore) {
  try {
    await localforage.setItem('simConfig', { bc, unicore });
  } catch (err) {
    console.error('saving configuration', err);
  }
}

async function retrievePreviousConfig() {
  return await localforage.getItem('simConfig') || {};
}

function cleanPreviousConfig() {
  return localforage.removeItem('simConfig');
}

export default {
  addJob,
  getJob,
  getJobByUrl,
  saveSimConfiguration,
  retrievePreviousConfig,
  deleteJob,
  cleanPreviousConfig,
};

/* eslint-enable no-underscore-dangle */