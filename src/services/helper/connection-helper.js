
import connectionsConfig from '@/config/connection-config';
import uuidGen from 'uuid';

const { getDefaultConnections } = connectionsConfig;

const synapseStringToArray = (synapseText) => {
  const regex = /%s.(.+?) = (-*\d*\.*\d*)/g;
  let matches = regex.exec(synapseText);
  const synapseConfigList = [];
  while (matches) {
    if (matches.length === 3 && matches[1] && matches[2]) {
      synapseConfigList.push({
        attr: matches[1],
        value: parseFloat(matches[2]),
        uuid: uuidGen(),
      });
    }
    matches = regex.exec(synapseText);
  }
  return synapseConfigList;
};

const synapseArrayToString = (synapsesArray) => {
  const synapseString = synapsesArray.reduce((result, synapseParam) => {
    const configuration = `%s.${synapseParam.attr} = ${synapseParam.value} `;
    return `${result}${configuration}`;
  }, '');
  return synapseString.trim();
};

export {
  getDefaultConnections,
  synapseStringToArray,
  synapseArrayToString,
};

export default {};
