
const computers = {
  BB5: 'BB5',
  JURECA: 'JURECA',
  PIZ_DAINT: 'PIZ_DAINT',
  SERVICE_ACCOUNT_MOOC: 'SERVICE_ACCOUNT_MOOC',
};

const areas = {
  HIPPOCAMPUS: 'HIPPOCAMPUS',
  SSCX: 'SSCX',
  // TODO: change this mooc to specific config
  HIPPOCAMPUS_MOOC: 'HIPPOCAMPUS_MOOC',
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

export {
  analysis,
  areas,
  computers,
  saveParamNames,
};

export default computers;
