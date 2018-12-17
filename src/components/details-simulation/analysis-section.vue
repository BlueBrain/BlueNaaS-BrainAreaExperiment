
<template>
  <div class="analysis-section">
    <collapse-title
      :collapsed="false"
      title="Analysis"
      @expanded="getAnalysisInfo"
    >
      <div slot="element">

        <icon
          v-if="analysisOverallStatus === 'loading'"
          type="md-sync"
          size="20"
          class="spin"
        />
        <span v-else>{{ analysisOverallStatus }}</span>

        <div
          v-for="analysis in analysisDetails"
          :key="analysis.jobURL"
          class="block"
        >
          <item-summary :item-details="analysis">
            <i-button
              @click="deleteJob(analysis.jobURL)"
              type="error"
              icon="md-trash"
              size="small"
              ghost
            >
              <span>Remove</span>
            </i-button>

          </item-summary>

          <icon
            v-if="analysis.fetchingImages"
            type="md-sync"
            size="20"
            class="spin"
          />

          <analysis-item
            :item-details="analysis"
            @analysisLogRequest="getAnalysisLog"
          />
        </div>

        <DeleteConfirmationModal ref="deletionModal"/>
      </div>
    </collapse-title>
  </div>
</template>


<script>
import CollapseTitle from '@/components/shared/collapse-title.vue';
import ItemSummary from '@/components/details-simulation/item-summary.vue';
import AnalysisItem from '@/components/details-simulation/analysis-item.vue';
import analysisConfig from '@/assets/analysis-config';
import { isRunning, jobStatus } from '@/assets/job-status';
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal.vue';
import unicore from '@/services/unicore';

export default {
  name: 'AnalysisSection',
  components: {
    CollapseTitle,
    ItemSummary,
    AnalysisItem,
    DeleteConfirmationModal,
  },
  props: ['simulationDetails', 'simulationUserProject'],
  data() {
    return {
      analysisDetails: [],
      overallLoading: false,
      isRunningFn: isRunning,
    };
  },
  computed: {
    analysisOverallStatus() {
      let outputText = '';
      if (!Object.keys(this.simulationDetails).length) {
        outputText = 'Fetching simulation information...';
      } else if (isRunning(this.simulationDetails.status)) {
        outputText = 'Simulation not finished yet';
      } else if (this.simulationDetails.status === jobStatus.failed) {
        outputText = 'Simulation failed. No analysis could be run.';
      } else if (this.analysisDetails.length === 0 && this.overallLoading) {
        outputText = 'loading';
      } else if (this.analysisDetails.length === 0 && !this.overallLoading) {
        outputText = 'No analysis have been run';
      }
      return outputText;
    },
  },
  mounted() {
    this.getAnalysisInfo();
  },
  methods: {
    async getAnalysisInfo() {
      /*  get the location of the analysis based on the mapping file
       *  that we save in the simulation and then the analysis image
       */
      // to get analysis the simulation must be finished sucessfully
      if (this.simulationDetails.status !== jobStatus.successful) return false;
      this.overallLoading = true;

      const analysisAssociatedList = await unicore.getAssociatedLocation(
        analysisConfig.analysisConnectionFileName,
        this.simulationDetails.workingDirectory,
      );

      // an array of all the analysis associated with simulation
      if (analysisAssociatedList.length === 0) { // no analysis
        this.overallLoading = false;
        return true;
      }

      this.analysisDetails = []; // reset all the analysis
      analysisAssociatedList.forEach((analysis) => {
        const childAnalysis = {};
        childAnalysis.jobURL = analysis._links.self.href;
        childAnalysis.workingDirectory = analysis._links.workingDirectory.href;
        childAnalysis.id = childAnalysis.jobURL.split('/').pop();
        childAnalysis.type = 'Analysis';
        this.refreshAnalysis(childAnalysis);
        this.analysisDetails.push(childAnalysis);
      });
      this.overallLoading = false;
      return true;
    },

    async refreshAnalysis(childAnalysis) {
      const analysisJobInfo = await unicore.getJobProperties(childAnalysis.jobURL);

      this.$set(childAnalysis, 'submissionTime', analysisJobInfo.submissionTime);
      this.$set(childAnalysis, 'name', analysisJobInfo.name);

      if (isRunning(analysisJobInfo.status)) {
        setTimeout(() => {
          this.refreshAnalysis(childAnalysis);
        }, this.$store.state.pollInterval);
        this.$set(childAnalysis, 'status', analysisJobInfo.status);
        return;
      }

      // to show spinner while loading images
      this.$set(childAnalysis, 'fetchingImages', true);
      const fileList = await unicore.getFilesList(`${childAnalysis.workingDirectory}/files`);

      // check if after finishing produce any plot. if not means an error occurred
      if (!fileList.children.some(file => file.endsWith('.png'))) {
        this.$set(childAnalysis, 'status', jobStatus.failed);
        this.$set(childAnalysis, 'fetchingImages', false);
        return;
      }
      this.$set(childAnalysis, 'status', analysisJobInfo.status);
      analysisConfig.plots.forEach((plot) => {
        this.getAnalysisImage(childAnalysis.workingDirectory, plot, childAnalysis);
      });
    },

    async getAnalysisImage(analysisURL, plotName, childAnalysis) {
      const plot = await unicore.getImage(`${analysisURL}/files/${plotName}.png`);
      if (plot) {
        console.debug('Stop loading...');
        this.$set(childAnalysis, plotName, plot);
      }
      this.$set(childAnalysis, 'fetchingImages', false);
    },

    async getAnalysisLog(childAnalysis) {
      const url = `${childAnalysis.workingDirectory}/files/stderr`;
      try {
        const stderr = await unicore.getFiles(url);
        const reader = new FileReader();
        reader.readAsText(stderr);
        reader.onloadend = () => {
          let content = reader.result;
          if (content === '') { content = 'File is empty'; }
          this.$set(childAnalysis, 'stderr', [content]);
        };
      } catch (e) {
        console.warn('error retrieving the analysis log');
        const stderr = [];
        if (isRunning(childAnalysis.status)) {
          stderr.push('No log available yet');
          stderr.push(`Analysis ${childAnalysis.status}`);
        } else {
          stderr.push('No log available');
          stderr.push('Job failed before script was executed');
        }
        this.$set(childAnalysis, 'stderr', stderr);
      }
    },

    async removeFromList(analysisId) {
      await unicore.deleteJobFromAssociatedFile(
        this.simulationDetails.workingDirectory,
        analysisId,
        analysisConfig.analysisConnectionFileName,
      );
      const listTemp = this.analysisDetails.filter(analysis => analysis.id !== analysisId);
      this.analysisDetails = listTemp;
    },

    deleteJob(url) {
      this.$refs.deletionModal.changeVisibility();
      this.$refs.deletionModal.setDeleteFn(async () => {
        await unicore.deleteJob(url);
        const id = url.split('/').pop();
        await this.removeFromList(id);
        this.$Message.info('Analaysis was deleted');
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
