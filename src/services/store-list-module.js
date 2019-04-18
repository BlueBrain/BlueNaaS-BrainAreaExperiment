
export default {
  state: {
    isLoading: true,
    analysisAreLoading: true,
    bulkEditActivated: false,
    simulationsToBulkAnalyse: [],
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setListIsLoading(state, value) {
      state.isLoading = value;
    },
    setAnalysisListIsLoading(state, value) {
      state.analysisAreLoading = value;
    },
    setBulkEditActivated(state, value) {
      state.bulkEditActivated = value;
    },
    addSimulationToBulkAnalyse(state, simulationId) {
      state.simulationsToBulkAnalyse.push(simulationId);
    },
    removeSimulationToBulkAnalyse(state, simulationId) {
      state.simulationsToBulkAnalyse.splice(state.simulationsToBulkAnalyse.indexOf(simulationId), 1);
    },
    cleanSimulationToBulkAnalyse(state) {
      state.simulationsToBulkAnalyse = [];
    },
  },
};
