<!--
This will get the information related to each job and pass the data to simulation-item.
This component manage each job (delete, start, create, etc).
-->
<template>
    <div class="list-simulations">
        <div class="filter">
            <span>
                <a
                    @click="resetFilter"
                    class="button-with-icon filter-icon"
                    :class="{'filter-on': filterOn}"
                    :title="filterStatus">
                    <i class="material-icons">filter_list</i>
                    Filter
                </a>
            </span>
            <span>
                <a class="button-with-icon" title="Filter by Name or ID"><i class="material-icons">fingerprint</i></a>
            </span>
            <input class="input-style" type="text" v-model="nameFilter">
            <span>
            <a class="button-with-icon" title="Status"><i class="material-icons">check_circle</i></a>
            </span>
            <select class="input-style" v-model="statusFilter">
                <option value="ALL">ALL</option>
                <option value="SUCCESSFUL">SUCCESSFUL</option>
                <option value="FAILED">FAILED</option>
                <option value="READY">READY</option>
                <option value="QUEUED">QUEUED</option>
                <option value="RUNNING">RUNNING</option>
            </select>
            <span>
            <a class="button-with-icon" title="Supercomputer to be used"><i class="material-icons">dns</i></a>
            </span>
            <select class="input-style" v-model="computerFilter">
                <option
                    v-for="computer in simulationConfig.available"
                    :key="computer"
                    :value="computer">
                    {{computer}}
                </option>
            </select>
            <span class="space-flex"></span>
            <router-link to="/" class="create-simulation-button">
                <a class="button-with-icon colored"><i class="material-icons">add</i>Create Simulation</a>
            </router-link>
            <span class="refresh" @click="refreshJobs">
                <a class="button-with-icon"><i class="material-icons">refresh</i>Reload</a>
            </span>
        </div>
        <div class="table-header">
            <span class="id">Name</span>
            <span class="status" title="Check the simulation status">Simulation Step</span>
            <span class="status" title="Check / run the analysis">Analysis Step</span>
            <span class="time">Submission Date</span>
        </div>
        <div v-if="!loading" class="simulation-items-container">
            <simulation-item
                v-for="job in viewList"
                :key="job._links.self.href"
                :job="job"
                @actionJob="actionJob"
                @deleteJob="deleteJob"
                @showDetails="showDetails(job, computerFilter)"
                @runAnalysis="runAnalysis(job)">
            </simulation-item>

            <infinite-loading
                @infinite="onInfinite"
                ref="infiniteLoading">
                <span slot="no-more"></span>
                <span slot="no-results"></span>
            </infinite-loading>
        </div>
        <!-- template for configuration -->
        <modal :show="showAnalysisForm" @changeModalVisibility="toggleModal">
            <h3 slot="header">Copy files and run analysis</h3>
            <div slot="content">
                <launch-analysis-form
                    @analysisConfigReady="analysisConfigReady"
                    :defaultAnalysisConfig="defaultAnalysisConfig"
                    :jobSelectedForValidation="jobSelectedForValidation"
                    @changeModalVisibility="toggleModal">
                </launch-analysis-form>
            </div>
        </modal>
        <!-- END template for configuration -->
    </div>
</template>

