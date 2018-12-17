
import template from 'lodash/template';
import templateSettings from 'lodash/templateSettings';

import unicore from '@/services/unicore';
import analysisConfig from '@/assets/analysis-config';
import store from '@/services/store';

templateSettings.interpolate = /{{([\s\S]+?)}}/g;

async function generateUpdatedAssociatedFile(simulationWorkDirectory, analysisObject, userProject) {
  try {
    const associationFile = await unicore.getAssociatedLocation(
      analysisConfig.analysisConnectionFileName,
      simulationWorkDirectory,
    );
    const newAssociationFile = [];
    const analysisPath = analysisConfig.analysisConnectionFileName;
    associationFile.forEach((oldAnalysis) => {
      newAssociationFile.push(oldAnalysis);
    });
    newAssociationFile.push(analysisObject);
    // mapping in simulation the analysis path.
    const input = { To: analysisPath, Data: JSON.stringify(newAssociationFile) };
    // upload the analysis_path.json file
    console.debug('Uploading associationFile');
    return unicore.uploadData(input, `${simulationWorkDirectory}/files`, userProject);
  } catch (e) {
    return Promise.reject(e);
  }
}

async function getFilesToCopy(filesURL, userProject) {
  const files = await unicore.getFilesList(filesURL, userProject);
  const avoidFilesList = analysisConfig.filesToAvoidCopy;

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

async function submitAnalysis(analysisAndTransferInfo, script) {
  // TODO add transfer option
  /*
   *   Move files using Unicore API if needed and start the job.
   *   Returns one object with the information about transfer and the destination job
   *
   *   @param {Object} analysisAndTransferInfo
   *   {
   *     'from': {
   *       'workingDirectory' = origin job working directory
   *       'computer' = computer name e.g: JUQUEEN,
   *       'projectSelected' = userid of the project to launch job
   *     },
   *     'to': {} // same fields than from
   *     'nodes' = number of nodes used to run the analysis
   *     'title' = title of the job
   *   }
   */
  console.debug('Start submit analysis');

  // this bool will determine if the files will be copied or referenced
  const sameMachine = (analysisAndTransferInfo.from.computer === analysisAndTransferInfo.to.computer);
  const newAnalysisAndTransferInfo = analysisAndTransferInfo;
  newAnalysisAndTransferInfo.executable = analysisConfig[analysisAndTransferInfo.to.computer].executable;
  const { needsTransfer } = analysisConfig[analysisAndTransferInfo.to.computer];

  if (!sameMachine || needsTransfer) {
    /* ---------------------------------------------------------------------
     * Dependecy files for a new job
     * --------------------------------------------------------------------- */
    // get all the files to be copied
    console.debug('Getting files to be copied ...');
    const files = await getFilesToCopy(`${newAnalysisAndTransferInfo.from.workingDirectory}/files`);
    // const transferArrayProm = [];

    const siteUrl = unicore.getSites()[newAnalysisAndTransferInfo.from.computer.toUpperCase()].url;
    const originalSM = siteUrl.replace('rest/core', 'services/StorageManagement?res=');
    const originalWorkId = newAnalysisAndTransferInfo.from.workingDirectory.split('/').pop();

    const imports = files.map(fileName => ({
      From: `BFT:${originalSM}${originalWorkId}#/${fileName}`,
      To: fileName,
    }));
    newAnalysisAndTransferInfo.imports = imports;
  }

  /* ---------------------------------------------------------------------
   * Create analysis job
   * --------------------------------------------------------------------- */
  const analysisParamsConfig = {
    list_analysis: newAnalysisAndTransferInfo.checkedAnalysis,
    number_of_cells: newAnalysisAndTransferInfo.numberOfCells,
    target_analysis: newAnalysisAndTransferInfo.target,
    report_analysis: newAnalysisAndTransferInfo.reportForAnalysis,
  };
  const inputs = [
    { To: analysisConfig.configFileName, Data: analysisParamsConfig },
  ];
  console.debug('Submiting job...');
  // create a new job with analysis info but don't start it yet
  if (!sameMachine) {
    store.commit('setUserProjectTmp', analysisAndTransferInfo.to.projectSelected);
  }
  const startLater = true;
  const destinationJobObject = await unicore.submitJob(newAnalysisAndTransferInfo, inputs, startLater);
  console.debug('Job created');

  // fill the destination and pass it to transfer
  newAnalysisAndTransferInfo.to.workingDirectory = destinationJobObject._links.workingDirectory.href;

  const parallelRequests = [];

  if (script) {
    console.debug('[analysis-helper] Has script ... creating input.sh');

    /* ---------------------------------------------------------------------
     * Generate input.sh analysis script
     * --------------------------------------------------------------------- */
    let startAnalysisScript = '';
    const startScriptTemplate = template(script.join('\n'));
    if (sameMachine) {
      const originPath = await unicore.workingDirToMachinePath(newAnalysisAndTransferInfo.from.workingDirectory);
      const destinationPath = await unicore.workingDirToMachinePath(newAnalysisAndTransferInfo.to.workingDirectory);
      // replace blueconfig path and output path
      if (analysisAndTransferInfo.analizeNonUnicore && analysisAndTransferInfo.nonUnicoreSimPath) {
        startAnalysisScript = startScriptTemplate({
          ORIGIN: analysisAndTransferInfo.nonUnicoreSimPath,
          DESTINATION: destinationPath,
        });
      } else {
        startAnalysisScript = startScriptTemplate({
          ORIGIN: originPath,
          DESTINATION: destinationPath,
        });
      }
    } else {
      console.warn('Analysis in different machine');
      startAnalysisScript = startScriptTemplate({ ORIGIN: '.', DESTINATION: '.' });
    }

    /* ---------------------------------------------------------------------
     * Create file to start analysis
     * --------------------------------------------------------------------- */
    parallelRequests.push(unicore.uploadData(
      { To: 'input.sh', Data: startAnalysisScript },
      `${newAnalysisAndTransferInfo.to.workingDirectory}/files`,
      newAnalysisAndTransferInfo.to.projectSelected,
    ));
  } else {
    console.debug('[analysis-helper] No script. skipping input.sh');
  }
  // reset user project tmp
  if (store.state.userProjectTmp) { store.commit('setUserProjectTmp', null); }


  /* ---------------------------------------------------------------------
   * Create association file in the simulation
   * --------------------------------------------------------------------- */
  parallelRequests.push(generateUpdatedAssociatedFile(
    newAnalysisAndTransferInfo.from.workingDirectory,
    destinationJobObject,
    newAnalysisAndTransferInfo.from.projectSelected,
  ));

  await Promise.all(parallelRequests);

  const transfer = {};
  transfer.destinationJob = destinationJobObject;
  return transfer;
}

export default {
  submitAnalysis,
};
