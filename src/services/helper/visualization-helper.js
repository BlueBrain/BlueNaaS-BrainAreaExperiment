
import unicore from '@/services/unicore';
import visualizationConfig from '@/config/visualization-config';
import store from '@/services/store';
import collabHelper from '@/services/helper/collab-helper';
import eventBus from '@/services/event-bus';
import { jobTags, addTag } from '@/common/job-status';

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

async function pollingVizIp() {
  const lastCharactersToken = store.state.token.substr(-15);

  try {
    const ip = await collabHelper.getIpByName(store.state.collabIdForViz, `${lastCharactersToken}.txt`);
    eventBus.$emit('viz-ready', ip);
  } catch (e) {
    setTimeout(() => pollingVizIp(), store.state.pollInterval);
  }
}

async function submitVisualization(simulationDetails) {
  const vizConfig = visualizationConfig[store.state.fullConfig.computer];

  const files = await getFilesToCopy(`${simulationDetails.workingDirectory}/files`);
  if (!files) throw new Error('Error getting files for visualization');

  const computerUrl = unicore.getComputerUrl(store.state.fullConfig.computer);
  const originalSM = computerUrl.replace('rest/core', 'services/StorageManagement?res=');
  const originalWorkId = simulationDetails.workingDirectory.split('/').pop();

  vizConfig.imports = files.map(fileName => ({
    From: `BFT:${originalSM}${originalWorkId}#/${fileName}`,
    To: fileName,
  }));

  vizConfig.computerSelected = vizConfig.to;
  vizConfig.projectSelected = store.state.userGroup;
  vizConfig.title = `${visualizationConfig.jobNamePrefix} ${simulationDetails.name}`;

  addTag(vizConfig, jobTags.VISUALIZATION);

  await unicore.submitJob(vizConfig, []);
  pollingVizIp();
}

export default {};

export { submitVisualization };
