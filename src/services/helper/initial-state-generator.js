
import simConfig from '@/config/simulation-config';
import circuitConfig from '@/config/circuit-config';
import '@/services/helper/computer-group-helper';

// define circuit based on URL
const match = window.location.href.match(/circuits\/(\w*)/);
if (!match) console.error('Specify /circuits in url');
const circuitToUse = match ? match[1] : null;

function getCurrentCircuitConfig() {
  return circuitConfig[circuitToUse];
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

export default {
  circuitToUse,
  getDefaultDuration,
  getDefaultForwardSkip,
  getComputersAvailableForCircuit,
  getCurrentCircuitConfig,
};
