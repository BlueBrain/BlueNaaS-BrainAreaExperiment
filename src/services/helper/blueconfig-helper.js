
import get from 'lodash/get';
import { getFiles } from '@/services/unicore';
import store from '@/services/store';
import { unmapBlueConfigTerms } from '@/common/utils';

function findByRegexp(bcStr, re) {
  const regex = re;
  const matches = [];
  let m = regex.exec(bcStr);
  while (m !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) regex.lastIndex += 1;
    matches.push(get(m, '[1]', '').trim());
    m = regex.exec(bcStr);
  }
  return matches;
}

function findDuration(bcStr) {
  const regexp = /Run Default.*?Duration\s(.+?)\s/;
  const simulationDurationMatched = bcStr.match(regexp);
  const durationStr = get(simulationDurationMatched, '[1]', 100).trim();
  return Number(durationStr);
}

function findCircuitTarget(bcStr) {
  const { sonataNeuronsPopulation, isSonata } = store.state.fullConfig.circuitConfig;
  const targetRegexp = isSonata
    ? new RegExp(`CircuitTarget\\s${sonataNeuronsPopulation}:(.+?)\\s`)
    : new RegExp('CircuitTarget\\s(.+?)\\s');
  const circuitTargetMatched = bcStr.match(targetRegexp);
  return get(circuitTargetMatched, '[1]', '').trim();
}

async function getBlueConfigStr(job, workingDirectoryParam = null) {
  const workingDirectory = workingDirectoryParam || get(job, '_links.workingDirectory.href');
  const blueConfigBlob = await getFiles(`${workingDirectory}/files/BlueConfig`);
  const blueConfigStr = await new Response(blueConfigBlob).text();
  // return one line string for easier regexp finding
  return blueConfigStr.replace(/(\r\n|\n|\r)/gm, ' ');
}

function checkReportIsLFP(bcStr, reportName) {
  const regexp = new RegExp(`${reportName}\\s\\{(.+?)\\}`, 'gm');
  const [reportContent] = findByRegexp(bcStr, regexp);
  if (!reportContent) return false;
  const { checksForLFP } = store.state.fullConfig.simulationConfig.genericSimulationConfig;
  return checksForLFP.every(check => reportContent.includes(check));
}

function getTargetByReport(bcStr, reportName) {
  const isLFP = checkReportIsLFP(bcStr, reportName);
  if (isLFP) { return findCircuitTarget(bcStr); }

  const regexp = new RegExp(`${reportName}.*?Target\\s(.*?)\\s`, 'gm');
  const matches = findByRegexp(bcStr, regexp);
  if (!matches.length) {
    return findCircuitTarget(bcStr);
  }
  return matches[0];
}

function getReportsRegexp() {
  return new RegExp('/(.+_report_.+).(?:bbp|h5)');
}

async function findCellsAmountByJobWD(workingDirectory) {
  const job = null;
  const bcStr = await getBlueConfigStr(job, workingDirectory);
  const { targets } = store.state.fullConfig.circuitConfig;
  const population = findCircuitTarget(bcStr);
  const displayName = unmapBlueConfigTerms(population);
  const targetObj = targets.find(target => (
    target.name === displayName || target.name === population
  ));
  return targetObj ? targetObj.cells : null;
}

export {
  getTargetByReport,
  findDuration,
  findCircuitTarget,
  getBlueConfigStr,
  getReportsRegexp,
  findCellsAmountByJobWD,
};
