
const configHBP = {
  auth: {
    clientId: 'test-sim-ui-locally-1',
    authUrl: 'https://iam.ebrains.eu/auth/realms/hbp',
  },
};

const configBBP = {
  auth: {
    clientId: 'sim-launcher-ui-unicore',
    authUrl: 'https://bbpauth.epfl.ch/auth/realms/BBP',
  },
  userEndpoint: 'https://bbpauth.epfl.ch/auth/realms/BBP/protocol/openid-connect/userinfo',
};

export {
  configHBP,
  configBBP,
};
