import moment from 'moment';
import {
  pickBy, forEach, cloneDeep,
  findKey, partial, isEqual, union,
} from 'lodash';

const QUEUED_STATUS = 'QUEUED';
const RUNNING_STATUS = 'RUNNING';

let mapper = {
  'FullCA1': 'Mosaic',
  'voltage': 'v',
  'Soma': 'compartment',
  'Poisson': 'NPoisson',
};

let filterName = function(name) {
  return name.replace(/[^[a-z0-9 \/.\-()]/gi, '');
};

let getDateLocalTime = function(dateString) {
  if (dateString) {
    let d = moment(dateString);
    return d.format('DD/MM/YYYY HH:mm:ss');
  }
};

let compact = function(object) {
  return pickBy(object);
};

let unionArray = function(array) {
  return union(array);
};

let mapAll = function(params) {
  if (typeof params === 'string') {
    return mapper[params] || params;
  }
  let clone = cloneDeep(params);
  forEach(params, (value, key) => {
    clone[key] = mapper[value] || value;
  });
  return clone;
};

let unMapAll = function(params) {
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
};

let save = function(name, fileContent) {
  let stringFormat = null;
  if (fileContent && Array.isArray(fileContent)) {
    stringFormat = fileContent.join('\n');
  } else {
    stringFormat = fileContent;
  }
  let blob = new Blob([stringFormat], {'type': 'text/plain'});
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
};

let matchFiles = function(jobURL, userProject) {
  let reg = new RegExp('7112/(.*)/rest/.*files/(.+)');
  let m = jobURL.match(reg);
  console.debug(`Getting from ${m[1]} file ${m[2]} using ${userProject}`);
};

let urlToId = function(jobURL) {
  // a.match(new RegExp('7112/HBP_(.+)/rest.*jobs/(.*)'))
  let reg = new RegExp('7112/HBP_(.+)/rest.*jobs/(.*)');
  let m = jobURL.match(reg);
  if (m.length > 2) {
    return {'computer': m[1], 'id': m[2]};
  }
};

let replaceMultiplePaths = function(inputString, replaceMap) {
  forEach(replaceMap, (value, key) => {
    let regex = new RegExp(`${key}.(.*)\\n`);
    let matches = inputString.match(regex);
    if (matches && matches.length > 1) {
      inputString = inputString.replace(matches[0], `${key} ${value}\n`);
    }
  });
  return inputString;
};

let replaceConst = function(inputString, replaceMap) {
  forEach(replaceMap, (value, key) => {
    if (inputString.includes(`{{${key}}}`)) {
      inputString = inputString.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });
  return inputString;
};

let isRunning = function(status) {
  return status === QUEUED_STATUS ||
    status === RUNNING_STATUS ||
    status === '';
};

export default {
  getDateLocalTime,
  compact,
  mapAll,
  unMapAll,
  save,
  matchFiles,
  urlToId,
  filterName,
  replaceMultiplePaths,
  unionArray,
};

export {
  urlToId,
  replaceMultiplePaths,
  replaceConst,
  unionArray,
  isRunning,
};
