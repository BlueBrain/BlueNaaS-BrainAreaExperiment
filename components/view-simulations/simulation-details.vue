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
                <div class="tools">
                  <a class="button-with-icon colored" @click="returnList"><i class="material-icons">arrow_back</i>Simulation List</a>
                  <!-- <a class="button-with-icon colored small" @click="launchVisualization">
                      <i class="material-icons">visibility</i>
                      Visualize Simulation
                  </a> -->
                  <a class="button-with-icon refresh" @click="refreshJobs" title="Poll manually">
                    <i class="material-icons">refresh</i>Reload
                  </a>
                </div>
            </div>
            <div class="detail-content">
                <collapse-title title="Analysis" :collapsed="false" @expanded="getAnalysisInfo()">
                    <div slot="element">
                        {{getAnalysisOverallStatus}}
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
                            <i
                              v-if="isRunning(analysis.status)"
                              class="material-icons spin">autorenew
                            </i>
                            <analysis
                              :itemDetails="analysis"
                              @analysisLogRequest="getAnalysisLog">
                            </analysis>
                        </div>
                    </div>
                </collapse-title>

                <collapse-title title="BlueConfig" :collapsed="true" @expanded="getBlueConfig()">
                    <div slot="element">
                        <display-or-download
                          name="blueconfig"
                          :fileContent="simulationDetails.blueconfig"
                          :isLoadingObj="isLoading">
                        </display-or-download>
                    </div>
                </collapse-title>

                <collapse-title title="Unicore Logs" :collapsed="true">
                    <div slot="element">
                        <display-or-download
                          name="unicore_log"
                          :fileContent="simulationDetails.logParsed"
                          :isLoadingObj="isLoading">
                        </display-or-download>
                    </div>
                </collapse-title>

                <collapse-title title="Stderr" :collapsed="true" @expanded="getFiles('stderr', simulationDetails)">
                    <div slot="element" class="log-item" >
                        <display-or-download
                          name="stderr"
                          :fileContent="simulationDetails.stderr"
                          :isLoadingObj="isLoading">
                        </display-or-download>
                    </div>
                </collapse-title>

                <collapse-title title="Stdout" :collapsed="true" @expanded="getFiles('stdout', simulationDetails)">
                    <div slot="element" class="log-item">
                        <display-or-download
                          name="stdout"
                          :fileContent="simulationDetails.stdout"
                          :isLoadingObj="isLoading">
                        </display-or-download>
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
import displayOrDownload from 'components/shared/display-or-download.vue';
import visualizationConfig from 'assets/visualization-config.json';
import {urlToId, replaceMultiplePaths, replaceConst, isRunning} from 'assets/utils.js';

const QUEUED_STATUS = 'QUEUED';

