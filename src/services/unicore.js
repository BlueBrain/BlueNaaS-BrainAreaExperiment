
import axios from 'axios';
import find from 'lodash/find';
import cleanDeep from 'clean-deep';

import sites from '@/assets/sites.json';
import store from '@/services/store';
import db from '@/services/db';
import simulationConfig from '@/assets/simulation-config';

function init() {
  axios.defaults.headers.common.Accept = 'application/json';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.put['Content-Type'] = 'application/octet-stream';

  axios.interceptors.request.use((config) => {
    // Do something before request is sent
    const newConfig = config;

    if (store.state.userProjectTmp) {
      console.warn('using temportal userProject');
      // used for temporal calls (when work with multiple user accounts in the same operation)
      newConfig.headers.common['X-UNICORE-User-Preferences'] = `group:${store.state.userProjectTmp}`;
    } else if (store.state.userProject) {
      newConfig.headers.common['X-UNICORE-User-Preferences'] = `group:${store.state.userProject}`;
    }

    // Download a file
    if (
      newConfig.url.includes('/core/storages/') &&
      !newConfig.url.endsWith('/files') &&
      !newConfig.url.endsWith('/files/') &&
      !newConfig.url.endsWith('uspace')
    ) {
      newConfig.headers.common.Accept = 'application/octet-stream';
    }

    // avoid sending param when ask for the user projects
    if (newConfig.url.endsWith('/rest/core')) {
      delete newConfig.headers.common['X-UNICORE-User-Preferences'];
    }

    return newConfig;
  }, error => error);
}
init();

function getSites() {
  return sites;
}

function getUser(site) {
  const unicoreURL = getSites()[site.toUpperCase()].url;
  return axios(unicoreURL).then(r => r.data);
}

function actionJob(actionURL) {
  // initiate some actions like start, restart, abort
  return axios({
    url: actionURL,
    method: 'post',
    data: JSON.stringify({}),
  });
}

function getInfoByUrl(transferUrl) {
  return axios(transferUrl);
}

function urlToComputerAndId(jobURL) {
  const result = find(getSites(), elem => jobURL.startsWith(elem.url));

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
  return axios({
    url: `${url}/jobs`,
    method: 'post',
    data: JSON.stringify(jobDefinition),
  });
}

async function deleteJob(url) {
  await axios({
    url,
    method: 'delete',
    data: JSON.stringify({}),
  });
  const { id } = urlToComputerAndId(url);
  console.debug('Removing from DB...', id);
  await db.deleteJob(id + store.state.currentComputer + store.state.userProject);
  console.debug('Removed from DB');
}

function uploadData(dataToUpload, uploadURL) {
  const data = dataToUpload.Data;
  const target = dataToUpload.To;
  return axios({
    url: `${uploadURL}/${target}`,
    method: 'put',
    data,
  });
}

async function getAllJobs(site) {
  const unicoreURL = getSites()[site.toUpperCase()].url;
  const response = await axios(`${unicoreURL}/jobs`);
  return response.data.jobs;
}

async function getJobProperties(jobURL, userProject) {
  let result = await db.getJobByUrl(jobURL);
  if (!result) {
    console.debug('Getting job from network');
    try {
      const job = await getInfoByUrl(jobURL, userProject);
      db.addJob(job.data);
      result = job.data;
    } catch (e) {
      return null;
    }
  } else {
    console.debug('Getting job from the DB');
  }
  return result;
}

async function getFilesList(jobURL) {
  try {
    const response = await getInfoByUrl(jobURL);
    return response.data;
  } catch (e) {
    console.error(`getting file list ${e}`);
    return {};
  }
}

async function getAllJobsExpandedWithChildren(site = store.state.currentComputer) {
  // get the information of all jobs asociated with key + the children
  const jobsListUrl = await getAllJobs(site);
  if (jobsListUrl.length <= 0) return [];

  async function expandInfo(jobUrl) {
    const { id } = urlToComputerAndId(jobUrl);
    const jobExapandedInfo = await getJobProperties(jobUrl);

    jobExapandedInfo.id = id;
    const url = `${jobExapandedInfo._links.workingDirectory.href}/files`;

    if (
      jobExapandedInfo.isSimulation ||
      jobExapandedInfo.isAnalysis ||
      jobExapandedInfo.isVisualization
    ) {
      /*
       * to have this flag means we already have loaded the files and
       * apply the filters to know that is a simulation (from filterOnlySimulations function)
       */
      return jobExapandedInfo;
    }
    console.debug('Retrieving files list', id);
    const fileList = await getFilesList(url);

    if (fileList) {
      jobExapandedInfo.children = fileList.children || [];
    }

    return jobExapandedInfo;
  }

  const promesesList = jobsListUrl.map(expandInfo);
  const expandedJob = await Promise.all(promesesList);
  console.debug('getAllJobsExpandedWithChildren DONE');
  return expandedJob;
}

function getFiles(jobURL) {
  return axios({
    url: jobURL,
    method: 'get',
    responseType: 'blob',
  })
    .then(r => (r.data))
    .catch((e) => { throw Error(`getFiles ${e}`); });
}

async function blobToObject(fileContent) {
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        resolve(evt.target.result);
      };
      reader.onerror = (err) => {
        console.error('Failed to read', file.name, 'due to', err);
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
  console.debug('Delete job from associationFile');
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
  console.debug('associationFile updated');
}

