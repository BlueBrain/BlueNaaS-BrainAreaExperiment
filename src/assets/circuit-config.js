
/*
|--------------------------------------------------------------------------
| Slices Full CA1
|--------------------------------------------------------------------------
*/
const slicesImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-CA1';

const slices = {
  prefix: { // setting prefix allow to know which computer can run the circuit
    JURECA: '/p/project/cpcp0/pcp0068/CircuitRelease',
    PIZ_DAINT: '/apps/hbp/ich002/home/antonel/full_ca1',
  },
  paths: {
    MorphologyPath: '/r2017.06b/MorphologyRelease/',
    METypePath: '/r2017.06b/ccells/',
    CircuitPath: '/r2017.06b/',
    CurrentDir: '/r2017.06b/',
    nrnPath: '/r2017.06b/S2F/',
    TargetFile: '/r2017.06b/user.target',
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
};


/*
|--------------------------------------------------------------------------
| MOOC Microcircuit
|--------------------------------------------------------------------------
*/

// https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-mooc/mosaic.png images-slices-CA1
const moocImgBase = 'https://bbpteam.epfl.ch/public/bsp-resources/sim-launcher-ui/images-slices-mooc';
const mooc = {
  prefix: {
    NUVLA: '/mooc',
  },
  paths: {
    MorphologyPath: '/entities/morphologies/20180417/',
    METypePath: '/entities/emodels/20180504b/hoc/',
    MEComboInfoFile: '/entities/emodels/20180504b/mecombo_emodel.tsv',
    CircuitPath: '/circuits/O1/20181114/',
    nrnPath: '/circuits/O1/20181114/connectome/functional/',
    TargetFile: '/circuits/O1/20181114/user.target',
    CellLibraryFile: 'circuit.mvd3',
    CurrentDir: '/io',
    OutputRoot: '/io',
  },
  targets: [
    { name: 'Random1PercFull', displayName: 'Random 1% (of circuit)', src: `${moocImgBase}/1p.png` },
    { name: 'Random5PercFull', displayName: 'Random 5% (of circuit)', src: `${moocImgBase}/5p.png` },
    { name: 'Random10PercFull', displayName: 'Random 10% (of circuit)', src: `${moocImgBase}/10p.png` },
    { name: 'Random500Central', displayName: 'Random 500 (of column)', src: `${moocImgBase}/500.png` },
    { name: 'Random1KCentral', displayName: 'Random 1K (of column)', src: `${moocImgBase}/1K.png` },
    { name: 'mc2_Column', displayName: 'Central Column', src: `${moocImgBase}/central_column.png` },
    { name: 'Mosaic', displayName: 'Full Circuit', src: `${moocImgBase}/full_circuit.png` },
  ],
  reportsTargetFilter: '(Random.{1,2}Perc|mc2_Column|Mosaic)',
  stimulationTargetFilter: '(Central|mc2_Column|Mosaic)',
  biggestTarget: 'Full Circuit',
  defaultPopulation: 'Central Column',
  displayName: 'Hippocampus CA1 microcircuit',
  extraParamsInBC: {
    Projection: {
      SC: {
        Path: '/mooc/circuits/O1/20181114/projection',
        Source: 'proj_nrn',
        Type: 'Synaptic',
      },
    },
    Connection: {
      // 'Inh-Exc': {
      //   // calculation based on Zheng et al 2011
      //   Source: 'Inhibitory',
      //   Destination: 'Excitatory',
      //   Weight: 1.0,
      //   SpontMinis: 0.05407864719187719,
      // },
      // 'Inh-Inh': {
      //   // # calculation based on Hajos and Mody, 1997
      //   Source: 'Inhibitory',
      //   Destination: 'Inhibitory',
      //   Weight: 1.0,
      //   SpontMinis: 0.016381091517789177,
      // },
      // 'SC-Exc': {
      //   // # calculation based on Ito and Schuman, 2009
      //   Source: 'SC',
      //   Destination: 'Excitatory',
      //   Weight: 1.0,
      //   SpontMinis: 0.023678248125348696,
      // },
      // 'Exc-Exc': {
      //   Source: 'Excitatory',
      //   Destination: 'Excitatory',
      //   Weight: 1.0,
      //   SpontMinis: 0.00015390861281476653,
      // },
      // 'SC-Inh': {
      //   // # calculation based on Zheng et al 2011 (excitatory minis on PV+ interneurons)
      //   Source: 'SC',
      //   Destination: 'Inhibitory',
      //   Weight: 1.0,
      //   SpontMinis: 0.0502721514946413,
      // },
      // 'Exc-Inh': {
      //   Source: 'Excitatory',
      //   Destination: 'Inhibitory',
      //   Weight: 1.0,
      //   SpontMinis: 0.00335147676630942,
      // },
      'All-All': {
        Source: 'Mosaic',
        Destination: 'Mosaic',
        Weight: 1.0,
        SpontMinis: 0.01,
      },
      'SC-All': {
        Source: 'SC',
        Destination: 'Mosaic',
        Weight: 1.0,
        SpontMinis: 0.01,
      },
      AMPA_NMDA: {
        Source: 'Excitatory',
        Destination: 'Mosaic',
        SynapseConfigure: '%s.e = 0 %s.NMDA_ratio = 1.22 %s.tau_r_NMDA = 3.9 %s.tau_d_NMDA = 35.6',
      },
      GABA_AB: {
        Source: 'Inhibitory',
        Destination: 'Mosaic',
        SynapseConfigure: '%s.e_GABAA = -80.0 %s.GABAB_ratio = 0',
        // # no GABA_B (so far)
      },
      MGGate: {
        Source: 'Excitatory',
        Destination: 'Mosaic',
        SynapseConfigure: '%s.mg = 1.0',
      },
    },
  },
};

export default {
  slices,
  mooc,
};
