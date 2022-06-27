
import { computers, circuits } from '@/common/constants';

const config = {
  [computers.BB5 + circuits.MOOC]: {
    endpoint: 'https://bbp-mooc-sim-neuro.epfl.ch/web-brayns-launcher',
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