<script>
    import SimulationItem from 'components/view-simulations/simulation-item.vue';
    import InfiniteLoading from 'vue-infinite-loading';
    import unicore from 'mixins/unicore.js';
    import simulationConfig from 'assets/simulation-config.json';
    import analysisConfig from 'assets/analysis-config.json';
    import LaunchAnalysisForm from 'components/view-simulations/launch-analysis-form.vue';
    import Modal from 'components/shared/modal-component.vue';
    import templateBluepyConfig from 'assets/blueconfig.json';
    const BLOCK_STATUS = 'BLOCK';
    const LOADING_STATUS = 'LOADING';
    const SUCCESSFUL_STATUS = 'SUCCESSFUL';
    const QUEUED_STATUS = 'QUEUED';
    const RUNNING_STATUS = 'RUNNING';

    export default {
      'name': 'list_simulations',
      'components': {
        'simulation-item': SimulationItem,
        'infinite-loading': InfiniteLoading,
        'launch-analysis-form': LaunchAnalysisForm,
        'modal': Modal,
      },
      'props': ['computerParam', 'statusSearch'],
      'data': function() {
        return {
          'loading': true,
          'computerFilter': '',
          'defaultAnalysisConfig': analysisConfig,
          'simulationConfig': simulationConfig,
          'showAnalysisForm': false,
          'unicoreAPI': unicore,
          'jobs': [],
          'filteredObjects': [],
          'viewList': [],
          'readObjectIndex': 0,
          'loadIncrement': 10,
          'statusFilter': 'ALL',
          'nameFilter': '',
          'dateFilter': '',
          'filterOn': false,
          'pollInterval': 10,
          'jobSelectedForValidation': null,
        };
      },
      'computed': {
        'filterStatus': function() {
          if (this.filterOn) {
            return 'Filter is activated';
          }
        },
      },
      'methods': {
        'toggleModal': function(value) {
          if (value) {
            this.showAnalysisForm = value;
            return;
          }
          this.showAnalysisForm = !this.showAnalysisForm;
        },
        'actionJob': function(actions) {
          this.unicoreAPI.actionJob(actions.url);
          swal('Great!', actions.text, 'success');
        },
        'checkFilterIcon': function() {
          if (this.nameFilter === '' && this.statusFilter === 'ALL') {
            this.filterOn = false;
          } else {
            this.filterOn = true;
          }
        },
        'filter': function() {
          let filteredByStatus = [];
          if (this.statusFilter === 'ALL') {
            filteredByStatus = this.jobs;
          }
          this.jobs.map((job) => {
            // filter items first by status
            if (job.status === this.statusFilter) {
              filteredByStatus.push(job);
            }
          });

          let filteredById = [];
          // used filtered status to continue filtering by id
          filteredByStatus.map((job) => {
            let name = job.name.toUpperCase();
            if (name.search(this.nameFilter.toUpperCase()) !== -1) {
              filteredById.push(job);
            }
          });

          // set color to the filter if there is one
          this.checkFilterIcon();
          // sort by date
          this.readObjectIndex = this.loadIncrement;
          filteredById.sort((a, b) => {
            if (a.submissionTime > b.submissionTime) return -1;
            return 1;
          });
          this.filteredObjects = filteredById;
          // put items in the view
          this.viewList = filteredById.slice(0, this.loadIncrement);
          this.loading = false;
          // reset inifiteloading so it checks the next time if there are more items
          this.$nextTick(() => { // wait until the infinite component is loaded
            this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
            // TODO: add id in as parameter (in general it will be "")
            this.$router.replace({
              'name': 'view',
              'params': {
                'computerParam': this.computerFilter,
                'statusSearch': this.statusFilter,
              },
            });
          });
        },
        'getAnalysisInfo': function(simulationJob) {
          /*  get the location of the analysis based on the mapping file
            that we save in the simulation and then the validation image */
          this.unicoreAPI.getAssociatedLocation(simulationJob._links.workingDirectory.href)
          .then((analysisObject) => {
            if (typeof(analysisObject) === 'object' &&
              analysisObject.length === 0) {
              // the file is empty or it is not there
              return this.setMultipleAnalysisStatus(simulationJob, []);
            }
            this.getStatus(analysisObject, simulationJob);
          });
        },
        'getStatus': function(analysisObject, simulationJob) {
          let multipleAnalysis = [];
          analysisObject.forEach((analysis) => {
            // fill the information for all the analysis
            this.unicoreAPI.getJobProperties(analysis._links.self.href)
            .then((jobInfo) => {
              multipleAnalysis.push(jobInfo.status);
              this.setMultipleAnalysisStatus(simulationJob, multipleAnalysis);
            });
          });
        },
        'setMultipleAnalysisStatus': function(simulationJob, statusList) {
          this.$set(simulationJob, 'multipleAnalysisStatus', statusList.sort());
        },
        'removeFromList': function(url) {
          this.jobs.map((job, index, arr) => {
            if (job._links.self.href === url) {
              this.jobs.splice(index, 1);
              return;
            }
          });
          this.filter();
        },
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
          }).then((choice) => {
            if (choice.value === true) {
              this.unicoreAPI.deleteJob(url)
              .then(() => {
                this.removeFromList(url);
              });
            }
          })
          .catch(this.handleError);
        },
        'showDetails': function(job, computer) {
          let url = job._links.self.href;
          let id = url.substr(url.lastIndexOf('/') + 1);
          this.$router.push({'name': 'details', 'params': {
            'jobId': id,
            'jobParam': job,
            'computerParam': computer,
          }});
        },
        'refreshJobs': function() {
          this.loading = true;
          let loadingComp = document.getElementById('loading-component');
          if (loadingComp && loadingComp.style.display === 'none') {
            loadingComp.style.display = 'block';
          }
          this.jobs = [];
          let computerRequested = this.computerFilter;
          this.unicoreAPI.getAllJobsExapandedWithChildren(this.computerFilter)
          .then((resultsArray) => {
            let onlySimulations = resultsArray.filter((simulation) => {
              if (simulation.children.includes(`/${analysisConfig.configFileName}`)) {
                // it is an analysis that should be removed
                return false;
              }
              if (!simulation.children.includes('/out.dat') &&
                  simulation.status === SUCCESSFUL_STATUS) {
                // without out.dat no analysis should be run
                this.setMultipleAnalysisStatus(simulation, [BLOCK_STATUS]);
                // flag to show the warning icon on the list
                simulation['noOut'] = true;
              } else if (simulation.status === SUCCESSFUL_STATUS) {
                this.setMultipleAnalysisStatus(simulation, [LOADING_STATUS]);
                this.getAnalysisInfo(simulation);
              } else {
                this.setMultipleAnalysisStatus(simulation, [BLOCK_STATUS]);
              }
              return true;
            });

            if (computerRequested === this.computerFilter) {
              // make sure we don't load other jobs if we change the selector
              // because of async call
              this.filteredObjects = this.jobs = onlySimulations;
              this.filter();
              if (loadingComp) {
                this.$nextTick(() => {
                  loadingComp.style.display = 'none';
                });
              }
            }
          })
          .catch(this.handleError);
        },
        'resetFilter': function() {
          this.nameFilter = '';
          this.statusFilter = 'ALL';
        },
        'runAnalysis': function(job) {
          this.showAnalysisForm = true;
          // set the origin computer
          this.defaultAnalysisConfig.from = this.computerFilter;
          this.jobSelectedForValidation = job;
          // after the form will return to analysisConfigReady
        },
        'onInfinite': function($state) {
          if (this.loading) return; // avoid processing things while loading
          if (this.readObjectIndex > this.filteredObjects.length) {
            $state.complete();
            return;
          }
          let newItems = [];
          // obtain the next elements
          newItems = this.filteredObjects.slice(this.readObjectIndex, this.readObjectIndex + this.loadIncrement);
          this.readObjectIndex += this.loadIncrement;
          this.viewList = this.viewList.concat(newItems);
          $state.loaded();
        },
        'startReloadJob': function(simulationJob) {
          let poolAnalysis = function(simulationJob) {
            if (simulationJob.autorefresh) {
              simulationJob['intervalReference'] = setInterval(() => {
                let statusList = simulationJob.multipleAnalysisStatus;
                if (!statusList.includes(LOADING_STATUS) &&
                                !statusList.includes(QUEUED_STATUS) &&
                                !statusList.includes(RUNNING_STATUS)) {
                  // stop interval on job finished
                  simulationJob['intervalReference'] = clearTimeout(simulationJob.intervalReference);
                } else {
                  this.getAnalysisInfo.call(this, simulationJob);
                }
              }, this.pollInterval * 1000);
            } else {
              simulationJob['intervalReference'] = clearTimeout(simulationJob.intervalReference);
            }
          };
          simulationJob['autorefresh'] = true;
          simulationJob['intervalReference'] = null;
          // add this status to show the sync
          simulationJob.multipleAnalysisStatus.push(LOADING_STATUS);
          poolAnalysis.call(this, simulationJob);
        },
        'analysisConfigReady': function(analysisConfig) {
          this.toggleModal();
          swal.enableLoading();
          let analysisInfo = {};
          analysisConfig.from.workingDirectory = this.jobSelectedForValidation._links.workingDirectory.href;

          this.unicoreAPI.submitAnalysis(
            analysisConfig,
            this.defaultAnalysisConfig.script,
            this.defaultAnalysisConfig.filesToAvoidCopy
          ).then((analysis) => {
            analysisInfo = analysis;
            if (analysisInfo.avoidCopy) return;
            return this.changeBlueConfigPaths(
              analysisConfig.to.workingDirectory,
              analysisConfig.to.computer
            );
          })
          .then(() => {
            let startURL = analysisInfo.destinationJob._links['action:start'].href;
            console.log('starting analysis...');
            this.unicoreAPI.actionJob(startURL);
            // pool the status of the analysis
            this.startReloadJob(this.jobSelectedForValidation);
            // swal.enableLoading();
            return swal({
              'title': 'Analysis started!',
              'text': 'Analysis results can take a long time',
              'showCancelButton': true,
              'confirmButtonText': 'View Job',
              'cancelButtonText': 'OK',
              'type': 'success',
            });
          })
          .then((choice) => {
            if (choice.value) {
              this.showDetails(
                this.jobSelectedForValidation,
                analysisConfig.from.computer
              );
            }
          })
          .catch(this.handleError);
        },
        'changeBlueConfigPaths': function(workingDirectory, computer) {
          let blueConfigName = 'blueconfig.json';
          let serverBlueConfig = `${workingDirectory}/files/${blueConfigName}`;
          return this.unicoreAPI.getFiles(serverBlueConfig)
          .then((blueConfig) => {
            // templateBluepyConfig has the placeholder to replace the work directory
            let analysisBlueConfig = Object.assign({}, templateBluepyConfig.Run.Default);
            let inMemoryBlueConfig = blueConfig.Run.Default;
            let newPathWork = this.simulationConfig[computer].pathWork;
            let placeholder = '{{WORK_DIRECTORY}}';
            Object.keys(analysisBlueConfig).forEach((key) => {
              if (analysisBlueConfig[key].toString().startsWith(placeholder)) {
                inMemoryBlueConfig[key] = analysisBlueConfig[key].toString().replace(placeholder, newPathWork);
              }
            });
            let uploadFile = {
              'Data': JSON.stringify(blueConfig),
              'To': blueConfigName,
            };
            return this.unicoreAPI.uploadData(uploadFile, `${workingDirectory}/files`);
          });
        },
        'handleError': function(error) {
          return swal('Error', error.message, 'error');
        },
      },
      'mounted': function() {
        if (this.statusSearch) {
          this.statusFilter = this.statusSearch.toUpperCase();
          this.checkFilterIcon();
        }
        this.computerFilter = this.computerParam.toUpperCase();
      },
      'watch': {
        'statusFilter': function() {
          if (!this.loading) {
            this.filter();
          }
        },
        'nameFilter': function() {
          if (!this.loading) {
            this.filter();
          }
        },
        'computerFilter': function(newVal, oldVal) {
          if (newVal !== oldVal) {
            this.refreshJobs();
          }
        },
      },
    };
