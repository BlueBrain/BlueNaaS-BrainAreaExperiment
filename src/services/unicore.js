
import axios from 'axios';
import find from 'lodash/find';
import get from 'lodash/get';
import cleanDeep from 'clean-deep';

import computeProvider from '@/common/compute-provider.json';
import store from '@/services/store';
import db from '@/services/db';
import simulationConfig from '@/config/simulation-config';

const axiosInstance = axios.create({
  headers: {
    'X-Custom-Header': 'foobar',
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

function actionJob(actionURL) {
  // initiate some actions like start, restart, abort
  return axiosInstance({
    url: actionURL,
    method: 'post',
    data: JSON.stringify({}),
  });
}

function getInfoByUrl(transferUrl) {
  return axiosInstance(transferUrl);
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
    data: JSON.stringify({}),
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
  const unicoreURL = getComputeProviders()[computer.toUpperCase()].url;
  try {
    const response = await axiosInstance(`${unicoreURL}/jobs`);
    return response.data.jobs;
  } catch (error) {
    console.error(error);
    throw new Error('Error getting all jobs for list');
  }
}

async function getJobProperties(jobURL, userGroup) {
  let result = await db.getJobByUrl(jobURL);
  let jobInfo = null;
  if (!result) {
    try {
      jobInfo = await getInfoByUrl(jobURL, userGroup);
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
    return response.data;
  } catch (e) {
    return {};
  }
}

async function populateJobsWithFiles(jobsListUrl) {
  // get the information of some jobs asociated with key + the children

  async function expandInfo(jobUrl) {
    const jobExapandedInfo = await getJobProperties(jobUrl);
    if (!jobExapandedInfo) return {};
    const workingDirectory = get(jobExapandedInfo, '_links.workingDirectory.href');
    const url = `${workingDirectory}/files`;

    if (
      jobExapandedInfo.isSimulation ||
      jobExapandedInfo.isAnalysis ||
      jobExapandedInfo.isVisualization ||
      jobExapandedInfo.isOther
    ) {
      /*
       * to have this flag means we already have loaded the files and
       * apply the filters to know that is a simulation (from filterOnlySimulations function)
       */
      return jobExapandedInfo;
    }
    const fileList = await getFilesList(url);

    if (fileList) {
      jobExapandedInfo.children = fileList.children || [];
    }

    return jobExapandedInfo;
  }

  const promesesList = jobsListUrl.map(expandInfo);
  const expandedJob = await Promise.all(promesesList);
  return expandedJob;
}

function getFiles(jobURL) {
  return axiosInstance({
    url: jobURL,
    method: 'get',
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

  function getPartition() {
    function filterPartition(partitionsMap, userGroup) {
      const partitions = Object.keys(partitionsMap);
      const selectedProject = partitions.find(partition => userGroup.includes(partition));
      const selectedPartition = partitionsMap[selectedProject];
      return selectedPartition;
    }
    const partitionsMap = simulationConfig[configParams.computerSelected].partitions;
    if (!partitionsMap) return null;
    return filterPartition(partitionsMap, store.state.userGroup);
  }

  function getExecutable() {
    return configParams.executable || '/bin/bash input.sh';
  }

  function getEnvironment() {
    const environment = {};
    if (configParams.computerSelected !== 'NUVLA') return environment;

    if (!configParams.imports) {
      // is a simulation
      environment.NUVLA__worker__multiplicity = configParams.nodes;
    } else if (configParams.plotsConfig) {
      // is analysis
    } else {
      // is visualization
      environment.NUVLA__compute__collab_oidc = store.state.token;
      environment.NUVLA__compute__collab_id = store.state.collabIdForViz;
    }
    return environment;
  }

  function getNodes() {
    // avoid setting nodes for test job submission
    return configParams.runtime < 300 ? null : configParams.nodes;
  }

  function getNodeType() {
    // multicore or gpu node
    const { nodeType } = simulationConfig[store.state.currentComputer];
    return nodeType;
  }

  function getMemory() {
    if (configParams.runtime < 300) return null; // assumption is for test job submission
    const { memory } = simulationConfig[store.state.currentComputer];
    return memory ? `${memory}M` : null;
  }

  // generate and remove the nulls
  const jobSpec = cleanDeep({
    Name: configParams.title || 'unnamed job',
    Executable: getExecutable(),
    Environment: getEnvironment(),
    Arguments: [],
    Parameters: {
      UC_PREFER_INTERACTIVE_EXECUTION: configParams.isViz,
    },
    haveClientStageIn: 'true',
    Resources: {
      Nodes: getNodes(),
      Runtime: configParams.runtime,
      Queue: getPartition(),
      NodeConstraints: getNodeType(),
      Memory: getMemory(),
    },
    Imports: configParams.imports,
  });
  return jobSpec;
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
  const computer = getComputeProviders()[store.state.currentComputer.toUpperCase()].url;
  const url = `${computer}/jobs/${jobId}`;
  return getJobProperties(url);
}

async function submitJob(runConfig, inputs = [], startLater = false) {
  /**
    * runConfig {computer, project }
    *
    * inputs [{ To: '', Data: '' }]
    */
  const newRunConfig = runConfig;

  newRunConfig.computerSelected = runConfig.computerSelected.toUpperCase();
  const unicoreURL = getComputeProviders()[newRunConfig.computerSelected].url;

  try {
    const launchParams = await generateUnicoreConfig(newRunConfig);
    const job = await createJob(unicoreURL, launchParams);

    const jobURL = job.headers.location;
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

function importPersonalSimulation(title, simFolderPath) {
  const executable = simulationConfig.importSimulationScript
    .replace('SIMFOLDERPATH', simFolderPath);
  const config = {
    computerSelected: store.state.currentComputer,
    runtime: 100,
    executable,
    title,
  };
  const files = [{ To: 'wasImported', Data: '' }];
  // save this file to differentiate this one with the rest of the external jobs
  return submitJob(config, files);
}

export default {
  getAssociatedLocation,
  deleteJob,
  deleteJobFromAssociatedFile,
  uploadData,
  submitJob,
  actionJob,
  getComputeProviders,
  populateJobsWithFiles,
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
};

export {
  urlToComputerAndId,
  getComputeProviders,
  getFiles,
  importPersonalSimulation,
  populateJobsWithFiles,
  axiosInstance,
  setAxiosToken,
};
