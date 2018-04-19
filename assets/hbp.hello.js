let axios = require('axios'); // to set the default header token
let hello = require('hellojs');
let authUrl = ( window.bbpConfig &&
                window.bbpConfig.auth &&
                window.bbpConfig.auth.url) ||
                'https://services.humanbrainproject.eu/oidc';
let token = null;

hello.init({
  'simlauncher': {
    'name': 'Human Brain Project',
    'oauth': {
      'version': '2',
      'auth': authUrl + '/authorize',
      'grant': authUrl + '/token',
    },
    // API base URL
    'base': authUrl + '/',
    'scope_delim': ' ', // eslint-disable-line camelcase
    'login': _login,
    'logout': _logout,
  },
});

function _login(p) {
  // Reauthenticate
  if (p.options.force) {
    p.qs.prompt = 'login';
  }
  // If no scope has been provided,
  // remove the param for the server to allocate
  // the default application scope.
  if (!p.qs.scope) {
    delete p.qs.scope;
  }
}

function _logout(callback, p) {
  if (p.options.force) {
    let token = p.authResponse.access_token;
    /* eslint-disable no-undef */
    let oReq = new XMLHttpRequest();
    oReq.onload = function() {
      callback();
    };
    oReq.open('post', authUrl + '/slo', true);
    oReq.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    oReq.withCredentials = true;
    oReq.send(JSON.stringify({'token': token}));
  } else {
    callback();
  }
}

function init() {
  hello.init({
    'simlauncher': 'c292031c-c91f-43fa-b1a9-72e65eb18e44',
  });
  return hello.login('simlauncher', {
    'display': 'page',
    'force': false,
    'page_uri': window.location.href,
  })
  .then((data) => {
    token = data.authResponse.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, (error) => {throw Error('init ' + e);});
}

function isAuth() {
  // if was not assigned yet
  if (!token) return init();
  // if we have already check expiration
  let session = hello('simlauncher').getAuthResponse();
  let valid = session.expires > (new Date).getTime()/1000;
  if (!valid) return init();
  return Promise.resolve();
}

export {
  isAuth,
  token,
};
