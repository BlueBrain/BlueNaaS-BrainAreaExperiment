
<template>
  <div class="list-filter">

    <i-button
      type="primary"
      :ghost="!filterOn"
      icon="ios-funnel"
      size="small"
      @click="resetFilter"
    >Filter</i-button>

    <icon
      type="md-finger-print"
      :size="iconSize"
      class="icon-spaced"
    />
    <i-input size="small" v-model="nameFilter" />

    <icon
      :type="getStatusIcon(statusFilter)"
      :size="iconSize"
      class="icon-spaced"
    />

    <i-select size="small" v-model="statusFilter">
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
    <i-select
      size="small"
      v-model="selectedComputer"
    >
      <i-option
        v-for="computer in simulationConfig.available"
        :value="computer"
        :key="computer"
      >{{ computer }}</i-option>
    </i-select>

    <icon
      type="md-person"
      :size="iconSize"
      class="icon-spaced"
    />
    <i-select
      :disabled="!hasMultipleProjects"
      size="small"
      v-model="selectedGroup"
    >
      <i-option
        v-for="project in selectedGroupsAvailable"
        :value="project"
        :key="project"
      >{{ project }}</i-option>
    </i-select>

  </div>
</template>


<script>
import { statesFilter, getStatusIcon } from '@/assets/job-status';
import simulationConfig from '@/assets/simulation-config';
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
    selectedGroup: {
      get() {
        return this.$store.state.userGroup;
      },
      set(newGroup) {
        if (!newGroup) return;
        eventBus.$emit('changeUserGroup', newGroup, this.reloadList);
        this.startLoadingList();
      },
    },
    selectedComputer: {
      get() { return this.$store.state.currentComputer; },
      set(newComputer) {
        if (this.$store.state.currentComputer === newComputer) return;

        this.startLoadingList();
        eventBus.$emit('changeComputer', newComputer, () => {
          this.reloadList();
          this.$router.replace({
            name: 'view',
            params: { computerParam: newComputer },
          });
        });
      },
    },
    hasMultipleProjects() {
      return !isEqual(this.selectedGroupsAvailable, ['*']);
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
      this.$emit('updateFilters', this.nameFilter, this.statusFilter);
      this.$nextTick(() => {
        eventBus.$emit('applyFilters');
      });
    },
    reloadList() {
      if (
        this.$store.state.currentComputer !== this.$route.params.computerParam &&
        this.$store.state.listIsLoading
      ) {
        // force reload to avoid waiting for previous async calls
        this.$router.go();
      } else {
        // search for projects
        eventBus.$emit('reloadJobsList');
      }
    },
    startLoadingList() {
      eventBus.$emit('cleanList');
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

