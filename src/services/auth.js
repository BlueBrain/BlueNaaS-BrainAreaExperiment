
import Oidc from 'oidc-client';
import { setAxiosToken, tokenIsValid } from '@/services/unicore';
import store from '@/services/store';
import { configHBP, configBBP } from '@/config';
import { errorMessages, computers } from '@/common/constants';
import {
  isDynamicCircuit,
  saveAndRemoveQueries,
  showErrorPage,
  getCircuitName,
  restoreQueries,
} from '@/services/helper/dynamic-circuit-loader-helper';
import { getAuth } from '@/services/db';
import initialStateGenerator from '@/services/helper/initial-state-generator';


function windowSignin(authMgr) {
  console.debug('[windowSignin]', window.location.href);
  return authMgr.signinRedirect();
}

function getActualAuthProvider() {
  // TOOD improve this detection
  const isBBP = getCircuitName().includes(computers.BB5_MOOC);
  const actualAuthProvider = isBBP ? configBBP : configHBP;
  return actualAuthProvider;
}

function createAuthConfig() {
  const actualAuthProvider = getActualAuthProvider();

  const redirect = `${window.location.origin}${process.env.BASE_URL}index.html#/login/`;

  const oidcConfig = {
    authority: actualAuthProvider.auth.authUrl,
    client_id: actualAuthProvider.auth.clientId,
    redirect_uri: redirect,
    response_type: 'id_token token',
    automaticSilentRenew: true,
    loadUserInfo: false,
    extraQueryParams: actualAuthProvider.auth.request,
    scope: 'email profile openid',
  };
  return oidcConfig;
}

function setToken(token) {
  store.commit('setToken', token);
  setAxiosToken(token);
}

async function login(authMgr) {
  const user = await authMgr.getUser().catch(err => console.error(err));

  if (!user) {
    console.debug('[windows signin]');
    await windowSignin(authMgr);
    // throw to stop processing (this will be catched in main.js)
    throw new Error(errorMessages.REDIRECT_LOGIN_REQUIRED);
  }
  if (user.expired) {
    console.debug('Token expired');
    await authMgr.removeUser();
    await authMgr.signoutRedirect();
  }
  setToken(user.access_token);
}

function loginCallback() {
  return new Oidc.UserManager().signinRedirectCallback()
    .then(user => setToken(user.access_token));
}

function checkToken() {
  const token = getAuth();
  store.commit('setToken', token);
  return tokenIsValid();
}

function init() {
  if (window.location.hash.includes('/login')) {
    return loginCallback();
  }

  const isIndex = window.location.hash === '#/' || window.location.pathname === '/';
  if (isIndex) { return Promise.resolve(errorMessages.IS_INDEX); }

  const hadQueryParams = saveAndRemoveQueries();

  if (isDynamicCircuit() && !hadQueryParams) {
    showErrorPage(errorMessages.NO_QUERY_PARAMS);
    return Promise.reject(new Error(errorMessages.NO_QUERY_PARAMS));
  }

  restoreQueries();
  const fullConfig = initialStateGenerator.setupInitialStates();
  store.commit('setCurrentSimulationConfig', fullConfig);

  if (fullConfig.computer === computers.BB5_MOOC) {
    return checkToken();
  }

  const oidcConfig = createAuthConfig();
  const authMgr = new Oidc.UserManager(oidcConfig);
  return login(authMgr);
}

export default {
  init,
};
