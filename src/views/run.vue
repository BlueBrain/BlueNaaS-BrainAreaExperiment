
<template>
  <div class="simulation">
    <div class="app-content simulation-run">

      <div class="right-align">
        <i-button
          type="primary"
          icon="ios-list"
          @click="viewList"
        >View Simulations</i-button>
      </div>

      <div class="shared-flex-block">
        <div class="params-config-container">
          <div class="border-container">
            <simulation-params/>
          </div>

          <div class="border-container margined-right">
            <stimulation-timeline/>
          </div>

          <div class="border-container margined-right">
            <report-timeline/>
          </div>
        </div>

        <div class="target-viewer-right-container border-container">
          <target-viewer :target-selected-url="targetSelectedUrl"/>
        </div>
      </div>

      <div class="border-container">
        <connection-manipulation/>
      </div>

      <div class="border-container">
        <projection-manipulation/>
      </div>

      <run-configuration-component
        @launch-sim="launchSim"
        ref="runConfigComponentRef"
      />

    </div>
  </div>
</template>


<script>
import sortBy from 'lodash/sortBy';
import SimulationParams from '@/components/run-simulation/sim-params.vue';
import StimulationTimeline from '@/components/run-simulation/stimulation/stimulation-timeline.vue';
import ReportTimeline from '@/components/run-simulation/report/report-timeline.vue';
import RunConfigurationComponent from '@/components/run-simulation/unicore-run-config/run-configuration-component.vue';
import ConnectionManipulation from '@/components/run-simulation/connection-manipulation/connection-list.vue';
import ProjectionManipulation from '@/components/run-simulation/projection-manipulation/list.vue';
import TargetViewer from '@/components/shared/target-viewer.vue';

import unicore, { urlToComputerAndId } from '@/services/unicore';
import { jobTags, addTag } from '@/common/job-status';
import '@/assets/css/simulation.scss';
import 'timeline-plus/dist/timeline.min.css';

export default {
  name: 'RunSimulation',
  props: ['circuit'],
  components: {
    ReportTimeline,
    SimulationParams,
    StimulationTimeline,
    RunConfigurationComponent,
    ConnectionManipulation,
    ProjectionManipulation,
    TargetViewer,
  },
  data() {
    return {
      targetSelectedUrl: null,
    };
  },
  created() {
    this.$store.commit('setAppTitle', 'Run Simulation');
    this.$store.dispatch('hideLoader');

    const allTargets = this.$store.state.fullConfig.circuitConfig.targets;

    // set the targets for stimulations
    const stimulationRegExp = new RegExp(this.$store.state.fullConfig.circuitConfig.stimulationTargetFilter);
    const filteredTargetsForStimulation = allTargets.filter(target => stimulationRegExp.test(target.name));
    this.$store.commit('setStimulationTargets', sortBy(filteredTargetsForStimulation, 'name'));

    // set targets for reports
    const reportRegExp = new RegExp(this.$store.state.fullConfig.circuitConfig.reportsTargetFilter);
    const filteredTargetsForReport = allTargets.filter(target => reportRegExp.test(target.name));
    this.$store.commit('setReportTargets', sortBy(filteredTargetsForReport, 'name'));

    // current population and computer will be set in sim-params due it needs to check the saved config

    this.$store.commit('setPopulationTargets', sortBy(filteredTargetsForStimulation, 'name'));

    const connectionManipulationTargets = allTargets;
    this.$store.commit('setConnectionTargets', sortBy(connectionManipulationTargets, 'name'));

    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setSimulationPopulation' && state.simulationPopulation) {
        this.getTargetImageUrl(state.simulationPopulation);
      }
    });
  },
  methods: {
    viewList() {
      const defaultComputer = this.$store.state.fullConfig.computersAvailable[0];
      const computer = this.$store.state.fullConfig.computer || defaultComputer;

      // save params before changing page
      this.$refs.runConfigComponentRef.generatePartialBlueConfig();

      this.$router.push({
        name: 'view',
        params: {
          computerParam: computer,
        },
        query: this.$route.query,
      });
    },
    async launchSim(blueConfigStr, runConfig, hideModalFn, extraFiles = null) {
      const newRunConfig = runConfig;
      const simResources = this.$store.state.fullConfig.simulationConfig;
      const files = [{ To: 'BlueConfig', Data: blueConfigStr }];

      const { script } = simResources;
      if (script) {
        const scriptPlainText = Array.isArray(script) ? script.join('\n') : script;
        files.push({ To: 'input.sh', Data: scriptPlainText });
      } else {
        console.warn('Script does not exist or is not an array');
      }

      if (extraFiles) {
        extraFiles.forEach((fileObj) => {
          files.push({ To: fileObj.name, Data: fileObj.data });
        });
      }
      newRunConfig.executable = simResources.executable;
      newRunConfig.environment = simResources.environment;

      addTag(newRunConfig, jobTags.SIMULATION);
      // add from which circuit this simulation was launched
      addTag(newRunConfig, this.$store.state.fullConfig.circuitName);
      addTag(newRunConfig, jobTags.UNICORE_MODE_TAG);
      let submittedJob;
      try {
        submittedJob = await unicore.submitJob(newRunConfig, files);
      } catch (e) {
        this.$Message.error(`Submit job ${e.message}`);
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
        query: this.$route.query,
      });
    },
    getTargetImageUrl(newPopulationName) {
      const selectedTargetObj = this.$store.state.populationTargets.find(targetObj => targetObj.name === newPopulationName);
      if (!selectedTargetObj) return;
      this.targetSelectedUrl = selectedTargetObj.src;
    },
  },
};
</script>


<style scoped>
  .right-align {
    text-align: right;
    margin-bottom: 8px;
  }
  .border-container {
    background-color: rgba(216, 223, 239, 0.38);
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
  }
  .params-config-container {
    flex-grow: 1;
    align-self: flex-start;
  }
  .target-viewer-right-container {
    display: flex;
    align-self: stretch;
    width: 20%;
    justify-content: center;
  }
  .shared-flex-block {
    display: flex;
    align-items: flex-end;
  }
  .shared-flex-block .border-container.margined-right {
    margin-right: 10px;
  }
</style>
