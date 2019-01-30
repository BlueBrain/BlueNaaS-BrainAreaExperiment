
<template>
  <div
    class="visualize-launcher in-corner"
    v-if="computerHasVisualization"
  >
    <i-button
      v-if="!vizIsReady"
      class="in-corner"
      size="small"
      type="primary"
      icon="md-videocam"
      :loading="vizRunning"
      @click="createVisualizationVM()"
    >Visualize</i-button>
    <i-button
      v-else
      class="in-corner"
      size="small"
      type="success"
      icon="md-open"
      @click="openVisualization()"
    >Open Visualization</i-button>
  </div>
</template>


<script>
import { submitVisualization } from '@/services/helper/visualization-helper';
import visualizationConfig from '@/assets/visualization-config';
import eventBus from '@/services/event-bus';

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
    eventBus.$on('vizReady', (ip) => {
      this.vizRunning = false;
      this.vizIsReady = true;
      this.ip = ip;
      this.$Message.info({ content: `Visualization running on ${ip}` });
    });
  },
  computed: {
    computerHasVisualization() {
      return !!visualizationConfig[this.$store.state.currentComputer];
    },
  },
  methods: {
    createVisualizationVM() {
      this.$Message.loading({
        content: 'Visualization is starting. This could take up to 10 minutes ...',
        duration: 5,
      });
      this.vizRunning = true;
      submitVisualization(this.simulationDetails);
    },
    openVisualization() {
      window.open(`http://${this.ip}/?host=${this.ip}:8200`, '_blank');
    },
  },
};
</script>
