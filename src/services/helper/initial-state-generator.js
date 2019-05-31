
import simConfig from '@/config/simulation-config';
import circuits from '@/config/circuit-config';
import '@/services/helper/computer-group-helper';

let circuitToUse;

function getCircuitToUse() {
  return circuitToUse;
}

function getCurrentCircuitConfig() {
  const config = circuits.mapCircuitNameWithUrl[getCircuitToUse()];
  return config;
}

function getDefaultDuration() {
  return simConfig.defaultDuration;
}

function getDefaultForwardSkip() {
  return simConfig.defaultForwardSkip;
}

function getComputersAvailableForCircuit() {
  // will filter the computers that actually can run the circuit
  const computersCanRunCircuit = Object.keys(getCurrentCircuitConfig().prefix);
  const computersAllowedToRun = simConfig.available.filter(computer => (
    computersCanRunCircuit.includes(computer)
  ));
  return computersAllowedToRun;
}

function setupInitialStates() {
  // define circuit based on URL
  const match = window.location.href.match(/circuits\/([\w\\-]*)/);
  if (!match) console.error('Specify /circuits in url');
  circuitToUse = match ? match[1] : 'hippo_microcircuit';
}

export default {
  circuitToUse,
  getDefaultDuration,
  getDefaultForwardSkip,
  getComputersAvailableForCircuit,
  getCurrentCircuitConfig,
  setupInitialStates,
  getCircuitToUse,
};
