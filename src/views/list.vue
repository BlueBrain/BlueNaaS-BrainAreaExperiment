
<!--
This component will be the frame for view the simulations.
-->
<template>
  <div class="view-simulation app-content">
    <div class="list-header">
      <list-filters
        class="list-filters"
        @update-filters="updateFilters"
      />

      <div class="grow-space"/>

      <import-simulation
        class="margined-right"
      />

      <bulk-edit
        class="margined-right"
      />

      <i-button
        type="primary"
        icon="ios-arrow-back"
        @click="returnRun"
      >Launch Simulation</i-button>
    </div>

    <list-simulations
      :status-search="statusSearch"
      :name-filter="nameFilter"
      ref="listSimulationsRef"
    />
  </div>
</template>


<script>
import ListSimulations from '@/components/list-simulations/index.vue';
import ListFilters from '@/components/list-simulations/list-filters.vue';
import ImportSimulation from '@/components/list-simulations/import-simulation.vue';
import BulkEdit from '@/components/list-simulations/bulk-edit.vue';

export default {
  name: 'SimulationsList',
  props: ['computerParam'],
  components: {
    ListSimulations,
    ListFilters,
    ImportSimulation,
    BulkEdit,
  },
  data() {
    return {
      statusSearch: 'ALL',
      nameFilter: '',
    };
  },
  created() {
    this.$store.commit('setAppTitle', 'List of Simulations');
  },
  methods: {
    updateFilters(newName, newStatus) {
      this.statusSearch = newStatus;
      this.nameFilter = newName;
    },
    returnRun() {
      this.$router.push({ name: 'run' });
    },
  },
};
</script>


<style scoped>
  .list-filters {
    margin-bottom: 5px;
  }
  .list-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
  }
  .grow-space + .margined-right {
    margin-right: 5px;
  }
</style>
