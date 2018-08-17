
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
    <i-select size="small" v-model="computerFilter">
        <i-option
          v-for="computer in simulationConfig.available"
          :value="computer"
          :key="computer"
        >{{ computer }}</i-option>
    </i-select>

    <icon
      v-if="projectsAvailable.length"
      type="md-person"
      :size="iconSize"
      class="icon-spaced"
    />
    <i-select
      v-if="projectsAvailable.length"
      size="small"
      v-model="userProjects"
    >
      <i-option
        v-for="project in projectsAvailable"
        :value="project"
        :key="project"
      >{{ project }}</i-option>
    </i-select>

  </div>
</template>


<script>
import { statesFilter, getStatusIcon } from '@/assets/job-status';
import simulationConfig from '@/assets/simulation-config';
import { getUserProjects } from '@/services/unicore';
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
      simulationConfig,
    };
  },
  computed: {
    filterOn() {
      return this.nameFilter || this.statusFilter !== 'ALL';
    },
    projectsAvailable() {
      return this.$store.state.userProjectsAvailable;
    },
    userProjects: {
      get() {
        return this.$store.state.userProject;
      },
      set(newVal = null) {
        // avoid reloading jobs twice when change computer
        this.$store.commit('setUserProject', newVal);
        this.reloadList();
      },
    },
    computerFilter: {
      get() {
        return this.$route.params.computerParam;
      },
      set(newVal) {
        this.$store.commit('setCurrentComputer', newVal);
        // this will call change userProject (computed) and it will take care of reloading
        if (!this.$store.state.userProject) {
          // if it does not have any project the reload on the change project is not triggered
          this.reloadList();
        }
        this.$store.commit('setUserProject', null);

        this.$router.replace({
          name: 'view',
          params: {
            computerParam: newVal,
          },
        });
      },
    },
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
      if (this.$store.state.isLoading) {
        // force reload to avoid waiting for previous async calls
        this.$router.go();
      } else {
        // search for projects
        this.$store.dispatch('showLoader');
        getUserProjects()
          .then(() => {
            eventBus.$emit('reloadJobsList');
          })
          .catch((e) => {
            this.$Message.error(`Error ${e.message}`);
            console.error(e.message);
          });
      }
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

