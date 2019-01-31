
import cleanDeep from 'clean-deep';

import store from '@/services/store';

function createBCTemplate() {
  const circuitPaths = store.state.currentCircuitConfig.paths;
  const circuitPathsPrexis = store.state.currentCircuitConfig.prefix[store.state.currentComputer];
  const template = cleanDeep({
    Stimulus: {},
    Report: {},
    Run: {
      Default: {
        MorphologyPath: circuitPaths.MorphologyPath ? circuitPathsPrexis + circuitPaths.MorphologyPath : null,
        METypePath: circuitPaths.METypePath ? circuitPathsPrexis + circuitPaths.METypePath : null,
        MEComboInfoFile: circuitPaths.MEComboInfoFile ? circuitPathsPrexis + circuitPaths.MEComboInfoFile : null,
        CircuitPath: circuitPaths.CircuitPath ? circuitPathsPrexis + circuitPaths.CircuitPath : null,
        nrnPath: circuitPaths.nrnPath ? circuitPathsPrexis + circuitPaths.nrnPath : null,
        TargetFile: circuitPaths.TargetFile ? circuitPathsPrexis + circuitPaths.TargetFile : null,
        CurrentDir: circuitPaths.CurrentDir,
        OutputRoot: circuitPaths.OutputRoot,
        Version: 'HEAD',
        Time: '12:27:21',
        Date: '15:2:16',
        CellLibraryFile: circuitPaths.CellLibraryFile,
        gitPath: 'ssh://bbpgit.epfl.ch/sim/neurodamus/bbp',
        CircuitTarget: store.state.simulationPopulation,
        Dt: '0.025',
        Duration: store.state.simulationDuration,
        ForwardSkip: store.state.simulationForwardSkip,
        NumSynapseFiles: '2048',
        BaseSeed: '10',
      },
    },
    StimulusInject: {},
    Connection: {}, // to define spontaneous activities
  });
  return template;
}

export default {};

export { createBCTemplate };
