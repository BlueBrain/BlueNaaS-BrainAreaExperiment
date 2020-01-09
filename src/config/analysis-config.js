
import { computers, analysis } from '@/common/constants';
import { copyToDestinationScript, copyFromDestinationScript } from '@/common/bbp-unicore-move-script';

export default {
  [computers.JURECA]: {
    script: [
      'OMP_NUM_THREADS=1',
      'export OMP_NUM_THREADS',
      'export EMSIM="/p/project/cvsk25/bbp-viz-deployment/HBP/jurecavis/appimage/emsim/emsim"',
      '/p/project/cvsk25/vsk2512/analysis/analysis_launch_jureca_0.16.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
  },
  [computers.PIZ_DAINT]: {
    script: [
      '#!/bin/bash',
      'HDF5_USE_FILE_LOCKING=FALSE',
      'export HDF5_USE_FILE_LOCKING',
      'export EMSIM="/apps/hbp/ich002/hbp-visualisation-deployements/emsim/emsim"',
      '/apps/hbp/ich002/home/antonel/analysis_launch_piz_daint_0.16.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
    dynamicAnalysisConfig: 'https://raw.githubusercontent.com/antonelepfl/simulation-launcher-notebooks/analysis-notebooks/analysis_config.json',
  },
  [computers.BB5]: {
    script: [
      '#!/bin/bash',
      '. /etc/profile',
      'HDF5_USE_FILE_LOCKING=FALSE',
      'export HDF5_USE_FILE_LOCKING',
      ...copyToDestinationScript,
      'module load emsim',
      'module load py-bluepy',
      'module load brion',
      'export EMSIM=emsim',
      'python /gpfs/bbp.cscs.ch/home/antonel/scripts_unicore/analysis_launch_bb5_0.16.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
      ...copyFromDestinationScript,
    ],
    executable: '/bin/bash input.sh',
    moveAnalysis: true,
    partitions: { '*': 'prod' },
    qos: 'normal',
  },
  [computers.NUVLA]: {
    dynamicAnalysisConfig: 'https://raw.githubusercontent.com/BlueBrain/MOOC-hippocampus-network-simulation-2019/master/analysis_config.json',
    bulkAnalysisConfig: 'https://raw.githubusercontent.com/BlueBrain/MOOC-hippocampus-network-simulation-2019/bulk-analysis/bulk_analysis_config.json',
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
