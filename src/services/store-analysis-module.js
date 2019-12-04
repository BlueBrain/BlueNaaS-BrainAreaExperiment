
import get from 'lodash/get';
import Vue from 'vue';
import analysisConfig from '@/config/analysis-config';
import { mapBlueConfigTerms } from '@/common/utils';

function analysisConfigObjReduceFn(endObj, analysisObj) {
  return {
    ...endObj,
    [analysisObj.realName]: {
      mode: null,
      name: analysisObj.displayName,
      type: analysisObj.realName,
      active: false,
    },
  };
}

function generatePlotsConfig(state) {
  const plotConfig = {
    configOk: false,
    errorMessage: '',
    configValues: {},
  };
  Object.values(state.analysisConfigObj).forEach((analysisValue) => {
    if (!analysisValue.active || !analysisValue.mode) return;

    plotConfig.configValues[analysisValue.type] = {
      mode: analysisValue.mode,
      value: mapBlueConfigTerms(analysisValue.value),
    };
  });
  if (!Object.keys(plotConfig.configValues).length) {
    plotConfig.errorMessage = 'Please fill out the analysis information';
  } else {
    plotConfig.configOk = true;
  }
  return plotConfig;
}

function getCurrentAnalysisObj(state, analysisId) {
  return get(state, `analysisConfigObj[${analysisId}]`);
}

const modes = {
  POPULATION: 'population',
  GIDS: 'gids',
  RANDOM_GIDS: 'random',
};

export default {
  state: {
    analysisConfigObj: analysisConfig.analysisAvailable.reduce(analysisConfigObjReduceFn, {}),
    analysisToRun: analysisConfig.analysisAvailable,
    analysisConfigToSend: {},
    lfpAnalysisFulfilled: false,
    modes,
  },
  mutations: {
    /* eslint-disable no-param-reassign */
    updateAnalysisValue(state, payload) {
      const currentAnalysisConfig = getCurrentAnalysisObj(state, payload.analysisObj.type);
      Vue.set(currentAnalysisConfig, 'value', payload.value);
    },
    generateFinalPlotsConfig(state) {
      state.analysisConfigToSend = generatePlotsConfig(state);
    },
    resetAnalysisConfigObj(state) {
      state.analysisConfigObj = analysisConfig.analysisAvailable.reduce(analysisConfigObjReduceFn, {});
    },
    changeAnalysisMode(state, payload) {
      const currentAnalysisConfig = getCurrentAnalysisObj(state, payload.analysisObj.type);
      currentAnalysisConfig.mode = payload.value;
    },
    setLfpFulfilled(state, value) {
      state.lfpAnalysisFulfilled = value;
    },
  },
};
