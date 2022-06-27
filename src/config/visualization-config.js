
import { computers, circuits } from '@/common/constants';

const config = {
  [computers.SERVICE_ACCOUNT + circuits.HIPPO_MOOC_SA_MICROCIRCUIT]: {
    executable: '/bin/bash input.sh',
    nodes: 1,
    runtime: 7200,
    script: [
      'ls -al',
      'echo <%= port %>',
      'sleep 120',
    ],
    endpoint: 'https://bbpteam.epfl.ch/mooc',
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
  blueConfigQuery: 'load',
  authQuery: 'auth',
};

export default config;
