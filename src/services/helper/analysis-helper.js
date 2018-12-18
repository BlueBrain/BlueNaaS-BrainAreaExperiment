
import unicore from '@/services/unicore';
import analysisConfig from '@/assets/analysis-config';
import store from '@/services/store';


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
   *   Returns one object with the information about transfer and the destination job
   *
   *   @param {Object} analysisAndTransferInfo
   *   {
   *     'from': { 'workingDirectory' = origin job working directory },
   *     'computerSelected' = computer used for the analysis,
   *     'nodes' = number of nodes used to run the analysis
   *     'title' = title of the job
   *   }
   */
  console.debug('Start submit analysis');

  const newAnalysisAndTransferInfo = analysisAndTransferInfo;
  const computer = store.state.currentComputer;
  newAnalysisAndTransferInfo.executable = analysisConfig[computer].executable;

  // get all the files to be copied
  console.debug('Getting files to be copied ...');
  const filesToCopy = await getFilesToCopy(`${newAnalysisAndTransferInfo.from.workingDirectory}/files`);
  const siteUrl = unicore.getSites()[computer.toUpperCase()].url;
  const originalSM = siteUrl.replace('rest/core', 'services/StorageManagement?res=');
  const originalWorkId = newAnalysisAndTransferInfo.from.workingDirectory.split('/').pop();

  const imports = filesToCopy.map(fileName => ({
    From: `BFT:${originalSM}${originalWorkId}#/${fileName}`,
    To: fileName,
  }));
  newAnalysisAndTransferInfo.imports = imports;

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

  if (script) {
    console.debug('[analysis-helper] Has script ... creating input.sh');
    /* ---------------------------------------------------------------------
     * Create file to start analysis
     * --------------------------------------------------------------------- */
    inputs.push({ To: 'input.sh', Data: script.join('\n') });
  } else {
    console.debug('[analysis-helper] No script. skipping input.sh');
  }

  console.debug('Submiting job...');
  const destinationJobObject = await unicore.submitJob(newAnalysisAndTransferInfo, inputs);
  console.debug('Job created');

  /* ---------------------------------------------------------------------
   * Create association file in the simulation
   * --------------------------------------------------------------------- */
  await generateUpdatedAssociatedFile(newAnalysisAndTransferInfo.from.workingDirectory, destinationJobObject);

  return { destinationJob: destinationJobObject };
}

export default {
  submitAnalysis,
};
