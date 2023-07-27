
import defaultsDeep from 'lodash/defaultsDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import cleanDeep from 'clean-deep';
import { rebuildConfig } from '@/services/helper/initial-state-generator';
import { circuits } from '@/common/constants';

let queryConfig = null;
const dynamicCircuitsRegexp = `(?:${circuits.HBP_DYNAMIC_CIRCUIT})`;
const dynamicQueryParamsRegexp = new RegExp(`#.+${dynamicCircuitsRegexp}[\\/\\-\\w]*\\?(.+)`);

function isDynamicCircuit() {
  const dynamicCircuitRegexp = new RegExp(`#/circuits/${dynamicCircuitsRegexp}`);
  const locationHash = window.location.hash;
  const dynamicCircuit = dynamicCircuitRegexp.test(locationHash);
  return dynamicCircuit;
}

function showErrorPage(message) {
  const loadingSpinner = document.getElementById('loading-component');
  loadingSpinner.style.display = 'hidden';
  document.body.innerHTML = `<h2 class="dynamic-circuit-page-error">${message}</h2>`;
}

function setup() {
  if (!isDynamicCircuit()) {
    return;
  }

  const newHash = window.location.hash;
  if (isDynamicCircuit() && !dynamicQueryParamsRegexp.test(newHash)) {
    return;
  }
  try {
    const queryConfigEncoded = newHash.match(dynamicQueryParamsRegexp)[1];
    const b64Encoded = decodeURIComponent(queryConfigEncoded);
    queryConfig = JSON.parse(atob(b64Encoded));
  } catch (e) {
    if (isDynamicCircuit()) {
      console.error(`failed parsing query params dynamic circuit ${e}`);
    }
  }
}

function getCircuitName() {
  const match = /circuits\/([\w\\-]*)/.exec(window.location.href);
  const name = match ? match[1] : null;
  return name;
}

function mergeConfigWithQueryParams(circuitToUse) {
  if (!isDynamicCircuit()) return rebuildConfig(circuitToUse);
  if (isDynamicCircuit() && !queryConfig) return {};

  const { baseConfig, computer } = queryConfig;

  const newFullConfig = rebuildConfig(baseConfig, computer);

  const mergedConfig = defaultsDeep({}, queryConfig, newFullConfig);

  set(mergedConfig, 'computersAvailable', [computer]);
  set(mergedConfig, 'circuitName', getCircuitName());
  set(mergedConfig, 'simulationConfig.script', queryConfig.simulationConfig.script);
  if (get(queryConfig, 'analysisConfig.script')) {
    set(mergedConfig, 'analysisConfig.script', queryConfig.analysisConfig.script);
  }
  if (get(queryConfig, 'circuitConfig.targets')) {
    set(mergedConfig, 'circuitConfig.targets', queryConfig.circuitConfig.targets);
  }

  const prunedFullConfig = cleanDeep(mergedConfig);

  return prunedFullConfig;
}

export default setup;

export {
  mergeConfigWithQueryParams,
  showErrorPage,
  isDynamicCircuit,
  setup,
  getCircuitName,
};
