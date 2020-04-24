
<template>
  <div
    class="visualize-launcher in-corner"
    v-if="computerHasVisualization && hasReports"
  >
    <i-button
      v-if="!vizIsReady"
      class="in-corner"
      type="primary"
      icon="md-videocam"
      :loading="vizRunning"
      @click="submitVizJob()"
    >Visualize</i-button>
    <i-button
      v-else
      class="in-corner"
      type="success"
      icon="md-open"
      @click="openVisualization()"
    >Open Visualization</i-button>
  </div>
</template>


<script>
import { submitVisualization } from '@/services/helper/visualization-helper';
import visualizationConfig from '@/config/visualization-config';
import { getReportsRegexp } from '@/services/helper/blueconfig-helper';
import eventBus from '@/services/event-bus';

export default {
  name: 'VisualizeLauncher',
  props: ['simulationDetails'],
  data() {
    return {
      vizRunning: false,
      vizIsReady: false,
      vizUrl: null,
    };
  },
  created() {
    eventBus.$on('viz-ready', (vizResponseObj) => {
      this.vizRunning = false;
      this.vizIsReady = true;
      this.vizUrl = vizResponseObj.vizUrl;
    });
    this.loadPreviousConfig();
  },
  computed: {
    computerHasVisualization() {
      return !!this.specificVizConfig;
    },
    hasReports() {
      if (!this.simulationDetails || !this.simulationDetails.children) return false;
      const reportRegex = getReportsRegexp();
      return this.simulationDetails.children.some(file => reportRegex.test(file));
    },
    specificVizConfig() {
      // use only for MOOC circuit
      return visualizationConfig[
        this.$store.state.fullConfig.computer + this.$store.state.fullConfig.circuitName
      ];
    },
  },
  methods: {
    async submitVizJob() {
      this.vizRunning = true;

      this.$Message.loading('Visualization is starting. This could take a couple of minutes ...');

      await submitVisualization(this.simulationDetails, this.port)
        .catch(error => this.$Message.error(`Submit Visualization - ${error.message}`));

      // it will come back using the ON 'viz-ready' event after Unicore finishes creating the job
    },
    openVisualization() {
      window.open(this.vizUrl, '_blank');
    },
    loadPreviousConfig() {},
  },
};
</script>
