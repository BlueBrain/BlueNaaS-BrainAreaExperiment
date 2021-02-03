
import { computers, analysis, circuits } from '@/common/constants';
import { copyToDestinationScript, copyFromDestinationScript } from '@/common/bbp-unicore-move-script';


const configPerComputer = {
  [computers.JURECA]: {
    script: [
      'export OMP_NUM_THREADS=1',
      'export EMSIM="/p/project/cvsk25/bbp-viz-deployment/HBP/jurecavis/appimage/emsim/emsim"',
      '/p/project/cvsk25/vsk2512/analysis/analysis_launch_jureca_0.19.0.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
  },
  [computers.PIZ_DAINT]: {
    script: [
      '#!/bin/bash',
      'export HDF5_USE_FILE_LOCKING=FALSE',
      'export EMSIM="/apps/hbp/ich002/hbp-visualisation-deployements/spack/softwares/28-04-2020/install/install/cray-cnl7-haswell/intel-19.0.1.144/emsim-1.0.0-vbdt6g/bin/emsim"',
      '/apps/hbp/ich002/home/antonel/analysis_launch_piz_daint_0.19.0.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
    dynamicAnalysisConfig: 'https://raw.githubusercontent.com/antonelepfl/simulation-launcher-notebooks/analysis-notebooks/analysis_config.json',
  },
  [computers.BB5]: {
    script: [
      '#!/bin/bash',
      '. /etc/profile',
      'export HDF5_USE_FILE_LOCKING=FALSE',
      ...copyToDestinationScript,
      'module load unstable',
      'module load emsim',
      'module load py-bluepy',
      'module load brion',
      'export EMSIM=emsim',
      'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/analysis_launch_bb5_0.19.0.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
      ...copyFromDestinationScript,
    ],
    executable: '/bin/bash input.sh',
    moveAnalysis: true,
    partitions: { '*': 'prod' },
    qos: 'normal',
  },
  [computers.SERVICE_ACCOUNT]: {
    script: [
      '#!/bin/bash',
      'export HDF5_USE_FILE_LOCKING=FALSE',
      'export EMSIM="/apps/hbp/ich002/hbp-visualisation-deployements/spack/softwares/28-04-2020/install/install/cray-cnl7-haswell/intel-19.0.1.144/emsim-1.0.0-vbdt6g/bin/emsim"',
      '/apps/hbp/ich002/home/antonel/analysis_launch_piz_daint_0.19.0.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
  },
  [computers.SERVICE_ACCOUNT + circuits.HIPPO_MOOC_SA_MICROCIRCUIT]: {
    script: [
      '#!/bin/bash',
      'module swap PrgEnv-cray PrgEnv-intel',
      'module load daint-mc cray-python/3.8.2.1 PyExtensions/python3-CrayGNU-20.08',
      'module swap intel/19.1.1.217 intel/19.0.1.144',
      'module use /apps/hbp/ich002/hbp-spack-deployments/softwares/12-02-2021/install/modules/tcl/cray-cnl7-haswell',
      'module load emsim',
      'module load py-bluepysnap',
      'export HDF5_USE_FILE_LOCKING=FALSE',
      'export NEURON_INIT_MPI=1',
      '# Avoid warnings during execution',
      'export PMI_NO_FORK=1',
      'export PMI_NO_PREINITIALIZE=1',
      'export PMI_MMAP_SYNC_WAIT_TIME=300',
      'python3 /apps/hbp/ich002/home/antonel/analysis_launch_piz_daint_0.21.3.py -vv',
    ],
    executable: '/bin/bash input.sh',
    nodeType: 'mc',
    memory: 64000,
  },
};

const analysisConfigMapping = {
  [computers.JURECA]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, configPerComputer[computers.JURECA]),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, configPerComputer[computers.JURECA]),
  },
  [computers.PIZ_DAINT]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: Object.assign({}, configPerComputer[computers.PIZ_DAINT]),
    [circuits.HIPPO_HBP_FULL_CA1]: Object.assign({}, configPerComputer[computers.PIZ_DAINT]),
  },
  [computers.BB5]: {
    [circuits.HIPPO_BBP_FULL_CA1]: Object.assign({}, configPerComputer[computers.BB5]),
    [circuits.HIPPO_BBP_MICROCIRCUIT]: Object.assign({}, configPerComputer[computers.BB5]),
    [circuits.SSCX_BBP_MICROCIRCUIT]: Object.assign({}, configPerComputer[computers.BB5]),
  },
  [computers.SERVICE_ACCOUNT]: {
    [circuits.HIPPO_MOOC_SA_MICROCIRCUIT]: Object.assign({}, configPerComputer[
      // very specific config for the sonata MOOC circuit
      computers.SERVICE_ACCOUNT + circuits.HIPPO_MOOC_SA_MICROCIRCUIT
    ]),
    [circuits.HIPPO_HBP_SA_FULL_CA1]: Object.assign({}, configPerComputer[computers.PIZ_DAINT]),
    [circuits.SSCX_HBP_SA_MOUSE_MICROCIRCUIT]: Object.assign({}, configPerComputer[computers.SERVICE_ACCOUNT]),
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
