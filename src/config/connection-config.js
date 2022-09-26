
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
    synapseConfigure: '%s.mg = 1.0 %s.NMDA_ratio = 1.22 %s.tau_r_NMDA = 3.9 %s.tau_d_NMDA = 35.6',
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
    synapseConfigure: '%s.NMDA_ratio = 1.22 %s.tau_r_NMDA = 3.9 %s.tau_d_NMDA = 148.5',
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


const getHippocampusBbpMoocConnections = biggestTarget => ([
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
    synapseConfigure: '$AMPA_NMDA_synapse_config',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
  {
    name: 'GABA_AB',
    source: 'Inhibitory',
    destination: biggestTarget,
    synapseConfigure: '$GABA_AB_synapse_config',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
  {
    name: 'MGGate',
    source: 'Excitatory',
    destination: biggestTarget,
    synapseConfigure: '$MGGate_synapse_config',
    weight: null,
    spontMinis: null,
    delay: 0,
  },
]);

const getSscxMouseConnections = () => ([]);


const connectionsConfigMapping = {
  [computers.PIZ_DAINT]: {
    [circuits.HIPPO_HBP_MICROCIRCUIT]: getHippocampusConnections,
    [circuits.HIPPO_HBP_FULL_CA1]: getHippocampusConnections,
  },
  [computers.SERVICE_ACCOUNT]: {
    [circuits.HIPPO_HBP_SA_MICROCIRCUIT]: getHippocampusMoocConnections,
    [circuits.HIPPO_HBP_SA_FULL_CA1]: getHippocampusConnections,
    [circuits.SSCX_HBP_SA_MOUSE_MICROCIRCUIT]: getSscxMouseConnections,
  },
  [computers.BB5_MOOC]: {
    [circuits.BB5_MOOC]: getHippocampusBbpMoocConnections,
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

// TODO: check this in ebrians and mooc are diff
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
