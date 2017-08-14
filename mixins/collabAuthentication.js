let hbpHello = require('../assets/hbp.hello.js').hellojs;
// replace this with your collab app id
hbpHello.init({
    'hbp': 'c292031c-c91f-43fa-b1a9-72e65eb18e44',
});

export default {
    data() {
        return {
            'collabAPI': 'https://services.humanbrainproject.eu/collab/v0/',
        };
    },
    'methods': {
        login(displayMethod) {
            if (displayMethod === undefined) {
                displayMethod = 'page';
            }
            return new Promise(function(resolve, reject) {
                hbpHello.login('hbp', {'display': displayMethod, 'force': false, 'page_uri': window.location.href})
                .then(function() {
                    resolve();
                }, function(e) {
                    console.debug('Login Error', e);
                    reject();
                });
            });
        },
        logout() {
            return new Promise(function(resolve, reject) {
                hbpHello.logout('hbp', {'force': false})
                .then(function(event) {
                    console.debug('User Logout OK');
                    resolve();
                }, function(e) {
                    console.debug('Logout Error', e);
                    reject();
                });
            });
        },
        getToken(renew) {
            let that = this;
            return new Promise(function(resolve, reject) {
                let localToken = that.getLocalToken();
                if (localToken) { // token exists
                    if (renew) {
                        localToken.expires = 1; // to force logout and login
                        console.log('Renew token forced');
                    }
                    let currentTime = (new Date()).getTime() / 1000;
                    if (localToken.expires > currentTime) { // token is not expired and valid
                        let token = 'Bearer ' + localToken.access_token;
                        resolve(token);
                    } else { // token is expired
                        that.logout().then(function() {
                            that.login().then(function() {
                                let token = 'Bearer ' + that.getLocalToken().access_token;
                                resolve(token);
                            });
                        });
                    }
                } else { // token does not exist
                    that.login().then(function() {
                        let token = 'Bearer ' + that.getLocalToken().access_token;
                        resolve(token);
                    });
                }
            });
        },
        getLocalToken() {
            let helloStorage = window.localStorage.hello;
            let hbpStorage = null;
            if (helloStorage) {
                hbpStorage = JSON.parse(helloStorage).hbp;
            }
            return hbpStorage;
        },
    },
};
