
<template>
  <div class="run-configuration-component">
    <div
      id="tip"
      class="tip"
    >
      <div class="tips">
        <h4>Tips:</h4>
        <div>Double click on timeline to create / modify item</div>
        <div>You can scroll in the timeline to zoom in/out</div>
        <div>Drag the stimuli to modify its duration</div>
      </div>
      <div class="close">
        <icon
          type="md-close"
          size="20"
          @click="closeTip"
        />
      </div>

    </div>

    <!-- template for configuration -->
    <unicore-config-form
      :show-modal="showComputerParamsModal"
      :is-launching-sim="isLaunchingSim"
      @preview-blueconfig="previewBlueConfig"
      @closeModal="showComputerParamsModal = false"
      @close-modal="showComputerParamsModal = false"
      @run-simulation="runSimulation"
    />
    <!-- END template for configuration -->
    <i-button
      icon="md-play"
      type="success"
      size="default"
      @click="configureSimulation"
      class="baseline-align"
      :class="{ disabled: !populationWasSelected }"
    >Continue</i-button>
  </div>
</template>


<script>
import union from 'lodash/union';
import merge from 'lodash/merge';
import eventBus from '@/services/event-bus';
import { createBCTemplate } from '@/common/blueconfig-template';
import UnicoreConfigForm from '@/components/run-simulation/unicore-run-config/unicore-config-form.vue';
import { convertToBCFormat, openContent, mapBlueConfigTerms } from '@/common/utils';
import { jobTags, addTag } from '@/common/job-status';


export default {
  name: 'RunConfigurationComponent',
  data() {
    return {
      showComputerParamsModal: false,
      isLaunchingSim: false,
      blueConfig: {},
    };
  },
  components: {
    UnicoreConfigForm,
  },
  mounted() {
    if (localStorage.getItem('hideTip')) {
      this.closeTip();
    }
  },
  computed: {
    populationWasSelected() {
      return this.$store.state.simulationPopulation;
    },
  },
  methods: {
    closeTip() {
      const tipElement = this.$el.querySelector('#tip');
      tipElement.classList.add('hidden');
      localStorage.setItem('hideTip', true);
    },

    async configureSimulation() {
      // make blueConfig to check if all the params are correct
      if (!this.populationWasSelected) {
        this.$Message.error('Please select a Population to run simulation');
        return;
      }
      const partialBlueConfig = await this.generatePartialBlueConfig();
      const populationSelected = this.$store.state.simulationPopulation;
      const isConsistant = this.checkSimulationConsistancy(partialBlueConfig, populationSelected);
      if (isConsistant) {
        this.showComputerParamsModal = true;
      }
    },

    async generatePartialBlueConfig() {
      /* it will send an action to each section to generate it's own config
        and when it received all of them it will merge it into BlueConfig (NO PATH) */
      const generateStimuli = new Promise((resolve) => {
        eventBus.$emit('create-stimulus-config', resolve);
      });
      const generateReport = new Promise((resolve) => {
        eventBus.$emit('create-report-config', resolve);
      });
      const generateConnections = new Promise((resolve) => {
        eventBus.$emit('create-connection-config', resolve);
      });
      const generateSimParams = new Promise((resolve) => {
        eventBus.$emit('create-sim-params-config', resolve);
      });
      const generateProjection = new Promise((resolve) => {
        eventBus.$emit('create-projection-config', resolve);
      });

      const [stimulationBC, reportBC, connectionsBC, simParamsBC, projectionBC] = await Promise.all([
        generateStimuli, generateReport, generateConnections, generateSimParams, generateProjection,
      ]);

      return merge({}, createBCTemplate(), stimulationBC, simParamsBC, reportBC, connectionsBC, projectionBC);
    },

    async generateFinalBlueConfigJSON() {
      const partialBlueConfig = await this.generatePartialBlueConfig();
      const bcStr = JSON.stringify(partialBlueConfig, null, 2);
      return bcStr;
    },

    async previewBlueConfig() {
      const finalBCStr = await this.generateFinalBlueConfigJSON();
      const finalBlueConfig = convertToBCFormat(finalBCStr);
      openContent(finalBlueConfig);
    },

    setIfSimulationIsLFP(blueConfigStr, unicoreConfig) {
      const lfpCheckAttributes = this.$store.state.fullConfig.generalSimParams.checksForLFP;
      if (!lfpCheckAttributes) return;

      const hasRequirements = lfpCheckAttributes.every(attr => (
        blueConfigStr.includes(attr)
      ));
      if (!hasRequirements) return;
      addTag(unicoreConfig, jobTags.SIMULATION);
      addTag(unicoreConfig, jobTags.LFP_SIMULATION);
      addTag(unicoreConfig, this.$store.state.fullConfig.circuitName);
    },

    async runSimulation(unicoreConfig) {
      const blueConfigStr = await this.generateFinalBlueConfigJSON();
      this.blueConfig = JSON.parse(blueConfigStr);

      // we have already checked the simulation consistancy
      this.isLaunchingSim = true;

      this.setIfSimulationIsLFP(blueConfigStr, unicoreConfig);

      const finalBlueConfig = convertToBCFormat(blueConfigStr);

      const getProjectionFilePromise = new Promise((resolve) => {
        eventBus.$emit('create-projection-file', resolve);
      });
      const projectionFile = await getProjectionFilePromise;
      const extraFiles = projectionFile ? [projectionFile] : null;

      this.$emit('launch-sim', finalBlueConfig, unicoreConfig, () => {
        // hideModalFn passed to Run will hide the modal when finish spinning
        this.showComputerParamsModal = false;
      }, extraFiles);
    },

    checkSimulationConsistancy(blueConfig, populationSelected) {
      // this will check if the model, stimulations and reports have coherence
      // only one stimulus and one report -> compare with Model
      const reportKeys = Object.keys(blueConfig.Report);
      const stimulusKeys = Object.keys(blueConfig.StimulusInject);
      const alert = this.$Message;
      const circuitConf = this.$store.state.fullConfig.circuitConfig;

      if (!reportKeys.length || !stimulusKeys.length) {
        alert.warning('Missing stimulus or report');
      }

      function checkModel() {
        if (populationSelected !== circuitConf.biggestTarget) {
          alert.warning({
            content: `This simulation may not run.
            Check if Population-Stimulation-Report intersection is not empty`,
            duration: 10,
          });
        }
      }

      function checkMultipleEquals(arraysOfArrays) {
        const reg = new RegExp('(.+)_(report|stimulusinject)_');
        const targets = [mapBlueConfigTerms(populationSelected)];
        // this will extract all the targets in stimulations and reports
        arraysOfArrays.forEach((type) => {
          type.forEach((item) => {
            const match = item.match(reg);
            if (match && match.length > 1) targets.push(match[1]);
          });
        });
        // check if there are some target different
        if (union(targets).length > 1) {
          checkModel();
        }
        return true;
      }

      return checkMultipleEquals([reportKeys, stimulusKeys]);
    },
  },
};
</script>


<style scoped>
.run-configuration-component {
  display: flex;
  justify-content: space-between;
}
.baseline-align {
  align-self: baseline;
}
</style>
