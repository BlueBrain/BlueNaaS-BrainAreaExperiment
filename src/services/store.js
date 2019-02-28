
import Vue from 'vue';
import Vuex from 'vuex';

import initialStateGenerator from '@/services/helper/initial-state-generator';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    title: 'Run Simulation',
    currentComputer: null,
    simulationPopulation: null,
    currentCircuit: initialStateGenerator.circuitToUse,
    currentCircuitConfig: initialStateGenerator.getCurrentCircuitConfig(),
    simulationDuration: initialStateGenerator.getDefaultDuration(),
    simulationForwardSkip: initialStateGenerator.getDefaultForwardSkip(),
    computersAvailable: initialStateGenerator.getComputersAvailableForCircuit(),
    token: null,
    userGroup: null,
    userGroupTmp: null,
    userGroupsAvailable: [],
    listIsLoading: true,
    analysisListIsLoading: true,
    pollInterval: 10 * 1000,
    stimulationTargets: [],
    reportTargets: [],
    populationTargets: [],
    connectionTargets: [],
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setAppTitle(state, newTitle) {
      state.title = newTitle;
    },
    setCurrentComputer(state, newComputer) {
      state.currentComputer = newComputer;
    },
    setUserGroup(state, newUserProject) {
      state.userGroup = newUserProject;
    },
    setUserGroupTmp(state, newUserProject) {
      console.warn('[store] SetUserGroupTmp', newUserProject);
      state.userGroupTmp = newUserProject;
    },
    setUserGroupsAvailable(state, projectsList) {
      state.userGroupsAvailable = projectsList;
    },
    setSimulationPopulation(state, newPopulation) {
      state.simulationPopulation = newPopulation;
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
    setConnectionTargets(state, targets) {
      state.connectionTargets = targets;
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
    setAnalysisListIsLoading(state, value) {
      state.analysisListIsLoading = value;
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
