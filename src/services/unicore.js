
import axios from 'axios';
import find from 'lodash/find';
import get from 'lodash/get';
import map from 'lodash/map';
import cleanDeep from 'clean-deep';
import prettyBytes from 'pretty-bytes';

import computeProvider from '@/common/compute-provider';
import store from '@/services/store';
import db, { getAuth } from '@/services/db';
import { getDate3YearFromNow } from '@/common/utils';
import { jobTags, addTag } from '@/common/job-status';
import { errorMessages, computers } from '@/common/constants';

const NOT_FOUND = 404;

const axiosInstance = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    post: {
      'Content-Type': 'application/json',
    },
    put: {
      'Content-Type': 'application/octet-stream',
    },
  },
});

function init() {
  axiosInstance.interceptors.request.use((config) => {
    // Do something before request is sent
    const newConfig = config;

    if (store.state.userGroupTmp) {
      // used for temporal calls (when work with multiple user accounts in the same operation)
      newConfig.headers['X-UNICORE-User-Preferences'] = `group:${store.state.userGroupTmp}`;
    } else if (store.state.userGroup && store.state.userGroup !== '*') {
      newConfig.headers['X-UNICORE-User-Preferences'] = `group:${store.state.userGroup}`;
    }

    // Download a file
    if (
      newConfig.url.includes('/core/storages/') &&
      !newConfig.url.endsWith('/files') &&
      !newConfig.url.endsWith('/files/') &&
      !newConfig.url.endsWith('uspace')
    ) {
      newConfig.headers.Accept = 'application/octet-stream';
    }

    // avoid sending param when ask for the user projects
    if (newConfig.url.endsWith('/rest/core')) {
      delete newConfig.headers['X-UNICORE-User-Preferences'];
    }

    if (newConfig.method === 'get') {
      if (store.state.list.httpReqSource) {
        const cancelToken = store.state.list.httpReqSource.token;
        newConfig.cancelToken = cancelToken;
      }
    }

    newConfig.headers.Authorization = getAuth();

    return newConfig;
  }, error => error);
}

init();

function setAxiosToken(token) {
  axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
}

function getComputeProviders() {
  return computeProvider;
}

function getComputerUrl(computerName) {
  return get(getComputeProviders(), `[${computerName.toUpperCase()}].url`);
}

function getImportUrl(computerName) {
  const computeUrl = computerName === computers.SERVICE_ACCOUNT
    ? getComputerUrl(computers.PIZ_DAINT)
    : getComputerUrl(computerName);
  return `${computeUrl}/storages`;
}

function actionJob(actionURL) {
  // initiate some actions like start, restart, abort
  return axiosInstance({
    url: actionURL,
    method: 'post',
    data: JSON.stringify({}),
  });
}

function getInfoByUrl(url) {
  return axiosInstance.get(url);
}

function urlToComputerAndId(jobURL) {
  if (!jobURL) return {};
  const result = find(getComputeProviders(), elem => jobURL.startsWith(elem.url));

  const m = jobURL.match(new RegExp('/rest/core/jobs/(.*)'));
  return { computer: result.id, id: m[1] };
}

function getProjectSelectedByLog(log) {
  /* this will search for the user that submitted the job
   * so we are able to get the files from that user * */

  function testRegex(reg) {
    const m = (log[2].match(reg));
    if (m && m.length > 1) return m[1];
    return false;
  }

  // get active or the default
  const activeGroup = new RegExp('gids.*active=(.+),');
  return testRegex(activeGroup);
}

function createJob(url, jobDefinition) {
  return axiosInstance({
    url: `${url}/jobs`,
    method: 'post',
    data: JSON.stringify(jobDefinition),
  });
}

async function deleteJob(url) {
  await axiosInstance({
    url,
    method: 'delete',
  })
    .catch((error) => {
      // if not found continue and delete it from the local storage
      if (!error.response || error.response.status !== NOT_FOUND) {
        throw error;
      }
    });
  return db.deleteJob(url);
}

