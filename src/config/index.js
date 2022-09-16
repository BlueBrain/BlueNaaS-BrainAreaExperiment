import { computers } from '@/common/constants';

export const configHBP = {
  auth: {
    clientId: 'ebrains-sim-ui',
    authUrl: 'https://iam.ebrains.eu/auth/realms/hbp',
  },
};

export const configBBP = {
  auth: {
    clientId: 'sim-launcher-ui-unicore',
    authUrl: 'https://bbpauth.epfl.ch/auth/realms/BBP',
  },
  userEndpoint: 'https://bbpauth.epfl.ch/auth/realms/BBP/protocol/openid-connect/userinfo',
  computerName: computers.BB5_MOOC,
};

export default configBBP;
