
import constants from '@/common/constants';
/*
|--------------------------------------------------------------------------
| Hippocampus Full CA1
|--------------------------------------------------------------------------
*/

const slicesImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-CA1/ca1-20181114';

const hippoHbpFullCa1 = {
  prefix: { // setting prefix allow to know which computer can run the circuit
    [constants.computers.JURECA]: '/p/home/jusers/antonel1/jureca/vsk2512/CA1/20181114',
    [constants.computers.PIZ_DAINT]: '/apps/hbp/ich002/home/antonel/full_ca1/CA1',
  },
  paths: {
    MorphologyPath: '<%= prefix %>/entities/morphologies/20180417/',
    METypePath: '<%= prefix %>/entities/emodels/20180504b/hoc',
    CircuitPath: '<%= prefix %>/circuits/CA1/20181114/',
    nrnPath: '<%= prefix %>/circuits/CA1/20181114/connectome/functional/',
    MEComboInfoFile: '<%= prefix %>/entities/emodels/20180504b/mecombo_emodel.tsv',
    BioName: '<%= prefix %>/circuits/CA1/20181114/bioname',
    TargetFile: '<%= prefix %>/circuits/CA1/20181114/user.target',
    CellLibraryFile: 'circuit.mvd3',
    CurrentDir: '.',
    OutputRoot: '.',
  },
  targets: [
    { name: 'slice0', displayName: 'Slice 0', src: `${slicesImgBase}/slice0.png` },
    { name: 'slice1', displayName: 'Slice 1', src: `${slicesImgBase}/slice1.png` },
    { name: 'slice2', displayName: 'Slice 2', src: `${slicesImgBase}/slice2.png` },
    { name: 'slice3', displayName: 'Slice 3', src: `${slicesImgBase}/slice3.png` },
    { name: 'slice4', displayName: 'Slice 4', src: `${slicesImgBase}/slice4.png` },
    { name: 'slice5', displayName: 'Slice 5', src: `${slicesImgBase}/slice5.png` },
    { name: 'slice6', displayName: 'Slice 6', src: `${slicesImgBase}/slice6.png` },
    { name: 'slice7', displayName: 'Slice 7', src: `${slicesImgBase}/slice7.png` },
    { name: 'slice8', displayName: 'Slice 8', src: `${slicesImgBase}/slice8.png` },
    { name: 'slice9', displayName: 'Slice 9', src: `${slicesImgBase}/slice9.png` },
    { name: 'slice10', displayName: 'Slice 10', src: `${slicesImgBase}/slice10.png` },
    { name: 'slice11', displayName: 'Slice 11', src: `${slicesImgBase}/slice11.png` },
    { name: 'slice12', displayName: 'Slice 12', src: `${slicesImgBase}/slice12.png` },
    { name: 'slice13', displayName: 'Slice 13', src: `${slicesImgBase}/slice13.png` },
    { name: 'slice14', displayName: 'Slice 14', src: `${slicesImgBase}/slice14.png` },
    { name: 'slice15', displayName: 'Slice 15', src: `${slicesImgBase}/slice15.png` },
    { name: 'slice16', displayName: 'Slice 16', src: `${slicesImgBase}/slice16.png` },
    { name: 'slice17', displayName: 'Slice 17', src: `${slicesImgBase}/slice17.png` },
    { name: 'slice18', displayName: 'Slice 18', src: `${slicesImgBase}/slice18.png` },
    { name: 'slice19', displayName: 'Slice 19', src: `${slicesImgBase}/slice19.png` },
    { name: 'slice20', displayName: 'Slice 20', src: `${slicesImgBase}/slice20.png` },
    { name: 'slice21', displayName: 'Slice 21', src: `${slicesImgBase}/slice21.png` },
    { name: 'slice22', displayName: 'Slice 22', src: `${slicesImgBase}/slice22.png` },
    { name: 'slice23', displayName: 'Slice 23', src: `${slicesImgBase}/slice23.png` },
    { name: 'slice24', displayName: 'Slice 24', src: `${slicesImgBase}/slice24.png` },
    { name: 'slice25', displayName: 'Slice 25', src: `${slicesImgBase}/slice25.png` },
    { name: 'slice26', displayName: 'Slice 26', src: `${slicesImgBase}/slice26.png` },
    { name: 'slice27', displayName: 'Slice 27', src: `${slicesImgBase}/slice27.png` },
    { name: 'slice28', displayName: 'Slice 28', src: `${slicesImgBase}/slice28.png` },
    { name: 'slice29', displayName: 'Slice 29', src: `${slicesImgBase}/slice29.png` },
    { name: 'slice30', displayName: 'Slice 30', src: `${slicesImgBase}/slice30.png` },
    { name: 'slice31', displayName: 'Slice 31', src: `${slicesImgBase}/slice31.png` },
    { name: 'slice32', displayName: 'Slice 32', src: `${slicesImgBase}/slice32.png` },
    { name: 'slice33', displayName: 'Slice 33', src: `${slicesImgBase}/slice33.png` },
    { name: 'slice34', displayName: 'Slice 34', src: `${slicesImgBase}/slice34.png` },
    { name: 'slice35', displayName: 'Slice 35', src: `${slicesImgBase}/slice35.png` },
    { name: 'slice36', displayName: 'Slice 36', src: `${slicesImgBase}/slice36.png` },
    { name: 'slice37', displayName: 'Slice 37', src: `${slicesImgBase}/slice37.png` },
    { name: 'slice38', displayName: 'Slice 38', src: `${slicesImgBase}/slice38.png` },
    { name: 'slice39', displayName: 'Slice 39', src: `${slicesImgBase}/slice39.png` },
    { name: 'slice40', displayName: 'Slice 40', src: `${slicesImgBase}/slice40.png` },
    { name: 'slice41', displayName: 'Slice 41', src: `${slicesImgBase}/slice41.png` },
    { name: 'slice42', displayName: 'Slice 42', src: `${slicesImgBase}/slice42.png` },
    { name: 'slice43', displayName: 'Slice 43', src: `${slicesImgBase}/slice43.png` },
    { name: 'slice44', displayName: 'Slice 44', src: `${slicesImgBase}/slice44.png` },
    { name: 'slice45', displayName: 'Slice 45', src: `${slicesImgBase}/slice45.png` },
    { name: 'slice46', displayName: 'Slice 46', src: `${slicesImgBase}/slice46.png` },
    { name: 'slice47', displayName: 'Slice 47', src: `${slicesImgBase}/slice47.png` },
    { name: 'slice48', displayName: 'Slice 48', src: `${slicesImgBase}/slice48.png` },
    { name: 'slice49', displayName: 'Slice 49', src: `${slicesImgBase}/slice49.png` },
    { name: 'slice50', displayName: 'Slice 50', src: `${slicesImgBase}/slice50.png` },
    { name: 'slice51', displayName: 'Slice 51', src: `${slicesImgBase}/slice51.png` },
    { name: 'slice52', displayName: 'Slice 52', src: `${slicesImgBase}/slice52.png` },
    { name: 'slice53', displayName: 'Slice 53', src: `${slicesImgBase}/slice53.png` },
    { name: 'slice54', displayName: 'Slice 54', src: `${slicesImgBase}/slice54.png` },
    { name: 'slice55', displayName: 'Slice 55', src: `${slicesImgBase}/slice55.png` },
    { name: 'slice56', displayName: 'Slice 56', src: `${slicesImgBase}/slice56.png` },
    { name: 'slice57', displayName: 'Slice 57', src: `${slicesImgBase}/slice57.png` },
    { name: 'slice58', displayName: 'Slice 58', src: `${slicesImgBase}/slice58.png` },
    { name: 'slice59', displayName: 'Slice 59', src: `${slicesImgBase}/slice59.png` },
    { name: 'slice60', displayName: 'Slice 60', src: `${slicesImgBase}/slice60.png` },
    { name: 'slice61', displayName: 'Slice 61', src: `${slicesImgBase}/slice61.png` },
    { name: 'slice62', displayName: 'Slice 62', src: `${slicesImgBase}/slice62.png` },
    { name: 'slice63', displayName: 'Slice 63', src: `${slicesImgBase}/slice63.png` },
    { name: 'slice64', displayName: 'Slice 64', src: `${slicesImgBase}/slice64.png` },
    { name: 'slice65', displayName: 'Slice 65', src: `${slicesImgBase}/slice65.png` },
    { name: 'slice66', displayName: 'Slice 66', src: `${slicesImgBase}/slice66.png` },
    { name: 'slice67', displayName: 'Slice 67', src: `${slicesImgBase}/slice67.png` },
    { name: 'slice68', displayName: 'Slice 68', src: `${slicesImgBase}/slice68.png` },
    { name: 'slice69', displayName: 'Slice 69', src: `${slicesImgBase}/slice69.png` },
    { name: 'SC', displayName: 'SC' },
    { name: 'SC-CA1', displayName: 'SC-CA1' },
    { name: 'SC-Exc', displayName: 'SC-Exc' },
    { name: 'PV', displayName: 'PV' },
    { name: 'BS', displayName: 'BS' },
    { name: 'BC', displayName: 'BC' },
    { name: 'SP_INT', displayName: 'SP_INT' },
    { name: 'INT', displayName: 'INT' },
    { name: 'cylinders', displayName: 'cylinders' },
    { name: 'cylinder205789r200', displayName: 'cylinder205789r200' },
    { name: 'cylinder377156r200', displayName: 'cylinder377156r200' },
    { name: 'cylinder55853r200', displayName: 'cylinder55853r200' },
    { name: 'cylinder405270r200', displayName: 'cylinder405270r200' },
    { name: 'cylinder363971r200', displayName: 'cylinder363971r200' },
    { name: 'cylinder75751r200', displayName: 'cylinder75751r200' },
    { name: 'cylinder367943r200', displayName: 'cylinder367943r200' },
    { name: 'slice24502t450', displayName: 'slice24502t450' },
    { name: 'slice24502t475', displayName: 'slice24502t475' },
    { name: 'slice24502t325', displayName: 'slice24502t325' },
    { name: 'slice24502t315', displayName: 'slice24502t315' },
    { name: 'Mosaic', displayName: 'Full CA1' },
    { name: 'All', displayName: 'All' },
    { name: 'Excitatory', displayName: 'Excitatory' },
    { name: 'Inhibitory', displayName: 'Inhibitory' },
    { name: 'SLM_PPA', displayName: 'SLM_PPA' },
    { name: 'SO_BP', displayName: 'SO_BP' },
    { name: 'SO_BS', displayName: 'SO_BS' },
    { name: 'SO_OLM', displayName: 'SO_OLM' },
    { name: 'SO_Tri', displayName: 'SO_Tri' },
    { name: 'SP_AA', displayName: 'SP_AA' },
    { name: 'SP_BS', displayName: 'SP_BS' },
    { name: 'SP_CCKBC', displayName: 'SP_CCKBC' },
    { name: 'SP_Ivy', displayName: 'SP_Ivy' },
    { name: 'SP_PC', displayName: 'SP_PC' },
    { name: 'SP_PVBC', displayName: 'SP_PVBC' },
    { name: 'SR_SCA', displayName: 'SR_SCA' },
    { name: 'bAC', displayName: 'bAC' },
    { name: 'cAC', displayName: 'cAC' },
    { name: 'cACpyr', displayName: 'cACpyr' },
    { name: 'cNAC', displayName: 'cNAC' },
    { name: 'SLM', displayName: 'SLM' },
    { name: 'SP', displayName: 'SP' },
    { name: 'SO', displayName: 'SO' },
    { name: 'SR', displayName: 'SR' },
    { name: 'AllCompartments', displayName: 'AllCompartments', lfp: true },
  ],
  defaultPopulation: 'Slice 5',
  biggestTarget: 'Full CA1',
  displayName: 'Hippocampus Full CA1',
  simConfigToUse: constants.areas.HIPPOCAMPUS,
  hipperpolarizingStim: {
    Stimulus: {
      hypamp: {
        Mode: 'Current',
        Pattern: 'Hyperpolarizing',
        Delay: '0.0',
        Duration: '3500.0',
      },
    },
    StimulusInject: {
      hypamp_mosaic: {
        Stimulus: 'hypamp',
        Target: 'Mosaic',
      },
    },
  },
};


