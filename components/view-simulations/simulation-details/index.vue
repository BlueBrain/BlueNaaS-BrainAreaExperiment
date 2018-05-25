<!--
This will display the details of a certain simulation and the analysis.
-->
<template>
  <div class="simulation-details">
    <div v-if="!loading">
      <div class="detail-header">
        <div>
          <item-summary
            :item-details="simulationDetails"
            @toggleAutoreload="toggleAutoreload">
            <!-- in the slot show the spinner -->
            <a
              v-if="simulationDetails.intervalReference"
              title="Loading"
            >
              <i class="material-icons spin">autorenew</i>
            </a>
          </item-summary>
        </div>
        <div class="tools">
          <a
            class="button-with-icon colored"
            @click="returnList">
            <i class="material-icons">arrow_back</i>Simulation List
          </a>
          <a
            id="visualizationLauncherButton"
            class="button-with-icon colored small"
            @click="launchVisualizationJob(job, simulationUserProject, computer)">
            <i class="material-icons">visibility</i>
            Visualize Simulation
          </a>
          <a
            class="button-with-icon refresh"
            title="Poll manually"
            @click="refreshJobs">
            <i class="material-icons">refresh</i>Reload
          </a>
        </div>
      </div>
      <div class="detail-content">
        <analysis-section
          :simulation-details="simulationDetails"
          :simulation-user-project="simulationUserProject"/>

        <collapse-title
          :collapsed="true"
          title="BlueConfig"
          @expanded="getBlueConfig()">
          <div slot="element">
            <display-or-download
              :file-content="simulationDetails.blueconfig"
              name="blueconfig"/>
          </div>
        </collapse-title>

        <collapse-title
          :collapsed="true"
          title="Unicore Logs">
          <div slot="element">
            <display-or-download
              :file-content="simulationDetails.logParsed"
              name="unicore_log"/>
          </div>
        </collapse-title>

        <collapse-title
          :collapsed="true"
          title="Stderr"
          @collapsed="cleanPolling('stderr', simulationDetails)"
          @expanded="getFiles('stderr', simulationDetails)">
          <div
            slot="element"
            class="log-item" >
            <display-or-download
              :file-content="simulationDetails.stderr"
              name="stderr"/>
          </div>
        </collapse-title>

        <collapse-title
          :collapsed="true"
          title="Stdout"
          @collapsed="cleanPolling('stdout', simulationDetails)"
          @expanded="getFiles('stdout', simulationDetails)">
          <div
            slot="element"
            class="log-item">
            <display-or-download
              :file-content="simulationDetails.stdout"
              name="stdout"/>
          </div>
        </collapse-title>
      </div>
    </div>
    <div v-else>
      <!-- this will show the erros if the job in not in the selected computer -->
      <div class="detail-content errors-container really-centered colored-red"/>
    </div>
  </div>
</template>

<script>
import * as unicoreAPI from 'mixins/unicore.js';
import CollapseTitle from 'components/shared/collapse-title.vue';
import ItemSummary from 'components/view-simulations/simulation-details/item-summary.vue';
import AnalysisSection from 'components/view-simulations/simulation-details/analysis-section.vue';
import displayOrDownload from 'components/shared/display-or-download.vue';
import {isRunning, isEnded} from 'assets/job-status.js';
import {launchVisualization, setFileContent} from 'mixins/simulation-details.js';
import 'assets/css/style.css';
const BRAYNS_URL = 'https://bbp-brayns.epfl.ch/?host=https://brayns.humanbrainproject.org';

