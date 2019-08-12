
import get from 'lodash/get';
import { getFiles } from '@/services/unicore';

function findReportTargets(bcStr, rexp) {
  const regex = rexp;
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

function findAnalysisTargetsFallback(bcStr) {
  // find targets when the BlueConfig was not produced by the sim-ui
  const regexp = /Report\s.*?{.*?Target\s(.*?)\s/gm;
  const inlineBC = bcStr.replace(/\n/g, '');
  return findReportTargets(inlineBC, regexp);
}

function findAnalysisTargets(bcStr) {
  if (!bcStr.includes('_report_')) return findAnalysisTargetsFallback(bcStr);
  const regexp = /Report (.+)_report/gm;
  return findReportTargets(bcStr, regexp);
}

function findDuration(bcStr) {
  const regexp = /Duration (.+)/;
  const simulationDurationMatched = bcStr.match(regexp);
  const durationStr = get(simulationDurationMatched, '[1]', 100).trim();
  return Number(durationStr);
}

function findLfpAnalysisTargets(bcStr) {
  const regexp = /CircuitTarget (.+)/;
  const circuitTargetMatched = bcStr.match(regexp);
  return get(circuitTargetMatched, '[1]', '').trim();
}

async function getBlueConfigStr(job) {
  const workingDirectory = get(job, '_links.workingDirectory.href');
  const blueConfigBlob = await getFiles(`${workingDirectory}/files/BlueConfig`);
  const blueConfigStr = await new Response(blueConfigBlob).text();
  return blueConfigStr;
}


export {
  findAnalysisTargets,
  findDuration,
  findLfpAnalysisTargets,
  getBlueConfigStr,
};
