
import { computers, circuits } from '@/common/constants';

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

const hippocampusMoocProjections = Object.assign(
  {},
  hippocampusProjections,
  {
    projectionBlock: {
      projectionSrcTarget: 'CA3_PC',
      Projection: {
        SC: {
          Path: '<%= prefix %>/sonata/edges/edges.h5:hippocampus_projections__hippocampus_neurons__chemical',
        },
      },
      // This connection goes here because is added only if projection
      Connection: {
        SC_All: {
          Source: 'hippocampus_projections:',
          Destination: 'Mosaic',
          // SpontMinis, // added automatically if spontMinis proj was selected
          Weight: '1.0', // this will be changed by the user
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
        Path: '/gpfs/bbp.cscs.ch/project/proj64/circuits/O1.v6a/20171212/proj_Thalamocortical_VPM/20171214-2/',
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

const sscxMouseProjections = {
  defaultProjection: hippocampusProjections.defaultProjection,
  projectionBlock: {
    projectionSrcTarget: 'proj_Thalamocortical_VPM_Source',
    Projection: {
      Thalamocortical_input_VPM: {
        Path: '<%= prefix %>/circuit/proj_Thalamocortical_VPM/sonata/edges.h5',
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

const projectionsConfigMapping = {
  [computers.JURECA]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, hippocampusProjections),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, hippocampusProjections),
  },
  [computers.PIZ_DAINT]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, hippocampusProjections),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, hippocampusProjections),
  },
  [computers.BB5]: {
    [circuits.HIPPO_BBP_FULL_CA1]: Object.assign({}, hippocampusProjections),
    [circuits.HIPPO_BBP_MICROCIRCUIT]: Object.assign({}, hippocampusProjections),
    [circuits.SSCX_BBP_MICROCIRCUIT]: Object.assign({}, sscxProjections),
  },
  [computers.SERVICE_ACCOUNT]: {
    [circuits.HIPPO_MOOC_SA_MICROCIRCUIT]: Object.assign({}, hippocampusMoocProjections),
    [circuits.HIPPO_HBP_SA_FULL_CA1]: Object.assign({}, hippocampusProjections),
    [circuits.SSCX_HBP_SA_MOUSE_MICROCIRCUIT]: Object.assign({}, sscxMouseProjections),
  },
};

function getProjectionConfig(computer, circuit) {
  const computerConfig = projectionsConfigMapping[computer];
  return computerConfig[circuit];
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