function uploadData(dataToUpload, uploadURL) {
  const data = dataToUpload.Data;
  const target = dataToUpload.To;
  return axiosInstance({
    url: `${uploadURL}/${target}`,
    method: 'put',
    data,
  });
}

async function getAllJobs(computer) {
  const unicoreURL = getComputerUrl(computer);
  let response;
  try {
    response = await axiosInstance(`${unicoreURL}/jobs`);
  } catch (error) {
    if (error.message !== errorMessages.CANCELED_REQUEST) {
      throw new Error('getting all jobs for list');
    }
    return null;
  }
  return response.data.jobs;
}

async function getSimUrls(computer, circuit) {
  const unicoreURL = getComputerUrl(computer);
  // get sims only for this specific circuit
  const tagList = [jobTags.SIMULATION, circuit];
  if (jobTags.UNICORE_MODE_TAG) tagList.push(jobTags.UNICORE_MODE_TAG);

  const queryStr = `tags=${tagList.join(',')}`;
  let response;
  try {
    // retrieve the simulations with tags
    response = await axiosInstance(`${unicoreURL}/jobs?${queryStr}`);
  } catch (error) {
    if (error.message !== errorMessages.CANCELED_REQUEST) {
      throw new Error('getting all jobs for list');
    }
    return null;
  }
  return get(response, 'data.jobs', []);
}

async function getJobProperties(jobURL) {
  let result = await db.getJobByUrl(jobURL);
  let jobInfo = null;
  if (!result) {
    try {
      jobInfo = await getInfoByUrl(jobURL);
    } catch (e) {
      return null;
    }
    result = jobInfo.data;
    result.id = urlToComputerAndId(result._links.self.href).id;
    db.addJob(result);
  }
  return result;
}

async function getFilesList(jobURL) {
  try {
    const response = await getInfoByUrl(jobURL);
    const filesObj = get(response, 'data.content', {});
    return Object.keys(filesObj);
  } catch (e) {
    return [];
  }
}

async function getFilesWithSizes(jobURL) {
  let filesInfoResponse = [];

  try {
    filesInfoResponse = await getInfoByUrl(jobURL);
  } catch (e) {
    filesInfoResponse = [];
  }

  const files = get(filesInfoResponse, 'data.content', []);
  const filesWithSize = map(files, (value, key) => ({
    name: key.substr(1),
    size: prettyBytes(value.size), // use KB, MB
    rawSize: value.size, // size in bytes
  }));

  return filesWithSize;
}

function getJobPhysicalLocation(log) {
  const regexp = /TSI_USPACE_DIR (.*)/;
  const matchesStr = log.find(logLine => logLine.match(regexp));
  if (!matchesStr) return null;
  const [, location] = matchesStr.match(regexp);
  return location;
}

async function getAndSetChildren(jobInfo, force = false) {
  // if already have info in localstorage do not fetch it
  if (!force && jobInfo.wasClassified) return;

  const workingDirectory = get(jobInfo, '_links.workingDirectory.href');
  const url = `${workingDirectory}/files`;

  const fileList = await getFilesList(url);

  /* eslint-disable no-param-reassign */
  jobInfo.children = fileList;
}

async function populateJobsUrlWithFiles(jobsListUrl) {
  // get the information of some jobs asociated with key + the children
  async function expandInfo(jobUrl) {
    const jobExapandedInfo = await getJobProperties(jobUrl);
    if (!jobExapandedInfo) return {};

    // to have this flag means we already have loaded / classify the job with files
    if (jobExapandedInfo.wasClassified) return jobExapandedInfo;
    await getAndSetChildren(jobExapandedInfo);
    return jobExapandedInfo;
  }
  const promesesList = jobsListUrl.map(expandInfo);
  const expandedJob = await Promise.all(promesesList);
  return expandedJob;
}

function getFiles(jobURL) {
  return axiosInstance.get(jobURL, {
    responseType: 'blob',
  })
    .then(r => (r.data))
    .catch((e) => { throw new Error(`getFiles ${e}`); });
}

