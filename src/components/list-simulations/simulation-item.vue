
<!--
This will only display the item. It knows where to put all the information.
-->
<template>
  <div class="simulation-item" :class="{ 'all-done': allDone }">

    <div
      class="bulk-section"
      v-if="bulkEditActivated"
    >
      <checkbox
        v-if="simulationSuccessful"
        @on-change="bulkSelectionChanged"
      />
    </div>

    <div class="name">{{ job.name }}</div>

    <div class="status simulation">
      <icon
        :title="getStatusString(job.status)"
        :type="getStatusIcon(job.status)"
        :size="iconSize"
      />
    </div>

    <div class="status analysis">
      <icon
        v-if="job.analysisStatus"
        :title="getAnalysisTooltip(job.analysisStatus)"
        :type="getStatusIcon(job.analysisStatus)"
        :size="iconSize"
      />

      <i v-else>
        <icon
          v-if="listIsLoading"
          type="md-sync"
          :size="iconSize"
        />
      </i>
    </div>

    <div class="middle-part date">{{ submissionDate }}</div>

    <div class="right-part actions">
      <i-button
        type="primary"
        icon="ios-search"
        @click="$emit('show-details', jobUrl)"
        ghost
      >View</i-button>

      <i-button
        :disabled="!analysisCanRun"
        type="success"
        icon="md-play"
        @click="$emit('run-analysis', jobUrl)"
        ghost
      >Analyze</i-button>

      <i-button
        type="error"
        class="delete"
        icon="md-trash"
        @click="$emit('delete-job', jobUrl)"
        ghost
      >Delete</i-button>
    </div>

  </div>
</template>


<script>
import { jobStatus, getStatusIcon, isRunning } from '@/common/job-status';

export default {
  name: 'SimulationItem',
  props: ['job'],
  data() {
    return {
      iconSize: 20,
      getStatusIcon,
    };
  },
  computed: {
    submissionDate() {
      const date = new Date(this.job.submissionTime);
      return date.toLocaleString();
    },
    analysisCanRun() {
      // show the analysis button
      return this.job.status !== jobStatus.FAILED &&
        this.job.status !== jobStatus.RUNNING &&
        this.job.status !== jobStatus.QUEUED &&
        this.job.analysisStatus !== jobStatus.BLOCK &&
        this.job.analysisStatus !== jobStatus.LOADING;
    },
    jobUrl() {
      return this.job._links.self.href;
    },
    allDone() {
      return (
        this.job.status === jobStatus.SUCCESSFUL &&
        this.job.analysisStatus === jobStatus.SUCCESSFUL
      );
    },
    listIsLoading() {
      return this.$store.state.list.analysisAreLoading;
    },
    bulkEditActivated() {
      return this.$store.state.list.bulkEditActivated;
    },
    simulationSuccessful() {
      return this.job.status === jobStatus.SUCCESSFUL;
    },
  },
  methods: {
    getStatusString(status) {
      if (!status || status === jobStatus.BLOCK) {
        return 'Waiting for simulation ends';
      }
      return status;
    },

    getAnalysisTooltip(analysisStatus) {
      if (this.job.status === jobStatus.FAILED) {
        return 'Simulation failed. No analysis can be run';
      }
      if (isRunning(this.job.status)) {
        return 'Waiting for the simulation to finish';
      }
      return analysisStatus;
    },
    bulkSelectionChanged(willAnalyse) {
      if (willAnalyse) {
        this.$store.commit('addSimulationToBulkAnalyse', this.job.id);
      } else {
        this.$store.commit('removeSimulationToBulkAnalyse', this.job.id);
      }
    },
  },
};
</script>


<style scoped lang="scss">
  .simulation-item {
    display: flex;
    align-items: center;

    &.all-done {
      background-color: #19b76708;
    }

    .bulk-section {
      width: 10px;
      margin: 0 4px;
      &+ .name {
        width: 34%;
      }
    }

    div {
      text-align: center;

      &.name {
        width: 35%;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-left: 10px;
      }
      &.status {
        width: 10%;
      }
      &.date {
        width: 20%;
      }
      &.actions {
        width: 25%;
        button {
          margin-right: 10px;
        }
      }
    }
  }
</style>
