let jobStatus = {
  successful: 'SUCCESSFUL',
  running: 'RUNNING',
  queued: 'QUEUED',
  failed: 'FAILED',
  ready: 'READY',
  block: 'BLOCK',
  loading: 'LOADING',
};

function isRunning(status) {
  return status === jobStatus.queued ||
    status === jobStatus.running ||
    status === '';
};

function isEnded(status) {
  return status === jobStatus.successful ||
    status === jobStatus.failed ||
    status === jobStatus.block;
}

let statesFilter = [
  'ALL', jobStatus.successful, jobStatus.failed,
  jobStatus.ready, jobStatus.queued, jobStatus.running,
];

function getStatusIcon(status) {
  switch (status) {
  case jobStatus.successful:
    return 'check_box';
    break;
  case jobStatus.failed:
    return 'error';
    break;
  case jobStatus.block:
    return 'block';
    break;
  default: // if is RUNNING, QUEUE, etc
    return 'sync';
    break;
  }
}

export {
  getStatusIcon,
  isRunning,
  isEnded,
  jobStatus,
  statesFilter,
};
