
const computers = {
  BB5: 'bb5',
  JURECA: 'jureca',
  PIZ_DAINT: 'piz_daint',
  SERVICE_ACCOUNT_MOOC: 'service_account_mooc',
};

const circuits = {
  HIPPO_HBP_MICROCIRCUIT: 'hippo_hbp_microcircuit',
  HIPPO_MOOC_SA_MICROCIRCUIT: 'hippo_mooc_sa_microcircuit',
  HIPPO_HBP_FULL_CA1: 'hippo_hbp_full_ca1',
  HIPPO_BBP_FULL_CA1: 'hippo_bbp_full_ca1',
  HIPPO_BBP_MICROCIRCUIT: 'hippo_bbp_microcircuit',
  SSCX_BBP_MICROCIRCUIT: 'sscx_bbp_microcircuit',
  SSCX_BBP_MOUSE_MICROCIRCUIT: 'sscx_bbp_mouse_microcircuit',
  HBP_DYNAMIC_CIRCUIT: 'bbp_dynamic_circuit',
  BBP_DYNAMIC_CIRCUIT: 'hbp_dynamic_circuit',
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
};

const errorMessages = {
  NO_QUERY_PARAMS: 'Query params not provided',
  NO_SESSION_ENDPOINT: 'no end session endpoint', // from oidc-client-js
  REDIRECT_LOGIN_REQUIRED: 'redirect window is required',
  CIRCUIT_NOT_PROVIDED: 'No circuit provided',
  IS_INDEX: 'is index',
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
