
import { errorMessages } from '@/common/constants';

export default {
  state: {
    isLoading: true,
    analysisAreLoading: true,
    bulkEditActivated: false,
    simulationsToBulkAnalyse: [],
    httpReqSource: null,
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
    setupHttpReqSource(state, httpReqSource) {
      state.httpReqSource = httpReqSource;
    },
    cancelLoadingList(state) {
      if (!state.httpReqSource) return;
      state.httpReqSource.cancel(errorMessages.CANCELED_REQUEST);
      // state.httpReqSource = null;
    },
    resetLoadingList(state) {
      state.httpReqSource = null;
    },
  },
};
