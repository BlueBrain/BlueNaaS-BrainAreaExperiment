
<template>
  <div
    class="visualize-launcher in-corner"
    v-if="computerHasVisualization && hasReports && hasCollab"
  >
    <i-button
      v-if="!vizIsReady"
      class="in-corner"
      type="primary"
      icon="md-videocam"
      :loading="vizRunning"
      @click="createVisualizationVM()"
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
import eventBus from '@/services/event-bus';
import db from '@/services/db';

export default {
  name: 'VisualizeLauncher',
  props: ['simulationDetails'],
  data() {
    return {
      vizRunning: false,
      vizIsReady: false,
      ip: null,
    };
  },
  created() {
    eventBus.$on('viz-ready', (ip) => {
      this.vizRunning = false;
      this.vizIsReady = true;
      this.ip = ip;
      this.$Message.info({ content: `Visualization running on ${ip}` });
    });
    this.loadPreviousConfig();
  },
  computed: {
    computerHasVisualization() {
      return !!visualizationConfig[this.$store.state.currentComputer];
    },
    hasReports() {
      if (!this.simulationDetails || !this.simulationDetails.children) return false;
      return this.simulationDetails.children.some(file => file.match('.bbp'));
    },
    hasCollab() {
      return !!this.$store.state.collabIdForViz;
    },
  },
  methods: {
    createVisualizationVM() {
      if (!this.$store.state.collabIdForViz) {
        this.$Message.error('No Collab in query parameters. Initiate this app from BSP Collab.');
        return;
      }
      this.$Message.loading('Visualization is starting. This could take up to 10 minutes ...');
      this.vizRunning = true;
      submitVisualization(this.simulationDetails)
        .catch(error => this.$Message.error(error.message));
    },
    openVisualization() {
      window.open(`http://${this.ip}/?host=${this.ip}:8200`, '_blank');
    },
    async loadPreviousConfig() {
      const collabId = await db.getCollabIdForViz();
      this.$store.commit('setCollabIdForViz', collabId);
    },
  },
};
</script>
