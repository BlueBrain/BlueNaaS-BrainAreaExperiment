<!--
This will display the details of a certain simulation and the analysis.
-->
<template>
    <div class="simulation-details">
        <div v-if="!loading">
            <div class="detail-header">
                <div>
                    <item-summary
                        :itemDetails="simulationDetails"
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
                <div class="space-flex"></div>
                <a class="button-with-icon colored" @click="returnList"><i class="material-icons">arrow_back</i>Simulation List</a>
                <span class="refresh" @click="refreshJobs" title="Poll manually">
                    <a class="button-with-icon"><i class="material-icons">refresh</i>Reload</a>
                </span>
            </div>
            <div class="detail-content">
                <collapse-title title="Analysis" :collapsed="false">
                    <div slot="element">
                        <a
                            v-if="
                              analysisDetails.length === 0 &&
                              simulationDetails.intervalReference
                            "
                            title="Loading"
                        >
                            <i class="material-icons spin">autorenew</i>
                        </a>
                        <div v-for="analysis in analysisDetails" class="block">
                            <item-summary :itemDetails="analysis">
                                <a
                                    class="delete"
                                    title="Delete"
                                    @click="deleteJob(analysis.jobURL)"
                                >
                                    <i class="material-icons">delete_forever</i>
                                    Remove
                                </a>
                            </item-summary>
                            <analysis :itemDetails="analysis"></analysis>
                        </div>
                    </div>
                </collapse-title>
                <collapse-title title="BlueConfig" :collapsed="true">
                    <div slot="element">
                        <div v-for="log in simulationDetails.BlueConfig" class="log-item">
                            {{ log }}
                        </div>
                        <a class="button-with-icon" v-if="simulationDetails.intervalReference" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                        <a @click="save('BlueConfig.txt', simulationDetails.BlueConfig)" class="button-with-icon colored"><i class="material-icons download-file">file_download</i>Download File</a>
                    </div>
                </collapse-title>
                <collapse-title title="Unicore Logs" :collapsed="true">
                    <div slot="element">
                        <!-- {{job.logParsed}} -->
                        <div v-for="log in job.logParsed" class="log-item">
                            <div v-if="typeof(log) === 'object'">
                              <div v-for="logItem in log" class="indent">
                                {{ logItem }}
                              </div>
                            </div>
                            <div v-else>
                              {{log}}
                            </div>
                        </div>
                        <a class="button-with-icon" v-if="simulationDetails.intervalReference" title="Loading">
                            <i class="material-icons">autorenew</i>
                        </a>
                        <a @click="save('Unicore_Logs.txt', job.log)" class="button-with-icon colored"><i class="material-icons download-file">file_download</i>Download File</a>
                    </div>
                </collapse-title>
                <collapse-title title="Stderr" :collapsed="true">
                    <div slot="element" class="log-item">
                        <div v-for="error in simulationDetails.stderr" class="log-item">
                            {{ error }}
                        </div>
                        <a class="button-with-icon" v-if="simulationDetails.intervalReference" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                        <a @click="save('Stderr.txt', simulationDetails.stderr)" class="button-with-icon colored"><i class="material-icons download-file">file_download</i>Download File</a>
                    </div>
                </collapse-title>
                <collapse-title title="Stdout" :collapsed="true">
                    <div slot="element" class="log-item">
                        <div v-for="out in simulationDetails.stdout" class="log-item">
                            {{ out }}
                        </div>
                        <a class="button-with-icon" v-if="simulationDetails.intervalReference" title="Loading">
                            <i class="material-icons spin">autorenew</i>
                        </a>
                        <a @click="save('Stdout.txt', simulationDetails.stdout)" class="button-with-icon colored"><i class="material-icons download-file">file_download</i>Download File</a>
                    </div>
                </collapse-title>
            </div>
        </div>
        <div v-else>
        <!-- this will show the erros if the job in not in the selected computer -->
            <div class="detail-content"></div>
        </div>
    </div>
</template>

<script>
import Unicore from 'mixins/unicore.js';
import CollapseTitle from 'components/shared/collapse-title.vue';
import ItemSummary from 'components/view-simulations/simulation-details/item-summary.vue';
import Analysis from 'components/view-simulations/simulation-details/analysis.vue';
import analysisConfig from 'assets/analysis-config.json';

