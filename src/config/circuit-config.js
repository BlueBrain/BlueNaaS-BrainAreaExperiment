
import constants from '@/common/constants';

const { computers } = constants;
/*
|--------------------------------------------------------------------------
| Hippocampus Full CA1
|--------------------------------------------------------------------------
*/

const slicesImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-CA1/ca1-20181114';

const hippoHbpFullCa1 = {
  prefix: { // setting prefix allow to know which computer can run the circuit
    [computers.JURECA]: '/p/home/jusers/antonel1/jureca/vsk2512/CA1/20181114',
    [computers.PIZ_DAINT]: '/apps/hbp/ich002/home/antonel/full_ca1/CA1',
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
    { name: 'slice1', displayName: 'Slice 01', src: `${slicesImgBase}/slice1.png` },
    { name: 'slice2', displayName: 'Slice 02', src: `${slicesImgBase}/slice2.png` },
    { name: 'slice3', displayName: 'Slice 03', src: `${slicesImgBase}/slice3.png` },
    { name: 'slice4', displayName: 'Slice 04', src: `${slicesImgBase}/slice4.png` },
    { name: 'slice5', displayName: 'Slice 05', src: `${slicesImgBase}/slice5.png` },
    { name: 'slice6', displayName: 'Slice 06', src: `${slicesImgBase}/slice6.png` },
    { name: 'slice7', displayName: 'Slice 07', src: `${slicesImgBase}/slice7.png` },
    { name: 'slice8', displayName: 'Slice 08', src: `${slicesImgBase}/slice8.png` },
    { name: 'slice9', displayName: 'Slice 09', src: `${slicesImgBase}/slice9.png` },
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
    { name: 'SLM_PPA', displayName: 'SLM_PPA', src: `${slicesImgBase}/SLM_PPA.png` },
    { name: 'PV', displayName: 'PV', src: `${slicesImgBase}/PV.png` },
    { name: 'BS', displayName: 'BS', src: `${slicesImgBase}/BS.png` },
    { name: 'BC', displayName: 'BC', src: `${slicesImgBase}/BC.png` },
    { name: 'SP_INT', displayName: 'SP_INT', src: `${slicesImgBase}/SP_INT.png` },
    { name: 'INT', displayName: 'INT', src: `${slicesImgBase}/INT.png` },
    { name: 'cylinders', displayName: 'cylinders', src: `${slicesImgBase}/cylinders.png` },
    { name: 'cylinder205789r200', displayName: 'cylinder205789r200', src: `${slicesImgBase}/cylinder205789r200.png` },
    { name: 'cylinder377156r200', displayName: 'cylinder377156r200', src: `${slicesImgBase}/cylinder377156r200.png` },
    { name: 'cylinder55853r200', displayName: 'cylinder55853r200', src: `${slicesImgBase}/cylinder55853r200.png` },
    { name: 'cylinder405270r200', displayName: 'cylinder405270r200', src: `${slicesImgBase}/cylinder405270r200.png` },
    { name: 'cylinder363971r200', displayName: 'cylinder363971r200', src: `${slicesImgBase}/cylinder363971r200.png` },
    { name: 'cylinder75751r200', displayName: 'cylinder75751r200', src: `${slicesImgBase}/cylinder75751r200.png` },
    { name: 'cylinder367943r200', displayName: 'cylinder367943r200', src: `${slicesImgBase}/cylinder367943r200.png` },
    { name: 'slice24502t450', displayName: 'slice24502t450', src: `${slicesImgBase}/slice24502t450.png` },
    { name: 'slice24502t475', displayName: 'slice24502t475', src: `${slicesImgBase}/slice24502t475.png` },
    { name: 'slice24502t325', displayName: 'slice24502t325', src: `${slicesImgBase}/slice24502t325.png` },
    { name: 'slice24502t315', displayName: 'slice24502t315', src: `${slicesImgBase}/slice24502t315.png` },
    { name: 'Mosaic', displayName: 'Full CA1', src: `${slicesImgBase}/Mosaic.png` },
    { name: 'All', displayName: 'All', src: `${slicesImgBase}/All.png` },
    { name: 'Excitatory', displayName: 'Excitatory', src: `${slicesImgBase}/Excitatory.png` },
    { name: 'Inhibitory', displayName: 'Inhibitory', src: `${slicesImgBase}/Inhibitory.png` },
    { name: 'SO_BP', displayName: 'SO_BP', src: `${slicesImgBase}/SO_BP.png` },
    { name: 'SO_BS', displayName: 'SO_BS', src: `${slicesImgBase}/SO_BS.png` },
    { name: 'SO_OLM', displayName: 'SO_OLM', src: `${slicesImgBase}/SO_OLM.png` },
    { name: 'SO_Tri', displayName: 'SO_Tri', src: `${slicesImgBase}/SO_Tri.png` },
    { name: 'SP_AA', displayName: 'SP_AA', src: `${slicesImgBase}/SP_AA.png` },
    { name: 'SP_BS', displayName: 'SP_BS', src: `${slicesImgBase}/SP_BS.png` },
    { name: 'SP_CCKBC', displayName: 'SP_CCKBC', src: `${slicesImgBase}/SP_CCKBC.png` },
    { name: 'SP_Ivy', displayName: 'SP_Ivy', src: `${slicesImgBase}/SP_Ivy.png` },
    { name: 'SP_PC', displayName: 'SP_PC', src: `${slicesImgBase}/SP_PC.png` },
    { name: 'SP_PVBC', displayName: 'SP_PVBC', src: `${slicesImgBase}/SP_PVBC.png` },
    { name: 'SR_SCA', displayName: 'SR_SCA', src: `${slicesImgBase}/SR_SCA.png` },
    { name: 'bAC', displayName: 'bAC', src: `${slicesImgBase}/bAC.png` },
    { name: 'cAC', displayName: 'cAC', src: `${slicesImgBase}/cAC.png` },
    { name: 'cACpyr', displayName: 'cACpyr', src: `${slicesImgBase}/cACpyr.png` },
    { name: 'cNAC', displayName: 'cNAC', src: `${slicesImgBase}/cNAC.png` },
    { name: 'SLM', displayName: 'SLM', src: `${slicesImgBase}/SLM.png` },
    { name: 'SP', displayName: 'SP', src: `${slicesImgBase}/SP.png` },
    { name: 'SO', displayName: 'SO', src: `${slicesImgBase}/SO.png` },
    { name: 'SR', displayName: 'SR', src: `${slicesImgBase}/SR.png` },
    {
      name: 'AllCompartments',
      displayName: 'AllCompartments',
      lfp: true,
      src: `${slicesImgBase}/All.png`,
    },
  ],
  defaultPopulation: 'Slice 05',
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
      [computers.BB5]: '/gpfs/bbp.cscs.ch/project/proj42/home/antonel/CA1',
    },
  },
);

