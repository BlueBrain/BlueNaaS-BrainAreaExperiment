
import constants from '@/common/constants';

export default {
  [constants.computers.JURECA]: {
    script: [
      'OMP_NUM_THREADS=1',
      'export OMP_NUM_THREADS',
      'export EMSIM="/p/project/cvsk25/bbp-viz-deployment/HBP/jurecavis/appimage/emsim/emsim"',
      '/p/project/cvsk25/vsk2512/analysis/analysis_launch_0.8.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
  },
  [constants.computers.PIZ_DAINT]: {
    script: [
      '#!/bin/bash',
      'HDF5_USE_FILE_LOCKING=FALSE',
      'export HDF5_USE_FILE_LOCKING',
      'export EMSIM="/apps/hbp/ich002/hbp-visualisation-deployements/emsim/emsim"',
      '/apps/hbp/ich002/home/antonel/analysis_launch_0.8.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
  },
  [constants.computers.BB5]: {
    script: [
      '#!/bin/bash',
      '. /etc/profile',
      'HDF5_USE_FILE_LOCKING=FALSE',
      'export HDF5_USE_FILE_LOCKING',
      'module load nix/viz/emsim/latest',
      'module load nix/nse/bluepy-py3/0.13.4',
      'export EMSIM=emsim',
      'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/analysis_launch_0.8.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
  },
  [constants.computers.NUVLA]: {
    dynamicAnalysis: true,
    bulkAnalysis: true,
    executable: 'epfl-mooc/analysis/launch_analysis',
  },
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
  ],
  plots: ['firing_rate_histogram', 'raster', 'voltage_collage'],
  analysisAvailable: [
    { param: 'firing_rate_histogram', name: 'Peristimulus Time Histogram' },
    { param: 'raster', name: 'Spike Raster Plot' },
    { param: 'voltage_collage', name: 'Trace Plot of Report', report_select: true },
  ],
  configFileName: 'analysis_config.json',
  analysisConnectionFileName: 'analysis_path.json',
  nodes: 2,
  runtime: 1800,
  externalDynamicAnalysisConfig: 'https://raw.githubusercontent.com/BlueBrain/MOOC-hippocampus-network-simulation-2019/master/analysis_config.json',
  externalBulkAnalysisConfig: 'https://raw.githubusercontent.com/BlueBrain/MOOC-hippocampus-network-simulation-2019/bulk-analysis/bulk_analysis_config.json',
  usecasesCreationForm: 'https://bbp.epfl.ch/public/dev.usecases-wizard/index.html#/entitydashboard?',
};
