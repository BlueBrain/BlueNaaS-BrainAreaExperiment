
import constants from '@/common/constants';

const { computers, areas } = constants;

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
        'module load HDF5',
        'export MODULEPATH=$MODULEPATH:/p/project/cvsk25/software-deployment/HBP/jureca-booster/install/latest',
        'module load neurodamus-hippocampus/0.2',
        'srun special -NFRAME 1000 $HOC_LIBRARY_PATH/init.hoc -mpi',
      ],
      runtime: 3600,
      nodes: 3,
      cpus: 68,
      partitions: { vsk25: 'booster' },
      executable: '/bin/bash input.sh',
    },
    [computers.NUVLA]: {
      runtime: 10800,
      nodes: 3,
      cpus: 8,
      executable: 'epfl-mooc/simulation/launch_simulation_parallel',
      environment: { NUVLA__worker__multiplicity: 4 },
    },
    [computers.PIZ_DAINT]: {
      script: [
        '#!/bin/bash -l',
        '. /etc/profile',
        'module swap PrgEnv-cray PrgEnv-intel',
        'export MODULEPATH=/apps/hbp/ich002/hbp-spack-deployments/softwares/05-06-2019/install/modules/tcl/cray-cnl6-haswell:$MODULEPATH',
        'module load neurodamus-hippocampus/0.2 cray-python/2.7.15.1',
        'srun special -NFRAME 1000 $HOC_LIBRARY_PATH/init.hoc -mpi',
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
        'module purge',
        'module load nix/nse/bluepy-py3/0.13.4',
        'module load neurodamus-hippocampus/0.2/python3',
        'srun special -NFRAME 1000 $HOC_LIBRARY_PATH/init.hoc -mpi',
      ],
      runtime: 3600,
      nodes: 2,
      cpus: 36,
      executable: '/bin/bash input.sh',
      project: null,
      memory: 32000,
      partitions: { '*': 'prod' },
    },
    defaultDuration: 300,
    defaultForwardSkip: 5000,
    importSimulationScript: 'ln -sf SIMFOLDERPATH/* .',
    stimuli: [
      { name: 'Linear', params: ['AmpStart', 'AmpEnd'] },
      { name: 'NPoisson', params: ['Lambda', 'Weight', 'NumOfSynapses'] },
      { name: 'Noise', params: ['MeanPercent', 'Variance'] },
    ],
    reportOn: {
      voltage: 'Voltage',
      calcium: 'Calcium Concentration',
      lfp: 'Total Current for LFP',
    },
    checksForLFP: ['AllCompartments', 'Summation'],
  },
  [areas.SSCX]: {
    [computers.BB5]: {
      script: [
        '#!/bin/bash -l',
        '. /etc/profile',
        'module load nix/hpc/neurodamus',
        'srun special -NFRAME 256 $HOC_LIBRARY_PATH/init.hoc -mpi',
      ],
      runtime: 3600,
      nodes: 5,
      cpus: 36,
      executable: '/bin/bash input.sh',
      project: null,
      memory: 64000,
      partitions: { '*': 'prod' },
    },
    defaultDuration: 300,
    defaultForwardSkip: 5000,
    importSimulationScript: 'ln -sf SIMFOLDERPATH/* .',
    stimuli: [
      { name: 'Linear', params: ['AmpStart', 'AmpEnd'] },
      { name: 'NPoisson', params: ['Lambda', 'Weight', 'NumOfSynapses'] },
      { name: 'Noise', params: ['MeanPercent', 'Variance'] },
    ],
    reportOn: {
      voltage: 'Voltage',
      calcium: 'Calcium Concentration',
      lfp: 'Total Current for LFP',
    },
    checksForLFP: ['AllCompartments', 'Summation'],
  },
};
