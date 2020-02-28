
import { computers, areas } from '@/common/constants';
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

export default {
  [areas.HIPPOCAMPUS]: {
    [computers.JURECA]: {
      script: [
        '#!/bin/sh',
        'module --force purge all',
        'module use /usr/local/software/jurecabooster/OtherStages',
        'module load Architecture/KNL',
        'module load Stages/2019a',
        'module load GCC Python/2.7.16',
        'module load Intel ParaStationMPI/5.2.2-1-mt imkl',
        'module load HDF5 Boost Python/2.7.16',
        'export MODULEPATH=/p/project/cvsk25/software-deployment/HBP/jureca-booster/install/latest:$MODULEPATH',
        'export NFRAME=1000',
        'module load neurodamus-hippocampus',
        'module load py-bluepy',
        'pip install --user -q pandas',
        '/p/project/cvsk25/vsk2512/analysis/create_replay_jureca_0.18.py',
        '/p/project/cvsk25/vsk2512/analysis/simulation_launch_jureca_0.18.py',
      ],
      runtime: 3600,
      nodes: 3,
      cpus: 68,
      partitions: { vsk25: 'booster' },
      executable: '/bin/bash input.sh',
    },
    [computers.PIZ_DAINT]: {
      script: [
        '#!/bin/bash -l',
        '. /etc/profile',
        'export MODULEPATH=/apps/hbp/ich002/hbp-spack-deployments/modules:$MODULEPATH',
        'export NFRAME=1000',
        'module swap PrgEnv-cray PrgEnv-intel',
        'module load neurodamus-hippocampus neuron cray-python/2.7.15.7',
        'export HDF5_USE_FILE_LOCKING=FALSE',
        '/apps/hbp/ich002/home/antonel/create_replay_piz_daint_0.18.py -vv',
        '/apps/hbp/ich002/home/antonel/simulation_launch_piz_daint_0.18.py -vv',
      ],
      runtime: 3600,
      nodes: 3,
      cpus: 36,
      executable: '/bin/bash input.sh',
      nodeType: 'mc',
      memory: 64000,
    },
    [computers.BB5]: {
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
        'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/create_replay_bb5_0.18.py',
        'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/simulation_launch_bb5_0.18.py',
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
    },
    defaultDuration: 300,
    defaultForwardSkip: 5000,
    importSimulationScript: 'ln -sf SIMFOLDERPATH/* . && rm ./BlueConfig && cp SIMFOLDERPATH/BlueConfig .',
    stimuli: Object.assign([], stimuliGeneric),
    reportOn: Object.assign({}, reportOnGeneric),
    checksForLFP: ['AllCompartments', 'Summation'],
  },
  [areas.HIPPOCAMPUS_MOOC]: {
    [computers.SERVICE_ACCOUNT_MOOC]: {
      script: [
        '#!/bin/bash -l',
        '. /etc/profile',
        'export MODULEPATH=/apps/hbp/ich002/hbp-spack-deployments/modules:$MODULEPATH',
        'export NFRAME=1000',
        'module swap PrgEnv-cray PrgEnv-intel',
        'module load neurodamus-hippocampus neuron cray-python/2.7.15.7',
        'export HDF5_USE_FILE_LOCKING=FALSE',
        '/apps/hbp/ich002/home/antonel/create_replay_piz_daint_0.18.py',
        '/apps/hbp/ich002/home/antonel/simulation_launch_piz_daint_0.18.py',
      ],
      runtime: 3600,
      nodes: 1,
      cpus: 36,
      executable: '/bin/bash input.sh',
      nodeType: 'mc',
      memory: 64000,
    },
    defaultDuration: 300,
    defaultForwardSkip: 5000,
    importSimulationScript: 'ln -sf SIMFOLDERPATH/* . && rm ./BlueConfig && cp SIMFOLDERPATH/BlueConfig .',
    stimuli: Object.assign([], stimuliGeneric),
    reportOn: Object.assign({}, reportOnGeneric),
    checksForLFP: ['AllCompartments', 'Summation'],
  },
  [areas.SSCX]: {
    [computers.BB5]: {
      script: [
        '#!/bin/bash -l',
        '. /etc/profile',
        ...copyToDestinationScript,
        'module load unstable',
        'module load neurodamus-neocortex',
        'module load py-bluepy',
        'module load brion',
        'export NFRAME=256',
        'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/create_replay_bb5_0.18.py',
        'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/simulation_launch_bb5_0.18.py',
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
    },
    defaultDuration: 300,
    defaultForwardSkip: 5000,
    importSimulationScript: 'ln -sf SIMFOLDERPATH/* .',
    stimuli: Object.assign([], stimuliGeneric),
    reportOn: Object.assign({}, reportOnGeneric),
    checksForLFP: ['AllCompartments', 'Summation'],
  },
};

function getSimulationConfig() {
  // placeholder for next commit
}

// export default {
//   getSimulationConfig,
// };

export {
  getSimulationConfig,
};
