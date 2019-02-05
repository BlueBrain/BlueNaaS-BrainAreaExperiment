
import connectionsConfig from '@/config/connection-config';
import cloneDeep from 'lodash/cloneDeep';

const getDefaultConnections = () => cloneDeep(connectionsConfig.defaultConnections);

const checkSynapseConfig = (config) => {
  const attributesList = connectionsConfig.synapseAttributes;

  const regex = new RegExp('%s.(.+?) =', 'g');
  let error = false;
  let matches = regex.exec(config);
  while (matches && !error) {
    const matchedAttribute = matches[1];
    if (!attributesList.includes(matchedAttribute)) {
      error = true;
    }
    matches = regex.exec(config);
  }
  return error;
};

export {
  getDefaultConnections,
  checkSynapseConfig,
};

export default {};