export default {
  name: 'SimulationDetails',
  components: {
    'collapse-title': CollapseTitle,
    'item-summary': ItemSummary,
    'analysis-section': AnalysisSection,
    'display-or-download': displayOrDownload,
  },
  props: ['jobParam', 'jobId', 'computerParam'],
  data: function() {
    return {
      loading: true,
      computer: 'JURECA',
      job: null,
      pollInterval: 5 * 1000, // seconds
      // isLoading: {}, // for save the timeout of the stderr, stdout
      // add more accesible information to the simulation
      simulationDetails: {
        // depending of the status change the icon
        statusIcon: 'check_circle',
        submissionTime: '',
        type: 'Simulation',
        intervalReference: null,
        autorefresh: true,
        id: '',
        name: '',
        url: '',
        files: '',
        status: '',
        refreshFunction: null,
      },
      simulationUserProject: '',
    };
  },
  created: function() {
    document.getElementById('frameTemplateTitle').innerText = 'Simulation Details';
  },
  mounted: function() {
    if (this.computerParam) {
      this.computer = this.computerParam;
    }
    if (this.jobParam) {
      this.job = this.jobParam;
      this.fillJobs(this.job);
    } else {
      this.getJobById(this.jobId, this.computer);
    }
    // poll check. I do the assigment to treat it like first time.
    // Otherwithse the toggle will negate again.
    this.simulationDetails.autorefresh = !this.simulationDetails.autorefresh;
    this.simulationDetails.refreshFunction = this.refreshJobs;
    // this.$set(this.isLoading, 'unicore_log', true);
    this.toggleAutoreload(this.simulationDetails);
  },
  beforeDestroy: function() {
    clearTimeout(this.simulationDetails.intervalReference);
  },
  methods: {
    fillJobs: function(job) {
      this.simulationDetails.url = job._links.self.href;
      this.simulationDetails.status = job.status;
      this.simulationDetails.id = this.simulationDetails.url.split('/').pop();
      this.simulationDetails.name = job.name;
      this.simulationDetails.workingDirectory = job._links.workingDirectory.href;
      this.simulationDetails.submissionTime = this.job.submissionTime;
      this.loading = false;
      let loadingComp = document.querySelector('#loading-component');
      if (loadingComp) {
        loadingComp.style.display = 'none';
      }
      // if (this.job && this.simulationDetails.status === 'SUCCESSFUL') {
      //   setTimeout(() => this.getAnalysisInfo(), this.pollInterval / 3);
      // }
      if (!this.simulationDetails.logParsed || !this.simulationUserProject) {
        // this.$set(this.isLoading, 'unicore_log', false);
        this.$set(this.simulationDetails, 'logParsed', this.parseLog(this.job));
        this.simulationUserProject = unicoreAPI.getProjectSelectedByLog(this.job.log);
        console.debug('Using project for details', this.simulationUserProject);
      }
    },
    getFiles: function(fileName, destination) {
      let url = this.simulationDetails.workingDirectory + '/files/' + fileName;
      let that = this;
      this.$set(destination, fileName, false);

      console.debug('Loading content', fileName);
      if (destination[`${fileName}Polling`]) return;
      destination[`${fileName}Polling`] = setInterval(getFilePolling, 2000);

      function getFilePolling() {
        console.debug('---))))))) Polling file', fileName);
        console.debug('Unicore', unicoreAPI);
        unicoreAPI.getFiles(url, that.simulationUserProject)
        .then((output) => {
          setFileContent(destination, fileName, output);
          if (!isRunning(that.job.status)) {
            that.cleanPolling(fileName, destination);
          }
        })
        .catch((fileNotFound) => {
          let e = `No file ${fileName} found`;
          setFileContent(destination, fileName, e);
          console.error(e);
          that.cleanPolling(fileName, destination);
        });
      }
    },
    cleanPolling(fileName, destination) {
      console.debug('Cleaning polling', fileName);
      clearInterval(destination[`${fileName}Polling`]);
      destination[`${fileName}Polling`] = null;
    },
    getBlueConfig: function() {
      let destination = this.simulationDetails;
      let fileName = 'BlueConfig';
      let attributeName = 'blueconfig';
      let url = this.simulationDetails.workingDirectory + '/files/' + fileName;
      console.debug('Getting content of', fileName);
      this.$set(destination, attributeName, false);
      unicoreAPI.getFiles(url, this.simulationUserProject)
      .then((output) => {
        setFileContent(destination, attributeName, output);
      }, (error) => {
        fileName = 'blueconfig.json';
        url = this.simulationDetails.workingDirectory + '/files/' + fileName;
        unicoreAPI.getFiles(url, this.simulationUserProject)
        .then((output) => {
          setFileContent(destination, attributeName, output);
        }, (error) => {
          setFileContent(destination, attributeName, 'No file BlueConfig found');
        });
      });
    },
    getJobById: function(jobId, computer) {
      // search for the details by id
      console.debug('getJobById');
      unicoreAPI.getJobById(jobId, computer)
      .then((jobDetails) => {
        this.job = jobDetails;
        this.fillJobs(jobDetails);
      }, (error) => {
        let loadingComp = document.getElementById('loading-component');
        if (loadingComp) {
          loadingComp.style.display = 'none';
        }
        let content = document.querySelector('.errors-container');
        let errorMessage = 'Job not in this computer? Try change the computer from the URL';
        content.innerText = errorMessage;
        console.warn(errorMessage);
      });
    },
    parseLog: function(logArray) {
      if (!logArray.log) return [];
      let clone = logArray.log.slice(0);
      clone.forEach((elem, index) => {
        if (elem.includes('\n')) {
          clone[index] = elem.split('\n');
        }
      });
      return clone;
    },
    refreshJobs: function() {
      this.getJobById(this.jobId, this.computer);
    },
    rejectError: function(error) {
      throw String(error);
    },
    returnList: function() {
      this.$router.push({
        name: 'view',
        params: {
          statusSearch: 'all',
          computerParam: this.computerParam,
        },
      });
    },
    toggleAutoreload: function(obj) {
      obj.autorefresh = !obj.autorefresh;
      if (obj.autorefresh) {
        obj.intervalReference = setInterval(() => {
          if (obj && isEnded(obj.status)) {
            // stop interval on job finished
            obj.intervalReference = clearTimeout(obj.intervalReference);
          } else {
            obj.refreshFunction();
          }
        }, this.pollInterval);
      } else {
        obj.intervalReference = clearTimeout(obj.intervalReference);
      }
    },
    launchVisualizationJob: function(job, simulationUserProject, computer) {
      return swal({
        title: 'Visualization',
        html: `<p>THIS CAN TAKE A WHILE (5~10 minutes). </p>
               <p><a href="${BRAYNS_URL}">BRAYNS</a>
                  will open automatically after it has been configured</p>`,
        type: 'info',
        showLoaderOnConfirm: true,
        confirmButtonText: 'Setup BRAYNS',
        preConfirm: () => launchVisualization(job, simulationUserProject, computer),
        allowOutsideClick: () => !swal.isLoading(),
      }).then((choice) => {
        if (!choice.value) return;
        window.open(BRAYNS_URL, '_blank');
      });
    },
  },
};
</script>

<style scoped>
  .simulation-details {
      padding: 0 15px;
  }
  a.button-with-icon {
      letter-spacing: .5px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      margin: 5px;
  }
  a.button-with-icon.colored {
      color: #fff;
      background-color: #879fcb;
      text-decoration: none;
  }
  .collapse-title a.button-with-icon.colored {
      margin-top: 10px;
      display: inline-flex;
  }
  .tools {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 5px 10px;
  }
  .detail-header {
      padding: 10px 5px;
      display: flex;
      justify-content: space-between;
      align-items: end;
  }
  .detail-content {
      margin: 0 10px;
  }
  .space-flex {
      flex-grow: 1;
  }
  .button-with-icon i.material-icons {
      margin-right: 5px;
  }
  .item-summary {
      margin-left: 5px;
  }
  .block {
      border-style: solid;
      border-color: lightgray;
      border-width: 1px;
      margin-bottom: 5px;
      padding: 5px;
  }
  .block .delete {
      min-width: 90px;
      color: #b0686f;
      cursor: pointer;
  }
  @media (max-width: 550px) {
    .detail-header {
      flex-wrap: wrap;
    }
  }
</style>