async function blobToObject(fileContent) {
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        resolve(evt.target.result);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsText(file);
    });
  }

  function convertTextToObject(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return {};
    }
  }

  const resultText = await readFile(fileContent);

  const resultObject = convertTextToObject(resultText);

  return resultObject;
}

async function getAssociatedLocation(connectionFileName, workingDirectory) {
  const url = `${workingDirectory}/files/${connectionFileName}`;
  try {
    const resultBlob = await getFiles(url);
    return await blobToObject(resultBlob);
  } catch (e) {
    // even if the file is not there it will be updated later
    return [];
  }
}

async function deleteJobFromAssociatedFile(simulationWorkDir, idToDelete, connectionFileName) {
  const associationFile = await getAssociatedLocation(connectionFileName, simulationWorkDir);
  const newAssociationFile = [];
  if (associationFile) {
    associationFile.forEach((oldAnalysis) => {
      const oldId = oldAnalysis._links.self.href.split('/').pop();
      if (oldId !== idToDelete) {
        newAssociationFile.push(oldAnalysis);
      }
    });
  }
  // mapping in simulation the analysis path.
  const input = {
    To: connectionFileName,
    Data: JSON.stringify(newAssociationFile),
  };
  // upload the analysis_path.json file
  await uploadData(input, `${simulationWorkDir}/files`);
}

async function generateUnicoreConfig(configParams) {
  /**
    * @params
    *   configParams { runtime, title, nodes, computerSelected, projectSelected }
    */
  const simStaticParams = store.state.fullConfig.simulationConfig;

  function getPartition() {
    if (configParams.computerSelected === computers.PIZ_DAINT) {
      return 'normal';
    }
    function filterPartition(partitionsMap, userGroup) {
      const partitions = Object.keys(partitionsMap);
      const selectedProject = partitions.find(partition => userGroup.includes(partition));
      const selectedPartition = partitionsMap[selectedProject];
      return selectedPartition;
    }
    const partitionsMap = configParams.partitions || simStaticParams.partitions;
    if (!partitionsMap) return null;
    return filterPartition(partitionsMap, store.state.userGroup);
  }

  function getNodes() {
    // avoid setting nodes for test job submission
    if (configParams.nodes === 0) return null;
    return configParams.runtime < 200 ? null : configParams.nodes;
  }

  function getMemory() {
    if (configParams.runtime < 200) return null; // assumption is for test job submission
    const { memory } = simStaticParams;
    return memory ? `${memory}M` : null;
  }

  function getAccount() {
    if (store.state.fullConfig.computer === computers.BB5_MOOC) {
      return configParams.accountSelected || simStaticParams.account;
    }
    if (configParams.computerSelected === computers.PIZ_DAINT) {
      return 'ich002';
    }
    return configParams.accountSelected || null;
  }

  const nodes = getNodes();
  // generate jobSpecs and remove the nulls
  return cleanDeep({
    Name: configParams.title || 'unnamed job',
    Executable: configParams.executable || '/bin/bash input.sh',
    Arguments: [],
    haveClientStageIn: 'true',
    Resources: {
      Nodes: nodes,
      Runtime: configParams.runtime,
      NodeConstraints: simStaticParams.nodeType,
      Memory: getMemory(),
      Queue: getPartition(),
      Project: getAccount(),
      QoS: configParams.qos || simStaticParams.qos || null,
    },
    Tags: configParams.tags,
    Imports: configParams.imports,
  });
}

async function getImage(imageURL) {
  try {
    const response = await axiosInstance({
      url: imageURL,
      method: 'get',
      responseType: 'blob',
    });
    // convert blob to Image
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        resolve(reader.result);
      }, false);
      reader.readAsDataURL(response.data);
    });
  } catch (e) {
    return false;
  }
}

function getJobById(jobId) {
  const computer = getComputerUrl(store.state.fullConfig.computer);
  const url = `${computer}/jobs/${jobId}`;
  return getJobProperties(url);
}

