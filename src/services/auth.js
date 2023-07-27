
import Oidc from 'oidc-client';
import { setAxiosToken, isTokenValid } from '@/services/unicore';
import store from '@/services/store';
import { configHBP, configBBP } from '@/config';
import { errorMessages, computers, storageConstants } from '@/common/constants';
import {
  isDynamicCircuit,
  showErrorPage,
  getCircuitName,
} from '@/services/helper/dynamic-circuit-loader-helper';
import {
  getAuth,
  setAuth,
  setSavedUrl,
  getSavedUrl,
} from '@/services/db';
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

async function login(authMgr) {
  const user = await authMgr.getUser().catch(err => console.error(err));

  if (!user) {
    console.debug('[windows signin]');
    await windowSignin(authMgr);
    // throw to stop processing (this will be catched in main.js)
    throw new Error(errorMessages.REDIRECT_LOGIN_REQUIRED);
  }
  if (user.expired) {
    await authMgr.removeUser();
    await authMgr.signoutRedirect();
    window.location.href = getSavedUrl();
  }
  setAxiosToken(user.access_token);
}

function saveVmmAuth() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const vmmAuth = urlSearchParams.get(storageConstants.AUTH);
  if (!vmmAuth) return;

  const savedAuth = getAuth();
  if (savedAuth !== vmmAuth) setAuth(vmmAuth);
}

function saveEbrainsAuth(token) {
  const savedAuth = getAuth();
  if (savedAuth !== token) setAuth(token);
}

function loginEbrainsCallback() {
  return new Oidc.UserManager().signinRedirectCallback()
    .then(user => saveEbrainsAuth(user.access_token));
}

function checkToken() {
  const token = getAuth();
  const prefix = '';
  setAxiosToken(token, prefix);
  return isTokenValid();
}

function init() {
  const { hash, href, search: queries } = window.location;

  const isIndex = hash === '#/';
  if (isIndex) { return Promise.resolve(errorMessages.IS_INDEX); }

  if (hash.includes('/login')) {
    return loginEbrainsCallback().then(() => {
      // restore as it was before login
      window.location.href = getSavedUrl();
    });
  }

  if (isDynamicCircuit() && queries === '') {
    showErrorPage(errorMessages.NO_QUERY_PARAMS);
    return Promise.reject(new Error(errorMessages.NO_QUERY_PARAMS));
  }

  const fullConfig = initialStateGenerator.setupInitialStates();
  store.commit('setCurrentSimulationConfig', fullConfig);

  if (fullConfig.computer === computers.BB5_MOOC) {
    saveVmmAuth();
    return checkToken();
  }

  setSavedUrl(href);
  const oidcConfig = createAuthConfig();
  const authMgr = new Oidc.UserManager(oidcConfig);
  return login(authMgr);
}

export default {
  init,
};
