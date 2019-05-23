
/*
|--------------------------------------------------------------------------
| Slices Full CA1
|--------------------------------------------------------------------------
*/
const slicesImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-CA1';

const fullca1 = {
  prefix: { // setting prefix allow to know which computer can run the circuit
    JURECA: '/p/project/cpcp0/pcp0068/CircuitRelease',
    PIZ_DAINT: '/apps/hbp/ich002/home/antonel/full_ca1',
  },
  paths: {
    MorphologyPath: '<%= prefix %>/r2017.06b/MorphologyRelease/',
    METypePath: '<%= prefix %>/r2017.06b/ccells/',
    CircuitPath: '<%= prefix %>/r2017.06b/',
    nrnPath: '<%= prefix %>/r2017.06b/S2F/',
    TargetFile: '<%= prefix %>/r2017.06b/user.target',
    CurrentDir: '.',
    OutputRoot: '.',
  },
  targets: [
    { name: 'slice-6', displayName: 'Slice-6', src: `${slicesImgBase}/slice-6.png` },
    { name: 'slice-5', displayName: 'Slice-5', src: `${slicesImgBase}/slice-5.png` },
    { name: 'slice-4', displayName: 'Slice-4', src: `${slicesImgBase}/slice-4.png` },
    { name: 'slice-3', displayName: 'Slice-3', src: `${slicesImgBase}/slice-3.png` },
    { name: 'slice-2', displayName: 'Slice-2', src: `${slicesImgBase}/slice-2.png` },
    { name: 'slice-1', displayName: 'Slice-1', src: `${slicesImgBase}/slice-1.png` },
    { name: 'slice0', displayName: 'Slice 0', src: `${slicesImgBase}/slice0.png` },
    { name: 'slice1', displayName: 'Slice 1', src: `${slicesImgBase}/slice1.png` },
    { name: 'slice2', displayName: 'Slice 2', src: `${slicesImgBase}/slice2.png` },
    { name: 'slice3', displayName: 'Slice 3', src: `${slicesImgBase}/slice3.png` },
    { name: 'slice4', displayName: 'Slice 4', src: `${slicesImgBase}/slice4.png` },
    { name: 'slice5', displayName: 'Slice 5', src: `${slicesImgBase}/slice5.png` },
    { name: 'slice6', displayName: 'Slice 6', src: `${slicesImgBase}/slice6.png` },
    { name: 'Mosaic', displayName: 'Full CA1', src: `${slicesImgBase}/Mosaic.png` },
    { name: 'cylinder', displayName: 'cylinder' },
    { name: 'slice', displayName: 'slice' },
    { name: 'slice_exc', displayName: 'slice_exc' },
    { name: 'slice_int', displayName: 'slice_int' },
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
    { name: 'SR_IS1', displayName: 'SR_IS1' },
    { name: 'SR_SCA', displayName: 'SR_SCA' },
    { name: 'bAC', displayName: 'bAC' },
    { name: 'cAC', displayName: 'cAC' },
    { name: 'cACpyr', displayName: 'cACpyr' },
    { name: 'cNAC', displayName: 'cNAC' },
    { name: 'Excitatory', displayName: 'Excitatory' },
    { name: 'Inhibitory', displayName: 'Inhibitory' },
    { name: 'SR', displayName: 'SR' },
    { name: 'SP', displayName: 'SP' },
    { name: 'SO', displayName: 'SO' },
    { name: 'SLM', displayName: 'SLM' },
    { name: 'AllCompartments', displayName: 'AllCompartments' },
  ],
  defaultPopulation: 'Slice-4',
  biggestTarget: 'Full CA1',
  displayName: 'Hippocampus Full CA1',
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
| O1 Microcircuit
|--------------------------------------------------------------------------
*/

const microcircuitImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-mooc';
const microcircuit = {
  prefix: {
    JURECA: '/p/project/cvsk25/vsk2512/O1',
    PIZ_DAINT: '/apps/hbp/ich002/home/antonel/O1',
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
    { name: 'mc2_Column', displayName: 'mc2_Column' },
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
    { name: 'AllCompartments', displayName: 'AllCompartments' },
  ],
  reportsTargetFilter: '(Random.{1,2}Perc|mc2_Column|Mosaic|AllCompartments)',
  stimulationTargetFilter: '(Central|mc2_Column|Mosaic)',
  checksForLFP: ['AllCompartments', 'Summation'],
  biggestTarget: 'Full Circuit',
  defaultPopulation: 'Central Column',
  displayName: 'Hippocampus CA1 microcircuit',
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
| MOOC Microcircuit
|--------------------------------------------------------------------------
*/

const newPaths = Object.assign({}, { ...microcircuit.paths }, { CurrentDir: '/io', OutputRoot: '/io' });
const moocmicrocircuit = Object.assign(
  {},
  { ...microcircuit },
  {
    prefix: {
      NUVLA: '/mooc',
    },
    paths: newPaths,
    reportsTargetFilter: '(Random.{1,2}Perc|mc2_Column|Mosaic)',
  },
);

export default {
  fullca1,
  moocmicrocircuit,
  microcircuit,
};
