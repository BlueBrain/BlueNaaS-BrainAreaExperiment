
import store from '@/services/store';

function getDefaultConnections() {
  return [{
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
    synapseConfigure: '%s.e = 0 %s.NMDA_ratio = 1.22 %s.tau_r_NMDA = 3.9 %s.tau_d_NMDA = 35.6 %s.mg = 1.0',
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
    // # no GABA_B (so far)
  }];
}

const synapseAttributes = [
  'tau_r_AMPA', 'tau_d_AMPA', 'tau_r_NMDA', 'tau_d_NMDA', 'Use', 'Dep', 'Fac', 'e',
  'mg', 'mggate', 'gmax', 'u0', 'NMDA_ratio', 'synapseID', 'verboseLevel', 'tau_r_GABAA',
  'tau_d_GABAA', 'tau_r_GABAB', 'tau_d_GABAB', 'e_GABAA', 'e_GABAB', 'GABAB_ratio',
];

export default {
  getDefaultConnections,
  synapseAttributes,
};

export { synapseAttributes };