const hippoBbpFullCa1 = Object.assign(
  {},
  { ...hippoHbpFullCa1 },
  {
    prefix: {
      [constants.computers.BB5]: '/gpfs/bbp.cscs.ch/project/proj42/home/antonel/CA1',
    },
  },
);

/*
|--------------------------------------------------------------------------
| O1 Hippocampus Microcircuit
|--------------------------------------------------------------------------
*/

const microcircuitImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-mooc';
const hippoHbpMicrocircuit = {
  prefix: {
    [constants.computers.JURECA]: '/p/project/cvsk25/vsk2512/O1',
    [constants.computers.PIZ_DAINT]: '/apps/hbp/ich002/home/antonel/O1',
  },
  paths: {
    MorphologyPath: '<%= prefix %>/entities/morphologies/20180417/',
    METypePath: '<%= prefix %>/entities/emodels/20180504b/hoc/',
    MEComboInfoFile: '<%= prefix %>/entities/emodels/20180504b/mecombo_emodel.tsv',
    CircuitPath: '<%= prefix %>/circuits/O1/20181114/',
    nrnPath: '<%= prefix %>/circuits/O1/20181114/connectome/functional/',
    TargetFile: '<%= prefix %>/circuits/O1/20181114/user.target',
    CellLibraryFile: 'circuit.mvd3',
    CurrentDir: '.',
    OutputRoot: '.',
  },
  targets: [
    { name: '5Cells', displayName: '5Cells' },
    { name: 'Random1PercFull', displayName: 'Random 1% full circuit', src: `${microcircuitImgBase}/1p.png` },
    { name: 'Random5PercFull', displayName: 'Random 5% full circuit', src: `${microcircuitImgBase}/5p.png` },
    { name: 'Random10PercFull', displayName: 'Random 10% full circuit', src: `${microcircuitImgBase}/10p.png` },
    { name: 'Random500Central', displayName: 'Random 500 central column', src: `${microcircuitImgBase}/500.png` },
    { name: 'Random1KCentral', displayName: 'Random 1K central column', src: `${microcircuitImgBase}/1K.png` },
    { name: 'mc2_Column', displayName: 'Central Column', src: `${microcircuitImgBase}/central_column.png` },
    { name: 'Mosaic', displayName: 'Full Circuit', src: `${microcircuitImgBase}/full_circuit.png` },
    { name: 'All', displayName: 'All' },
    { name: 'Excitatory', displayName: 'Excitatory' },
    { name: 'Inhibitory', displayName: 'Inhibitory' },
    { name: 'SLM_PPA', displayName: 'SLM_PPA' },
    { name: 'SO_BP', displayName: 'SO_BP' },
    { name: 'SO_BS', displayName: 'SO_BS' },
    { name: 'SO_OLM', displayName: 'SO_OLM' },
    { name: 'SO_Tri', displayName: 'SO_Tri' },
    { name: 'SP_AA', displayName: 'SP_AA' },
    { name: 'SP_BS', displayName: 'SP_BS' },
    { name: 'SP_CCKBC', displayName: 'SP_CCKBC' },
    { name: 'SP_Ivy', displayName: 'SP_Ivy' },
    { name: 'SP_PC', displayName: 'SP_PC' },
    { name: 'SP_PVBC', displayName: 'SP_PVBC' },
    { name: 'SR_SCA', displayName: 'SR_SCA' },
    { name: 'bAC', displayName: 'bAC' },
    { name: 'cAC', displayName: 'cAC' },
    { name: 'cACpyr', displayName: 'cACpyr' },
    { name: 'cNAC', displayName: 'cNAC' },
    { name: 'mc4_Column', displayName: 'mc4_Column' },
    { name: 'SR', displayName: 'SR' },
    { name: 'SP', displayName: 'SP' },
    { name: 'mc5_Column', displayName: 'mc5_Column' },
    { name: 'SLM', displayName: 'SLM' },
    { name: 'mc0_Column', displayName: 'mc0_Column' },
    { name: 'SO', displayName: 'SO' },
    { name: 'mc6_Column', displayName: 'mc6_Column' },
    { name: 'mc1_Column', displayName: 'mc1_Column' },
    { name: 'mc3_Column', displayName: 'mc3_Column' },
    { name: 'SC', displayName: 'SC' },
    { name: 'SC-CA1', displayName: 'CA1' },
    { name: 'SC-Exc', displayName: 'Exc' },
    { name: 'PV', displayName: 'PV' },
    { name: 'BS', displayName: 'BS' },
    { name: 'BC', displayName: 'BC' },
    { name: 'SP_INT', displayName: 'SP_INT' },
    { name: 'INT', displayName: 'INT' },
    { name: 'Minicolumn', displayName: 'Minicolumn' },
    { name: 'slice475', displayName: 'slice475' },
    { name: 'slice450', displayName: 'slice450' },
    { name: 'slice325', displayName: 'slice325' },
    { name: 'slice315', displayName: 'slice315' },
    { name: 'AllCompartments', displayName: 'AllCompartments', lfp: true },
  ],
  biggestTarget: 'Full Circuit',
  defaultPopulation: 'Central Column',
  displayName: 'Hippocampus CA1 microcircuit',
  simConfigToUse: constants.areas.HIPPOCAMPUS,
  extraParamsInBC: {
    Projection: {
      SC: {
        Path: '<%= prefix %>/circuits/O1/20181114/projection',
        Source: 'proj_nrn',
        Type: 'Synaptic',
      },
    },
  },
  hipperpolarizingStim: {
    Stimulus: {
      hypamp: {
        Mode: 'Current',
        Pattern: 'Hyperpolarizing',
        Delay: '0.0',
        Duration: '3500.0',
      },
    },
    StimulusInject: {
      hypamp_mosaic: {
        Stimulus: 'hypamp',
        Target: 'Mosaic',
      },
    },
  },
};


