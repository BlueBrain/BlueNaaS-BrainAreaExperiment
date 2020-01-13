
const configHBP = {
  auth: {
    clientId: 'c292031c-c91f-43fa-b1a9-72e65eb18e44',
    authUrl: 'https://services.humanbrainproject.eu/oidc',
  },
};

const configBBP = {
  auth: {
    clientId: 'sim-launcher-ui-unicore',
    authUrl: 'https://bbpteam.epfl.ch/auth/realms/BBP',
    request: { nonce: 'null' },
  },
  userEndpoint: 'https://bbpteam.epfl.ch/auth/realms/BBP/protocol/openid-connect/userinfo',
};

export {
  configHBP,
  configBBP,
};
