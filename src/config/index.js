
const configHBP = {
  auth: {
    clientId: 'c292031c-c91f-43fa-b1a9-72e65eb18e44',
    authUrl: 'https://services.humanbrainproject.eu/oidc/authorize',
  },
};

const configBBP = {
  auth: {
    clientId: 'mooc-voucher-management',
    authUrl: 'https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/auth',
    request: { nonce: null },
  },
  userEndpoint: 'https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/userinfo',
};

export {
  configHBP,
  configBBP,
};