/*
|--------------------------------------------------------------------------
| O1 Hippocampus Microcircuit
|--------------------------------------------------------------------------
*/

const microcircuitImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/o1-20181114';
const hippoHbpMicrocircuit = {
  prefix: {
    [computers.JURECA]: '/p/project/cvsk25/vsk2512/O1',
    [computers.PIZ_DAINT]: '/apps/hbp/ich002/home/antonel/O1',
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
    { name: 'Random1PercFull', displayName: 'Random 1% full circuit', src: `${microcircuitImgBase}/Random1PercFull.png` },
    { name: 'Random5PercFull', displayName: 'Random 5% full circuit', src: `${microcircuitImgBase}/Random5PercFull.png` },
    { name: 'Random10PercFull', displayName: 'Random 10% full circuit', src: `${microcircuitImgBase}/Random10PercFull.png` },
    { name: 'Random500Central', displayName: 'Random 500 central column', src: `${microcircuitImgBase}/Random500Central.png` },
    { name: 'Random1KCentral', displayName: 'Random 1K central column', src: `${microcircuitImgBase}/Random1KCentral.png` },
    { name: 'mc2_Column', displayName: 'Central Column', src: `${microcircuitImgBase}/mc2_Column.png` },
    { name: 'Mosaic', displayName: 'Full Circuit', src: `${microcircuitImgBase}/Mosaic.png` },
    { name: 'All', displayName: 'All', src: `${microcircuitImgBase}/All.png` },
    { name: 'Excitatory', displayName: 'Excitatory', src: `${microcircuitImgBase}/Excitatory.png` },
    { name: 'Inhibitory', displayName: 'Inhibitory', src: `${microcircuitImgBase}/Inhibitory.png` },
    { name: 'SLM_PPA', displayName: 'SLM_PPA', src: `${microcircuitImgBase}/SLM_PPA.png` },
    { name: 'SO_BP', displayName: 'SO_BP', src: `${microcircuitImgBase}/SO_BP.png` },
    { name: 'SO_BS', displayName: 'SO_BS', src: `${microcircuitImgBase}/SO_BS.png` },
    { name: 'SO_OLM', displayName: 'SO_OLM', src: `${microcircuitImgBase}/SO_OLM.png` },
    { name: 'SO_Tri', displayName: 'SO_Tri', src: `${microcircuitImgBase}/SO_Tri.png` },
    { name: 'SP_AA', displayName: 'SP_AA', src: `${microcircuitImgBase}/SP_AA.png` },
    { name: 'SP_BS', displayName: 'SP_BS', src: `${microcircuitImgBase}/SP_BS.png` },
    { name: 'SP_CCKBC', displayName: 'SP_CCKBC', src: `${microcircuitImgBase}/SP_CCKBC.png` },
    { name: 'SP_Ivy', displayName: 'SP_Ivy', src: `${microcircuitImgBase}/SP_Ivy.png` },
    { name: 'SP_PC', displayName: 'SP_PC', src: `${microcircuitImgBase}/SP_PC.png` },
    { name: 'SP_PVBC', displayName: 'SP_PVBC', src: `${microcircuitImgBase}/SP_PVBC.png` },
    { name: 'SR_SCA', displayName: 'SR_SCA', src: `${microcircuitImgBase}/SR_SCA.png` },
    { name: 'bAC', displayName: 'bAC', src: `${microcircuitImgBase}/bAC.png` },
    { name: 'cAC', displayName: 'cAC', src: `${microcircuitImgBase}/cAC.png` },
    { name: 'cACpyr', displayName: 'cACpyr', src: `${microcircuitImgBase}/cACpyr.png` },
    { name: 'cNAC', displayName: 'cNAC', src: `${microcircuitImgBase}/cNAC.png` },
    { name: 'mc4_Column', displayName: 'mc4_Column', src: `${microcircuitImgBase}/mc4_Column.png` },
    { name: 'SR', displayName: 'SR', src: `${microcircuitImgBase}/SR.png` },
    { name: 'SP', displayName: 'SP', src: `${microcircuitImgBase}/SP.png` },
    { name: 'mc5_Column', displayName: 'mc5_Column', src: `${microcircuitImgBase}/mc5_Column.png` },
    { name: 'SLM', displayName: 'SLM', src: `${microcircuitImgBase}/SLM.png` },
    { name: 'mc0_Column', displayName: 'mc0_Column', src: `${microcircuitImgBase}/mc0_Column.png` },
    { name: 'SO', displayName: 'SO', src: `${microcircuitImgBase}/SO.png` },
    { name: 'mc6_Column', displayName: 'mc6_Column', src: `${microcircuitImgBase}/mc6_Column.png` },
    { name: 'mc1_Column', displayName: 'mc1_Column', src: `${microcircuitImgBase}/mc1_Column.png` },
    { name: 'mc3_Column', displayName: 'mc3_Column', src: `${microcircuitImgBase}/mc3_Column.png` },
    { name: 'SC-Exc', displayName: 'Exc', src: `${microcircuitImgBase}/SC-Exc.png` },
    { name: 'PV', displayName: 'PV', src: `${microcircuitImgBase}/PV.png` },
    { name: 'BS', displayName: 'BS', src: `${microcircuitImgBase}/BS.png` },
    { name: 'BC', displayName: 'BC', src: `${microcircuitImgBase}/BC.png` },
    { name: 'SP_INT', displayName: 'SP_INT', src: `${microcircuitImgBase}/SP_INT.png` },
    { name: 'INT', displayName: 'INT', src: `${microcircuitImgBase}/INT.png` },
    { name: 'Minicolumn', displayName: 'Minicolumn', src: `${microcircuitImgBase}/Minicolumn.png` },
    {
      name: 'AllCompartments',
      displayName: 'AllCompartments',
      lfp: true,
      src: `${microcircuitImgBase}/Mosaic.png`,
    },
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
      [computers.NUVLA]: '/mooc',
    },
    paths: newPaths,
  },
);

