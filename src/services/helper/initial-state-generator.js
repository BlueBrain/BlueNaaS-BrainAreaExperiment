
import simConfig from '@/config/simulation-config';
import pickBy from 'lodash/pickBy';
import circuits from '@/config/circuit-config';
import '@/services/helper/computer-group-helper';

let circuitToUse;
let simulationCurrentConfig;

function getCircuitToUse() {
  return circuitToUse;
}

function getCurrentCircuitConfig() {
  const config = circuits.mapCircuitNameWithUrl[getCircuitToUse()];
  return config || {};
}

function getDefaultDuration() {
  return simulationCurrentConfig.defaultDuration;
}

function getDefaultForwardSkip() {
  return simulationCurrentConfig.defaultForwardSkip;
}

function getCurrentSimulationConfig() {
  return simulationCurrentConfig;
}

function getComputersAvailableForCircuit() {
  // will filter the computers that actually can run the circuit
  const computerForCircuit = getCurrentCircuitConfig().prefix;
  if (!computerForCircuit) return [];
  const computersCanRunCircuit = Object.keys(computerForCircuit);
  const allComutersAvailable = Object.keys(pickBy(simulationCurrentConfig, computer => computer.cpus));
  const computersAllowedToRun = allComutersAvailable.filter(computer => (
    computersCanRunCircuit.includes(computer)
  ));
  return computersAllowedToRun;
}

function getCurrentSimConfig() {
  return simConfig[getCurrentCircuitConfig().simConfigToUse] || {};
}

function setupInitialStates() {
  // define circuit based on URL
  const match = window.location.href.match(/circuits\/([\w\\-]*)/);
  if (!match) console.error('Specify /circuits in url');
  circuitToUse = match ? match[1] : null;

  simulationCurrentConfig = getCurrentSimConfig();
}


export default {
  circuitToUse,
  getDefaultDuration,
  getDefaultForwardSkip,
  getComputersAvailableForCircuit,
  getCurrentCircuitConfig,
  setupInitialStates,
  getCircuitToUse,
  getCurrentSimulationConfig,
  getCurrentSimConfig,

};
