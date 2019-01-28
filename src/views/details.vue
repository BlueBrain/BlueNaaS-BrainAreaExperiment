
<!--
This will display the details of a certain simulation and the analysis.
-->
<template>
  <div class="simulation-details app-content">

    <div class="detail-header">
      <item-summary
        class="item-summary-details"
        :item-details="simulationDetails"
      />

      <div class="grow-space"/>

      <div class="tools">
        <i-button
          type="primary"
          size="small"
          icon="ios-arrow-back"
          @click="returnList"
        >Simulation List</i-button>
      </div>
    </div>

    <i-button
      type="primary"
      class="in-corner"
      icon="md-videocam"
      size="small"
      @click="launchVisualization"
      :loading="vizRunning"
    >Visualize</i-button>

    <analysis-in-notebook :simulation-details="simulationDetails"/>

    <div class="detail-content" :class="{'full-disable': !simulationDetails.id}">
      <analysis-section :simulation-details="simulationDetails"/>

      <collapse-title
        :collapsed="true"
        title="BlueConfig"
        @expanded="getBlueConfig()"
      >
        <div slot="element">
          <display-or-download
            :file-content="downloadedFiles.blueconfig"
            file-name="blueconfig"
          />
        </div>
      </collapse-title>

      <collapse-title
        :collapsed="true"
        title="Unicore Logs"
      >
        <div slot="element">
          <display-or-download
            :file-content="simulationDetails.logParsed"
            file-name="unicore_log"
          />
        </div>
      </collapse-title>

      <collapse-title
        :collapsed="true"
        title="Files"
        @expanded="getFileExpanded('wdfiles', downloadedFiles, '')"
      >
        <div
          slot="element"
          class="log-item" >
          <display-or-download
            :file-content="downloadedFiles.wdfiles"
            file-name="workingDirectoryFiles"
          />
        </div>
      </collapse-title>

      <collapse-title
        :collapsed="true"
        title="Stderr"
        @expanded="getFileExpanded('stderr', downloadedFiles)"
      >
        <div
          slot="element"
          class="log-item" >
          <display-or-download
            :file-content="downloadedFiles.stderr"
            file-name="stderr"
          />
        </div>
      </collapse-title>

      <collapse-title
        :collapsed="true"
        title="Stdout"
        @expanded="getFileExpanded('stdout', downloadedFiles)"
      >
        <div
          slot="element"
          class="log-item">
          <display-or-download
            :file-content="downloadedFiles.stdout"
            file-name="stdout"
          />
        </div>
      </collapse-title>
    </div>

  </div>
</template>


<script>
import unicore from '@/services/unicore';
import CollapseTitle from '@/components/shared/collapse-title.vue';
import ItemSummary from '@/components/details-simulation/item-summary.vue';
import AnalysisSection from '@/components/details-simulation/analysis-section.vue';
import DisplayOrDownload from '@/components/shared/display-or-download.vue';
import AnalysisInNotebook from '@/components/details-simulation/analysis-in-notebook.vue';
import eventBus from '@/services/event-bus';
import { isRunning, jobStatus } from '@/assets/job-status';
import { submitVisualization } from '@/services/helper/visualization-helper';
import db from '@/services/db';

