
import constants from '@/common/constants';

const { computers, areas } = constants;

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
        'module load HDF5',
        'export MODULEPATH=/p/project/cvsk25/software-deployment/HBP/jureca-booster/install/latest:$MODULEPATH',
        'module load neurodamus-hippocampus',
        'module load py-bluepy',
        'pip install --user -q pandas',
        'python /p/project/cvsk25/vsk2512/analysis/create_replay_jureca_0.11.py',
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
        'export HDF5_USE_FILE_LOCKING=FALSE',
        'module swap PrgEnv-cray PrgEnv-intel',
        'export MODULEPATH=/apps/hbp/ich002/hbp-spack-deployments/softwares/05-06-2019/install/modules/tcl/cray-cnl6-haswell:$MODULEPATH',
        'module load neurodamus-hippocampus cray-python/2.7.15.1',
        '/apps/hbp/ich002/home/antonel/create_replay_piz_daint_0.11.py',
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
        'module load py-bluepy',
        'module load neurodamus-hippocampus',
        'module load brion/3.0.0/python3/serial',
        'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/create_replay_bb5_0.11.py',
        'srun special -NFRAME 1000 $HOC_LIBRARY_PATH/init.hoc -mpi',
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
        'module load neurodamus-neocortex',
        'module load py-bluepy',
        'module load brion/3.0.0/python3/serial',
        'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/create_replay_bb5_0.11.py',
        'srun special -NFRAME 256 $HOC_LIBRARY_PATH/init.hoc -mpi',
      ],
      runtime: 3600,
      nodes: 5,
      cpus: 36,
      executable: '/bin/bash input.sh',
      project: null,
      memory: 128000,
      partitions: { '*': 'prod' },
      qos: 'bigjob',
    },
    defaultDuration: 300,
    defaultForwardSkip: 5000,
    importSimulationScript: 'ln -sf SIMFOLDERPATH/* .',
    stimuli: Object.assign([], stimuliGeneric),
    reportOn: Object.assign({}, reportOnGeneric),
    checksForLFP: ['AllCompartments', 'Summation'],
  },
};
