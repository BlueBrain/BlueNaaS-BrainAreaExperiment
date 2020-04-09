
import { computers, circuits } from '@/common/constants';

const getHippocampusConnections = biggestTarget => ([
  {
    name: 'All-All',
    source: biggestTarget,
    destination: biggestTarget,
    weight: 1,
    spontMinis: 0.01,
    delay: 0,
  },
  {
    name: 'AMPA_NMDA',
    source: 'Excitatory',
    destination: biggestTarget,
    synapseConfigure: '%s.mg = 1.0 %s.NMDA_ratio = 1.22 tau_r_NMDA_ProbAMPANMDA_EMS = 3.9 tau_d_NMDA_ProbAMPANMDA_EMS = 35.6',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
  {
    name: 'GABA_AB',
    source: 'Inhibitory',
    destination: biggestTarget,
    synapseConfigure: '%s.e_GABAA = -80.0 %s.GABAB_ratio = 0',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
]);

const getHippocampusMoocConnections = biggestTarget => ([
  {
    name: 'All-All',
    source: biggestTarget,
    destination: biggestTarget,
    weight: 1,
    spontMinis: 0.01,
    delay: 0,
  },
  {
    name: 'AMPA_NMDA',
    source: 'Excitatory',
    destination: biggestTarget,
    synapseConfigure: '%s.NMDA_ratio = 1.22 tau_r_NMDA_ProbAMPANMDA_EMS = 3.9 tau_d_NMDA_ProbAMPANMDA_EMS = 148.5',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
  {
    name: 'GABA_AB',
    source: 'Inhibitory',
    destination: biggestTarget,
    synapseConfigure: '%s.e_GABAA = -80.0 %s.GABAB_ratio = 0',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
  {
    name: 'MGGate',
    source: 'Excitatory',
    destination: biggestTarget,
    synapseConfigure: '%s.mg = 1.0',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
]);

const getSscxConnections = () => ([
  {
    name: 'ConL6Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer6',
    weight: 1.0,
    spontMinis: 0.04,
  },
  {
    name: 'ConL5Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer5',
    weight: 1.0,
    spontMinis: 0.067,
  },
  {
    name: 'ConL4Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer4',
    weight: 1.0,
    spontMinis: 0.072,
  },
  {
    name: 'ConL3Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer3',
    weight: 1.0,
    spontMinis: 0.122,
  },
  {
    name: 'ConL2Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer2',
    weight: 1.0,
    spontMinis: 0.26,
  },
  {
    name: 'ConL1Exc-Uni',
    source: 'Excitatory',
    destination: 'Layer1',
    weight: 1.0,
    spontMinis: 0.63,
  },
  {
    name: 'ConInh-Uni',
    source: 'Inhibitory',
    destination: 'Mosaic',
    weight: 1.0,
    spontMinis: 0.012,
  },
  {
    name: 'GABAB_erev',
    source: 'Inhibitory',
    destination: 'Mosaic',
    weight: 1.0,
    synapseConfigure: '%s.e_GABAA = -80.0 %s.e_GABAB = -75.8354310081',
  },
  {
    name: 'MGGate',
    source: 'Excitatory',
    destination: 'Mosaic',
    weight: 1.0,
    synapseConfigure: '%s.mg = 1.0',
  },
  {
    name: 'scheme_CaUse_ee',
    source: 'Excitatory',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
  {
    name: 'scheme_CaUse_e_2_PV_FS',
    source: 'Excitatory',
    destination: 'PV_FS',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.554049006733',
  },
  {
    name: 'scheme_CaUse_PV_FS_2_e',
    source: 'PV_FS',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.554049006733',
  },
  {
    name: 'scheme_CaUse_e_2_DISTAR_INH',
    source: 'Excitatory',
    destination: 'DISTAR_INH',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
  {
    name: 'scheme_CaUse_DISTAR_INH_2_e',
    source: 'DISTAR_INH',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
  {
    name: 'scheme_CaUse_e_2_Other_Inh',
    source: 'Excitatory',
    destination: 'Other_Inh',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.333494714503',
  },
  {
    name: 'scheme_CaUse_Other_Inh_2_e',
    source: 'Other_Inh',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.333494714503',
  },
  {
    name: 'scheme_CaUse_Inh_Inh',
    source: 'Inhibitory',
    destination: 'Inhibitory',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.333494714503',
  },
  {
    name: 'scheme_nmda_e2e',
    source: 'Excitatory',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.4',
  },
  {
    name: 'scheme_nmda_e2i',
    source: 'Excitatory',
    destination: 'Inhibitory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.8',
  },
  {
    name: 'scheme_nmda_l5tpc',
    source: 'L5_TPC_AB',
    destination: 'L5_TPC_AB',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.71',
  },
  {
    name: 'NMDA_Override_L4-L4',
    source: 'Layer4Excitatory',
    destination: 'Layer4Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.86',

  },
  {
    name: 'NMDA_Override_L4-L23',
    source: 'L4_SSC',
    destination: 'Layer23Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.NMDA_ratio = 0.5',

  },
  {
    name: 'scheme1b',
    source: 'Layer1',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.GABAB_ratio = 0.75',
  },
  {
    name: 'scheme2b',
    source: 'L23_NGC',
    destination: 'Excitatory',
    weight: 1.0,
    synapseConfigure: '%s.GABAB_ratio = 0.75',
  },
  {
    name: 'scheme_CaUse_ee_tc2c',
    source: 'proj_Thalamocortical_VPM_Source',
    destination: 'Mosaic',
    weight: 1.0,
    synapseConfigure: '%s.Use *= 0.112940422273',
  },
]);

const getSscxMouseConnections = () => ([]);


const connectionsConfigMapping = {
  [computers.JURECA]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: getHippocampusConnections,
    [circuits.HIPPO_HBP_FULL_CA1]: getHippocampusConnections,
  },
  [computers.PIZ_DAINT]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: getHippocampusConnections,
    [circuits.HIPPO_HBP_FULL_CA1]: getHippocampusConnections,
  },
  [computers.BB5]: {
    [circuits.HIPPO_BBP_FULL_CA1]: getHippocampusConnections,
    [circuits.HIPPO_BBP_MICROCIRCUIT]: getHippocampusConnections,
    [circuits.SSCX_BBP_MICROCIRCUIT]: getSscxConnections,
  },
  [computers.SERVICE_ACCOUNT]: {
    [circuits.HIPPO_MOOC_SA_MICROCIRCUIT]: getHippocampusMoocConnections,
    [circuits.HIPPO_HBP_SA_FULL_CA1]: getHippocampusConnections,
    [circuits.SSCX_HBP_SA_MOUSE_MICROCIRCUIT]: getSscxMouseConnections,
  },
};

function getConnectionConfig(computer, circuit) {
  const computerConfig = connectionsConfigMapping[computer];
  return computerConfig[circuit];
}

function getConnections(computer, circuit, biggestTarget) {
  const connectionCreationFunction = getConnectionConfig(computer, circuit);
  return connectionCreationFunction(biggestTarget);
}

function getDefaultConnections(computer, circuit) {
  return getConnectionConfig(computer, circuit)();
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
  getConnectionConfig,
  getDefaultConnections,
  synapseAttributes,
  getConnections,
};

export {
  synapseAttributes,
  getConnections,
};
