
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
          icon="ios-arrow-back"
          @click="returnList"
        >Simulation List</i-button>
      </div>
    </div>

    <visualize-launcher
      v-if="simulationWasSuccessful"
      :simulation-details="simulationDetails"
    />

    <analysis-in-notebook
      v-if="simulationWasSuccessful"
      :replace-text="simulationId"
      :config-url="analysisNotebookConfig"
    />

    <div class="detail-content" :class="{'full-disable': !simulationDetails.id}">
      <analysis-section :simulation-details="simulationDetails"/>

      <collapse-title
        :collapsed="true"
        title="BlueConfig"
        @expanded="getBlueConfig"
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
        title="Files"
        @expanded="parseUnicoreFiles"
      >
        <div
          slot="element"
          class="log-item"
        >
          <div class="files-content">
            <div v-if="parsedFiles.physicalLocation">
              <strong>HPC Location: </strong><span>{{ parsedFiles.physicalLocation }}</span>
              <div v-if="!parsedFiles.unicoreSimulationFiles.length">
                <badge status="error"/>
                <span>Files not available</span>
              </div>
              <files-list
                v-else
                :list="parsedFiles.unicoreSimulationFiles"
                :working-dir="simulationDetails.workingDirectory"
              />
            </div>
            <div v-else>
              <icon type="md-sync" size="20" class="spin" />
            </div>

          </div>
        </div>
      </collapse-title>


      <collapse-title
        :collapsed="true"
        title="Technical Logs"
      >
        <div slot="element">
          <collapse-title
            :collapsed="true"
            :sublevel="true"
            title="Unicore Logs"
            @expanded="parseUnicoreLogs"
          >
            <div slot="element">
              <div v-if="parsedFiles.unicoreLog">
                <display-or-download
                  :file-content="parsedFiles.unicoreLog"
                  file-name="unicore_log"
                />
              </div>
              <div v-else>
                <icon type="md-sync" size="20" class="spin" />
              </div>
            </div>
          </collapse-title>

          <collapse-title
            :collapsed="true"
            :sublevel="true"
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
            :sublevel="true"
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

          <collapse-title
            :collapsed="true"
            title="Visualization Logs"
            v-show="viz.showLogs"
          >
            <div slot="element">
              <collapse-title
                :collapsed="true"
                :sublevel="true"
                title="Stderr"
                @expanded="getFileExpanded('stderr', viz.downloadedFiles, 'stderr', viz.workingDirectory)"
              >
                <div
                  slot="element"
                  class="log-item" >
                  <display-or-download
                    :file-content="viz.downloadedFiles.stderr"
                    file-name="stderr"
                  />
                </div>
              </collapse-title>

              <collapse-title
                :collapsed="true"
                :sublevel="true"
                title="Stdout"
                @expanded="getFileExpanded('stdout', viz.downloadedFiles, 'stdout', viz.workingDirectory)"
              >
                <div
                  slot="element"
                  class="log-item">
                  <display-or-download
                    :file-content="viz.downloadedFiles.stdout"
                    file-name="stdout"
                  />
                </div>
              </collapse-title>
            </div>
          </collapse-title>
        </div>
      </collapse-title>
    </div>

  </div>
</template>


<script>
import get from 'lodash/get';
import unicore from '@/services/unicore';
import CollapseTitle from '@/components/shared/collapse-title.vue';
import ItemSummary from '@/components/details-simulation/item-summary.vue';
import AnalysisSection from '@/components/details-simulation/analysis-section.vue';
import DisplayOrDownload from '@/components/shared/display-or-download.vue';
import AnalysisInNotebook from '@/components/shared/analysis-in-notebook.vue';
import VisualizeLauncher from '@/components/details-simulation/visualize-launcher.vue';
import FilesList from '@/components/details-simulation/files-list.vue';
import eventBus from '@/services/event-bus';
import db from '@/services/db';
import analysisConfig from '@/config/analysis-config';
import { getComputerUrlCombo } from '@/common/utils';
import { isRunning, jobStatus } from '@/common/job-status';
import { simulationProducedResults } from '@/services/helper/list-jobs-helper';

