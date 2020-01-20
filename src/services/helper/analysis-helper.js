
import template from 'lodash/template';
import unicore from '@/services/unicore';
import analysisConfig from '@/config/analysis-config';
import store from '@/services/store';
import { addTag, jobTags } from '@/common/job-status';


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
  files.forEach((file) => {
    // remove the '/'
    const fileName = file.substr(1);
    // allowed if was not found
    const found = avoidFilesList.find(avoidFile => fileName.indexOf(avoidFile) !== -1);
    if (!found) { allowed.push(fileName); }
  });
  return allowed;
}

async function submitAnalysis(analysisAndTransferInfo, script) {
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
  const currentAnalysisConfig = analysisConfig[computer];
  newAnalysisAndTransferInfo.executable = currentAnalysisConfig.executable;
  newAnalysisAndTransferInfo.partitions = currentAnalysisConfig.partitions;
  newAnalysisAndTransferInfo.qos = currentAnalysisConfig.qos;

  // get all the files to be copied
  const filesToCopy = await getFilesToCopy(`${newAnalysisAndTransferInfo.from.workingDirectory}/files`);
  const computeUrl = unicore.getComputerUrl(computer);
  const originalSM = computeUrl.replace('rest/core', 'services/StorageManagement?res=');
  const originalWorkId = newAnalysisAndTransferInfo.from.workingDirectory.split('/').pop();

  const imports = filesToCopy.map(fileName => ({
    From: `BFT:${originalSM}${originalWorkId}#/${fileName}`,
    To: fileName,
  }));
  newAnalysisAndTransferInfo.imports = imports;

  addTag(newAnalysisAndTransferInfo, jobTags.ANALYSIS);
  if (newAnalysisAndTransferInfo.lfpPlotsConfig) {
    addTag(newAnalysisAndTransferInfo, jobTags.LFP_ANALYSIS);
  }

  /* ---------------------------------------------------------------------
   * Create analysis job
   * --------------------------------------------------------------------- */
  const analysisParamsConfig = {
    basic_plots_config: newAnalysisAndTransferInfo.basicPlotsConfig,
    report_analysis: newAnalysisAndTransferInfo.reportForAnalysis,
    lfp_plots_config: newAnalysisAndTransferInfo.lfpPlotsConfig,
    lfp_target: newAnalysisAndTransferInfo.lfpTarget,
  };
  const inputs = [
    { To: analysisConfig.configFileName, Data: analysisParamsConfig },
  ];

  if (script) {
    /* ---------------------------------------------------------------------
     * Create file to start analysis
     * --------------------------------------------------------------------- */
    let runScript = script.join('\n');
    if (currentAnalysisConfig.moveAnalysis && newAnalysisAndTransferInfo.accountSelected) {
      runScript = template(runScript)({ projSelected: newAnalysisAndTransferInfo.accountSelected });
    }
    inputs.push({ To: 'input.sh', Data: runScript });
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
