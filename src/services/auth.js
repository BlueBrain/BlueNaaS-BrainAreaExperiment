
import Oidc from 'oidc-client';
import { setAxiosToken, axiosInstance } from '@/services/unicore';
import store from '@/services/store';
import { configHBP, configBBP } from '@/config';

let actualAuthProvider = null;

function removeExtraURLParams() {
  const url = window.location.href;
  if (window.location.href.includes('access_token')) {
    const accessTokenIndex = url.match(/\/&+/);
    const newUrl = url.substr(0, accessTokenIndex.index);
    return newUrl;
  }
  return url;
}

function windowSignin(authMgr) {
  console.debug('[windowSignin]');
  return authMgr.signinRedirect().then(() => {
    console.debug('signinRedirect done');
  });
}

function iframeSignin(authMgr) {
  console.debug('[iframeSignin]');
  return authMgr.signinSilent().then((user) => {
    console.debug('signinSilent done');
    return user;
  });
}

function createAuthConfig() {
  const isBBP = store.state.currentCircuit.includes('bbp_');
  actualAuthProvider = isBBP ? configBBP : configHBP;

  const oidcConfig = {
    authority: actualAuthProvider.auth.authUrl,
    client_id: actualAuthProvider.auth.clientId,
    redirect_uri: `${removeExtraURLParams()}/`,
    response_type: 'id_token token',
    automaticSilentRenew: true,
    loadUserInfo: false,
    extraQueryParams: actualAuthProvider.auth.request,
  };
  return oidcConfig;
}

async function login(authMgr) {
  new Oidc.UserManager().signinSilentCallback();

  if (window.location.href.includes('access_token')) {
    window.location.href = removeExtraURLParams();
  }

  let user = await authMgr.getUser().catch(err => console.error(err));

  if (!user) {
    user = await iframeSignin(authMgr).catch(() => windowSignin(authMgr));
  }
  const client = user || {};
  if (client.expired) {
    console.debug('Token expired');
    await authMgr.removeUser();
    await authMgr.signoutRedirect();
  }
  store.commit('setToken', client.access_token);
  setAxiosToken(client.access_token);
}

function init() {
  const isIndex = window.location.hash === '#/';
  if (isIndex) { return Promise.resolve(); }

  const oidcConfig = createAuthConfig();
  const authMgr = new Oidc.UserManager(oidcConfig);
  return login(authMgr);
}

async function getUserInfo() {
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
