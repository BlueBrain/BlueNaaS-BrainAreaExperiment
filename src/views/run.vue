
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
import simulationConfig from '@/assets/simulation-config';
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

    // set the target that is the defautl for stimulus, reports and circuitTarget in BlueConfig
    const model = this.$store.state.currentCircuitConfig.defaultModel;
    console.debug('Using model', model);
    this.$store.commit('setSimulationModel', model);
  },
  methods: {
    viewList() {
      this.$router.push({
        name: 'view',
        params: {
          computerParam: this.$store.state.currentComputer,
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

      try {
        const submittedJob = await unicore.submitJob(newRunConfig, files);
        console.log(submittedJob);

        hideModalFn();
        setTimeout(() => {
          /* giving time modal to hide
            (fix issue not scrolling on details [body overflow: hidden]) */
          this.showDetails(submittedJob._links.self.href);
        }, 500);
      } catch (e) {
        this.$Message.error(e.message);
        console.error(e.message);
      }
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
