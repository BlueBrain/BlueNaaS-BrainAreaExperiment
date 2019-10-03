
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import findKey from 'lodash/findKey';
import partial from 'lodash/partial';
import isEqual from 'lodash/isEqual';

import store from '@/services/store';

const mapper = {
  Voltage: 'v',
  Soma: 'compartment',
  Poisson: 'NPoisson',
  'Calcium Concentration': 'cai',
  'Current Summation (for LFP)': 'i_membrane IClamp',
};

// add targets to mapper for later conversion to BlueConfig and vice-versa
let fullMapper = null;

function fillMapper() {
  const targetsMapper = {};
  store.state.currentCircuitConfig.targets.forEach((targetObj) => {
    targetsMapper[targetObj.displayName] = targetObj.name;
  });
  fullMapper = Object.assign({}, mapper, targetsMapper);
}

function mapBlueConfigTerms(params) {
  if (!fullMapper) fillMapper();
  if (typeof params === 'string') {
    return fullMapper[params] || params;
  }
  const clone = cloneDeep(params);
  forEach(params, (value, key) => {
    clone[key] = fullMapper[value] || value;
  });
  return clone;
}

function unmapBlueConfigTerms(params) {
  if (!fullMapper) fillMapper();
  if (typeof params === 'string') {
    const keyUnMapped = findKey(fullMapper, partial(isEqual, params));
    return keyUnMapped || params;
  }
  const clone = cloneDeep(params);
  forEach(params, (value, key) => {
    const keyUnMapped = findKey(fullMapper, partial(isEqual, value));
    clone[key] = keyUnMapped || value;
  });
  return clone;
}

function convertToBCFormat(bcStr) {
  const bcObj = JSON.parse(bcStr);
  const finalArr = [];
  forEach(bcObj, (categoryObj, categoryName) => {
    forEach(categoryObj, (itemObj, itemName) => {
      finalArr.push(`${categoryName} ${itemName}`);
      finalArr.push('{');
      forEach(itemObj, (subitemValue, subitemName) => {
        finalArr.push(`${subitemName} ${subitemValue}`);
      });
      finalArr.push('}');
    });
  });

  return finalArr.join('\n');
}

function openContent(content) {
  const x = window.open();
  x.document.open();
  x.document.write(`<html><body><pre>${content}</pre></body></html>`);
  x.document.close();
}

function getComputerUrlCombo() {
  return store.state.currentComputer + store.state.userGroup + window.location.href;
}

function getDate3YearFromNow() {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 3);
  return futureDate;
}

function getComputerProjectCircuitCombo(prefix) {
  const comboStr = `${store.state.currentComputer}_${store.state.userGroup}_${store.state.currentCircuit}`;
  return prefix ? `${prefix}_${comboStr}` : comboStr;
}

function pointIsValid(point) {
  const regex = /^-?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?$/g;
  const sp = point.split(',');
  let isValid = false;

  if (!sp) return isValid;

  const numbList = sp.map(e => e.trim());
  if (numbList.length !== 3) return isValid;

  isValid = numbList.every((numb) => {
    const match = numb.match(regex);
    return match ? !!match.length : false;
  });
  return isValid;
}

export {
  convertToBCFormat,
  openContent,
  mapBlueConfigTerms,
  unmapBlueConfigTerms,
  getComputerUrlCombo,
  getComputerProjectCircuitCombo,
  getDate3YearFromNow,
  pointIsValid,
};
