// import uuid from 'uuid4'
// import typesCollabsApps from '../assets/config_files/types_collabs_apps.json'
import collabAuthentication from './collabAuthentication.js';
const BLUEPY_CONFIG_V0 = 'https://services.humanbrainproject.eu/bluepy/v0/api/blueconfig/';
// const STORAGE_ENTITY = 'https://services.humanbrainproject.eu/storage/v1/api/entity/';
const UNICORE_URL = 'https://hbp-unic.fz-juelich.de:7112/HBP_JUQUEEN/rest/core/';
const UNICORE_TOKEN = 'Bearer ..';

export default {
  'data' () {
    return {
      header: {}
    };
  },
  'mixins': [collabAuthentication],
  'created' () {
    this.fillToken();
  },
  'methods': {
    'fillToken': function (renew) {
      let that = this;
      this.getToken(renew).then(function (token) {
        that.header = {headers: {'Authorization': token}};
      }); // from collabAuthentication
    },
    'saveCompleteConfig': function (config) {
      let that = this;
      return new Promise(function (resolve, reject) {
        that.$http.post(BLUEPY_CONFIG_V0 + 'txt/', config, that.header)
        .then(function (response) {
          if (response.ok) {
            return resolve('Configuration saved');
          }
        }, function (error) {
          if (error.status === 401) {
            window.localStorage.setItem('blupyconfig', JSON.stringify(config));
            that.login('none').then(function () {
              // login in the background
              that.fillToken();
            });
          }
         reject('Error', error);
        });
      });
    },
    'loadCompleteConfig': function () {
      let that = this;
      return new Promise(function (resolve, reject) {
        // let url = STORAGE_ENTITY + '?uuid=41c6c0f6-a590-4a99-bb8c-30b6668b49bd';
        let url = BLUEPY_CONFIG_V0 + '41c6c0f6-a590-4a99-bb8c-30b6668b49bd';
        that.$http.get(url, that.header)
        .then(function (response) {
          return resolve(response.body);
        }, function (error) {
          if (error.status === 401) {
            that.fillToken(true);
          }
          console.log(error);
          reject('Error', error);
        });
      });
    },
    'loadLocalConfig': function () {
      return Promise.resolve(require('assets/entity.json'));
    },
    'reserveJob': function () {
      let that = this;
      return new Promise(function (resolve, reject) {
        let header = {headers: {
          'Authorization': UNICORE_TOKEN,
          'Accept': 'application/json'
        }};
        let config = {
          'ApplicationName': 'BSP',
          'Parameters': {
              'CONFIG': 'BlueConfig',
              'TARGET': 'user.target',
              'OUTPUT': 'output',
          },
          'haveClientStageIn': 'True',
          'Resources': {
              'Nodes': 32
          }
        };

        that.$http.post(UNICORE_URL + 'jobs/', config, header)
        .then(function (response) {
          if (response.ok) {
            console.log('job was reserved');
            let location = response.headers.Location;
            return resolve(location);
          }
        }, function (error) {
         reject('Error cretating job reservation', error);
        });
      });
    },
    'stageFile': function (workingDirectory, fileName, file) {
      let that = this;
      return new Promise(function (resolve, reject) {
        let header = {headers: {
          'Authorization': UNICORE_TOKEN,
          'Content-Type': 'application/octet-stream'
        }};
        let url = UNICORE_URL + 'storages/' + 'files/' + fileName;
        that.$http.put(url, file, header)
        .then(function (response) {
          if (response.ok) {
            console.log('File ' + fileName + ' was staged');
            return resolve(response.body);
          }
        }, function (error) {
         reject('Error staging file', error);
        });
      });
    },
    'getLocation': function (location) {
      let that = this;
      return new Promise(function (resolve, reject) {
        let header = {headers: {
          'Authorization': UNICORE_TOKEN,
          'Accept': 'application/json'
        }};
        that.$http.get(UNICORE_URL + 'jobs/' + location, header)
        .then(function (response) {
          if (response.ok) {
            console.log('Location was received');
            return resolve(response.body);
          }
        }, function (error) {
         reject('Error getting the location', error);
        });
      });
    }
  }
};
