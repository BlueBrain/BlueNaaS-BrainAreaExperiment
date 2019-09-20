
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
    source: 'Schaffer Collateral Projection',
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

const sscxConnections = [
  {
    id: 1,
    name: 'ConL6Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer6',
    weight: 1.0,
    spontMinis: 0.04,
  },
  {
    id: 2,
    name: 'ConL5Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer5',
    weight: 1.0,
    spontMinis: 0.067,
  },
  {
    id: 3,
    name: 'ConL4Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer4',
    weight: 1.0,
    spontMinis: 0.072,
  },
  {
    id: 4,
    name: 'ConL3Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer3',
    weight: 1.0,
    spontMinis: 0.122,
  },
  {
    id: 5,
    name: 'ConL2Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer2',
    weight: 1.0,
    spontMinis: 0.26,
  },
  {
    id: 6,
    name: 'ConL1Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer1',
    weight: 1.0,
    spontMinis: 0.63,
  },
  {
    id: 7,
    name: 'ConInh-Uni',
    source: 'Inhibitory',
    destination: 'Mosaic',
    weight: 1.0,
    spontMinis: 0.012,
  },
  {
    id: 8,
    name: 'GABAB_erev',
    source: 'Inhibitory',
    destination: 'Mosaic',
    weight: 1.0,
    synapseConfigure: '%s.e_GABAA = -80.0 %s.e_GABAB = -75.8354310081',
  },
  {
    id: 9,
    name: 'MGGate',
    source: 'Excitatory',
    destination: 'Mosaic',
    weight: 1.0,
    synapseConfigure: '%s.mg = 1.0',
  },
  {
    id: 10,
    name: 'scheme_CaUse_ee',
    source: 'Excitatory',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
  {
    id: 11,
    name: 'scheme_CaUse_e_2_PV_FS',
    source: 'Excitatory',
    destination: 'PV_FS',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.554049006733',
  },
  {
    id: 12,
    name: 'scheme_CaUse_PV_FS_2_e',
    source: 'PV_FS',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.554049006733',
  },
  {
    id: 13,
    name: 'scheme_CaUse_e_2_DISTAR_INH',
    source: 'Excitatory',
    destination: 'DISTAR_INH',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
  {
    id: 14,
    name: 'scheme_CaUse_DISTAR_INH_2_e',
    source: 'DISTAR_INH',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
  {
    id: 15,
    name: 'scheme_CaUse_e_2_Other_Inh',
    source: 'Excitatory',
    destination: 'Other_Inh',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.333494714503',
  },
  {
    id: 16,
    name: 'scheme_CaUse_Other_Inh_2_e',
    source: 'Other_Inh',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.333494714503',
  },
  {
    id: 17,
    name: 'scheme_CaUse_Inh_Inh',
    source: 'Inhibitory',
    destination: 'Inhibitory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.333494714503',
  },
  {
    id: 18,
    name: 'scheme_nmda_e2e',
    source: 'Excitatory',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.4',
  },
  {
    id: 19,
    name: 'scheme_nmda_e2i',
    source: 'Excitatory',
    destination: 'Inhibitory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.8',
  },
  {
    id: 20,
    name: 'scheme_nmda_l5tpc',
    source: 'L5_TPC_AB',
    destination: 'L5_TPC_AB',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.71',
  },
  {
    id: 21,
    name: 'NMDA_Override_L4-L4',
    source: 'Layer4Excitatory',
    destination: 'Layer4Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.86',

  },
  {
    id: 22,
    name: 'NMDA_Override_L4-L23',
    source: 'L4_SSC',
    destination: 'Layer23Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.5',

  },
  {
    id: 23,
    name: 'scheme1b',
    source: 'Layer1',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.GABAB_ratio = 0.75',
  },
  {
    id: 24,
    name: 'scheme2b',
    source: 'L23_NGC',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.GABAB_ratio = 0.75',
  },
  {
    id: 25,
    name: 'scheme_CaUse_ee_tc2c',
    source: 'proj_Thalamocortical_VPM_Source',
    destination: 'Mosaic',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
];


const connections = {
  [constants.areas.HIPPOCAMPUS]: hippocampusConnections,
  [constants.areas.SSCX]: sscxConnections,
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
