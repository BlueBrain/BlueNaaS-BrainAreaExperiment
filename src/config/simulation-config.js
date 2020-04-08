
import { computers, circuits } from '@/common/constants';
import { copyToDestinationScript, copyFromDestinationScript } from '@/common/bbp-unicore-move-script';

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

const jurecaHippocampus = {
  script: [
    '#!/bin/sh -l',
    '. /etc/profile',
    'module --force purge all',
    'module load Architecture/KNL',
    'module load Intel/2019.5.281-GCC-8.3.0 IntelMPI/2019.6.154',
    'module load Python/3.6.8 SciPy-Stack/2019a-Python-3.6.8',
    'export NFRAME=1000',
    'module use /p/project/cvsk25/software-deployment/HBP/jureca-booster/25-03-2020/modules/tcl/linux-centos7-haswell',
    'module load py-bluepy/0.14.6',
    'module load HDF5/1.10.5',
    'module load neurodamus-hippocampus/0.4-knl',
    'python /p/project/cvsk25/vsk2512/analysis/create_replay_jureca_0.19.0.py',
    'python /p/project/cvsk25/vsk2512/analysis/simulation_launch_jureca_0.19.0.py',
  ],
  runtime: 3600,
  nodes: 3,
  cpus: 68,
  partitions: { vsk25: 'booster' },
  executable: '/bin/bash input.sh',
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const pizDaintHippocampus = {
  script: [
    '#!/bin/bash -l',
    '. /etc/profile',
    'module load daint-mc cray-python/3.6.5.7 PyExtensions/3.6.5.7-CrayGNU-19.10',
    'module use /apps/hbp/ich002/hbp-spack-deployments/softwares/25-03-2020/install/modules/tcl/cray-cnl7-haswell',
    'module load neurodamus-hippocampus/0.4',
    'module load py-bluepy/0.14.6',
    'export NFRAME=1000',
    'export HDF5_USE_FILE_LOCKING=FALSE',
    'python /apps/hbp/ich002/home/antonel/create_replay_piz_daint_0.19.0.py -vv',
    'python /apps/hbp/ich002/home/antonel/simulation_launch_piz_daint_0.19.0.py -vv',
  ],
  runtime: 3600,
  nodes: 3,
  cpus: 36,
  executable: '/bin/bash input.sh',
  nodeType: 'mc',
  memory: 64000,
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const bb5Hippocampus = {
  script: [
    '#!/bin/bash -l',
    '. /etc/profile',
    ...copyToDestinationScript,
    'module purge',
    'module load unstable',
    'module load py-bluepy',
    'module load neurodamus-hippocampus',
    'module load brion',
    'export NFRAME=1000',
    'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/create_replay_bb5_0.19.0.py',
    'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/simulation_launch_bb5_0.19.0.py',
    ...copyFromDestinationScript,
  ],
  runtime: 3600,
  nodes: 2,
  cpus: 36,
  executable: '/bin/bash input.sh',
  project: null,
  memory: 64000,
  nodeType: 'uc3',
  partitions: { '*': 'prod' },
  qos: 'bigjob',
  moveSimulation: true,
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const bb5Sscx = {
  script: [
    '#!/bin/bash -l',
    '. /etc/profile',
    ...copyToDestinationScript,
    'module load unstable',
    'module load neurodamus-neocortex',
    'module load py-bluepy',
    'module load brion',
    'export NFRAME=256',
    'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/create_replay_bb5_0.19.0.py',
    'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/simulation_launch_bb5_0.19.0.py',
    ...copyFromDestinationScript,
  ],
  runtime: 3600,
  nodes: 5,
  cpus: 36,
  executable: '/bin/bash input.sh',
  project: null,
  memory: 128000,
  partitions: { '*': 'prod' },
  qos: 'bigjob',
  moveSimulation: true,
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const bb5SscxMouse = {
  script: [
    '#!/bin/bash -l',
    '. /etc/profile',
    ...copyToDestinationScript,
    'module load unstable',
    'module load neurodamus-neocortex',
    'module load py-bluepy',
    'module load brion',
    'export NFRAME=256',
    'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/create_replay_bb5_0.19.0.py',
    'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/simulation_launch_bb5_0.19.0.py',
    ...copyFromDestinationScript,
  ],
  runtime: 3600,
  nodes: 5,
  cpus: 36,
  executable: '/bin/bash input.sh',
  project: null,
  memory: 128000,
  partitions: { '*': 'prod' },
  qos: 'bigjob',
  moveSimulation: true,
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const pizDaintHippocampusServiceAccount = {
  script: [
    '#!/bin/bash -l',
    '. /etc/profile',
    'export MODULEPATH=/apps/hbp/ich002/hbp-spack-deployments/modules:$MODULEPATH',
    'export NFRAME=1000',
    'module swap PrgEnv-cray PrgEnv-intel',
    'module load neurodamus-hippocampus neuron cray-python/2.7.15.7',
    'export HDF5_USE_FILE_LOCKING=FALSE',
    '/apps/hbp/ich002/home/antonel/create_replay_piz_daint_0.19.0.py',
    '/apps/hbp/ich002/home/antonel/simulation_launch_piz_daint_0.19.0.py',
  ],
  runtime: 3600,
  nodes: 1,
  cpus: 36,
  executable: '/bin/bash input.sh',
  nodeType: 'mc',
  memory: 64000,
  genericSimulationConfig: Object.assign({}, genericSimulationConfig),
};

const simConfigMapping = {
  [computers.JURECA]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, jurecaHippocampus),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, jurecaHippocampus),
  },
  [computers.PIZ_DAINT]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, pizDaintHippocampus),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, pizDaintHippocampus),
  },
  [computers.BB5]: {
    [circuits.HIPPO_BBP_FULL_CA1]: Object.assign({}, bb5Hippocampus),
    [circuits.HIPPO_BBP_MICROCIRCUIT]: Object.assign({}, bb5Hippocampus),
    [circuits.SSCX_BBP_MICROCIRCUIT]: Object.assign({}, bb5Sscx),
    [circuits.SSCX_BBP_MOUSE_MICROCIRCUIT]: Object.assign({}, bb5SscxMouse),
  },
  [computers.SERVICE_ACCOUNT]: {
    [circuits.HIPPO_MOOC_SA_MICROCIRCUIT]: Object.assign({}, pizDaintHippocampusServiceAccount),
    [circuits.HIPPO_HBP_SA_FULL_CA1]: Object.assign({}, pizDaintHippocampus),
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
