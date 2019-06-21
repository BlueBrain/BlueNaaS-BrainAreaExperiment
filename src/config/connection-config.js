
import store from '@/services/store';
import constants from '@/common/constants';

const hippocampusConnections = [
  {
    id: 1,
    name: 'All-All',
    source: store.state.currentCircuitConfig.biggestTarget,
    destination: store.state.currentCircuitConfig.biggestTarget,
    weight: 1,
    spontMinis: 0.01,
    delay: 0,
  },
  {
    id: 2,
    name: 'SC-All',
    source: 'SC',
    destination: store.state.currentCircuitConfig.biggestTarget,
    weight: 1,
    spontMinis: 0.01,
    delay: 0,
  },
  {
    id: 3,
    name: 'AMPA_NMDA',
    source: 'Excitatory',
    destination: store.state.currentCircuitConfig.biggestTarget,
    synapseConfigure: '%s.mg = 1.0 %s.NMDA_ratio = 1.22 tau_r_NMDA_ProbAMPANMDA_EMS = 3.9 tau_d_NMDA_ProbAMPANMDA_EMS = 35.6',
    weight: 0,
    spontMinis: 0,
    delay: 0,
  },
  {
    id: 4,
    name: 'GABA_AB',
    source: 'Inhibitory',
    destination: store.state.currentCircuitConfig.biggestTarget,
    synapseConfigure: '%s.e_GABAA = -80.0 %s.GABAB_ratio = 0',
    weight: 0,
    spontMinis: 0,
    delay: 0,
  },
];


const connections = {
  [constants.areas.HIPPOCAMPUS]: hippocampusConnections,
  [constants.areas.SSCX]: hippocampusConnections,
};

function getDefaultConnections() {
  return connections[store.state.currentCircuitConfig.simConfigToUse];
}

const synapseAttributes = {
  scoped: [
    'tau_d_AMPA', 'Use', 'Dep', 'Fac', 'mg', 'mggate', 'gmax', 'u0', 'NMDA_ratio',
    'synapseID', 'verboseLevel', 'tau_r_GABAA', 'tau_d_GABAA',
    'tau_r_GABAB', 'tau_d_GABAB', 'e_GABAA', 'e_GABAB', 'GABAB_ratio',
  ],
  global: ['tau_r_NMDA_ProbAMPANMDA_EMS', 'tau_d_NMDA_ProbAMPANMDA_EMS', 'e'],
};

export default {
  getDefaultConnections,
  synapseAttributes,
};

export { synapseAttributes };
