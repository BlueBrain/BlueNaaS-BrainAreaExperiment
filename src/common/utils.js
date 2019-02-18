
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import findKey from 'lodash/findKey';
import partial from 'lodash/partial';
import isEqual from 'lodash/isEqual';

import store from '@/services/store';

const mapper = {
  voltage: 'v',
  Soma: 'compartment',
  Poisson: 'NPoisson',
};

// add targets to mapper for later conversion to BlueConfig and vice-versa
store.state.currentCircuitConfig.targets.forEach((targetObj) => {
  mapper[targetObj.displayName] = targetObj.name;
});

function mapBlueConfigTerms(params) {
  if (typeof params === 'string') {
    return mapper[params] || params;
  }
  const clone = cloneDeep(params);
  forEach(params, (value, key) => {
    clone[key] = mapper[value] || value;
  });
  return clone;
}

function unmapBlueConfigTerms(params) {
  if (typeof params === 'string') {
    const keyUnMapped = findKey(mapper, partial(isEqual, params));
    return keyUnMapped || params;
  }
  const clone = cloneDeep(params);
  forEach(params, (value, key) => {
    const keyUnMapped = findKey(mapper, partial(isEqual, value));
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

function getComputerProjectCombo() {
  return store.state.currentComputer + store.state.userGroup + window.location.href;
}

export {
  convertToBCFormat,
  openContent,
  mapBlueConfigTerms,
  unmapBlueConfigTerms,
  getComputerProjectCombo,
};
