
import cleanDeep from 'clean-deep';
import template from 'lodash/template';

import store from '@/services/store';

function replacePrefixPlaceholders(obj, replaceText) {
  if (!obj) return null;
  const str = JSON.stringify(obj);
  const templateFn = template(str);
  const replacedStr = templateFn({ prefix: replaceText });
  return JSON.parse(replacedStr);
}

function createBCTemplate() {
  const circuitRunSection = store.state.currentCircuitConfig.paths;
  const circuitPathsPrefixes = store.state.currentCircuitConfig.prefix[store.state.currentComputer];
  const fullPathAttributes = replacePrefixPlaceholders(circuitRunSection, circuitPathsPrefixes);
  const extraParams = replacePrefixPlaceholders(store.state.currentCircuitConfig.extraParamsInBC, circuitPathsPrefixes);
  const bcTemplate = cleanDeep({
    Stimulus: {},
    Report: {},
    Run: {
      Default: {
        ...fullPathAttributes,
        CircuitTarget: store.state.simulationPopulation,
        Dt: '0.025',
        Duration: store.state.simulationDuration,
        ForwardSkip: store.state.simulationForwardSkip,
        NumSynapseFiles: circuitRunSection.NumSynapseFiles,
        BaseSeed: '10',
        RNGMode: 'UpdatedMCell',
      },
    },
    StimulusInject: {},
    Connection: {}, // to define spontaneous activities
    ...extraParams,
  });
  return bcTemplate;
}

export default {};

export {
  createBCTemplate,
  replacePrefixPlaceholders,
};
