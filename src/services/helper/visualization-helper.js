
import unicore from '@/services/unicore';
import visualizationConfig from '@/assets/visualization-config';
import store from '@/services/store';
import collabHelper from '@/services/helper/collab-helper';

// TODO: merge with analaysis_helper getFilesToCopy
async function getFilesToCopy(filesURL) {
  const files = await unicore.getFilesList(filesURL);
  const avoidFilesList = visualizationConfig.filesToAvoidCopy;

  const allowed = [];
  files.children.forEach((file) => {
    // remove the '/'
    const fileName = file.substr(1);
    // allowed if was not found
    const found = avoidFilesList.find(avoidFile => fileName.indexOf(avoidFile) !== -1);
    if (!found) { allowed.push(fileName); }
  });
  return allowed;
}

async function pollingVizIp() {
  console.debug('Polling visualization VM IP');
  const lastCharactersToken = store.state.token.substr(-15);

  try {
    const ip = await collabHelper.getIpByName(`${lastCharactersToken}.txt`);
    console.debug('IP', ip);
    window.open(`http://${ip}/?host=${ip}:8200`, '_blank');
  } catch (e) {
    console.debug('VM IP not found. Retrying...');
    setTimeout(() => pollingVizIp(), store.state.pollInterval);
  }
}

async function submitVisualization(simulationDetails) {
  console.debug('Start submit visualization');
  const vizConfig = visualizationConfig[store.state.currentComputer];

  const files = await getFilesToCopy(`${simulationDetails.workingDirectory}/files`);

  const computerUrl = unicore.getComputeProviders()[store.state.currentComputer].url;
  const originalSM = computerUrl.replace('rest/core', 'services/StorageManagement?res=');
  const originalWorkId = simulationDetails.workingDirectory.split('/').pop();

  vizConfig.imports = files.map(fileName => ({
    From: `BFT:${originalSM}${originalWorkId}#/${fileName}`,
    To: fileName,
  }));

  vizConfig.computerSelected = vizConfig.to;
  vizConfig.projectSelected = store.state.userGroup;
  vizConfig.title = `${visualizationConfig.jobNamePrefix} ${simulationDetails.name}`;

  const backupGroup = store.state.userGroup;
  store.commit('setUserGroup', null);
  await unicore.submitJob(vizConfig, []);
  pollingVizIp();
  store.commit('setUserGroupTmp', backupGroup);
}

export default {};

export { submitVisualization };
