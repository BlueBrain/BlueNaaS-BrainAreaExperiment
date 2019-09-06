
import uuidGen from 'uuid';
import connectionsConfig from '@/config/connection-config';

const { getDefaultConnections } = connectionsConfig;

const allAttributesObj = connectionsConfig.synapseAttributes;

function isGlobalAttr(synAttr) {
  return allAttributesObj.global.includes(synAttr);
}

function synapseStringToArray(synapseText) {
  if (!synapseText) return [];
  // get ranged or global attributes
  const regex = /(%s.(\w+?)|\w+) = (-*\d*\.*\d*)/g;
  let matches = regex.exec(synapseText);
  const synapseConfigList = [];
  while (matches) {
    if (matches.length > 2) {
      synapseConfigList.push({
        attr: matches[2] || matches[1],
        value: parseFloat(matches[3]),
        uuid: uuidGen(),
      });
    }
    matches = regex.exec(synapseText);
  }
  return synapseConfigList;
}

function synapseArrayToString(synapsesArray) {
  const synapseString = synapsesArray.reduce((result, synapseParam) => {
    const prefix = isGlobalAttr(synapseParam.attr) ? '' : '%s.';
    const configuration = `${prefix}${synapseParam.attr} = ${synapseParam.value} `;
    return `${result}${configuration}`;
  }, '');
  return synapseString.trim();
}

export {
  getDefaultConnections,
  synapseStringToArray,
  synapseArrayToString,
};

export default {};
