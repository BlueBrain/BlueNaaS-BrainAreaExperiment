
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
      <analysis-section
        :simulation-details="simulationDetails"
      />

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
        @collapsed="cleanPolling('wdfiles', downloadedFiles)"
        @expanded="getFilesWithPolling('wdfiles', downloadedFiles, '')"
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
        @collapsed="cleanPolling('stderr', downloadedFiles)"
        @expanded="getFilesWithPolling('stderr', downloadedFiles)"
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
        @collapsed="cleanPolling('stdout', downloadedFiles)"
        @expanded="getFilesWithPolling('stdout', downloadedFiles)"
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
import { isRunning } from '@/assets/job-status';
import { submitVisualization } from '@/services/helper/visualization-helper';

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

      details.logParsed = this.simulationDetails.logParsed ?
        this.simulationDetails.logParsed :
        this.parseLog(this.job.log);

      this.simulationDetails = details;
    },

    getFilesWithPolling(attributeName, destination, fileToFetch = attributeName) {
      this.$set(destination, attributeName, false);

      console.debug('Loading content', attributeName);

      // avoid load already loading file
      if (destination[`${attributeName}Polling`]) return;

      const that = this;
      async function getFilePolling(url) {
        console.debug('---))))))) Polling file', attributeName);

        try {
          const fileContent = await unicore.getFiles(url);
          await that.setVariableContent(destination, attributeName, fileContent);

          if (!isRunning(that.simulationDetails.status)) {
            that.cleanPolling(attributeName, destination);
          }
        } catch (notFound) {
          const message = 'File not found';
          const e = new Blob([message]);
          that.setVariableContent(destination, attributeName, e);
          console.warn(message);
          that.cleanPolling(attributeName, destination);
        }
      }

      const url = `${this.simulationDetails.workingDirectory}/files/${fileToFetch}`;
      /* eslint-disable no-param-reassign */
      getFilePolling(url); // fetch the first time inmediately and then if needed polling
      // add the polling information
      destination[`${attributeName}Polling`] = setInterval(getFilePolling, this.$store.state.pollInterval, url);
      /* eslint-enable no-param-reassign */
    },

    cleanPolling(attributeName, destination) {
      /* eslint-disable no-param-reassign */
      // remove the polling information
      console.debug('Cleaning polling', attributeName);
      clearInterval(destination[`${attributeName}Polling`]);
      destination[`${attributeName}Polling`] = null;
      /* eslint-enable no-param-reassign */
    },

    async getBlueConfig() {
      const attributeName = 'blueconfig';
      const { workingDirectory } = this.simulationDetails;
      if (!workingDirectory) return;
      console.debug('Getting content of', attributeName);

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
          console.error(e);
          throw new Error(e);
        }
      }
    },

    async setVariableContent(parentObj, variableName, fileContent) {
      const reader = new FileReader();
      reader.readAsText(fileContent);
      reader.onloadend = () => {
        let content = reader.result;
        if (!content.startsWith('File not found') && !content.includes('\n')) {
          // tries to prettify the output if possible
          try {
            content = JSON.stringify(JSON.parse(content), null, 2);
          } catch (e) {
            console.warn('problem prettifying');
          }
        }
        this.$set(parentObj, variableName, content);
      };
    },

    async getJobById(jobId) {
      // search for the details by id
      this.job = await unicore.getJobById(jobId);
      if (!this.job) {
        this.$Message.error('Error loading simulation details');
        console.error('Error loading simulation details');
        return;
      }
      this.fillJobs(this.job);

      this.$store.dispatch('hideLoader');

      if (isRunning(this.job.status)) {
        console.debug('Simulation is running - polling info...');
        console.debug('');
        setTimeout(() => { this.getJobById(jobId); }, this.$store.state.pollInterval);
      } else {
        console.debug('Simulation finished. stopping polling...');
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
