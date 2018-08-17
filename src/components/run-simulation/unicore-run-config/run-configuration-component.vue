
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
    <i-button
      icon="md-play"
      type="success"
      @click="configureSimulation"
      class="baseline-align"
    >Continue</i-button>

    <!-- template for configuration -->
    <unicore-config-form
      :show-modal="showComputerParamsModal"
      :is-launching-sim="isLaunchingSim"
      @previewBlueConfig="previewBlueConfig"
      @closeModal="showComputerParamsModal = false"
      @runSimulation="runSimulation"
    />
    <!-- END template for configuration -->
  </div>
</template>


<script>
import union from 'lodash/union';
import merge from 'lodash/merge';

import eventBus from '@/services/event-bus';
import { createBCTemplate } from '@/assets/blueconfig-template';
import UnicoreConfigForm from '@/components/run-simulation/unicore-run-config/unicore-config-form.vue';
import db from '@/services/db';
import { convertToBCFormat, openContent, mapBlueConfigTerms } from '@/assets/utils';


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
  methods: {
    closeTip() {
      const tipElement = this.$el.querySelector('#tip');
      tipElement.classList.add('hidden');
      localStorage.setItem('hideTip', true);
    },

    async configureSimulation() {
      // make blueConfig to check if all the params are correct
      const partialBlueConfig = await this.generatePartialBlueConfig();
      const isConsistant = this.checkSimulationConsistancy(partialBlueConfig, this.$store.state.simulationModel);
      if (isConsistant) {
        this.showComputerParamsModal = true;
      }
    },

    async generatePartialBlueConfig() {
      // generate stimulus and report in BlueConfig.json format NO PATH
      console.debug('generatePartialBlueConfig');
      const generateStimuli = new Promise((resolve) => {
        eventBus.$emit('createStimulusConfig', resolve);
      });
      const generateReport = new Promise((resolve) => {
        eventBus.$emit('createReportConfig', resolve);
      });
      const generateSimParams = new Promise((resolve) => {
        eventBus.$emit('createSimParamsConfig', resolve);
      });
      const [stimulationBC, reportBC, simParamsBC] = await Promise.all([
        generateStimuli, generateReport, generateSimParams,
      ]);
      const extraParams = this.$store.state.currentCircuitConfig.extraParamsInBC || {};

      return merge({}, createBCTemplate(), stimulationBC, simParamsBC, reportBC, extraParams);
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

    async runSimulation(unicoreConfig) {
      const blueConfigStr = await this.generateFinalBlueConfigJSON();
      this.blueConfig = JSON.parse(blueConfigStr);

      console.log('finalBlueConfig', this.blueConfig);
      db.saveSimConfiguration(this.blueConfig, unicoreConfig);
      // we have already checked the simulation consistancy
      this.isLaunchingSim = true;

      const finalBlueConfig = convertToBCFormat(blueConfigStr);
      this.$emit('launchSim', finalBlueConfig, unicoreConfig, () => {
        // hideModalFn passed to Run will hide the modal when finish spinning
        this.showComputerParamsModal = false;
      });
    },

    checkSimulationConsistancy(blueConfig, modelSelected) {
      // this will check if the model, stimulations and reports have coherence
      // only one stimulus and one report -> compare with Model
      const reportKeys = Object.keys(blueConfig.Report);
      const stimulusKeys = Object.keys(blueConfig.StimulusInject);
      const alert = this.$Message;
      const circuitConf = this.$store.state.currentCircuitConfig;

      if (reportKeys.length === 0 || stimulusKeys.length === 0) {
        alert.error('Select at least one stimulus and one report');
        return false;
      }

      function checkModel() {
        if (modelSelected !== circuitConf.biggestTarget) {
          alert.error(`Incorrect Model. Select the model ${circuitConf.biggestTarget}`);
          return false;
        }
        return true;
      }

      function checkMultipleEquals(arraysOfArrays) {
        const reg = new RegExp('(.+)_(report|stimulusinject)_');
        const targets = [mapBlueConfigTerms(modelSelected)];

        // this will extract all the targets in stimulations and reports
        arraysOfArrays.forEach((type) => {
          type.forEach((item) => {
            const match = item.match(reg);
            if (match && match.length > 1) targets.push(match[1]);
          });
        });

        // check if there are some target different
        if (union(targets).length > 1) {
          return checkModel();
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