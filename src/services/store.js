
import Vue from 'vue';
import Vuex from 'vuex';
import listModule from '@/services/store-list-module';
import analysisModule from '@/services/store-analysis-module';

import initialStateGenerator from '@/services/helper/initial-state-generator';

Vue.use(Vuex);

const fullConfig = initialStateGenerator.setupInitialStates();

const store = new Vuex.Store({
  state: {
    title: 'Run Simulation',
    simulationPopulation: null,
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
    fullConfig,
  },
  modules: {
    list: listModule,
    analysis: analysisModule,
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setAppTitle(state, newTitle) {
      state.title = newTitle;
    },
    setCurrentComputer(state, newComputer) {
      state.fullConfig.computer = newComputer;
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
      state.fullConfig.simulationConfig.defaultSimulationParams.defaultDuration = newDuration;
    },
    setSimulationForwardSkip(state, newForwardSkip) {
      state.fullConfig.simulationConfig.defaultSimulationParams.defaultForwardSkip = newForwardSkip;
    },
    setToken(state, newToken) {
      state.token = newToken;
    },
    setCollabIdForViz(state, collabId) {
      state.collabIdForViz = collabId;
    },
    setCurrentSimulationConfig(state, config) {
      state.fullConfig = config;
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
    setupFullConfig(ctx) {
      const newFullConfig = initialStateGenerator.rebuildConfig(
        ctx.state.fullConfig.circuitName,
        ctx.state.fullConfig.computer,
      );
      ctx.commit('setCurrentSimulationConfig', newFullConfig);
    },
  },
});

export default store;
