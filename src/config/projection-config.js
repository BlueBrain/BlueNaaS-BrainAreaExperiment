
// import get from 'lodash/get';
import merge from 'lodash/merge';
import { areas } from '@/common/constants';

const configFileName = 'projection-config.json';

const hippocampusProjections = {
  defaultProjection: {
    // a full projection has {name, weight, minisFreq, isMinis, isSpikeReplay, target, freq, type}
    name: 'Microcircuit Project',
    weight: 1,
    minisFreq: 0.01,
    isMinis: true,
    isSpikeReplay: false,
  },
  projectionBlock: {
    projectionSrcTarget: 'Schaffer Collateral Projection',
    Projection: {
      SC: {
        Path: '<%= prefix %>/circuit/projection',
        Source: 'proj_nrn',
        Type: 'Synaptic',
      },
    },
    // This connection goes here because is added only if projection
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
        spikeReplay: {
          Mode: 'Current',
          Delay: '0',
          Duration: '10000',
          Pattern: 'SynapseReplay',
          SpikeFile: './in.dat', // this will be generated with script
        },
      },
      StimulusInject: {
        spikeReplayIntoAll: {
          Stimulus: 'spikeReplay',
          Target: 'Mosaic',
        },
      },
    },
  },
};

const hippocampusMoocProjections = merge(
  {},
  hippocampusProjections,
  {
    projectionBlock: {
      projectionSrcTarget: 'CA3 Projection',
      Projection: {
        SC: {
          Path: '<%= prefix %>/circuit/projections/v3.2k/O1_ca1_20191017_projections_sorted.sonata',
        },
      },
      // This connection goes here because is added only if projection
      Connection: {
        SC_All: {
          Source: 'CA3_PC',
          Destination: 'Mosaic',
          // SpontMinis, // added if spontMinis proj was selected
          Weight: '1', // this will be changed by the user
        },
      },
      spikeReplay: hippocampusProjections.projectionBlock.spikeReplay,
    },
  },
);

const sscxProjections = {
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
};

const projections = {
  [areas.HIPPOCAMPUS]: hippocampusProjections,
  [areas.SSCX]: sscxProjections,
  [areas.HIPPOCAMPUS_MOOC]: hippocampusMoocProjections,
};

function getProjectionConfig() {
  // placeholder for next commit
  console.log(projections);
}

function getConfigFileName() {
  return configFileName;
}

export default {
};

export {
  getProjectionConfig,
  getConfigFileName,
};
