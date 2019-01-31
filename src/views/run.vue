
<template>
  <div class="simulation">
    <div class="app-content">
      <!-- header params -->
      <div class="duration-skip">

        <simulation-params/>

        <span class="grow-space"/>
        <i-button
          type="primary"
          size="small"
          icon="ios-list"
          @click="viewList"
        >View Simulations</i-button>
      </div>
      <!-- END header params -->

      <!-- stimulation timeline -->
      <div class="border-container">
        <h2>Stimulations</h2>
        <div class="subtitle">Defines pattern of stimuli to be
        injected into multiple locations</div>
        <stimulation-timeline/>
      </div>
      <!-- END stimulation timeline -->

      <!-- report timeline -->
      <div class="border-container">
        <h2>Reports</h2>
        <div class="subtitle">Controls data collection during the simulation</div>
        <report-timeline/>
      </div>
      <!-- END report timeline -->

      <run-configuration-component @launchSim="launchSim"/>

    </div>
  </div>
</template>


<script>
import SimulationParams from '@/components/run-simulation/sim-params.vue';
import StimulationTimeline from '@/components/run-simulation/stimulation/stimulation-timeline.vue';
import ReportTimeline from '@/components/run-simulation/report/report-timeline.vue';
import RunConfigurationComponent from '@/components/run-simulation/unicore-run-config/run-configuration-component.vue';
import unicore, { urlToComputerAndId } from '@/services/unicore';
import simulationConfig from '@/config/simulation-config';
import { getComputersAvailableForCurrentModel } from '@/services/helper/computer-group-helper';
import '@/assets/css/simulation.css';

export default {
  name: 'RunSimulation',
  components: {
    ReportTimeline,
    SimulationParams,
    StimulationTimeline,
    RunConfigurationComponent,
  },
  created() {
    this.$store.commit('setAppTitle', 'Run Simulation');
    this.$store.dispatch('hideLoader');

    const allTargets = this.$store.state.currentCircuitConfig.targets;

    // set the targets for stimulations
    const stimulationRegExp = new RegExp(this.$store.state.currentCircuitConfig.stimulationTargetFilter);
    const filteredTargetsForStimulation = allTargets.filter(target => stimulationRegExp.test(target.name));
    this.$store.commit('setStimulationTargets', filteredTargetsForStimulation);

    // set targets for reports
    const reportRegExp = new RegExp(this.$store.state.currentCircuitConfig.reportsTargetFilter);
    const filteredTargetsForReport = allTargets.filter(target => reportRegExp.test(target.name));
    this.$store.commit('setReportTargets', filteredTargetsForReport);

    // set the population to be loaded in the simulation (circuitTarget in BlueConfig)
    const population = this.$store.state.currentCircuitConfig.defaultPopulation;
    this.$store.commit('setSimulationPopulation', population);
    this.$store.commit('setPopulationTargets', filteredTargetsForStimulation);
  },
  methods: {
    viewList() {
      const defaultComputer = getComputersAvailableForCurrentModel()[0];
      const computer = this.$store.state.currentComputer || defaultComputer;
      this.$router.push({
        name: 'view',
        params: {
          computerParam: computer,
        },
      });
    },
    async launchSim(blueConfigStr, runConfig, hideModalFn) {
      const newRunConfig = runConfig;
      const currentSimConfig = simulationConfig[this.$store.state.currentComputer];

      const files = [{ To: 'BlueConfig', Data: blueConfigStr }];
      let { script } = currentSimConfig;
      if (script) {
        script = script.join('\n');
        files.push({ To: 'input.sh', Data: script });
      }
      newRunConfig.executable = currentSimConfig.executable;
      newRunConfig.environment = currentSimConfig.environment;

      let submittedJob;
      try {
        submittedJob = await unicore.submitJob(newRunConfig, files);
      } catch (e) {
        this.$Message.error(e.message);
        throw new Error(e.message);
      }

      hideModalFn();
      setTimeout(() => {
        /* giving time modal to hide
          (fix issue not scrolling on details [body overflow: hidden]) */
        this.showDetails(submittedJob._links.self.href);
      }, 500);
    },
    showDetails(jobUrl) {
      const { id, computer } = urlToComputerAndId(jobUrl);
      this.$router.push({
        name: 'details',
        params: {
          jobId: id,
          computerParam: computer,
        },
      });
    },
  },
};
</script>


<style scoped>
  .duration-skip {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .border-container {
    background-color: rgba(216, 223, 239, 0.38);
    border-radius: 5px;
    padding: 20px 10px;
    margin: 20px 0;
  }
</style>
