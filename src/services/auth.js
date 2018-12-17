
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
