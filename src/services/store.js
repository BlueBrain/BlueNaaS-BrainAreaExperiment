
import Vue from 'vue';
import Vuex from 'vuex';

import simConfig from '@/assets/simulation-config';
import circuitConfig from '@/assets/circuit-config';

Vue.use(Vuex);

// Setup default params when the app starts
// Circuit
const circuitToUse = localStorage.getItem('circuitToUse') || 'mooc';
localStorage.setItem('circuitToUse', circuitToUse);
console.log('Circuit to use', circuitToUse);

// check if the computer can run the circuit
const computersThatCanRunCircuit = Object.keys(circuitConfig[circuitToUse].prefix);
const storedComputer = localStorage.getItem('userComputer');
const computerToUse = computersThatCanRunCircuit.includes(storedComputer) ?
  storedComputer :
  computersThatCanRunCircuit[0];
localStorage.setItem('userComputer', computerToUse);

const savedProject = localStorage.getItem('userProject');
// savedProject = savedProject === 'null' ? null : savedProject;
console.log(`stored project ${savedProject} - computer ${computerToUse}`);

const store = new Vuex.Store({
  state: {
    title: 'Run Simulation',
    currentComputer: computerToUse,
    currentCircuitConfig: circuitConfig[circuitToUse],
    simulationModel: circuitConfig[circuitToUse].defaultModel,
    simulationDuration: simConfig.defaultDuration,
    simulationForwardSkip: simConfig.defaultForwardSkip,
    token: null,
    userProject: savedProject || null,
    userProjectTmp: null,
    userProjectsAvailable: [],
    isLoading: true,
    pollInterval: 10 * 1000,
    // circuit to use in the app (slices, microcircuit, etc) from circuit-config.js
    appCircuitToUse: circuitToUse,
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setAppTitle(state, newTitle) {
      state.title = newTitle;
    },
    setCurrentComputer(state, newComputer) {
      console.debug('setCurrentComputer', newComputer);
      state.currentComputer = newComputer;
      if (!newComputer || newComputer === 'undefined') {
        localStorage.removeItem('userComputer');
      } else {
        localStorage.setItem('userComputer', newComputer);
      }
    },
    setSimulationModel(state, newModel) {
      state.simulationModel = newModel;
    },
    setSimulationDuration(state, newDuration) {
      state.simulationDuration = newDuration;
    },
    setSimulationForwardSkip(state, newForwardSkip) {
      state.simulationForwardSkip = newForwardSkip;
    },
    setToken(state, newToken) {
      state.token = newToken;
    },
    setUserProject(state, newUserProject) {
      console.debug('setUserProject', newUserProject);
      state.userProject = newUserProject;
      if (!newUserProject || newUserProject === 'null' || newUserProject === 'undefined') {
        localStorage.removeItem('userProject');
      } else {
        localStorage.setItem('userProject', newUserProject);
      }
    },
    setUserProjectTmp(state, newUserProject) {
      console.warn('setUserProjectTmp', newUserProject);
      state.userProjectTmp = newUserProject;
    },
    setUserProjectAvailable(state, projectsList) {
      console.debug('setUserProjectAvailable', projectsList);
      state.userProjectsAvailable = projectsList;
    },
    setIsLoading(state, value) {
      state.isLoading = value;
    },
  },
  actions: {
    showLoader({ commit }) {
      const squareLoading = document.getElementById('loading-component');
      if (!squareLoading) return;
      commit('setIsLoading', true);
      squareLoading.style.display = 'block';
    },
    hideLoader({ commit }) {
      const squareLoading = document.getElementById('loading-component');
      if (!squareLoading) return;
      commit('setIsLoading', false);
      squareLoading.style.display = 'none';
    },
  },
});

export default store;
