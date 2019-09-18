
import get from 'lodash/get';
import constants from '@/common/constants';

const configFileName = 'projection-config.json';

const hippocampusProjections = {
  defaultProjection: {
    name: 'Microcircuit Project',
    weight: 1,
    minisFreq: 0.01,
    isMinis: true,
    isSpikeReplay: false,
    // target, // will be added on by the projection list component
    freq: 0.1,
    type: 'Poisson',
  },
  projectionBlock: {
    projectionSrcTarget: 'SC',
    Projection: {
      SC: {
        Path: '<%= prefix %>/circuit/projection',
        Source: 'proj_nrn',
        Type: 'Synaptic',
      },
    },
    Connection: {
      SC_All: {
        Source: 'SC',
        Destination: 'Mosaic',
        // SpontMinis, // added if spontMinis proj was selected
        Weight: '1', // this will be changed by the user
      },
    },
    spikeReplay: {
      Stimulus: {
        spikeReplay_stimulus_0: {
          Mode: 'Current',
          Delay: '0',
          Duration: '10000',
          Pattern: 'SynapseReplay',
          SpikeFile: './in.dat', // this will be generated with script
        },
      },
      StimulusInject: {
        spikeReplay_stimulusinject_0: {
          Stimulus: 'spikeReplay_stimulus_0',
          Target: 'Mosaic',
        },
      },
    },
  },
};


const sscxProjections = Object.assign(
  {},
  {
    defaultProjection: hippocampusProjections.defaultProjection,
    projectionBlock: {
      projectionSrcTarget: 'proj_Thalamocortical_VPM_Source',
      Projection: {
        Thalamocortical_input_VPM: {
          Path: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj64/circuits/O1.v6a/20171212/proj_Thalamocortical_VPM/20171214-2/',
          Source: 'proj_Thalamocortical_VPM_Source',
        },
      },
      Connection: {
        scheme_CaUse_ee_tc2c: {
          Source: 'proj_Thalamocortical_VPM_Source',
          Destination: 'Mosaic',
          // SpontMinis, // added if spontMinis proj was selected
          Weight: '1', // this will be changed by the user
          SynapseConfigure: '%s.Use *= 0.158401372855',
        },
      },
      spikeReplay: hippocampusProjections.projectionBlock.spikeReplay,
    },
  },
);

const projections = {
  [constants.areas.HIPPOCAMPUS]: hippocampusProjections,
  [constants.areas.SSCX]: sscxProjections,
};

function getDefaultProjection(area) {
  return get(projections, `[${area}].defaultProjection`, null);
}

function getProjectionBlocks(area) {
  return get(projections, `[${area}].projectionBlock`, null);
}

function getConfigFileName() {
  return configFileName;
}

export default {
  getDefaultProjection,
};

export {
  getDefaultProjection,
  getProjectionBlocks,
  getConfigFileName,
};
