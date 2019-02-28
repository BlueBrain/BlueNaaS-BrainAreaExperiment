
<template>
  <div class="list-filter">

    <i-button
      type="primary"
      :ghost="!filterOn"
      icon="ios-funnel"
      @click="resetFilter"
    >Filter</i-button>

    <icon
      type="md-finger-print"
      :size="iconSize"
      class="icon-spaced"
    />
    <i-input v-model="nameFilter" />

    <icon
      :type="getStatusIcon(statusFilter)"
      :size="iconSize"
      class="icon-spaced"
    />

    <i-select v-model="statusFilter">
      <i-option
        v-for="state in statesFilter"
        :value="state"
        :key="state"
      >
        <icon
          :type="getStatusIcon(state)"
          :size="iconSize"
        />
        {{ state }}
      </i-option>
    </i-select>

    <icon
      type="md-cloud"
      :size="iconSize"
      class="icon-spaced"
    />
    <i-select v-model="selectedComputer">
      <i-option
        v-for="computer in computersAvailable"
        :value="computer"
        :key="computer"
        :disabled="listIsLoading"
      >{{ computer }}</i-option>
    </i-select>

    <icon
      type="md-person"
      :size="iconSize"
      class="icon-spaced"
    />
    <i-select
      :disabled="!hasMultipleProjects"
      v-model="selectedGroup"
    >
      <i-option
        v-for="project in selectedGroupsAvailable"
        :value="project"
        :key="project"
        :disabled="listIsLoading"
      >{{ project }}</i-option>
    </i-select>

  </div>
</template>


<script>
import { statesFilter, getStatusIcon } from '@/common/job-status';
import simulationConfig from '@/config/simulation-config';
import eventBus from '@/services/event-bus';
import isEqual from 'lodash/isEqual';

export default {
  name: 'ListFilters',
  data() {
    return {
      nameFilter: '',
      statusFilter: 'ALL',
      iconSize: 18,
      statesFilter,
      getStatusIcon,
      simulationConfig,
    };
  },
  computed: {
    filterOn() {
      return this.nameFilter || this.statusFilter !== 'ALL';
    },
    selectedGroupsAvailable() {
      return this.$store.state.userGroupsAvailable;
    },
    listIsLoading() {
      return this.$store.state.listIsLoading;
    },
    selectedGroup: {
      get() {
        return this.$store.state.userGroup;
      },
      set(newGroup) {
        if (!newGroup) return;
        this.startLoadingList();
        eventBus.$emit('changeUserGroup', newGroup, () => eventBus.$emit('reloadJobsList'));
      },
    },
    selectedComputer: {
      get() {
        return this.$store.state.currentComputer;
      },
      set(newComputer) {
        if (this.$store.state.currentComputer === newComputer) return;

        this.startLoadingList();
        eventBus.$emit('changeComputer', newComputer, () => {
          this.$router.replace({
            name: 'view',
            params: { computerParam: newComputer },
          }, () => eventBus.$emit('reloadJobsList'));
        });
      },
    },
    hasMultipleProjects() {
      return !isEqual(this.selectedGroupsAvailable, ['*']);
    },
    computersAvailable() {
      return this.$store.state.computersAvailable;
    },
  },
  mounted() {
    eventBus.$emit('setupFromStorage');
  },
  methods: {
    resetFilter() {
      this.nameFilter = '';
      this.statusFilter = 'ALL';
    },
    applyFilters() {
      this.$emit('update-filters', this.nameFilter, this.statusFilter);
      this.$nextTick(() => {
        eventBus.$emit('applyFilters');
      });
    },
    startLoadingList() {
      this.$store.commit('setListIsLoading', true);
      this.$store.dispatch('showLoader');
    },
  },
  watch: {
    statusFilter() {
      this.applyFilters();
    },
    nameFilter() {
      this.applyFilters();
    },
  },
};
</script>


<style scoped lang="scss">
  .list-filter {
    display: inline-flex;
    align-items: center;

    div {
      margin-right: 15px;
      min-width: 120px;
    }

    .icon-spaced {
      margin: 0 5px;
    }
  }
</style>

