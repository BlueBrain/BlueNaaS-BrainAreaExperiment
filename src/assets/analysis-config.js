
export default {
  JURECA: {
    script: [
      'OMP_NUM_THREADS=1',
      'export OMP_NUM_THREADS',
      '/homec/vsk25/vsk2512/analysis/analysis_launch_0.1.py --blueconfig ./BlueConfig --output . --analysisconfig ./analysis_config.json -vv',
    ],
    executable: '/bin/bash input.sh',
  },
  NUVLA: {
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
    { param: 'voltage_collage', name: 'Voltage Trace Plot', report_select: true },
  ],
  configFileName: 'analysis_config.json',
  analysisConnectionFileName: 'analysis_path.json',
  nodes: 1,
  runtime: 500,
  externalDynamicAnalysisConfig: 'https://raw.githubusercontent.com/BlueBrain/MOOC-hippocampus-network-simulation-2019/master/analysis_config.json',
  usecasesCreationForm: 'https://bbp.epfl.ch/public/dev.usecases-wizard/index.html#/entitydashboard?',
};
