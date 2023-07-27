
import { computers, analysis, circuits } from '@/common/constants';

const defaultConfig = {
  script: [
    '#!/bin/bash',
    'module purge',
    'module load PrgEnv-intel intel',
    'module load daint-mc cray-python/3.9.4.1',
    'module use /apps/hbp/ich002/hbp-spack-deployments/softwares/23-02-2022/modules/tcl/cray-cnl7-haswell',
    'module load emsim',
    'module load py-bluepy',
    'export HDF5_USE_FILE_LOCKING=FALSE',
    'export NEURON_INIT_MPI=1',
    '# Avoid warnings during execution',
    'export PMI_NO_FORK=1',
    'export PMI_NO_PREINITIALIZE=1',
    'export PMI_MMAP_SYNC_WAIT_TIME=300',
    'module list',
    'python3 /apps/hbp/ich002/home/antonel/convert_blueconfig_to_simulationconfig_0.22.0.py',
  ],
  executable: '/bin/bash input.sh',
  nodeType: 'mc',
  memory: 64000,
  dynamicAnalysisConfig: 'https://raw.githubusercontent.com/antonelepfl/simulation-launcher-notebooks/analysis-notebooks/analysis_config.json',
};

const configPerComputer = {
  [computers.PIZ_DAINT]: Object.assign(
    {},
    defaultConfig,
    {
      script: [
        ...defaultConfig.script,
        'python3 /apps/hbp/ich002/home/antonel/analysis-legacy-circuit.py -vv',
      ],
    },
  ),
  [computers.SERVICE_ACCOUNT + circuits.HIPPO_HBP_SA_MICROCIRCUIT]: Object.assign(
    {},
    defaultConfig,
    {
      script: [
        ...defaultConfig.script,
        'python3 /apps/hbp/ich002/home/antonel/analysis_launch_piz_daint_0.22.1.py -vv',
      ],
    },
  ),
  [computers.BB5_MOOC]: {
    script: 'ANALYSIS_SCRIPT_PLACEHOLDER',
    executable: '/bin/bash input.sh',
    moveAnalysis: true,
    partitions: { '*': 'prod' },
    qos: 'normal',
  },
};

const analysisConfigMapping = {
  [computers.PIZ_DAINT]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, configPerComputer[computers.PIZ_DAINT]),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, configPerComputer[computers.PIZ_DAINT]),
  },
  [computers.SERVICE_ACCOUNT]: {
    [circuits.HIPPO_HBP_SA_MICROCIRCUIT]: Object.assign({}, configPerComputer[
      // very specific config for the sonata MOOC circuit
      computers.SERVICE_ACCOUNT + circuits.HIPPO_HBP_SA_MICROCIRCUIT
    ]),
    [circuits.HIPPO_HBP_SA_FULL_CA1]: Object.assign({}, configPerComputer[computers.PIZ_DAINT]),
    [circuits.SSCX_HBP_SA_MOUSE_MICROCIRCUIT]: Object.assign({}, configPerComputer[computers.PIZ_DAINT]),
  },
  [computers.BB5_MOOC]: {
    [circuits.BB5_MOOC]: Object.assign({}, configPerComputer[computers.BB5_MOOC]),
  },
};

function getAnalysisConfig(computer, circuit) {
  const computerConfig = analysisConfigMapping[computer];
  return computerConfig[circuit];
}

export default {
  getAnalysisConfig,
  filesToAvoidCopy: [
    'analysis_path',
    'input.sh',
    'stderr',
    'stdout',
    'output/',
    'UNICORE_SCRIPT_EXIT_CODE',
    'UNICORE_Job_',
    'bss_submit',
    'BlueConfig.backup',
    'cx_',
    'TSI_temp_file',
    'mcomplex.dat',
    'cxinfo_',
    'processing_at',
  ],
  analysisAvailable: [
    { realName: analysis.types.FIRING_RATE_HISTOGRAM, displayName: 'Peristimulus Time Histogram' },
    { realName: analysis.types.RASTER, displayName: 'Spike Raster Plot' },
    { realName: analysis.types.VOLTAGE_COLLAGE, displayName: 'Trace Plot of Report', report_select: true },
  ],
  configFileName: 'analysis_config.json',
  analysisConnectionFileName: 'analysis_path.json',
  nodes: 1,
  runtime: 1800,
  usecasesCreationForm: 'https://bbp.epfl.ch/public/usecases-wizard/index.html#/entitydashboard?',
};

export { getAnalysisConfig };
