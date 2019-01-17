
import Vue from 'vue';
import Vuex from 'vuex';

import simConfig from '@/assets/simulation-config';
import circuitConfig from '@/assets/circuit-config';

Vue.use(Vuex);

// Setup default params when the app starts
// Circuit
const circuitToUse = localStorage.getItem('circuitToUse') || 'mooc';
localStorage.setItem('circuitToUse', circuitToUse);
console.log('[store] Circuit to use', circuitToUse);

const storedComputer = localStorage.getItem('userComputer');
const storedGroup = localStorage.getItem('userGroup');
console.log(`[store] LocalStored: project: ${storedGroup} - computer: ${storedComputer}`);

const store = new Vuex.Store({
  state: {
    title: 'Run Simulation',
    currentComputer: null,
    currentCircuitConfig: circuitConfig[circuitToUse],
    simulationPopulation: null,
    simulationDuration: simConfig.defaultDuration,
    simulationForwardSkip: simConfig.defaultForwardSkip,
    allComputerAvailable: simConfig.available,
    token: null,
    userGroup: null,
    userGroupTmp: null,
    userGroupsAvailable: [],
    listIsLoading: true,
    pollInterval: 10 * 1000,
    // circuit to use in the app (slices, microcircuit, etc) from circuit-config.js
    appCircuitToUse: circuitToUse,
    stimulationTargets: [],
    reportTargets: [],
    populationTargets: [],
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setAppTitle(state, newTitle) {
      state.title = newTitle;
    },
    setCurrentComputer(state, newComputer) {
      console.debug('[store] SetCurrentComputer', newComputer);
      state.currentComputer = newComputer;
    },
    setUserGroup(state, newUserProject) {
      console.debug('[store] SetUserGroup', newUserProject);
      state.userGroup = newUserProject;
    },
    setUserGroupTmp(state, newUserProject) {
      console.warn('[store] SetUserGroupTmp', newUserProject);
      state.userGroupTmp = newUserProject;
    },
    setUserGroupsAvailable(state, projectsList) {
      console.debug('[store] setUserGroupsAvailable', projectsList);
      state.userGroupsAvailable = projectsList;
    },
    setSimulationPopulation(state, newModel) {
      state.simulationPopulation = newModel;
    },
    setStimulationTargets(state, targets) {
      state.stimulationTargets = targets;
    },
    setReportTargets(state, targets) {
      state.reportTargets = targets;
    },
    setPopulationTargets(state, targets) {
      state.populationTargets = targets;
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
    setListIsLoading(state, value) {
      state.listIsLoading = value;
    },
  },
  actions: {
    showLoader() {
      const squareLoading = document.getElementById('loading-component');
      if (!squareLoading) return;
      squareLoading.style.display = 'block';
    },
    hideLoader() {
      const squareLoading = document.getElementById('loading-component');
      if (!squareLoading) return;
      squareLoading.style.display = 'none';
    },
  },
});

export default store;
