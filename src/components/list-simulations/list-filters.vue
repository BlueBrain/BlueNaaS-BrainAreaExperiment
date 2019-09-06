
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
import isEqual from 'lodash/isEqual';
import { statesFilter, getStatusIcon } from '@/common/job-status';
import eventBus from '@/services/event-bus';

export default {
  name: 'ListFilters',
  data() {
    return {
      nameFilter: '',
      statusFilter: 'ALL',
      iconSize: 18,
      statesFilter,
      getStatusIcon,
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
      return this.$store.state.list.isLoading;
    },
    selectedGroup: {
      get() {
        return this.$store.state.userGroup;
      },
      set(newGroup) {
        if (!newGroup) return;
        this.startLoadingList();
        eventBus.$emit('change-user-group', newGroup, () => eventBus.$emit('reload-jobs-list'));
      },
    },
    selectedComputer: {
      get() {
        return this.$store.state.currentComputer;
      },
      set(newComputer) {
        if (this.$store.state.currentComputer === newComputer) return;

        this.startLoadingList();
        eventBus.$emit('change-computer', newComputer, () => {
          this.$router.replace({
            name: 'view',
            params: { computerParam: newComputer },
          }, () => eventBus.$emit('reload-jobs-list'));
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
    eventBus.$emit('setup-from-storage');
  },
  methods: {
    resetFilter() {
      this.nameFilter = '';
      this.statusFilter = 'ALL';
    },
    applyFilters() {
      this.$emit('update-filters', this.nameFilter, this.statusFilter);
      this.$nextTick(() => {
        eventBus.$emit('apply-filters');
      });
    },
    startLoadingList() {
      this.$store.commit('cancelLoadingList');
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
