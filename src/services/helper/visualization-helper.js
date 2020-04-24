
import get from 'lodash/get';
import unicore from '@/services/unicore';
import visualizationConfig from '@/config/visualization-config';
import store from '@/services/store';
import eventBus from '@/services/event-bus';
import { jobTags, addTag, jobStatus } from '@/common/job-status';
import { findCellsAmountByJobWD } from '@/services/helper/blueconfig-helper';

// TODO: merge with analaysis_helper getFilesToCopy
async function getFilesToCopy(filesURL) {
  const files = await unicore.getFilesList(filesURL);
  if (!files.length) return null;
  const avoidFilesList = visualizationConfig.filesToAvoidCopy;

  const allowed = [];

  files.forEach((file) => {
    // remove the '/'
    const fileName = file.substr(1);
    // allowed if was not found
    const found = avoidFilesList.find(avoidFile => fileName.indexOf(avoidFile) !== -1);
    if (!found) { allowed.push(fileName); }
  });
  return allowed;
}

async function getVizJobDetails(vizJobId) {
  const vizGeneralConfig = visualizationConfig[store.state.fullConfig.computer + store.state.fullConfig.circuitName];
  const statusUrl = `${vizGeneralConfig.endpoint}/status/${vizJobId}`;
  const response = await unicore.axiosInstance({
    url: statusUrl,
    method: 'get',
  });

  const jobDetails = get(response, 'data');
  return jobDetails;
}

async function pollingVizIp(vizJobId, vizUrl) {
  console.debug('Polling results until job is RUNNING...');
  const newJobProperties = await getVizJobDetails(vizJobId);
  const vizGeneralConfig = visualizationConfig[store.state.fullConfig.computer + store.state.fullConfig.circuitName];
  const filesEndpoint = `${vizGeneralConfig.endpoint}/storages/${vizJobId}`;
  if (jobStatus.RUNNING === newJobProperties.status) {
    console.debug('Visualization is RUNNING!');
    eventBus.$emit('viz-ready', {
      workingDir: filesEndpoint,
      vizUrl,
    });
  } else {
    console.debug('JOB is not ready', newJobProperties.status);
    setTimeout(() => pollingVizIp(vizJobId, vizUrl), store.state.pollInterval);
  }
}

async function registerVizJobToMiddleware(vizConfig, simulationId) {
  const vizGeneralConfig = visualizationConfig[store.state.fullConfig.computer + store.state.fullConfig.circuitName];
  const unicoreParams = await unicore.generateUnicoreConfig(vizConfig);
  const registerUrl = `${vizGeneralConfig.endpoint}/register`;
  const response = await unicore.axiosInstance({
    url: registerUrl,
    method: 'post',
    data: JSON.stringify({
      uuid: simulationId,
      token: store.state.token,
      unicore_params: unicoreParams,
      density: vizConfig.percentageToShow,
    }),
  });
  const data = get(response, 'data');
  console.log('Data:', data);
  return data;
}

function getPercentageToShow(targetCellsAmount) {
  const MAX_AMOUNT_TO_SHOW = 250;
  const perc = (MAX_AMOUNT_TO_SHOW / targetCellsAmount) * 100;
  return perc > 100 ? 100 : Math.round(perc);
}

async function submitVisualization(simulationDetails) {
  const vizConfig = visualizationConfig[store.state.fullConfig.computer + store.state.fullConfig.circuitName];
  const cells = await findCellsAmountByJobWD(simulationDetails.workingDirectory);
  vizConfig.percentageToShow = getPercentageToShow(cells);

  const files = await getFilesToCopy(`${simulationDetails.workingDirectory}/files`);
  if (!files) throw new Error('Error getting files for visualization');

  const computerUrl = unicore.getComputerUrl(store.state.fullConfig.computer);
  const originalSM = computerUrl.replace('rest/core', 'services/StorageManagement?res=');
  const originalWorkId = simulationDetails.workingDirectory.split('/').pop();

  vizConfig.imports = files.map(fileName => ({
    From: `BFT:${originalSM}${originalWorkId}#/${fileName}`,
    To: fileName,
  }));

  vizConfig.projectSelected = store.state.userGroup;
  vizConfig.computerSelected = store.state.fullConfig.computer;
  vizConfig.title = `${visualizationConfig.jobNamePrefix} ${simulationDetails.name}`;

  addTag(vizConfig, jobTags.VISUALIZATION);
  addTag(vizConfig, store.state.fullConfig.circuitName);

  const { job_id: vizJobId, viz_url: vizUrl } = await registerVizJobToMiddleware(vizConfig, simulationDetails.id);

  console.log('Visualization JOB:', vizJobId);

  pollingVizIp(vizJobId, vizUrl);
}

export default {};

export {
  submitVisualization,
};