export default {
  'name': 'simulationDetails',
  'props': ['jobParam', 'jobId', 'computerParam'],
  'data': function() {
    return {
      'loading': true,
      'computer': 'JURECA',
      'unicoreAPI': Unicore,
      'job': null,
      'pollInterval': 5 * 1000, // seconds
      'isLoading': {}, // for save the timeout of the stderr, stdout
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
        'files': '',
        'status': '',
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
      'simulationUserProject': '',
      isRunning,
    };
  },
  'components': {
    'collapse-title': CollapseTitle,
    'item-summary': ItemSummary,
    'analysis': Analysis,
    'display-or-download': displayOrDownload,
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
      if (this.job && this.simulationDetails.status === 'SUCCESSFUL') {
        setTimeout(() => this.getAnalysisInfo(), this.pollInterval / 3);
      }
      if (!this.simulationDetails.logParsed || !this.simulationUserProject) {
        this.$set(this.isLoading, 'unicore_log', false);
        this.$set(this.simulationDetails, 'logParsed', this.parseLog(this.job));
        this.simulationUserProject = this.unicoreAPI.getProjectSelectedByLog(this.job.log);
        console.debug('Using project for details', this.simulationUserProject);
      }
    },
    'getFiles': function(fileName, destination) {
      let url = this.simulationDetails.files + '/files/' + fileName;
      this.$set(this.isLoading, fileName, true);
      console.debug('Loading content', fileName);
      return this.unicoreAPI.getFiles(url, this.simulationUserProject)
      .then((output) => {
        this.setFileContent(destination, fileName, output);
      }, () => {
        if (isRunning(this.job.status)) {
          setTimeout(() => {
            this.getFiles(fileName, destination);
          }, this.pollInterval);
        } else {
          let e = `No file ${fileName} found`;
          this.setFileContent(destination, fileName, e);
          console.error(e);
        }
      });
    },
    'getBlueConfig': function() {
      let destination = this.simulationDetails;
      let fileName = 'BlueConfig';
      let attributeName = 'blueconfig';
      let url = this.simulationDetails.files + '/files/' + fileName;
      console.debug('Loading content', fileName);
      this.$set(this.isLoading, attributeName, true);
      this.unicoreAPI.getFiles(url, this.simulationUserProject)
      .then((output) => {
        this.setFileContent(destination, attributeName, output);
        // destination.blueconfig = output.split('\n');
      }, (error) => {
        fileName = 'blueconfig.json';
        url = this.simulationDetails.files + '/files/' + fileName;
        this.unicoreAPI.getFiles(url, this.simulationUserProject)
        .then((output) => {
          this.setFileContent(destination, attributeName, output);
          // destination.blueconfig = JSON.stringify(output, null, 2).split('\n');
        }, (error) => {destination.blueconfig = ['No BlueConfig available'];});
      });
    },
    'getAnalysisInfo': function() {
      /*  get the location of the analysis based on the mapping file
          that we save in the simulation and then the analysis image */
      if (this.job && this.simulationDetails.status === 'SUCCESSFUL') {
        this.analysisDetails = []; // reset all the analysis
        this.unicoreAPI.getAssociatedLocation(this.simulationDetails.files, this.simulationUserProject)
        .then((analysisObject) => {
          // an array of all the analysis associated with simulation
          if (analysisObject === '') { // no analysis
            return;
          }
          analysisObject.forEach((analysis) => {
            let childAnalysis = Object.assign({}, this.analysisDetailTemplate);
            childAnalysis.jobURL = analysis._links.self.href;
            childAnalysis.workingDirectory = analysis._links.workingDirectory.href;
            childAnalysis.id = analysis._links.self.href.split('/').pop();
            this.refreshAnalysis(analysisConfig, childAnalysis);
            this.analysisDetails.push(childAnalysis);
          });
        });
      }
    },
    'refreshAnalysis': function(analysisConfig, childAnalysis) {
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
    'getAnalysisImage': function(analysisURL, plotName, childAnalysis) {
      this.unicoreAPI.getImage(`${analysisURL}/files/${plotName}.png`)
      .then((plot) => {
        // is a blob content
        this.setFileContent(childAnalysis, plotName, plot, true);
      }, (error) => {
        console.debug('No analysis image available yet');
      });
    },
    'getAnalysisStatus': function(analysisURL, childAnalysis) {
      return this.unicoreAPI.getJobProperties(analysisURL)
      .then((jobInfo) => {
        childAnalysis.status = jobInfo.status;
        childAnalysis.submissionTime = jobInfo.submissionTime;
        childAnalysis.name = jobInfo.name;
      });
    },
    'getAnalysisLog': function(childAnalysis) {
      let url = `${childAnalysis.workingDirectory}/files/stderr`;
      console.debug('Get analysis log');
      this.unicoreAPI.getFiles(url)
      .then((stderr) => {
        this.setFileContent(childAnalysis, 'log', stderr);
      })
      .catch((noFile) => {
        let log = [];
        if (childAnalysis.status === QUEUED_STATUS) {
          log.push('No log available yet');
          log.push('Analysis ' + QUEUED_STATUS);
        } else {
          log.push('No log available');
          log.push('Job failed before script was executed');
        }
        this.$set(childAnalysis, 'log', log);
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
    'setFileContent': function(destination, name, fileContent, isBlob = false) {
      // TODO: avoid loading the same file multiple times because of
      // collaps and expand multiple times
      if (isRunning(this.job.status)) {
        setTimeout(() => {
          this.getFiles(name, this.simulationDetails);
        }, this.pollInterval);
      };
      if (!isBlob) {
        if (typeof fileContent === 'object') {
          fileContent = JSON.stringify(fileContent, null, 2);
        }
        this.$set(destination, name, fileContent.split('\n'));
        this.$set(this.isLoading, name, false);
        console.debug('++ Loaded content', name);
      } else {
        let reader = new FileReader();
        reader.onloadend = () => {
          this.$set(destination, name, reader.result);
          this.$set(this.isLoading, name, false);
        };
        reader.readAsDataURL(fileContent);
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
        }, this.pollInterval);
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
    'launchVisualization': function() {
      swal.enableLoading();
      let promisePhysicalLocation = this.unicoreAPI.jobUrlToPhysicalLocation(
        this.job._links.self.href,
        this.simulationUserProject
      );

      let promiseGetReport = this.unicoreAPI.getFilesToCopy(
        `${this.job._links.workingDirectory.href}/files`,
        this.simulationUserProject,
        visualizationConfig.filesToAvoidCopy
      ).then((filesToCopy) => {
        let reportMap = {};
        filesToCopy.map((name) => {
          if (name.endsWith('.bbp')) {
            name = name.replace('.bbp', '');
            reportMap[name] = name;
          }
        });
        if (Object.keys(reportMap).length > 1) {
          // more than one report so select which one
          return swal({
            'title': 'Select Report to Visualize',
            'input': 'select',
            'inputOptions': reportMap,
            'inputPlaceholder': 'Select Report',
            'showCancelButton': true,
          })
          .then((selection) => {
            let finalReport = selection.value;
            if (selection.value === '') {
              finalReport = Object.keys(reportMap)[0];
            }
            return finalReport;
          });
        }
        return Object.keys(reportMap)[0];
      });

      let promiseChangeBlueConfigPaths = this.unicoreAPI.getFiles(
        `${this.job._links.workingDirectory.href}/files/BlueConfig`,
        this.simulationUserProject
      ).then((blueConfig) => {
        return replaceMultiplePaths(blueConfig, visualizationConfig.BlueConfigPath);
      });

      return Promise.all([promisePhysicalLocation, promiseGetReport, promiseChangeBlueConfigPaths])
      .then(([physicalLocation, report, blueConfig]) => {
        console.debug('Visualizing report', report);
        // add BlueConfig because I had to move the new with new paths for Viz
        visualizationConfig.scripts['BlueConfig'] = blueConfig;
        let fileNames = Object.keys(visualizationConfig.scripts);
        let inputs = [];
        // avoid copy the simulation input
        let onlyInputs = true;
        let moveObject = {
          'computer': this.computer,
          'projectSelected': this.simulationUserProject,
          'nodes': 1,
          'runtime': 100,
          'title': 'Vizualization for ' + this.job.name,
          'isViz': true, // to use the head node that has network for ssh
        };

        fileNames.forEach((fileName) => {
          let data = visualizationConfig.scripts[fileName];
          if (Array.isArray(data)) data = data.join('\n');
          if (data.includes('{{BASE}}')) {
            data = data.replace(/{{BASE}}/g, physicalLocation);
          }
          if (data.includes('{{REPORTNAME}}')) {
            data = data.replace(/{{REPORTNAME}}/g, report);
          }
          if (data.includes('{{CIRCUITTARGET}}')) {
            let match = report.match(new RegExp('(.*)_report_'));
            if (match.length > 1) {
              data = data.replace(/{{CIRCUITTARGET}}/g, match[1]);
            }
          }

          data = replaceConst(data, visualizationConfig.const);

          inputs.push({
            'To': fileName,
            'Data': data,
          });
        });
        console.debug('Submiting job for visualization');
        return this.unicoreAPI.submitJob(moveObject, inputs, onlyInputs);
      })
      .then((newJob) => {
        console.debug('starting job...');
        let newJobId = urlToId(newJob._links.self.href).id;
        console.debug('Visualization job id', newJobId);
        this.unicoreAPI.actionJob(newJob._links['action:start'].href);
        let input = {
          'To': 'job_link.txt',
          'Data': newJobId,
        };
        this.unicoreAPI.uploadData(
          input,
          this.job._links.workingDirectory.href + '/files',
          this.simulationUserProject
        );
        swal.disableLoading();
        return swal({
          'title': 'Visualization Job Was Submitted!',
          'html': `<p>We are copying the files... </p>
                  <p>THIS CAN TAKE A WHILE. </p>`,
          'type': 'success',
          'showCancelButton': true,
          'focusConfirm': true,
          'confirmButtonText': 'Open Brayns',
        }).then((choice) => {
          if (choice.value) {
            window.open(
              'https://bbp-brayns.epfl.ch/?host=https://brayns.humanbrainproject.org',
              '_blank'
            );
          }
        });
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
    this.simulationDetails.refreshFunction = this.refreshJobs;
    this.$set(this.isLoading, 'unicore_log', true);
    this.toggleAutoreload(this.simulationDetails);
  },
  'computed': {
    'getAnalysisOverallStatus': function() {
      if (isRunning(this.simulationDetails.status)) {
        return 'Simulation not finished yet';
      }
      if (this.analysisDetails.length === 0 &&
        this.simulationDetails.intervalReference) {
        return 'Loading ...';
      }
      if (this.analysisDetails.length === 0 &&
        !this.simulationDetails.intervalReference) {
        return 'No analysis run';
      }
    },
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
  .spin {
    animation: spin 2s infinite linear;
  }
  @keyframes spin {
    from {transform: rotate(0deg);}
    to {transform: rotate(359deg);}
  }
  @media (max-width: 550px) {
    .detail-header {
      flex-wrap: wrap;
    }
  }
</style>