export default {
  name: 'SimulationDetails',
  components: {
    CollapseTitle,
    ItemSummary,
    DisplayOrDownload,
    AnalysisSection,
    AnalysisInNotebook,
    VisualizeLauncher,
    analysisConfig,
    FilesList,
  },
  props: ['jobId', 'computerParam'],
  data() {
    return {
      job: {},
      simulationDetails: {},
      downloadedFiles: {},
      viz: {
        downloadedFiles: {},
        showLogs: false,
        workingDirectory: null,
        vizUrl: null,
      },
      computerProjectCombo: null,
      parsedFiles: {
        unicoreLog: '',
        unicoreSimulationFiles: '',
        physicalLocation: '',
      },
    };
  },
  computed: {
    simulationWasSuccessful() {
      if (!get(this, 'job.children')) return false;
      const isSuccessful = this.simulationDetails.status === jobStatus.SUCCESSFUL;
      const hasResults = simulationProducedResults(this.job);
      return isSuccessful && hasResults;
    },
    simulationId() {
      return this.simulationDetails.id ||
        unicore.urlToComputerAndId(this.simulationDetails.url).id;
    },
    analysisNotebookConfig() {
      return get(this, '$store.state.fullConfig.analysisConfig.dynamicAnalysisConfig');
    },
  },
  mounted() {
    this.$store.commit('setAppTitle', 'Simulation Details');
    if (this.computerParam) {
      eventBus.$emit('change-computer', this.computerParam);
    }
    this.computerProjectCombo = getComputerUrlCombo();
    this.getJobById(this.jobId);

    eventBus.$on('viz-ready', vizResult => this.setupVizVariables(vizResult));
  },
  methods: {
    fillJobs(job) {
      const details = {};
      // Loading until the "simulationProducedResults" was performed
      details.status = isRunning(job.status) ? job.status : jobStatus.LOADING;
      details.id = job._links.self.href.split('/').pop();
      details.name = job.name;
      details.url = job._links.self.href;
      details.workingDirectory = job._links.workingDirectory.href;
      details.submissionTime = job.submissionTime;
      details.type = 'Simulation';
      details.log = job.log;

      this.simulationDetails = details;
    },

    async getFileExpanded(
      attributeName,
      destination,
      fileToFetch = attributeName,
      workingDirectory = this.simulationDetails.workingDirectory,
    ) {
      this.$set(destination, attributeName, false);
      const url = `${workingDirectory}/files/${fileToFetch}`;
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
        } else if (!content.startsWith('File not found') && !content.includes('\\n')) {
          try {
            content = JSON.stringify(JSON.parse(content), null, 2);
          } catch (e) { console.debug('File is raw text'); }
        } else if (content.includes('\\n') && content.includes('"')) {
          // result from service account
          content = content.replace(/\\n/g, '\n').replace(/"/g, '');
        }
        this.$set(parentObj, variableName, content);
      };
    },

    async getJobById(jobId) {
      // search for the details by id
      if (this.computerProjectCombo !== getComputerUrlCombo()) return;

      this.job = await unicore.getJobById(jobId);
      if (!this.job) {
        this.$Message.error('Error loading simulation details');
        return;
      }

      this.fillJobs(this.job);

      this.$store.dispatch('hideLoader');

      if (isRunning(this.job.status)) {
        setTimeout(() => { this.getJobById(jobId); }, this.$store.state.pollInterval);
      } else {
        // after the simulation is finished check if the results were correct
        if (this.job.children || this.job.status !== jobStatus.SUCCESSFUL) {
          // pass children so if it has reports show the viz button
          this.simulationDetails.children = this.job.children;
          this.$set(this.simulationDetails, 'status', this.job.status);
          return;
        }
        const [simulationWithFiles] = await unicore.populateJobsUrlWithFiles([this.job._links.self.href]);
        if (!simulationProducedResults(simulationWithFiles)) {
          // do not produce any output file - simulation failed
          simulationWithFiles.status = jobStatus.FAILED;
          this.$set(this.simulationDetails, 'status', jobStatus.FAILED);
        } else {
          // this wlll upload the simulationWasSuccessful and show the analysis and viz buttons
          this.$set(this.job, 'children', simulationWithFiles.children);
          this.$set(this.simulationDetails, 'children', simulationWithFiles.children);
          this.$set(this.simulationDetails, 'status', this.job.status);
        }
        db.addJob(simulationWithFiles);
      }
    },

    async parseUnicoreFiles() {
      const url = `${this.simulationDetails.workingDirectory}/files`;
      const filesList = await unicore.getFilesWithSizes(url);
      this.$set(this.parsedFiles, 'unicoreSimulationFiles', filesList);
      const physicalLocation = unicore.getJobPhysicalLocation(this.job.log);
      this.parsedFiles.physicalLocation = physicalLocation || '(Location not available)';
    },

    parseUnicoreLogs() {
      // transform to array to display with indentation
      const { log } = this.job;
      if (!log) {
        this.$set(this.parsedFiles, 'unicoreLog', 'No logs are available');
        return;
      }

      // choose the project
      const simProject = unicore.getProjectSelectedByLog(log);
      if (simProject) {
        this.$store.commit('setUserProject', simProject);
      }

      const logList = log.slice(0);
      logList.forEach((elem, index) => {
        if (elem.includes('\n')) {
          logList[index] = elem.split('\n');
        }
      });

      this.$set(this.parsedFiles, 'unicoreLog', logList);
    },

    returnList() {
      this.$router.push({
        name: 'view',
        params: {
          statusSearch: 'all',
          computerParam: this.computerParam,
        },
        query: this.$route.query,
      });
    },

    async setupVizVariables({ workingDir, vizUrl }) {
      this.viz.showLogs = !!workingDir;
      this.viz.workingDirectory = workingDir;
      this.viz.vizUrl = vizUrl;
    },
  },
  beforeDestroy() {
    // stop refreshing the simulations that are running
    this.pageIsDisplayed = false;
    eventBus.$on('viz-ready', vizResult => this.setupVizVariables(vizResult));
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
  .files-content {
    font-size: 16px;
  }
</style>
