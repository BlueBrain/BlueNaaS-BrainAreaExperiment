import moment from 'moment';
import pickBy from 'lodash/pickBy';
import unionBy from 'lodash/unionBy';
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
  'blueConfigMapper': function(param) {
    return mapper[param] || param;
  },
  'unionTargets': function(reports, stimuli, model) {
    return unionBy(reports, stimuli, model, 'Target');
  },
};