/*
|--------------------------------------------------------------------------
| MOOC Hippocampus Microcircuit
|--------------------------------------------------------------------------
*/

const newPaths = Object.assign({}, { ...hippoHbpMicrocircuit.paths }, { CurrentDir: '/io', OutputRoot: '/io' });
const hippoMoocMicrocircuit = Object.assign(
  {},
  { ...hippoHbpMicrocircuit },
  {
    prefix: {
      [constants.computers.NUVLA]: '/mooc',
    },
    paths: newPaths,
  },
);

const hippoBbpMicrocircuit = Object.assign(
  {},
  { ...hippoHbpMicrocircuit },
  {
    prefix: {
      [constants.computers.BB5]: '/gpfs/bbp.cscs.ch/home/antonel/20181114/putting_circuit_together',
    },
  },
);

/*
|--------------------------------------------------------------------------
| O1 SSCx
|--------------------------------------------------------------------------
*/

const sscxBbpMicrocircuit = {
  prefix: {
    [constants.computers.BB5]: '',
  },
  paths: {
    MorphologyPath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj1/morphologies',
    METypePath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj1/ccells',
    CircuitPath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj1/circuits/SomatosensoryCxS1-v4.lowerCellDensity.r151/O1_2/merged_circuit',
    nrnPath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj1/circuits/SomatosensoryCxS1-v4.lowerCellDensity.r151/O1_2/merged_circuit/ncsFunctionalAllRecipePathways',
    TargetFile: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj1/simulations/2014.08.21/SomatosensoryCxS1-v4.SynUpdate.r151/Silberberg/k_ca_scan/K3p5/Ca1p2/user.target',
    CellLibraryFile: 'circuit.mvd3',
    NumSynapseFiles: 8192,
    CurrentDir: '.',
    OutputRoot: '.',
  },
  targets: [
    { name: 'mc2_Column', displayName: 'Central Column' },
  ],
  reportsTargetFilter: '(Random.{1,2}Perc|mc2_Column|Mosaic|AllCompartments)',
  stimulationTargetFilter: '(Central|mc2_Column|Mosaic)',
  biggestTarget: 'Full Circuit',
  defaultPopulation: 'Central Column',
  displayName: 'SomatosensoryCortex microcircuit',
  simConfigToUse: constants.areas.SSCX,
};

const mapCircuitNameWithUrl = {
  hippo_hbp_microcircuit: hippoHbpMicrocircuit,
  hippo_mooc_microcircuit: hippoMoocMicrocircuit,
  hippo_hbp_full_ca1: hippoHbpFullCa1,
  hippo_bbp_full_ca1: hippoBbpFullCa1,
  hippo_bbp_microcircuit: hippoBbpMicrocircuit,
  sscx_bbp_microcircuit: sscxBbpMicrocircuit,
};

export default {
  mapCircuitNameWithUrl,
};
