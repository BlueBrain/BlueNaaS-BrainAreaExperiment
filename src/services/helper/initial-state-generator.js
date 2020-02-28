
import pickBy from 'lodash/pickBy';
import { getSimulationConfig } from '@/config/simulation-config';
import { getAnalysisConfig } from '@/config/analysis-config';
import { getProjectionConfig } from '@/config/projection-config';
import { getConnections } from '@/config/connection-config';
import { getSavedComputerAndMappings } from '@/services/db';
import circuitsFile from '@/config/circuit-config';


let circuitToUse;
let simulationCurrentConfig;

function getCircuitToUse() {
  return circuitToUse;
}

function getCurrentCircuitConfig() {
  const config = circuitsFile.mapCircuitNameWithUrl[getCircuitToUse()];
  return config || {};
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

function getSavedComputerOrDefault(computerList, circuitName) {
  const { computerSaved } = getSavedComputerAndMappings(circuitName);
  return computerSaved || computerList[0];
}

function getCurrentComputer(circuitDetails, circuitName) {
  // if only one computer return it otherwise return null and check later with setupUserProjects()
  const computerForCircuit = circuitDetails.prefix;
  if (!computerForCircuit) return null;
  const computerList = Object.keys(computerForCircuit);
  const currentComputer = computerList.length === 1
    ? computerList[0]
    : getSavedComputerOrDefault(computerList, circuitName);
  return {
    available: computerList,
    computer: currentComputer,
  };
}

class CurrentFullConfig {
  constructor(circuitName, computer) {
    this.circuitName = circuitName;
    this.computer = computer;

    if (!circuitName && !computer) return;
    this.fetchAllConfigs();
  }

  fetchCircuitConfig() {
    const circuitConfig = circuitsFile.mapCircuitNameWithUrl[this.circuitName] || {};
    return circuitConfig;
  }

  fetchComputer() {
    const { computer, available } = getCurrentComputer(this.circuitConfig, this.circuitName);
    this.computersAvailable = available;
    return (this.computer || computer);
  }

  fetchAnalysisConfig() {
    const analysis = getAnalysisConfig(this.computer, this.circuitName);
    return analysis;
  }

  fetchProjectionConfig() {
    const projConfig = getProjectionConfig(this.computer, this.circuitName);
    return projConfig;
  }

  fetchSimulationConfig() {
    const simConfig = getSimulationConfig(this.computer, this.circuitName);
    return simConfig;
  }

  fetchConnectionsConfig() {
    this.biggestTarget = this.circuitConfig.biggestTarget;
    const connectionConfig = getConnections(this.computer, this.circuitName, this.biggestTarget);
    return connectionConfig;
  }

  fetchAllConfigs() {
    this.circuitConfig = this.fetchCircuitConfig();
    this.computer = this.fetchComputer();
    this.analysisConfig = this.fetchAnalysisConfig();
    this.projectionConfig = this.fetchProjectionConfig();
    this.simulationConfig = this.fetchSimulationConfig();
    this.connectionConfig = this.fetchConnectionsConfig();
  }
}

function setupInitialStates() {
  // define circuit based on URL
  const match = window.location.href.match(/circuits\/([\w\\-]*)/);
  if (!match) console.error('Specify /circuits in url');
  circuitToUse = match ? match[1] : null;

  return new CurrentFullConfig(circuitToUse);
}

function rebuildConfig(circuitName, computer) {
  const newFullConfig = new CurrentFullConfig(circuitName, computer);
  return newFullConfig;
}

export default {
  circuitToUse,
  getComputersAvailableForCircuit,
  getCurrentCircuitConfig,
  setupInitialStates,
  getCircuitToUse,
  getCurrentSimulationConfig,
  rebuildConfig,
};
