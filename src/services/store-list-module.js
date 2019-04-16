
export default {
  state: {
    isLoading: true,
    analysisAreLoading: true,
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    setListIsLoading(state, value) {
      state.isLoading = value;
    },
    setAnalysisListIsLoading(state, value) {
      state.analysisAreLoading = value;
    },
  },
};
