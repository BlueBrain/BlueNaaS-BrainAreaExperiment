
const computers = {
  BB5: 'BB5',
  NUVLA: 'NUVLA',
  JURECA: 'JURECA',
  PIZ_DAINT: 'PIZ_DAINT',
};

const areas = {
  HIPPOCAMPUS: 'HIPPOCAMPUS',
  SSCX: 'SSCX',
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
