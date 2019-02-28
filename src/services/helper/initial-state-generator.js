
import simConfig from '@/config/simulation-config';
import circuitConfig from '@/config/circuit-config';
import '@/services/helper/computer-group-helper';

function getCircuitToUse() {
  const match = window.location.href.match(/circuits\/([a-z1]*)/);
  if (!match) {
    console.error('Specify /circuits in url');
    return null;
  }
  const [, circuit] = match;
  return circuit;
}

function getCurrentCircuitConfig() {
  return circuitConfig[getCircuitToUse()];
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
  getCircuitToUse,
  getDefaultDuration,
  getDefaultForwardSkip,
  getComputersAvailableForCircuit,
  getCurrentCircuitConfig,
};
