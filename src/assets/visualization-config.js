
const config = {
  // JURECA: {
  //   to: 'NUVLA',
  //   script: [
  //     'OMP_NUM_THREADS=1',
  //     'export OMP_NUM_THREADS',
  //   ],
  //   executable: '/bin/bash input.sh',
  // },
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
    'UNICORE_SCRIPT_EXIT_CODE',
    'out.dat',
    'analysis_path.json',
    'bss_submit_',
    'BlueConfig.backup',
    'input.sh',
  ],
  jobNamePrefix: 'Visualization of',
  // Information where to retrieve files with IPs of VMs
  folderUUID: 'd43113df-66cb-43fd-8716-cfca867bbc16',
  collabId: '24493',
  folderName: 'ips',
};

export default config;
