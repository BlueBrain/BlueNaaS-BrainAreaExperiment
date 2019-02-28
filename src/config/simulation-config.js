
export default {
  JURECA: {
    script: [
      '#!/bin/sh',
      'module --force purge all',
      'module use /usr/local/software/jureca/OtherStages',
      'module load Architecture/KNL',
      'module load Stages/2018a',
      'module load Intel IntelMPI imkl',
      'module load HDF5',
      'export MODULEPATH=/p/project/cvsk25/vsk2514/HBP/jureca-booster/install/latest:$MODULEPATH',
      'module load neurodamus/hippocampus',
      'export FULL_CPU_PER_NODE=68',
      'python /p/project/cvsk25/vsk2512/simulation/simulation_launch_no_usertarget.py -vv --blueconfig BlueConfig',
    ],
    runtime: 10800,
    nodes: 10,
    cpus: 68,
    partitions: { vsk25: 'booster' },
    executable: '/bin/bash input.sh',
  },
  NUVLA: {
    runtime: 10800,
    nodes: 3,
    cpus: 2,
    executable: 'epfl-mooc/simulation/launch_simulation',
    environment: { NUVLA__worker__multiplicity: 4 },
  },
  PIZ_DAINT: {
    script: [
      '#!/bin/bash',
      '. /etc/profile',
      'module swap PrgEnv-cray PrgEnv-intel',
      'export MODULEPATH=/apps/hbp/ich002/hbp-spack-deployments/modules:$MODULEPATH',
      'module load neurodamus/hippocampus/intel',
      'export FULL_CPU_PER_NODE=36',
      '/users/bp000037/simulation/simulation_launch.py -vv --blueconfig BlueConfig',
    ],
    runtime: 10800,
    nodes: 10,
    cpus: 36,
    executable: '/bin/bash input.sh',
    nodeType: 'mc',
    memory: 64000,
  },
  available: ['JURECA', 'PIZ_DAINT', 'NUVLA'],
  defaultDuration: 300,
  defaultForwardSkip: 5000,
  importSimulationScript: 'ln -sf SIMFOLDERPATH/* .',
  stimuli: [
    'Linear',
    'RelativeLinear',
    'Pulse',
    'NPoisson',
    'NPoissonInhomogeneus',
    'Subthreshold',
    'Noise',
    'SynapseReplay',
    'Hyperpolarizing',
    'ReplayVoltageTrace',
    'SEClamp',
  ],
};
