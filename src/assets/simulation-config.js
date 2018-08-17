
export default {
  JURECA: {
    script: [
      '#!/bin/sh',
      'module purge',
      'module use /homec/bp0/bp000022/modulesfiles-x64',
      'module load nix/hpc/neurodamus-hippocampus',
      'export FULL_CPU_PER_NODE=24',
      'mkdir -p output',
      'python /p/project/cvsk25/vsk2512/simulation/simulation_launch_no_usertarget.py -vv --blueconfig BlueConfig',
    ],
    runtime: 10800,
    nodes: 10,
    cpus: 24,
    partitions: { vsk25: 'booster' },
    executable: '/bin/bash input.sh',
  },
  NUVLA: {
    runtime: 10800,
    nodes: 4,
    cpus: 8,
    executable: 'epfl-mooc/simulation/launch_simulation',
    environment: { NUVLA__worker__multiplicity: 4 },
  },
  PIZ_DAINT: {
    script: [
      '#!/bin/sh',
      'module purge',
      'module use /homec/bp0/bp000022/modulesfiles-x64',
      'module load nix/hpc/neurodamus-hippocampus',
      'export FULL_CPU_PER_NODE=24',
      'mkdir -p output',
      'python /p/project/cvsk25/vsk2512/simulation/simulation_launch_no_usertarget.py -vv --blueconfig BlueConfig',
    ],
    runtime: 10800,
    nodes: 10,
    cpus: 24,
    executable: '/bin/bash input.sh',
  },
  available: ['JURECA', 'PIZ_DAINT', 'NUVLA'],
  defaultDuration: 30,
  defaultForwardSkip: 5000,
};
