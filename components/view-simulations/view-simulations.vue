<!--
This component will be the frame for view the simulations.
-->
<template>
    <div class="view-simulation">
        <list-simulations
            :computerParam="computerParam"
            :statusSearch="statusSearch">
        </list-simulations>
    </div>
</template>

<script>
import ListSimulations from 'components/view-simulations/list-simulations.vue';
export default {
  'name': 'view_simulation',
  'props': ['computerParam', 'statusSearch'],
  'components': {
    'list-simulations': ListSimulations,
  },
  'created': function() {
    if (!this.computerParam) {
      this.computerParam = 'JUQUEEN';
    }
    document.getElementById('frameTemplateTitle').innerText = 'View Simulations';
  },
};
</script>