
import { computers, circuits } from '@/common/constants';

const reportOnGeneric = {
  voltage: {
    displayName: 'Voltage',
    name: 'v',
    type: 'compartment',
    unit: 'mV',
  },
  calcium: {
    displayName: 'Calcium Concentration',
    name: 'cai',
    type: 'compartment',
    unit: 'mM',
  },
  lfp: {
    displayName: 'Current Summation (for LFP)',
    name: 'i_membrane IClamp',
    type: 'Summation',
    unit: 'nA',
  },
};

const stimuliGeneric = [
  { name: 'Linear', params: ['AmpStart', 'AmpEnd'] },
  { name: 'NPoisson', params: ['Lambda', 'Weight', 'NumOfSynapses'] },
  { name: 'Noise', params: ['MeanPercent', 'Variance'] },
];

const genericSimulationConfig = {
  importSimulationScript: 'ln -sf SIMFOLDERPATH/* . && rm ./BlueConfig && cp SIMFOLDERPATH/BlueConfig .',
  stimuli: Object.assign([], stimuliGeneric),
  reportOn: Object.assign({}, reportOnGeneric),
  checksForLFP: ['AllCompartments', 'Summation'],
};

const sonataGenericSimulationConfig = Object.assign(
  {},
  genericSimulationConfig,
  {
    checksForLFP: ['AllCompartments'],
    reportOn: Object.assign(
      {},
      reportOnGeneric,
      {
        lfp: {
          displayName: 'Current Summation (for LFP)',
          name: 'i_membrane',
          type: 'compartment',
          unit: 'nA',
        },
      },
    ),
  },
);

const basePizDaintHippocampus = {
  script: [
    '#!/bin/bash -l',
    'module purge',
    'module load PrgEnv-intel intel',
    'module load daint-mc cray-python/3.9.4.1',
    'module use /apps/hbp/ich002/hbp-spack-deployments/softwares/23-02-2022/modules/tcl/cray-cnl7-haswell',
    'module load neurodamus-hippocampus',
    'module load py-neurodamus',
    'module load py-bluepy',
    'export HDF5_USE_FILE_LOCKING=FALSE',
    'export NEURON_INIT_MPI=1',
    '# Avoid warnings during execution',
    'export PMI_NO_FORK=1',
    'export PMI_NO_PREINITIALIZE=1',
    'export PMI_MMAP_SYNC_WAIT_TIME=300',
    'module list',
    'python3 /apps/hbp/ich002/home/antonel/create_replay_piz_daint_0.22.0.py -vv',
  ],
  runtime: 3600,
  nodes: 1,
  cpus: 36,
  executable: '/bin/bash input.sh',
  nodeType: 'mc',
  memory: 64000,
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const pizDaintSonata = Object.assign(
  {},
  basePizDaintHippocampus,
  {
    script: [
      ...basePizDaintHippocampus.script,
      'python3 /apps/hbp/ich002/home/antonel/simulation_launch_piz_daint_0.22.0.py -vv --sonata',
    ],
    genericSimulationConfig: Object.assign({}, sonataGenericSimulationConfig),
  },
);

const pizDaintLegacyCircuit = Object.assign(
  {},
  basePizDaintHippocampus,
  {
    script: [
      ...basePizDaintHippocampus.script,
      'python3 /apps/hbp/ich002/home/antonel/simulation_launch_piz_daint_0.22.0.py -vv',
    ],
  },
);

const pizDaintMouseSSCxServiceAccount = {
  script: [
    '#!/bin/bash -l',
    'module purge',
    'module load PrgEnv-intel intel',
    'module load daint-mc cray-python/3.9.4.1',
    'module use /apps/hbp/ich002/hbp-spack-deployments/softwares/23-02-2022/modules/tcl/cray-cnl7-haswell',
    'module load neurodamus-mousify',
    'module load py-neurodamus',
    'module load py-bluepy',
    'export HDF5_USE_FILE_LOCKING=FALSE',
    'export NEURON_INIT_MPI=1',
    '# Avoid warnings during execution',
    'export PMI_NO_FORK=1',
    'export PMI_NO_PREINITIALIZE=1',
    'export PMI_MMAP_SYNC_WAIT_TIME=300',
    'module list',
    'python /apps/hbp/ich002/home/antonel/create_replay_piz_daint_0.22.0.py -vv',
    'python /apps/hbp/ich002/home/antonel/simulation_launch_piz_daint_0.22.0.py -vv --sonata',
  ],
  runtime: 3600,
  nodes: 1,
  cpus: 36,
  executable: '/bin/bash input.sh',
  nodeType: 'mc',
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const moocHippocampus = {
  // will be replaced in the backend
  script: 'SIMULATION_SCRIPT_PLACEHOLDER',
  runtime: 3600,
  nodes: 2,
  cpus: 36,
  executable: '/bin/bash input.sh',
  project: null,
  memory: 64000,
  nodeType: 'uc3',
  partitions: { '*': 'prod' },
  account: 'proj133',
  moveSimulation: true,
  genericSimulationConfig: Object.assign({}, sonataGenericSimulationConfig),
};

const simConfigMapping = {
  [computers.PIZ_DAINT]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, pizDaintSonata),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, pizDaintLegacyCircuit),
  },
  [computers.SERVICE_ACCOUNT]: {
    [circuits.HIPPO_HBP_SA_MICROCIRCUIT]: Object.assign({}, pizDaintSonata),
    [circuits.HIPPO_HBP_SA_FULL_CA1]: Object.assign({}, pizDaintLegacyCircuit),
    [circuits.SSCX_HBP_SA_MOUSE_MICROCIRCUIT]: Object.assign({}, pizDaintMouseSSCxServiceAccount),
  },
  [computers.BB5_MOOC]: {
    [circuits.BB5_MOOC]: Object.assign({}, moocHippocampus),
  },
};

function getSimulationConfig(computer, circuit) {
  const computerConfig = simConfigMapping[computer];
  return computerConfig[circuit];
}

export default {
  getSimulationConfig,
};

export {
  getSimulationConfig,
};
