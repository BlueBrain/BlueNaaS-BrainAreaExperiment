
const computers = {
  PIZ_DAINT: 'piz_daint',
  SERVICE_ACCOUNT: 'service_account',
  BB5_MOOC: 'bb5_mooc',
};

const circuits = {
  HIPPO_HBP_MICROCIRCUIT: 'hippo_hbp_microcircuit',
  HIPPO_HBP_SA_MICROCIRCUIT: 'hippo_hbp_sa_microcircuit',
  HIPPO_HBP_FULL_CA1: 'hippo_hbp_full_ca1',
  HIPPO_HBP_SA_FULL_CA1: 'hippo_hbp_sa_full_ca1',
  SSCX_HBP_SA_MOUSE_MICROCIRCUIT: 'sscx_hbp_sa_mouse_microcircuit',
  HBP_DYNAMIC_CIRCUIT: 'hbp_dynamic_circuit',
  BB5_MOOC: 'bb5_mooc',
};

const saveParamNames = {
  CONNECTION: 'CONNECTION',
  PROJECTION: 'PROJECTION',
  REPORT: 'REPORT',
  STIMULATION: 'STIMULATION',
  SIM_PARAMS: 'SIM_PARAMS',
  UNICORE: 'UNICORE',
};

const analysis = {
  types: {
    FIRING_RATE_HISTOGRAM: 'firing_rate_histogram',
    RASTER: 'raster',
    VOLTAGE_COLLAGE: 'voltage_collage',
  },
  voltage_collage: {
    MAX_AMOUNT_GIDS: 20,
  },
  default: {
    MAX_AMOUNT_GIDS: 1000,
  },
};

const storageConstants = {
  COMPUTER_PREFIX: 'user-computer',
  GROUP_PREFIX: 'user-group',
  MAPPING_PREFIX: 'computer-group-mapping',
  AUTH: 'auth',
  SAVED_URL: 'saved-url',
};

const errorMessages = {
  NO_QUERY_PARAMS: 'Query params not provided',
  NO_SESSION_ENDPOINT: 'no end session endpoint', // from oidc-client-js
  REDIRECT_LOGIN_REQUIRED: 'redirect window is required',
  CIRCUIT_NOT_PROVIDED: 'No circuit provided',
  IS_INDEX: 'is index',
  CANCELED_REQUEST: 'Stop from the user',
  TOKEN_EXPIRED: 'Token has expired',
};

export {
  analysis,
  computers,
  circuits,
  saveParamNames,
  storageConstants,
  errorMessages,
};

export default computers;
