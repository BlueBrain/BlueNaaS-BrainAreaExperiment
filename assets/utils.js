import moment from 'moment';
import {
  pickBy, forEach, cloneDeep,
  findKey, partial, isEqual, union,
} from 'lodash';

let mapper = {
  FullCA1: 'Mosaic',
  voltage: 'v',
  Soma: 'compartment',
  Poisson: 'NPoisson',
};

function filterName(name) {
  return name.replace(/[^[a-z0-9 \/.\-()]/gi, '');
}

function getDateLocalTime(dateString) {
  if (dateString) {
    let d = moment(dateString);
    return d.format('DD/MM/YYYY HH:mm:ss');
  }
}

function compact(object) {
  return pickBy(object);
}

function unionArray(array) {
  return union(array);
}

function mapAll(params) {
  if (typeof params === 'string') {
    return mapper[params] || params;
  }
  let clone = cloneDeep(params);
  forEach(params, (value, key) => {
    clone[key] = mapper[value] || value;
  });
  return clone;
}

function unMapAll(params) {
  if (typeof params === 'string') {
    let keyUnMapped = findKey(mapper, partial(isEqual, params));
    return keyUnMapped || params;
  }
  let clone = cloneDeep(params);
  forEach(params, (value, key) => {
    let keyUnMapped = findKey(mapper, partial(isEqual, value));
    clone[key] = keyUnMapped || value;
  });
  return clone;
}

function save(name, fileContent) {
  let stringFormat = null;
  if (fileContent && Array.isArray(fileContent)) {
    stringFormat = fileContent.join('\n');
  } else {
    stringFormat = fileContent;
  }
  let blob = new Blob([stringFormat], {type: 'text/plain'});
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, name);
  } else {
    let elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = name;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

function replaceMultiplePaths(inputString, replaceMap) {
  forEach(replaceMap, (value, key) => {
    let regex = new RegExp(`${key}.(.*)\\n`);
    let matches = inputString.match(regex);
    if (matches && matches.length > 1) {
      inputString = inputString.replace(matches[0], `${key} ${value}\n`);
    }
  });
  return inputString;
}

function handleError(error) {
  swal('Error', error.message, 'error');
}

export {
  compact,
  filterName,
  getDateLocalTime,
  handleError,
  mapAll,
  replaceMultiplePaths,
  save,
  unMapAll,
  unionArray,
};