export default {
  name: 'SimulationDetails',
  components: {
    CollapseTitle,
    ItemSummary,
    DisplayOrDownload,
    AnalysisSection,
    AnalysisInNotebook,
  },
  props: ['jobId', 'computerParam'],
  data() {
    return {
      job: {},
      simulationDetails: {},
      downloadedFiles: {},
      vizRunning: false,
    };
  },
  mounted() {
    this.$store.commit('setAppTitle', 'Simulation Details');
    if (this.computerParam) {
      eventBus.$emit('changeComputer', this.computerParam);
    }
    this.getJobById(this.jobId);
  },
  methods: {
    fillJobs(job) {
      const details = {};
      details.status = job.status;
      details.id = job._links.self.href.split('/').pop();
      details.name = job.name;
      details.url = job._links.self.href;
      details.workingDirectory = job._links.workingDirectory.href;
      details.submissionTime = job.submissionTime;
      details.type = 'Simulation';
      details.logParsed = this.simulationDetails.logParsed;

      this.simulationDetails = details;
    },

    async getFileExpanded(attributeName, destination, fileToFetch = attributeName) {
      this.$set(destination, attributeName, false);
      const url = `${this.simulationDetails.workingDirectory}/files/${fileToFetch}`;
      let fileContent = null;
      try {
        fileContent = await unicore.getFiles(url);
      } catch (notFound) {
        const message = 'File not found';
        fileContent = new Blob([message]);
      }
      await this.setVariableContent(destination, attributeName, fileContent);
    },

    async getBlueConfig() {
      const attributeName = 'blueconfig';
      const { workingDirectory } = this.simulationDetails;
      if (!workingDirectory) return;

      // initialize with false to show spinner
      this.$set(this.downloadedFiles, attributeName, false);

      const setVariableContentFn = this.setVariableContent;

      async function fetchAndSetBC(fileToFetch, destination) {
        const url = `${workingDirectory}/files/${fileToFetch}`;
        const fileContent = await unicore.getFiles(url);
        await setVariableContentFn(destination, attributeName, fileContent);
      }

      try {
        await fetchAndSetBC('BlueConfig', this.downloadedFiles);
      } catch (e) {
        try {
          await fetchAndSetBC('blueconfig.json', this.downloadedFiles);
        } catch (error) {
          this.$Message.error('Error Loading BlueConfig');
          throw new Error(e);
        }
      }
    },

    async setVariableContent(parentObj, variableName, fileContent) {
      const reader = new FileReader();
      reader.readAsText(fileContent);
      reader.onloadend = () => {
        let content = reader.result;
        if (content === '') {
          content = 'Empty File';
        } else if (!content.startsWith('File not found') && !content.includes('\n')) {
          content = JSON.stringify(JSON.parse(content), null, 2);
        }
        this.$set(parentObj, variableName, content);
      };
    },

    async getJobById(jobId) {
      // search for the details by id
      this.job = await unicore.getJobById(jobId);
      if (!this.job) {
        this.$Message.error('Error loading simulation details');
        return;
      }

      if (
        !this.simulationDetails.logParsed ||
        this.simulationDetails.logParsed.length < this.job.log.length
      ) {
        this.simulationDetails.logParsed = this.parseLog(this.job.log);
      } else {
        this.simulationDetails.logParsed = this.simulationDetails.logParsed;
      }

      this.fillJobs(this.job);

      this.$store.dispatch('hideLoader');

      if (isRunning(this.job.status)) {
        setTimeout(() => { this.getJobById(jobId); }, this.$store.state.pollInterval);
      } else {
        // after the simulation is finished check if the results were correct
        if (this.job.children || this.job.status !== jobStatus.successful) return;
        const [simulationWithFiles] = await unicore.populateJobsWithFiles([this.job._links.self.href]);
        if (!simulationWithFiles.children.includes('/out.dat')) {
          // do not produce any output file - simulation failed
          simulationWithFiles.status = jobStatus.failed;
          this.$set(this.simulationDetails, 'status', jobStatus.failed);
        }
        db.addJob(simulationWithFiles);
      }
    },

    parseLog(log) {
      // transform to array to display with indentation
      if (!log) return [];

      // choose the project
      const simProject = unicore.getProjectSelectedByLog(log);
      if (simProject) {
        this.$store.commit('setUserProject', simProject);
      }

      const clone = log.slice(0);
      clone.forEach((elem, index) => {
        if (elem.includes('\n')) {
          clone[index] = elem.split('\n');
        }
      });

      return clone;
    },

    returnList() {
      this.$router.push({
        name: 'view',
        params: {
          statusSearch: 'all',
          computerParam: this.computerParam,
        },
      });
    },

    launchVisualization() {
      this.$Message.loading({
        content: 'Visualization is starting. This could take up to 10 min...',
        duration: 60,
      });
      submitVisualization(this.simulationDetails);
      this.vizRunning = true;
    },
  },
};
</script>


<style scoped>
  .full-disable {
    pointer-events: none;
  }
  .detail-header {
    display: flex;
    align-items: baseline;
  }
  .in-corner {
    float: right;
    margin-left: 5px;
  }
</style>
