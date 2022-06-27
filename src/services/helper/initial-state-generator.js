
import pickBy from 'lodash/pickBy';
import { getSimulationConfig } from '@/config/simulation-config';
import { getAnalysisConfig } from '@/config/analysis-config';
import circuitsFile from '@/config/circuit-config';
import { getProjectionConfig } from '@/config/projection-config';
import { getConnections } from '@/config/connection-config';
import '@/services/helper/computer-group-helper';
import {
  getSavedComputerAndMappings, setAuth, getAuth,
} from '@/services/db';
import { storageConstants } from '@/common/constants';
import * as dynamicCircuitHelper from '@/services/helper/dynamic-circuit-loader-helper';

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
  // if only one computer return it otherwise return empty and check later with setupUserProjects()
  const computerForCircuit = circuitDetails.prefix;
  if (!computerForCircuit) return {};
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

function setupVmmAuth() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const vmmAuth = urlSearchParams.get(storageConstants.AUTH);
  if (!vmmAuth) return;

  const savedUser = getAuth();
  if (savedUser !== vmmAuth) setAuth(vmmAuth);
}

function setupInitialStates() {
  // define circuit based on URL
  circuitToUse = dynamicCircuitHelper.getCircuitName();
  if (!circuitToUse) console.error('Specify /circuits in url');

  setupVmmAuth();
  dynamicCircuitHelper.setup();

  const fullConfig = dynamicCircuitHelper.mergeConfigWithQueryParams(circuitToUse);
  return fullConfig;
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

export {
  rebuildConfig,
};
