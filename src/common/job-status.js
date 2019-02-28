const jobStatus = {
  successful: 'SUCCESSFUL',
  running: 'RUNNING',
  queued: 'QUEUED',
  failed: 'FAILED',
  ready: 'READY',
  block: 'BLOCK',
  loading: 'LOADING',
  stagingin: 'STAGINGIN',
  stagingout: 'STAGINGOUT',
  undefined: 'UNDEFINED',
};

function isRunning(status) {
  return status === jobStatus.queued ||
    status === jobStatus.running ||
    status === jobStatus.ready ||
    status === jobStatus.stagingin ||
    status === jobStatus.stagingout ||
    status === jobStatus.undefined ||
    status === '';
}

function isEnded(status) {
  return status === jobStatus.successful ||
    status === jobStatus.failed ||
    status === jobStatus.block;
}

const statesFilter = [
  'ALL', jobStatus.successful, jobStatus.failed,
  jobStatus.queued, jobStatus.running,
];

function getStatusIcon(status) {
  switch (status) {
    case jobStatus.successful:
      return 'md-checkmark-circle';
    case jobStatus.failed:
      return 'ios-close-circle';
    case jobStatus.block:
      return 'md-remove-circle';
    case jobStatus.queued:
      return 'md-clock';
    case 'ALL':
      return 'md-radio-button-off';
    default: // if is RUNNING, READY, etc
      return 'md-sync';
  }
}

export {
  getStatusIcon,
  isRunning,
  isEnded,
  jobStatus,
  statesFilter,
};
