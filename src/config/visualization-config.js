
const config = {
  NUVLA: {
    to: 'NUVLA',
    needsTransfer: true,
    executable: 'brayns/BraynsUI',
    nodes: 1,
    runtime: 500,
  },
  filesToAvoidCopy: [
    'stderr',
    'stdout',
    'UNICORE_',
    'out.dat',
    'analysis_path.json',
    'bss_submit_',
    'BlueConfig.backup',
    'input.sh',
  ],
  jobNamePrefix: 'Visualization of',
};

export default config;