const hippoBbpMicrocircuit = Object.assign(
  {},
  { ...hippoHbpMicrocircuit },
  {
    prefix: {
      [computers.BB5]: '/gpfs/bbp.cscs.ch/home/antonel/20181114/putting_circuit_together',
    },
  },
);

/*
|--------------------------------------------------------------------------
| O1 SSCx
|--------------------------------------------------------------------------
*/

const sscxImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/sscx-o1.v6a-20171212';
const sscxBbpMicrocircuit = {
  prefix: {
    [computers.BB5]: '',
  },
  paths: {
    MorphologyPath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj59/entities/morphologies/2017.10.31',
    METypePath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj64/home/vangeit/modelmanagement/prod.20171103/mm_runs/run/1810912/output/emodels_hoc/',
    MEComboInfoFile: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj64/home/vangeit/modelmanagement/prod.20171103/megate_runs/run/6c6d611/output_select/mecombo_emodel.tsv',
    CircuitPath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj64/circuits/O1.v6a/20171212/',
    nrnPath: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj64/circuits/O1.v6a/20171212/ncsFunctionalAllRecipePathways',
    TargetFile: '<%= prefix %>/gpfs/bbp.cscs.ch/home/antonel/sscx/user.target',
    CellLibraryFile: 'circuit.mvd3',
    BaseSeed: 372588,
    CurrentDir: '.',
    OutputRoot: '.',
  },
  targets: [
    { name: 'Mosaic', displayName: 'Mosaic', src: `${sscxImgBase}/Mosaic.png` },
    { name: 'All', displayName: 'All', src: `${sscxImgBase}/All.png` },
    { name: 'Excitatory', displayName: 'Excitatory', src: `${sscxImgBase}/Excitatory.png` },
    { name: 'Inhibitory', displayName: 'Inhibitory', src: `${sscxImgBase}/Inhibitory.png` },
    { name: 'Layer1', displayName: 'Layer1', src: `${sscxImgBase}/Layer1.png` },
    { name: 'Layer2', displayName: 'Layer2', src: `${sscxImgBase}/Layer2.png` },
    { name: 'Layer3', displayName: 'Layer3', src: `${sscxImgBase}/Layer3.png` },
    { name: 'Layer4', displayName: 'Layer4', src: `${sscxImgBase}/Layer4.png` },
    { name: 'Layer5', displayName: 'Layer5', src: `${sscxImgBase}/Layer5.png` },
    { name: 'Layer6', displayName: 'Layer6', src: `${sscxImgBase}/Layer6.png` },
    { name: 'L1_DAC', displayName: 'L1_DAC', src: `${sscxImgBase}/L1_DAC.png` },
    { name: 'L1_HAC', displayName: 'L1_HAC', src: `${sscxImgBase}/L1_HAC.png` },
    { name: 'L1_LAC', displayName: 'L1_LAC', src: `${sscxImgBase}/L1_LAC.png` },
    { name: 'L1_NGC-DA', displayName: 'L1_NGC-DA', src: `${sscxImgBase}/L1_NGC-DA.png` },
    { name: 'L1_NGC-SA', displayName: 'L1_NGC-SA', src: `${sscxImgBase}/L1_NGC-SA.png` },
    { name: 'L1_SAC', displayName: 'L1_SAC', src: `${sscxImgBase}/L1_SAC.png` },
    { name: 'L23_BP', displayName: 'L23_BP', src: `${sscxImgBase}/L23_BP.png` },
    { name: 'L23_BTC', displayName: 'L23_BTC', src: `${sscxImgBase}/L23_BTC.png` },
    { name: 'L23_CHC', displayName: 'L23_CHC', src: `${sscxImgBase}/L23_CHC.png` },
    { name: 'L23_DBC', displayName: 'L23_DBC', src: `${sscxImgBase}/L23_DBC.png` },
    { name: 'L23_LBC', displayName: 'L23_LBC', src: `${sscxImgBase}/L23_LBC.png` },
    { name: 'L23_MC', displayName: 'L23_MC', src: `${sscxImgBase}/L23_MC.png` },
    { name: 'L23_NBC', displayName: 'L23_NBC', src: `${sscxImgBase}/L23_NBC.png` },
    { name: 'L23_NGC', displayName: 'L23_NGC', src: `${sscxImgBase}/L23_NGC.png` },
    { name: 'L23_SBC', displayName: 'L23_SBC', src: `${sscxImgBase}/L23_SBC.png` },
    { name: 'L2_IPC', displayName: 'L2_IPC', src: `${sscxImgBase}/L2_IPC.png` },
    { name: 'L2_TPC:A', displayName: 'L2_TPC:A', src: `${sscxImgBase}/L2_TPC-A.png` },
    { name: 'L2_TPC:B', displayName: 'L2_TPC:B', src: `${sscxImgBase}/L2_TPC-B.png` },
    { name: 'L3_TPC:A', displayName: 'L3_TPC:A', src: `${sscxImgBase}/L3_TPC-A.png` },
    { name: 'L3_TPC:B', displayName: 'L3_TPC:B', src: `${sscxImgBase}/L3_TPC-B.png` },
    { name: 'L4_BP', displayName: 'L4_BP', src: `${sscxImgBase}/L4_BP.png` },
    { name: 'L4_BTC', displayName: 'L4_BTC', src: `${sscxImgBase}/L4_BTC.png` },
    { name: 'L4_CHC', displayName: 'L4_CHC', src: `${sscxImgBase}/L4_CHC.png` },
    { name: 'L4_DBC', displayName: 'L4_DBC', src: `${sscxImgBase}/L4_DBC.png` },
    { name: 'L4_LBC', displayName: 'L4_LBC', src: `${sscxImgBase}/L4_LBC.png` },
    { name: 'L4_MC', displayName: 'L4_MC', src: `${sscxImgBase}/L4_MC.png` },
    { name: 'L4_NBC', displayName: 'L4_NBC', src: `${sscxImgBase}/L4_NBC.png` },
    { name: 'L4_NGC', displayName: 'L4_NGC', src: `${sscxImgBase}/L4_NGC.png` },
    { name: 'L4_SBC', displayName: 'L4_SBC', src: `${sscxImgBase}/L4_SBC.png` },
    { name: 'L4_SSC', displayName: 'L4_SSC', src: `${sscxImgBase}/L4_SSC.png` },
    { name: 'L4_TPC', displayName: 'L4_TPC', src: `${sscxImgBase}/L4_TPC.png` },
    { name: 'L4_UPC', displayName: 'L4_UPC', src: `${sscxImgBase}/L4_UPC.png` },
    { name: 'L5_BP', displayName: 'L5_BP', src: `${sscxImgBase}/L5_BP.png` },
    { name: 'L5_BTC', displayName: 'L5_BTC', src: `${sscxImgBase}/L5_BTC.png` },
    { name: 'L5_CHC', displayName: 'L5_CHC', src: `${sscxImgBase}/L5_CHC.png` },
    { name: 'L5_DBC', displayName: 'L5_DBC', src: `${sscxImgBase}/L5_DBC.png` },
    { name: 'L5_LBC', displayName: 'L5_LBC', src: `${sscxImgBase}/L5_LBC.png` },
    { name: 'L5_MC', displayName: 'L5_MC', src: `${sscxImgBase}/L5_MC.png` },
    { name: 'L5_NBC', displayName: 'L5_NBC', src: `${sscxImgBase}/L5_NBC.png` },
    { name: 'L5_NGC', displayName: 'L5_NGC', src: `${sscxImgBase}/L5_NGC.png` },
    { name: 'L5_SBC', displayName: 'L5_SBC', src: `${sscxImgBase}/L5_SBC.png` },
    { name: 'L5_TPC:A', displayName: 'L5_TPC:A', src: `${sscxImgBase}/L5_TPC-A.png` },
    { name: 'L5_TPC:B', displayName: 'L5_TPC:B', src: `${sscxImgBase}/L5_TPC-B.png` },
    { name: 'L5_TPC:C', displayName: 'L5_TPC:C', src: `${sscxImgBase}/L5_TPC-C.png` },
    { name: 'L5_UPC', displayName: 'L5_UPC', src: `${sscxImgBase}/L5_UPC.png` },
    { name: 'L6_BP', displayName: 'L6_BP', src: `${sscxImgBase}/L6_BP.png` },
    { name: 'L6_BPC', displayName: 'L6_BPC', src: `${sscxImgBase}/L6_BPC.png` },
    { name: 'L6_BTC', displayName: 'L6_BTC', src: `${sscxImgBase}/L6_BTC.png` },
    { name: 'L6_CHC', displayName: 'L6_CHC', src: `${sscxImgBase}/L6_CHC.png` },
    { name: 'L6_DBC', displayName: 'L6_DBC', src: `${sscxImgBase}/L6_DBC.png` },
    { name: 'L6_HPC', displayName: 'L6_HPC', src: `${sscxImgBase}/L6_HPC.png` },
    { name: 'L6_IPC', displayName: 'L6_IPC', src: `${sscxImgBase}/L6_IPC.png` },
    { name: 'L6_LBC', displayName: 'L6_LBC', src: `${sscxImgBase}/L6_LBC.png` },
    { name: 'L6_MC', displayName: 'L6_MC', src: `${sscxImgBase}/L6_MC.png` },
    { name: 'L6_NBC', displayName: 'L6_NBC', src: `${sscxImgBase}/L6_NBC.png` },
    { name: 'L6_NGC', displayName: 'L6_NGC', src: `${sscxImgBase}/L6_NGC.png` },
    { name: 'L6_SBC', displayName: 'L6_SBC', src: `${sscxImgBase}/L6_SBC.png` },
    { name: 'L6_TPC:A', displayName: 'L6_TPC:A', src: `${sscxImgBase}/L6_TPC-A.png` },
    { name: 'L6_TPC:C', displayName: 'L6_TPC:C', src: `${sscxImgBase}/L6_TPC-C.png` },
    { name: 'L6_UPC', displayName: 'L6_UPC', src: `${sscxImgBase}/L6_UPC.png` },
    { name: 'bAC', displayName: 'bAC', src: `${sscxImgBase}/bAC.png` },
    { name: 'bIR', displayName: 'bIR', src: `${sscxImgBase}/bIR.png` },
    { name: 'bNAC', displayName: 'bNAC', src: `${sscxImgBase}/bNAC.png` },
    { name: 'bSTUT', displayName: 'bSTUT', src: `${sscxImgBase}/bSTUT.png` },
    { name: 'cACint', displayName: 'cACint', src: `${sscxImgBase}/cACint.png` },
    { name: 'cADpyr', displayName: 'cADpyr', src: `${sscxImgBase}/cADpyr.png` },
    { name: 'cIR', displayName: 'cIR', src: `${sscxImgBase}/cIR.png` },
    { name: 'cNAC', displayName: 'cNAC', src: `${sscxImgBase}/cNAC.png` },
    { name: 'cSTUT', displayName: 'cSTUT', src: `${sscxImgBase}/cSTUT.png` },
    { name: 'dNAC', displayName: 'dNAC', src: `${sscxImgBase}/dNAC.png` },
    { name: 'dSTUT', displayName: 'dSTUT', src: `${sscxImgBase}/dSTUT.png` },
    { name: 'mc0_Column', displayName: 'mc0_Column', src: `${sscxImgBase}/mc0_Column.png` },
    { name: 'mc1_Column', displayName: 'mc1_Column', src: `${sscxImgBase}/mc1_Column.png` },
    { name: 'mc2_Column', displayName: 'Central Column', src: `${sscxImgBase}/mc2_Column.png` },
    { name: 'mc3_Column', displayName: 'mc3_Column', src: `${sscxImgBase}/mc3_Column.png` },
    { name: 'mc4_Column', displayName: 'mc4_Column', src: `${sscxImgBase}/mc4_Column.png` },
    { name: 'mc5_Column', displayName: 'mc5_Column', src: `${sscxImgBase}/mc5_Column.png` },
    { name: 'mc6_Column', displayName: 'mc6_Column', src: `${sscxImgBase}/mc6_Column.png` },
    { name: 'INH_OTHER', displayName: 'INH_OTHER', src: `${sscxImgBase}/INH_OTHER.png` },
    { name: 'L23_PC', displayName: 'L23_PC', src: `${sscxImgBase}/L23_PC.png` },
    { name: 'L5_TTPC1', displayName: 'L5_TTPC1', src: `${sscxImgBase}/L5_TTPC1.png` },
    { name: 'L5_TTPC2', displayName: 'L5_TTPC2', src: `${sscxImgBase}/L5_TTPC2.png` },
    {
      name: 'AllCompartments',
      displayName: 'AllCompartments',
      lfp: true,
      src: `${sscxImgBase}/All.png`,
    },
  ],
  biggestTarget: 'Full Circuit',
  defaultPopulation: 'Mosaic',
  displayName: 'SomatosensoryCortex microcircuit',
  simConfigToUse: constants.areas.SSCX,
  extraParamsInBC: {
    Projection: {
      SC: {
        Path: '<%= prefix %>/gpfs/bbp.cscs.ch/project/proj64/circuits/O1.v6a/20171212/proj_Thalamocortical_VPM/20171214-2',
        Source: 'proj_Thalamocortical_VPM_Source',
        // Type: 'Synaptic',
      },
    },
  },
  hipperpolarizingStim: {
    Stimulus: {
      ThresholdExc: {
        Mode: 'Current',
        Pattern: 'Noise',
        Delay: '0.0',
        Duration: '2500.0',
        MeanPercent: '85.0',
        Variance: '0.001',
      },
      hypamp: {
        Mode: 'Current',
        Pattern: 'Hyperpolarizing',
        Delay: '0.0',
        Duration: '3500.0',
      },
    },
    StimulusInject: {
      spikeReplayIntoUniverse: {
        Stimulus: 'spikeReplay',
        Target: 'Mosaic',
      },
      hypamp_mosaic: {
        Stimulus: 'hypamp',
        Target: 'Mosaic',
      },
    },
  },
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
