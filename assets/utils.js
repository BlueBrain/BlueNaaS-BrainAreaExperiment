import moment from 'moment';
import {
  pickBy, unionBy, forEach, cloneDeep,
  findKey, partial, isEqual,
} from 'lodash';

let mapper = {
  'FullCA1': 'Mosaic',
  'voltage': 'v',
  'Soma': 'compartment',
  'Poisson': 'NPoisson',
};

export default {
  'filterName': function(name) {
    return name.replace(/[^[a-z0-9 \/.\-()]/gi, '');
  },
  'getDateLocalTime': function(dateString) {
    if (dateString) {
      let d = moment(dateString);
      return d.format('DD/MM/YYYY HH:mm:ss');
    }
  },
  'compact': function(object) {
    return pickBy(object);
  },
  'unionTargets': function(reports, stimuli, model) {
    return unionBy(reports, stimuli, model, 'Target');
  },
  'mapAll': function(params) {
    if (typeof params === 'string') {
      return mapper[params] || params;
    }
    let clone = cloneDeep(params);
    forEach(params, (value, key) => {
      clone[key] = mapper[value] || value;
    });
    return clone;
  },
  'unMapAll': function(params) {
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
  },
  'save': function(name, fileContent) {
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
  },
};
