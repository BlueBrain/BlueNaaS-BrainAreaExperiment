
const unicoreModeTag = process.env.VUE_APP_UNICORE_MODE_TAG || '';

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

const jobTags = {
  ANALYSIS: 'analysis',
  SIMULATION: 'simulation',
  VISUALIZATION: 'visualization',
  LFP_SIMULATION: 'lfp_simulation',
  LFP_ANALYSIS: 'lfp_analysis',
  SIMULATION_IMPORTED: 'simulation_imported',
  OTHER: 'other',
  UNICORE_MODE_TAG: unicoreModeTag,
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

function addTag(obj, tag) {
  if (!tag) return;
  const newTags = obj.tags || [];
  if (newTags.includes(tag)) return;
  newTags.push(tag);
  /* eslint-disable no-param-reassign */
  obj.tags = newTags;
}

export {
  getStatusIcon,
  isRunning,
  isEnded,
  jobStatus,
  statesFilter,
  jobTags,
  addTag,
};
