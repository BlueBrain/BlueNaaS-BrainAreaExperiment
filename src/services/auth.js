
import { JSO } from 'jso';
import axios from 'axios';

import store from '@/services/store';
import config from '@/config';

const client = new JSO({
  client_id: config.auth.clientId,
  redirect_uri: `${window.location.href}/`,
  authorization: config.auth.authUrl,
  response_type: 'id_token token',
  request: config.auth.request,
});

function init() {
  client.callback();

  /*
   * check if the access_token is in the URL and remove it to avoid
   * going to another page that consider access_token as param
   */
  if (window.location.href.includes('access_token')) {
    /* eslint-disable no-console */
    console.debug('URL has token, removing it ...');
    /* eslint-enable no-console */
    const url = window.location.href;
    const accessTokenIndex = url.indexOf('%2F&access_token') || url.indexOf('access_token');
    window.location.href = url.substr(0, accessTokenIndex);
  }

  const authorization = client.getToken();
  authorization.then((session) => {
    store.commit('setToken', session.access_token);
    axios.defaults.headers.common.Authorization = `Bearer ${session.access_token}`;
  });

  return authorization;
}

export default {
  init,
};
