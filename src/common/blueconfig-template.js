
import cleanDeep from 'clean-deep';
import template from 'lodash/template';

import store from '@/services/store';

function replacePrefixPlaceholders(obj, replaceText) {
  if (!obj) return null;
  if (replaceText === null) return obj;
  const str = JSON.stringify(obj);
  const templateFn = template(str);
  const replacedStr = templateFn({ prefix: replaceText });
  return JSON.parse(replacedStr);
}

function createBCTemplate() {
  const { circuitConfig, computer } = store.state.fullConfig;
  const circuitRunSection = circuitConfig.paths;
  const circuitPathsPrefixes = circuitConfig.prefix ? circuitConfig.prefix[computer] : null;
  const fullPathAttributes = replacePrefixPlaceholders(circuitRunSection, circuitPathsPrefixes);
  const extraParams = replacePrefixPlaceholders(circuitConfig.extraParamsInBC, circuitPathsPrefixes);
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