</script>

<style scoped>
    .list-simulations {
        padding: 0 15px;
    }
    .table-header {
        display: flex;
        padding: 5px 15px;
        font-weight: bold;
        font-size: 20px;
        margin: 0 5px;
        border-radius: 5px;
        border: 1px solid;
    }
    .table-header span.id {
        width: 37%;
        text-align: center;
    }
    .table-header span.status {
        width: 18%;
        cursor: help;
    }
    .table-header span.time {
        width: 32%;
        text-align: end;
    }
    .filter {
        padding: 10px 5px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    .space-flex {
        flex-grow: 1;
    }
    a.button-with-icon {
        letter-spacing: .5px;
        display: flex;
        cursor: pointer;
        align-items: center;
        margin: 0 10px;
    }
    a.button-with-icon.colored {
        color: #fff;
        background-color: #879fcb;
        padding: 5px 10px;
        border-radius: 3px;
        margin: 0;
    }
    a.create-simulation-button.router-link-active {
        text-decoration: none;
    }
    .filter-icon {
        border-radius: 5px;
        padding: 5px;
    }
    .filter-icon.filter-on {
        background-color: red;
        color: white;
    }
    .input-style {
        height: 33px;
        width: 130px;
        margin: 0px 0;
        display: inline-block;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 3px #ddd;
        border-radius: 4px;
        box-sizing: border-box;
        padding: 6px 10px;
    }
    .config-template {
        overflow: hidden;
        text-align: center;
        margin: 0 23%;
    }
    .config-template .subtitle {
        padding: 10px;
        display: block;
    }
    .config-template > tr {
        display: inline-flex;
        justify-content: space-between;
        width: 100%;
    }
    .config-template input {
        border-radius: 4px;
        border-style: groove;
    }
</style>

<style>
    /* disable the bounce effect sweetalerts*/
    @-webkit-keyframes showSweetAlert {
        0% {
            -webkit-transform: scale(0.7);
            transform: scale(0.7);
        }

        100% {
            -webkit-transform: scale(1);
            transform: scale(1);
        }
    }
    @keyframes showSweetAlert {
        0% {
            -webkit-transform: scale(0.7);
            transform: scale(0.7);
        }

        100% {
            -webkit-transform: scale(1);
            transform: scale(1);
        }
    }
    .swal2-content td, .swal2-content th {
        /*border: 1px solid #dddddd;*/
        text-align: left;
        padding: 8px;
    }
    .swal2-content table {
        margin: 0 auto;
    }
</style>
