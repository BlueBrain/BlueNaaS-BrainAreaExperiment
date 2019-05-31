
import Vue from 'vue';
import Vuex from 'vuex';
import listModule from '@/services/store-list-module';

import initialStateGenerator from '@/services/helper/initial-state-generator';

Vue.use(Vuex);

initialStateGenerator.setupInitialStates();

const store = new Vuex.Store({
  state: {
    title: 'Run Simulation',
    currentComputer: null,
    simulationPopulation: null,
    currentCircuit: initialStateGenerator.getCircuitToUse(),
    currentCircuitConfig: initialStateGenerator.getCurrentCircuitConfig(),
    simulationDuration: initialStateGenerator.getDefaultDuration(),
    simulationForwardSkip: initialStateGenerator.getDefaultForwardSkip(),
    computersAvailable: initialStateGenerator.getComputersAvailableForCircuit(),
    token: null,
    userGroup: null,
    userGroupTmp: null,
    userGroupsAvailable: [],
    pollInterval: 10 * 1000,
    stimulationTargets: [],
    reportTargets: [],
    populationTargets: [],
    connectionTargets: [],
    collabIdForViz: null,
  },
  modules: {
    list: listModule,
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
    setCollabIdForViz(state, collabId) {
      state.collabIdForViz = collabId;
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