async function getUserProjects() {
  const userProjectsMap = localStorage.getItem('userProjectsMap') || '';
  if (
    store.state.currentComputer &&
    store.state.userProject &&
    (userProjectsMap.includes(store.state.userProject) &&
     userProjectsMap.includes(store.state.currentComputer))
  ) {
    const available = userProjectsMap.split('-')[1].split(',');
    console.debug('setup available projects from localStorage');
    store.commit('setUserProjectAvailable', available);
    return store.state.userProject;
  }

  console.debug('get user accounts from network');
  if (store.state.userProject && store.state.userProject !== 'null') {
    // reset user project to fetch information
    store.commit('setUserProject', null);
  }

  const userInfo = await getUser(store.state.currentComputer);
  if (!userInfo) {
    console.error('getUserProjects');
    return Promise.reject(new Error('retrieving projects for this computer'));
  }

  if (!userInfo.client.xlogin.availableGroups) {
    console.error('getting availableGroups');
    throw Error('Error getting available groups');
  }
  const projects = userInfo.client.xlogin.availableGroups.length ? userInfo.client.xlogin.availableGroups : [];
  store.commit('setUserProjectAvailable', projects);
  if (!store.state.userProject) {
    store.commit('setUserProject', store.state.userProjectsAvailable[0]);
  }

  // mapping projects available for a specific computer
  if (store.state.currentComputer && projects) {
    localStorage.setItem(
      'userProjectsMap',
      `${store.state.currentComputer}-${projects}`,
    );
  }

  return store.state.userProject;
}

async function generateUnicoreConfig(configParams) {
  /**
    * @params
    *   configParams { runtime, title, nodes, computerSelected, projectSelected }
    */

  function getPatition(computerSelected) {
    function filterPartition(partitionsMap, userProject) {
      const partitions = Object.keys(partitionsMap);
      const selectedProject = partitions.find(partition => userProject.indexOf(partition) >= 0);
      const selectedPartition = partitionsMap[selectedProject];
      console.debug('selectedPartition', selectedPartition);
      return selectedPartition;
    }

    const partitionsMap = simulationConfig[computerSelected].partitions;
    if (!partitionsMap) return null;
    return filterPartition(partitionsMap, store.state.userProject);
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
    } else if (configParams.numberOfCells) {
      // is analysis
    } else {
      // is visualization
      environment.NUVLA__compute__collab_oidc = store.state.token;
    }
    return environment;
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
      Nodes: configParams.nodes,
      Runtime: configParams.runtime,
      Queue: getPatition(configParams.computerSelected),
    },
    Imports: configParams.imports,
  });
  console.log('jobSpec', jobSpec);
  return jobSpec;
}

async function getImage(imageURL) {
  try {
    const response = await axios({
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
  const computer = store.state.currentComputer.toUpperCase();
  const site = getSites()[computer].url;
  const url = `${site}/jobs/${jobId}`;
  return getJobProperties(url);
}

async function submitJob(runConfig, inputs, startLater = false) {
  // TODO: these variables are now global for unicore. use submit job scope.
  /**
    * runConfig {computer, project }
    *
    * inputs [{ To: '', Data: '' }]
    */
  console.log('submitJob', runConfig);
  const newRunConfig = runConfig;

  newRunConfig.computerSelected = (runConfig.computerSelected || runConfig.to.computer).toUpperCase();
  // newRunConfig.userProject = runConfig.projectSelected || runConfig.to.projectSelected;
  const unicoreURL = getSites()[newRunConfig.computerSelected].url;

  try {
    const launchParams = await generateUnicoreConfig(newRunConfig);
    console.debug('creating job...');
    const job = await createJob(unicoreURL, launchParams);

    const jobURL = job.headers.location;
    console.debug('getting job properties...');
    const jobProperties = await getJobProperties(jobURL);
    /* eslint-disable no-underscore-dangle */
    const workingDirectory = jobProperties._links.workingDirectory.href;
    const actionStartURL = jobProperties._links['action:start'].href;
    /* eslint-enable no-underscore-dangle */

    // upload all the inputs
    await Promise.all(inputs.map((input) => {
      console.debug('uploading files...');
      return uploadData(input, `${workingDirectory}/files`);
    }));

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

    console.debug('starting job...');
    await actionJob(actionStartURL);
    return jobDetails;
  } catch (err) {
    console.error(err);
    throw Error(`Submit job ${err}`);
  }
}

async function workingDirToMachinePath(workingDirectory) {
  try {
    const response = await axios(workingDirectory);
    return response.data.mountPoint;
  } catch (e) {
    console.error(`getting workingDirToMachinePath ${e}`);
    return Promise.reject(new Error('no mount point'));
  }
}

function getComputersAvailableForCurrentModel() {
  // will filter the computers that actually can run the circuit
  console.log('getComputersAvailableForCurrentModel');
  const storedComputer = localStorage.getItem('userComputer');
  const computersCanRunCircuit = Object.keys(store.state.currentCircuitConfig.prefix);
  const computersAllowedToRun = simulationConfig.available.filter(computer => (
    computersCanRunCircuit.includes(computer)
  ));
  console.log('computersAllowedToRun', computersAllowedToRun);
  // const storedComputer = '';
  const computerToSet = computersAllowedToRun.includes(storedComputer) ? storedComputer : computersAllowedToRun[0];
  store.commit('setCurrentComputer', computerToSet);
  // localStorage.setItem('userComputer', computerToSet);
  return computersAllowedToRun;
}

export default {
  getAssociatedLocation,
  deleteJob,
  deleteJobFromAssociatedFile,
  uploadData,
  submitJob,
  actionJob,
  getSites,
  getAllJobsExpandedWithChildren,
  getJobById,
  getJobProperties,
  getFiles,
  getFilesList,
  getImage,
  getUser,
  urlToComputerAndId,
  getProjectSelectedByLog,
  getInfoByUrl,
  getUserProjects,
  workingDirToMachinePath,
};

export {
  getUser,
  getUserProjects,
  urlToComputerAndId,
  getComputersAvailableForCurrentModel,
};
