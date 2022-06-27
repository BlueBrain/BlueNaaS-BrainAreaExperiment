
<template>
  <div
    class="visualize-launcher in-corner"
    v-if="computerHasVisualization && hasReports"
  >
    <i-button
      class="in-corner"
      type="primary"
      icon="md-videocam"
      @click="openBraynsLauncher()"
    >Visualize</i-button>
  </div>
</template>


<script>
import visualizationConfig from '@/config/visualization-config';
import { getReportsRegexp } from '@/services/helper/blueconfig-helper';
import { getJobPhysicalLocation } from '@/services/unicore';

export default {
  name: 'VisualizeLauncher',
  props: ['simulationDetails'],
  created() {
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
    async openBraynsLauncher() {
      console.log('openBraynsLauncher');
      const braynsLauncherUrl = this.specificVizConfig.endpoint;
      const queryParams = new URLSearchParams();
      queryParams.append(visualizationConfig.authQuery, encodeURIComponent(this.$store.state.token));
      const computerPath = getJobPhysicalLocation(this.simulationDetails.log);
      queryParams.append(visualizationConfig.blueConfigQuery, computerPath);
      const url = `${braynsLauncherUrl}/?${queryParams.toString()}BlueConfig`;
      console.log('Brayns launcher URL:', url);
      window.open(url, '_blank');
    },
    loadPreviousConfig() {},
  },
};
</script>
