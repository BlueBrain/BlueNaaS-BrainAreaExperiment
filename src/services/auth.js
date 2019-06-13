
import { JSO } from 'jso';
import { setAxiosToken } from '@/services/unicore';

import store from '@/services/store';
import { configHBP, configBBP } from '@/config';

let client = null;
if (store.state.currentCircuit) {
  const isBBP = store.state.currentCircuit.includes('bbp_');
  const actualAuthProvider = isBBP ? configBBP : configHBP;

  client = new JSO({
    client_id: actualAuthProvider.auth.clientId,
    redirect_uri: `${window.location.href}/`,
    authorization: actualAuthProvider.auth.authUrl,
    response_type: 'id_token token',
    request: actualAuthProvider.auth.request,
  });
}

function init() {
  const isIndex = window.location.hash === '#/';
  if (!client && isIndex) { return Promise.resolve(); }

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
    setAxiosToken(session.access_token);
  });

  return authorization;
}

export default {
  init,
};
