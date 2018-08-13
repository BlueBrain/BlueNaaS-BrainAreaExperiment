<template>
  <div class="analysis-section">
    <collapse-title
      :collapsed="false"
      title="Analysis"
      @expanded="getAnalysisInfo()">
      <div slot="element">
        {{ getAnalysisOverallStatus }}
        <div
          v-for="analysis in analysisDetails"
          :key="analysis.jobURL"
          class="block">
          <item-summary :item-details="analysis">
            <a
              class="delete"
              title="Delete"
              @click="deleteJob(analysis.jobURL)"
            >
              <i class="material-icons">delete_forever</i>
              Remove
            </a>
          </item-summary>
          <i
            v-if="isRunning(analysis.status)"
            class="material-icons spin margined">autorenew
          </i>
          <analysis-item
            :item-details="analysis"
            @analysisLogRequest="getAnalysisLog"/>
        </div>
      </div>
    </collapse-title>
  </div>
</template>

<script>
import collapseTitle from 'components/shared/collapse-title.vue';
import itemSummary from 'components/view-simulations/simulation-details/item-summary.vue';
import analysisItem from 'components/view-simulations/simulation-details/analysis-item.vue';
import analysisConfig from 'assets/analysis-config.json';
import {isRunning, jobStatus} from 'assets/job-status.js';
import * as unicoreAPI from 'mixins/unicore.js';
import {setFileContent} from 'mixins/simulation-details.js';

export default {
  name: 'AnalysisSection',
  components: {
    'collapse-title': collapseTitle,
    'item-summary': itemSummary,
    'analysis-item': analysisItem,
  },
  props: ['simulationDetails', 'simulationUserProject'],
  data: function() {
    return {
      analysisDetails: [],
      pollInterval: 3 * 1000,
      overallLoading: true,
      isRunning,
    };
  },
  computed: {
    getAnalysisOverallStatus: function() {
      if (isRunning(this.simulationDetails.status)) {
        return 'Simulation not finished yet';
      }
      if (this.analysisDetails.length === 0 &&
          this.overallLoading) {
        return 'Loading ...';
      }
      if (this.analysisDetails.length === 0 &&
          !this.overallLoading) {
        return 'No analysis run';
      }
    },
  },
  mounted() {
    this.getAnalysisInfo();
  },
  methods: {
    getAnalysisInfo: function() {
      this.overallLoading = true;
      /*  get the location of the analysis based on the mapping file
        that we save in the simulation and then the analysis image */
      if (this.simulationDetails.status === jobStatus.successful) {
        this.analysisDetails = []; // reset all the analysis
        unicoreAPI.getAssociatedLocation(
          this.simulationDetails.workingDirectory,
          this.simulationUserProject
        ).then((analysisObject) => {
          // an array of all the analysis associated with simulation
          if (analysisObject === '') { // no analysis
            this.overallLoading = false;
            return;
          }
          analysisObject.forEach((analysis) => {
            let childAnalysis = Object.assign({}, this.analysisDetailTemplate);
            childAnalysis.jobURL = analysis._links.self.href;
            childAnalysis.workingDirectory = analysis._links.workingDirectory.href;
            childAnalysis.id = childAnalysis.jobURL.split('/').pop();
            childAnalysis.type = 'Analysis';
            childAnalysis.submissionTime = analysis.submissionTime;
            childAnalysis.statusIcon = analysis.status;
            childAnalysis.isLoading = true;
            this.refreshAnalysis(analysisConfig, childAnalysis);
            this.analysisDetails.push(childAnalysis);
          });
          this.overallLoading = false;
        });
      }
    },
    refreshAnalysis: function(analysisConfig, childAnalysis) {
      this.getAnalysisStatus(childAnalysis.jobURL, childAnalysis)
      .then(() => {
        if (isRunning(childAnalysis.status)) {
          setTimeout(() => {
            this.refreshAnalysis(analysisConfig, childAnalysis);
          }, this.pollInterval);
          return;
        }
        analysisConfig.plots.forEach((plot) => {
          this.getAnalysisImage(
            childAnalysis.workingDirectory,
            plot,
            childAnalysis
          );
        });
      });
    },
    getAnalysisImage: function(analysisURL, plotName, childAnalysis) {
      unicoreAPI.getImage(`${analysisURL}/files/${plotName}.png`)
      .then((plot) => {
        // is a blob content
        setFileContent(childAnalysis, plotName, plot, true);
      }, (error) => {
        console.debug('No analysis image available yet');
      }).then(() => {
        console.debug('Stop loading...');
        childAnalysis.isLoading = false;
      });
    },
    getAnalysisStatus: function(analysisURL, childAnalysis) {
      return unicoreAPI.getJobProperties(analysisURL)
      .then((jobInfo) => {
        childAnalysis.status = jobInfo.status;
        childAnalysis.submissionTime = jobInfo.submissionTime;
        childAnalysis.name = jobInfo.name;
      });
    },
    getAnalysisLog: function(childAnalysis) {
      let url = `${childAnalysis.workingDirectory}/files/stderr`;
      console.debug('Get analysis log');
      unicoreAPI.getFiles(url)
      .then((stderr) => {
        setFileContent(childAnalysis, 'log', stderr);
      })
      .catch((noFile) => {
        let log = [];
        if (childAnalysis.status === jobStatus.queued) {
          log.push('No log available yet');
          log.push('Analysis ' + jobStatus.queued);
        } else {
          log.push('No log available');
          log.push('Job failed before script was executed');
        }
        this.$set(childAnalysis, 'log', log);
      });
    },
    removeFromList: function(analysisId) {
      return unicoreAPI.deleteJobFromAssociatedFile(
        this.simulationDetails.workingDirectory,
        analysisId
      )
      .then(() => {
        let listTemp = this.analysisDetails.filter((analysis) => {
          return analysis.id !== analysisId;
        });
        this.analysisDetails = listTemp;
      });
    },
    deleteJob: function(url) {
      unicoreAPI.deleteJobByUrl(url).then((localRemove) => {
        if (localRemove) {
          let id = url.split('/').pop();
          return this.removeFromList(id);
        }
      });
    },
  },
};
</script>

<style scoped>
  .block .delete {
    min-width: 90px;
    color: #b0686f;
    cursor: pointer;
  }
  .margined {
    margin-left: 15px;
  }
</style>
