import moment from 'moment';
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
};
