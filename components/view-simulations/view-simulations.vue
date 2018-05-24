<!--
This component will be the frame for view the simulations.
-->
<template>
  <div class="view-simulation">
    <list-simulations
      :computer-param="computerParam"
      :status-search="statusSearch"/>
  </div>
</template>

<script>
import ListSimulations from 'components/view-simulations/list-simulations.vue';
import simulationConfig from 'assets/simulation-config.json';
export default {
  name: 'ViewSimulation',
  components: {
    'list-simulations': ListSimulations,
  },
  props: ['computerParam', 'statusSearch'],
  created: function() {
    if (!this.computerParam) {
      this.computerParam = simulationConfig.default;
    }
    document.getElementById('frameTemplateTitle').innerText = 'View Simulations';
  },
};
</script>
