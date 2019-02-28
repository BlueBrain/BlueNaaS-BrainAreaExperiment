const jobStatus = {
  SUCCESSFUL: 'SUCCESSFUL',
  RUNNING: 'RUNNING',
  QUEUED: 'QUEUED',
  FAILED: 'FAILED',
  READY: 'READY',
  BLOCK: 'BLOCK',
  LOADING: 'LOADING',
  STAGINGIN: 'STAGINGIN',
  STAGINGOUT: 'STAGINGOUT',
  UNDEFINED: 'UNDEFINED',
};

const iconMap = {
  [jobStatus.SUCCESSFUL]: 'md-checkmark-circle',
  [jobStatus.FAILED]: 'ios-close-circle',
  [jobStatus.BLOCK]: 'md-remove-circle',
  [jobStatus.QUEUED]: 'md-clock',
  ALL: 'md-radio-button-off',
};

function isRunning(status) {
  return [
    jobStatus.QUEUED,
    jobStatus.RUNNING,
    jobStatus.READY,
    jobStatus.STAGINGIN,
    jobStatus.STAGINGOUT,
    jobStatus.UNDEFINED,
    '',
  ].includes(status);
}

function isEnded(status) {
  return status === jobStatus.SUCCESSFUL ||
    status === jobStatus.FAILED ||
    status === jobStatus.BLOCK;
}

const statesFilter = [
  'ALL',
  jobStatus.SUCCESSFUL,
  jobStatus.FAILED,
  jobStatus.QUEUED,
  jobStatus.RUNNING,
];

function getStatusIcon(status) {
  return iconMap[status] || 'md-sync';
}

export {
  getStatusIcon,
  isRunning,
  isEnded,
  jobStatus,
  statesFilter,
};
