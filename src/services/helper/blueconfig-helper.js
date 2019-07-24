
import get from 'lodash/get';
import { getFiles } from '@/services/unicore';

function findAnalysisTargets(bcStr) {
  const regexp = /Report (.+)_report/gm;
  const matches = [];
  let m = regexp.exec(bcStr);
  while (m !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regexp.lastIndex) regexp.lastIndex += 1;
    matches.push(get(m, '[1]', '').trim());
    m = regexp.exec(bcStr);
  }
  return matches;
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