export default {
  'name': 'simulationDetails',
  'props': ['jobParam', 'jobId', 'computerParam'],
  'data': function() {
    return {
      'loading': true,
      'computer': 'JUQUEEN',
      'unicoreAPI': Unicore,
      'job': null,
      'pollInterval': 10, // seconds
      // add more accesible information to the simulation
      'simulationDetails': {
        // depending of the status change the icon
        'statusIcon': 'check_circle',
        'submissionTime': '',
        'type': 'Simulation',
        'intervalReference': null,
        'autorefresh': true,
        'id': '',
        'name': '',
        'url': '',
        'stderr': [],
        'files': '',
        'stdout': [],
        'status': '',
        'BlueConfig': [],
        'refreshFunction': null,
      },
      'analysisDetailTemplate': {
        // depending of the status change the icon
        'statusIcon': 'check_circle',
        'submissionTime': '',
        'type': 'Analysis',
        'id': '',
        'name': '',
        'status': '',
      },
      'analysisDetails': [],
    };
  },
  'components': {
    'collapse-title': CollapseTitle,
    'item-summary': ItemSummary,
    'analysis': Analysis,
  },
  'methods': {
    'deleteJob': function(url) {
      swal({
        'title': 'Are you sure?',
        'text': 'You won\'t be able to revert this!',
        'type': 'warning',
        'showCancelButton': true,
        'focusCancel': true,
        'confirmButtonColor': '#ac6067',
        'cancelButtonColor': '#879fcb',
        'confirmButtonText': 'Yes, delete it!',
        'showLoaderOnConfirm': true,
        'allowOutsideClick': false,
        'preConfirm': (choice) => {
          if (choice === true) {
            return this.unicoreAPI.deleteJob(url)
            .then(() => {
              let id = url.split('/').pop();
              return this.removeFromList(id);
            });
          }
        },
      });
    },
    'fillJobs': function(job) {
      this.simulationDetails.url = job._links.self.href;
      this.simulationDetails.status = job.status;
      this.simulationDetails.id = this.simulationDetails.url.split('/').pop();
      this.simulationDetails.name = job.name;
      this.simulationDetails.files = job._links.workingDirectory.href;
      this.simulationDetails.submissionTime = this.job.submissionTime;
      this.loading = false;
      let loadingComp = document.querySelector('#loading-component');
      if (loadingComp) {
        loadingComp.style.display = 'none';
      }
      this.getFiles('stderr', this.simulationDetails);
      this.getFiles('stdout', this.simulationDetails);
      this.getFiles('BlueConfig', this.simulationDetails);
      this.getAnalysisInfo();
      this.job.logParsed = this.parseLog(this.job);
    },
    'getFiles': function(fileName, destination) {
      let url = this.simulationDetails.files + '/files/' + fileName;
      this.unicoreAPI.getFiles(url).then((output) => {
        if (fileName === 'BlueConfig') {
          // parse to visualize it prettier
          try {
            let prettyText = JSON.stringify(JSON.parse(output), null, 2).split('\n');
            destination[fileName] = prettyText;
          } catch (e) {
            destination[fileName] = output.split('\n');
          }
        } else {
          destination[fileName] = output.split('\n');
        }
      }, console.warn);
    },
    'getAnalysisInfo': function() {
      /*  get the location of the analysis based on the mapping file
                that we save in the simulation and then the analysis image */
      if (this.job && this.simulationDetails.status === 'SUCCESSFUL') {
        this.analysisDetails = []; // reset all the analysis
        this.unicoreAPI.getAssociatedLocation(this.simulationDetails.files)
        .then((analysisObject) => {
          // an array of all the analysis associated with simulation
          if (analysisObject === '') { // no analysis
            return;
          }
          analysisObject.forEach((analysis) => {
            let childAnalysis = Object.assign({}, this.analysisDetailTemplate);
            childAnalysis['jobURL'] = analysis._links.self.href;
            childAnalysis.id = analysis._links.self.href.split('/').pop();
            analysisConfig.plots.forEach((plot) => {
              this.getAnalysisImage(
                analysis._links.workingDirectory.href,
                plot,
                childAnalysis
              );
            });
            this.getAnalysisStatus(analysis._links.self.href, childAnalysis);
            this.analysisDetails.push(childAnalysis);
          });
        });
      }
    },
    'getAnalysisImage': function(analysisURL, plotName, childAnalysis) {
      this.unicoreAPI.getImage(`${analysisURL}/files/${plotName}.png`)
      .then((plot) => {
        let reader = new FileReader();
        reader.onloadend = () => {
          this.$set(childAnalysis, plotName, reader.result);
        };
        reader.readAsDataURL(plot);
      }, (error) => {
        console.log('No analysis image available yet');
      });
    },
    'getAnalysisStatus': function(analysisURL, childAnalysis) {
      this.unicoreAPI.getJobProperties(analysisURL)
      .then((jobInfo) => {
        childAnalysis.status = jobInfo.status;
        childAnalysis.submissionTime = jobInfo.submissionTime;
        childAnalysis.name = jobInfo.name;
      });
    },
    'getJobById': function() {
      // search for the details by id
      this.unicoreAPI.getJobById(this.jobId, this.computer)
      .then((jobDetails) => {
        this.job = jobDetails;
        this.fillJobs(jobDetails);
      }, (error) => {
        let loadingComp = document.getElementById('loading-component');
        if (loadingComp) {
          loadingComp.style.display = 'none';
        }
        let content = document.querySelector('.detail-content');
        let errorMessage = 'Job not in this computer? Try change the computer from the URL';
        content.innerText = errorMessage;
        console.warn(errorMessage);
      });
    },
    'parseLog': function(logArray) {
      if (!logArray.log) return [];
      let clone = logArray.log.slice(0);
      clone.forEach((elem, index) => {
        if (elem.includes('\n')) {
          clone[index] = elem.split('\n');
        }
      });
      return clone;
    },
    'refreshJobs': function() {
      this.getJobById();
    },
    'rejectError': function(error) {
      throw String(error);
    },
    'returnList': function() {
      this.$router.push({
        'name': 'view',
        'params': {
          'statusSearch': 'all',
          'computerParam': this.computerParam,
        },
      });
    },
    'save': function(filename, data) {
      let stringFormat = null;
      if (data && Array.isArray(data)) {
        stringFormat = data.join('\n');
      } else {
        stringFormat = data;
      }
      let blob = new Blob([stringFormat], {'type': 'text/plain'});
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    },
    'toggleAutoreload': function(obj) {
      obj.autorefresh = !obj.autorefresh;
      if (obj.autorefresh) {
        obj.intervalReference = setInterval(() => {
          if (obj && (
            obj.status === 'SUCCESSFUL' ||
            obj.status === 'FAILED' ||
            obj.status === 'BLOCK'
          )) {
            // stop interval on job finished
            obj.intervalReference = clearTimeout(obj.intervalReference);
          } else {
            obj.refreshFunction();
          }
        }, this.pollInterval * 1000);
      } else {
        obj.intervalReference = clearTimeout(obj.intervalReference);
      }
    },
    'removeFromList': function(analysisId) {
      return this.unicoreAPI.deleteJobFromAssociatedFile(
        this.simulationDetails.files,
        analysisId
      )
      .then(() => {
        let listTemp = this.analysisDetails.filter((analysis) => {
          return analysis.id !== analysisId;
        });
        this.analysisDetails = listTemp;
      });
    },
  },
  'created': function() {
    document.getElementById('frameTemplateTitle').innerText = 'Simulation Details';
  },
  'mounted': function() {
    if (this.computerParam) {
      this.computer = this.computerParam;
    }
    if (this.jobParam) {
      this.job = this.jobParam;
      this.fillJobs(this.job);
    }
    if (this.jobParam == null) {
      this.getJobById();
    }
    // poll check. I do the assigment to treat it like first time.
    // Otherwithse the toggle will negate again.
    this.simulationDetails.autorefresh = !this.simulationDetails.autorefresh;
    this.analysisDetails.autorefresh = !this.analysisDetails.autorefresh;
    this.simulationDetails.refreshFunction = this.refreshJobs;
    this.toggleAutoreload(this.simulationDetails);
  },
  'beforeDestroy': function() {
    clearTimeout(this.simulationDetails.intervalReference);
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
    }
    a.button-with-icon.colored {
        color: #fff;
        background-color: #879fcb;
    }
    .collapse-title a.button-with-icon.colored {
        margin-top: 10px;
        display: inline-flex;
    }
    .log-item {
        padding: 5px 0;
        word-break: break-word;
    }
    a.no-link-style.router-link-active {
        text-decoration: none;
    }
    .detail-header {
        padding: 10px 5px;
        display: flex;
        justify-content: space-between;
        align-items: end;
        flex-wrap: wrap;
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
    .indent {
      margin-left: 20px;
    }
    div.indent:first-child {
      margin-left: 0;
    }
</style>

<style>
    .spin {
      animation: spin 2s infinite linear;
    }
    @keyframes spin {
      from {transform: rotate(0deg);}
      to {transform: rotate(359deg);}
    }
</style>
