
import unicore from '@/services/unicore';
import analysisConfig from '@/assets/analysis-config';
import store from '@/services/store';


async function generateUpdatedAssociatedFile(simulationWorkDirectory, analysisObject, userGroup) {
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
  return unicore.uploadData(input, `${simulationWorkDirectory}/files`, userGroup);
}

async function getFilesToCopy(filesURL, userGroup) {
  const files = await unicore.getFilesList(filesURL, userGroup);
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

  const newAnalysisAndTransferInfo = analysisAndTransferInfo;
  const computer = store.state.currentComputer;
  newAnalysisAndTransferInfo.executable = analysisConfig[computer].executable;

  // get all the files to be copied
  const filesToCopy = await getFilesToCopy(`${newAnalysisAndTransferInfo.from.workingDirectory}/files`);
  const computeUrl = unicore.getComputeProviders()[computer.toUpperCase()].url;
  const originalSM = computeUrl.replace('rest/core', 'services/StorageManagement?res=');
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
    /* ---------------------------------------------------------------------
     * Create file to start analysis
     * --------------------------------------------------------------------- */
    inputs.push({ To: 'input.sh', Data: script.join('\n') });
  }

  const destinationJobObject = await unicore.submitJob(newAnalysisAndTransferInfo, inputs);

  /* ---------------------------------------------------------------------
   * Create association file in the simulation
   * --------------------------------------------------------------------- */
  await generateUpdatedAssociatedFile(newAnalysisAndTransferInfo.from.workingDirectory, destinationJobObject);

  return { destinationJob: destinationJobObject };
}

export default {
  submitAnalysis,
};