function updateDeletionDate(jobURL) {
  const futureDate = getDate3YearFromNow();
  // converting from "2019-04-29T14:22:28.320Z" to "2019-04-29 14:22"
  const terminationTime = futureDate.toISOString()
    .replace('T', ' ')
    .replace(/:[0-9][0-9]\..+/, '');

  return axiosInstance({
    url: jobURL,
    method: 'put',
    data: { terminationTime },
  })
    .catch((e) => { throw new Error(`update termination date ${e}`); });
}

async function submitJob(runConfig, inputs = [], startLater = false) {
  /**
    * runConfig {computerSelected, projectSelected, ... }
    *
    * inputs [{ To: '', Data: '' }]
    */
  const newRunConfig = runConfig;
  const unicoreURL = getComputerUrl(newRunConfig.computerSelected);

  try {
    const launchParams = await generateUnicoreConfig(newRunConfig);
    const job = await createJob(unicoreURL, launchParams);

    const jobURL = job.headers.location;
    if (!jobURL) throw new Error('Location not present on response headers');
    await updateDeletionDate(jobURL);
    const jobProperties = await getJobProperties(jobURL);
    /* eslint-disable no-underscore-dangle */
    const workingDirectory = jobProperties._links.workingDirectory.href;
    const actionStartURL = jobProperties._links['action:start'].href;
    /* eslint-enable no-underscore-dangle */

    // upload all the inputs
    await Promise.all(inputs.map(input => uploadData(input, `${workingDirectory}/files`)));

    // make it compatible with the job structure
    const jobDetails = {
      _links: {
        self: {
          href: jobURL,
        },
        workingDirectory: {
          href: workingDirectory,
        },
        'action:start': {
          href: actionStartURL,
        },
      },
    };

    // avoid starting the job directly
    if (startLater) {
      return jobDetails;
    }

    await actionJob(actionStartURL);
    return jobDetails;
  } catch (err) {
    throw new Error(`Submit job ${err}`);
  }
}

async function workingDirToMachinePath(workingDirectory) {
  try {
    const response = await axiosInstance(workingDirectory);
    return response.data.mountPoint;
  } catch (e) {
    return Promise.reject(new Error('no mount point'));
  }
}

function importPersonalSimulation(title, simFolderPath, account = null) {
  const executable = store.state.fullConfig.simulationConfig.genericSimulationConfig.importSimulationScript
    .replace(/SIMFOLDERPATH/g, simFolderPath);
  const config = {
    computerSelected: store.state.fullConfig.computer,
    runtime: 500,
    nodes: 1,
    accountSelected: account,
    executable,
    title,
  };

  addTag(config, jobTags.SIMULATION);
  addTag(config, store.state.fullConfig.circuitName);
  addTag(config, jobTags.SIMULATION_IMPORTED);
  addTag(config, jobTags.UNICORE_MODE_TAG);

  return submitJob(config);
}

function getHttpReqSource() {
  const { CancelToken } = axios;
  const httpReqSource = CancelToken.source();
  return httpReqSource;
}

async function tokenIsValid() {
  const computerEndpoint = getComputerUrl(store.state.fullConfig.computer);
  const info = await axiosInstance(computerEndpoint).catch(() => {
    throw Error(errorMessages.EDX_TOKEN_EXPIRED);
  });
  if (!info || info.status !== 200) throw new Error();
  return true;
}

export default {
  axiosInstance,
  getAssociatedLocation,
  deleteJob,
  deleteJobFromAssociatedFile,
  uploadData,
  submitJob,
  actionJob,
  populateJobsUrlWithFiles,
  getComputerUrl,
  getJobById,
  getJobProperties,
  getFiles,
  getFilesList,
  getImage,
  urlToComputerAndId,
  getProjectSelectedByLog,
  getInfoByUrl,
  workingDirToMachinePath,
  getAllJobs,
  getHttpReqSource,
  getSimUrls,
  getAndSetChildren,
  getFilesWithSizes,
  getJobPhysicalLocation,
  generateUnicoreConfig,
  getImportUrl,
};

export {
  urlToComputerAndId,
  getComputerUrl,
  getFiles,
  importPersonalSimulation,
  populateJobsUrlWithFiles,
  axiosInstance,
  tokenIsValid,
  setAxiosToken,
  getJobPhysicalLocation,
};
