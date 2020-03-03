
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
  const circuitRunSection = store.state.fullConfig.circuitConfig.paths;
  const circuitPathsPrefixes = store.state.fullConfig.circuitConfig.prefix[store.state.fullConfig.computer];
  const fullPathAttributes = replacePrefixPlaceholders(circuitRunSection, circuitPathsPrefixes);
  const extraParams = replacePrefixPlaceholders(store.state.fullConfig.circuitConfig.extraParamsInBC, circuitPathsPrefixes);
  const bcTemplate = cleanDeep({
    Stimulus: {},
    Report: {},
    Run: {
      Default: {
        ...fullPathAttributes,
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
