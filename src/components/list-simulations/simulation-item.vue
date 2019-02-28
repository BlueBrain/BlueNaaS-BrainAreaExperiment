
<!--
This will only display the item. It knows where to put all the information.
-->
<template>
  <div class="simulation-item" :class="{ 'all-done': allDone }">
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
        :title="getAnalysisStatus(job.analysisStatus)"
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
        @click="$emit('showDetails', jobUrl)"
        ghost
      >View</i-button>

      <i-button
        :disabled="!analysisCanRun"
        type="success"
        icon="md-play"
        @click="$emit('runAnalysis', jobUrl)"
        ghost
      >Analyze</i-button>

      <i-button
        type="error"
        class="delete"
        icon="md-trash"
        @click="$emit('deleteJob', jobUrl)"
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
      if (
        this.job.status === jobStatus.failed ||
        this.job.status === jobStatus.running ||
        this.job.status === jobStatus.queued ||
        this.job.analysisStatus === jobStatus.block ||
        this.job.analysisStatus === jobStatus.loading
      ) {
        return false;
      }
      return true;
    },
    jobUrl() {
      return this.job._links.self.href;
    },
    allDone() {
      return (
        this.job.status === jobStatus.successful &&
        this.job.analysisStatus === jobStatus.successful
      );
    },
    listIsLoading() {
      return this.$store.state.analysisListIsLoading;
    },
  },
  methods: {
    getStatusString(status) {
      if (!status || status === jobStatus.block) {
        return 'Waiting for simulation ends';
      }
      return status;
    },

    getAnalysisStatus(analysisStatus) {
      if (this.job.status === jobStatus.failed) {
        return 'Simulation failed. No analysis can be run';
      }
      if (isRunning(this.job.status)) {
        return 'Waiting for the simulation to finish';
      }
      return analysisStatus;
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
