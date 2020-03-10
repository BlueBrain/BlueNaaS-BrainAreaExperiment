
import Oidc from 'oidc-client';
import { setAxiosToken, axiosInstance } from '@/services/unicore';
import store from '@/services/store';
import { configHBP, configBBP } from '@/config';
import { errorMessages } from '@/common/constants';
import {
  isDynamicCircuit,
  saveAndRemoveQueries,
  showErrorPage,
  getCircuitName,
} from '@/services/helper/dynamic-circuit-loader-helper';


function windowSignin(authMgr) {
  console.debug('[windowSignin]', window.location.href);
  return authMgr.signinRedirect();
}

function getActualAuthProvider() {
  // TOOD improve this detection
  const isBBP = getCircuitName().includes('bbp_');
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

function init() {
  if (window.location.hash.includes('/login')) {
    return loginCallback();
  }

  const isIndex = window.location.hash === '#/';
  if (isIndex) { return Promise.resolve(errorMessages.IS_INDEX); }

  const hadQueryParams = saveAndRemoveQueries();

  if (isDynamicCircuit() && !hadQueryParams) {
    showErrorPage(errorMessages.NO_QUERY_PARAMS);
    return Promise.reject(new Error(errorMessages.NO_QUERY_PARAMS));
  }

  const oidcConfig = createAuthConfig();
  const authMgr = new Oidc.UserManager(oidcConfig);
  return login(authMgr);
}

async function getUserInfo() {
  const actualAuthProvider = getActualAuthProvider();
  const info = await axiosInstance.get(actualAuthProvider.userEndpoint);
  if (!info) return null;
  return info.data;
}

async function getUserProjects() {
  const userInfo = await getUserInfo();
  const projectPrefix = '/bbp-dev-proj';
  const regexp = `${projectPrefix}(\\d+)`;

  const projects = userInfo.groups
    .filter(g => g.startsWith(projectPrefix))
    .map((groupString) => {
      const match = groupString.match(regexp);
      if (!match || !match.length) return false;
      return `proj${match[1]}`;
    })
    .filter(group => group);
  return projects;
}

export default {
  init,
  getUserProjects,
};
