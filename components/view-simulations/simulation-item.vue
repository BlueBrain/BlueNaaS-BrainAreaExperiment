<!--
This will only display the item. It knows where to put all the information.
-->
<template>
  <div
    class="simulation-item"
    @click="itemSelected">
    <div class="left-part clickable">
      <div class="id clickable">
        {{ job.name }}
      </div>
      <div class="details-button clickable">
        <a
          class="button-with-icon clickable"
          title="See Simulation details">
          <i class="material-icons clickable">zoom_in</i>Details
        </a>
      </div>
    </div>
    <!-- simulation status icon -->
    <div class="middle-part clickable simulation">
      <i
        v-if="job.noOut"
        class="material-icons colored"
        title="No results produced"
      >
        warning
      </i>
      <i
        v-else
        :title="getStatusString(job.status)"
        class="material-icons colored">
        {{ getStatusIcon(job.status) }}</i>
    </div>
    <!-- analysis status icon -->
    <div class="middle-part clickable analysis">
      <i v-if="showAnalysisStatus()">
        <i
          v-for="analysisStatus in job.multipleAnalysisStatus"
          :key="analysisStatus"
          :title="getAnalysisStatus(analysisStatus)"
          class="material-icons colored"
        >
          {{ getStatusIcon(analysisStatus) }}
        </i>
      </i>
      <a
        v-else
        class="button-with-icon analysis"
        title="Start analysis"
        @click="runAnalysis"
      >
        <i class="material-icons">play_arrow</i>
        Start
      </a>
    </div>
    <!-- END analysis status icon -->
    <div class="right-part clickable">
      <div class="column clickable">
        <div class="date">{{ getDate }}</div>
        <div class="inline-flex">
          <a
            v-if="analysisCanRun"
            class="button-with-icon analysis available"
            title="Start analysis"
            @click="runAnalysis">
            <i class="material-icons">play_arrow</i>Analysis
          </a>
          <a
            class="button-with-icon danger"
            title="Delete job forever"
            @click="deleteJob">
            <i class="material-icons">delete_forever</i>Delete
          </a>
          <a
            class="button-with-icon"
            title="Cancel Job"
            @click="abortJob">
            <i class="material-icons">cancel</i>Abort
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getDateLocalTime} from 'assets/utils.js';
import {jobStatus, getStatusIcon} from 'assets/job-status.js';

export default {
  name: 'SimulationItem',
  props: ['job'],
  data() {
    return {
      getStatusIcon,
    };
  },
  computed: {
    getId: function() {
      let url = this.job._links.self.href;
      if (this.job._links && url) {
        return url.substr(url.lastIndexOf('/') + 1);
      }
    },
    getDate: function() {
      return getDateLocalTime(this.job.submissionTime);
    },
    analysisCanRun: function() {
      // show the analysis button on the right
      if (!this.job.multipleAnalysisStatus) {
        return false;
      }
      if (this.job.multipleAnalysisStatus.includes(jobStatus.block) ||
                this.job.multipleAnalysisStatus.length === 0) {
        return false;
      }
      if (this.job.multipleAnalysisStatus.length === 1 &&
                this.job.multipleAnalysisStatus.includes(jobStatus.loading)) {
        return false;
      }
      return true;
    },
  },
  watch: {
    'job.multipleAnalysisStatus': function(newVal) {
      this.showAnalysisStatus();
    },
  },
  methods: {
    runAnalysis: function() {
      this.$emit('runAnalysis');
    },
    abortJob: function() {
      let actionURL = this.job._links.self.href + '/actions/abort';
      this.$emit('actionJob', {url: actionURL, text: 'Job Aborted'});
    },
    deleteJob: function() {
      let url = this.job._links.self.href;
      this.$emit('deleteJob', url);
    },
    itemSelected: function(event) {
      // check if the id for example is not selected so we can copy it.
      if (event.target.classList.contains('clickable') &&
          window.getSelection().toString() === '') {
        this.$emit('showDetails', this.job);
      }
    },
    getStatusString: function(status) {
      if (!status || status === jobStatus.block) {
        return 'Waiting for simulation ends';
      }
      return status;
    },
    showAnalysisStatus: function() {
      // show analysis button in the middle
      if (this.job.multipleAnalysisStatus &&
          this.job.multipleAnalysisStatus.length > 0) {
        return true;
      }
      return false;
    },
    getAnalysisStatus: function(analysisStatus) {
      if (this.job.status === jobStatus.failed) {
        return 'Simulation failed. No analysis can be run';
      }
      if (this.job.noOut) {
        return 'Simulation did not produce results. No analysis can be run';
      }
      if (this.job.status === jobStatus.running ||
          this.job.status === jobStatus.queued) {
        return 'Waiting for the simulation to finish';
      }
      return analysisStatus;
    },
  },
};
</script>

<style scoped>
  .simulation-item {
    display: flex;
    border-radius: 5px;
    justify-content: space-between;
    padding: 5px;
    margin: 5px;
    background-color: rgba(216, 223, 239, 0.38);
  }
  .left-part {
    width: 40%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .middle-part {
    width: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .middle-part.simulation {
    border-left: solid lightgray;
    border-right: solid lightgray;
  }
  .middle-part.analysis {
    border-right: solid lightgray;
  }
  .right-part {
    width: 40%;
    display: flex;
    align-items: flex-end;
    flex-direction: column;
  }
  .right-part .inline-flex {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  a.button-with-icon {
    color: #fff;
    background-color: #879fcb;
    letter-spacing: .5px;
    cursor: pointer;
    padding: 5px 10px;
    margin: 5px 5px;
    border-radius: 3px;
    display: flex;
    align-items: center;
  }
  a.button-with-icon.danger {
    background-color: rgb(172, 96, 103);
  }
  a.button-with-icon.analysis {
    background-color: #548d68;
  }
  .material-icons.colored {
    color: rgb(172, 96, 103);
  }
  .material-icons.colored[title='SUCCESSFUL'] {
    color: green;
  }
  .date {
    text-align: right;
    padding-right: 5px;
  }
</style>
