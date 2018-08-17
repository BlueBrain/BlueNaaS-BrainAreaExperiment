
<template>
  <div class="filter">
    <span>
      <a
        :class="{'filter-on': filterOn}"
        :title="filterStatus"
        class="button-with-icon filter-icon"
        @click="$emit('resetFilter')"
      >
        <i class="material-icons">filter_list</i>
        Filter
      </a>
    </span>
    <span>
      <a
        class="button-with-icon"
        title="Filter by Name or ID"
      >
        <i class="material-icons">fingerprint</i>
      </a>
    </span>
    <input
      v-model="nameFilter"
      class="input-style"
      type="text"
    >
    <span>
      <a class="button-with-icon" title="Status">
        <i class="material-icons">check_circle</i>
      </a>
    </span>
    <select
      v-model="statusFilter"
      class="input-style"
    >
      <option
        v-for="state in statesFilter"
        :key="state"
        :value="state"
      >{{ state }}</option>
    </select>
    <span>
      <a
        class="button-with-icon"
        title="Supercomputer to be used"
      >
        <i class="material-icons">dns</i>
      </a>
    </span>
    <select
      v-model="computerFilter"
      class="input-style"
    >
      <option
        v-for="computer in computersAvailable"
        :key="computer"
        :value="computer"
      >{{ computer }}</option>
    </select>
    <span class="space-flex"/>
    <span
      class="refresh"
      @click="$emit('refreshJobs')">
      <a class="button-with-icon">
        <i class="material-icons">refresh</i>
        Reload
      </a>
    </span>
    <router-link
      to="/"
      class="create-simulation-button"
    >
      <a class="button-with-icon colored">
        <i class="material-icons">add</i>
        Create Simulation
      </a>
    </router-link>
  </div>
</template>


<script>
export default {
  name: 'list-header',
  props: ['filterOn', 'nameFilter', 'statusFilter', 'statesFilter', 'computerFilter', 'computersAvailable'],
};
</script>
