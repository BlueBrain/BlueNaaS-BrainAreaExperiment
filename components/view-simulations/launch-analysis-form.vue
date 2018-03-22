<template>
    <table class="launch-form">
        <div class="form-group">
            <label class="control-label">Title:</label>
            <div class="controls">
                <input type="text" name="" class="title" v-model="title" placeholder="Job's title">
            </div>
        </div>

        <div class="form-group">
            <label class="control-label">Target:</label>
            <div class="controls" id="targetSelector">
                <target-autocomplete
                    @targetChanged="targetChanged"
                    :targetSelected="getTargetsBasedBlueConfig[0]"
                    :itemsAvailable="getTargetsBasedBlueConfig"
                ></target-autocomplete>
            </div>
        </div>
        <span v-if="!sameComputer">
          <div class="form-group">
            <label class="control-label">Origin:</label>
            <div class="controls">{{ from.computer }}</div>
          </div>
          <div class="form-group">
              <label class="control-label">Project:</label>
              <div class="controls">
                  <select
                      class="project"
                      name="Name of the project to run jobs"
                      v-model="from.projectSelected">
                      <option v-for="project in from.projectsAvailable">
                          {{ project }}
                      </option>
                  </select>
                  <i v-if="from.projectsAvailable.length < 1"
                  class="material-icons spin">autorenew</i>
              </div>
          </div>
          <div class="form-group">
              <label class="control-label">Destination: </label>
              <div class="controls">{{ to.computer }}</div>
          </div>
          <div class="form-group">
              <label class="control-label">Project:</label>
              <div class="controls">
                  <select
                      class="project"
                      name="Name of the project to run jobs"
                      v-model="to.projectSelected">
                      <option v-for="project in to.projectsAvailable">
                          {{ project }}
                      </option>
                  </select>
                  <i v-if="to.projectsAvailable.length < 1"
                  class="material-icons spin">autorenew</i>
              </div>
          </div>
        </span>
        <span v-else>
          <div class="form-group">
            <label class="control-label">Project:</label>
            <div class="controls">
                <select
                    class="project"
                    name="Name of the project to run jobs"
                    v-model="to.projectSelected">
                    <option v-for="project in to.projectsAvailable">
                        {{ project }}
                    </option>
                </select>
                <i v-if="to.projectsAvailable.length < 1"
                class="material-icons spin">autorenew</i>
            </div>
          </div>
        </span>
        <div class="form-group">
            <label class="control-label">Analysis: </label>
            <div class="controls analysis-list">
                <div
                    class="checkbox-container"
                    v-for="analysis in analysisToRun"
                >
                    <input
                        class="small"
                        type="checkbox"
                        :id="analysis.param"
                        :value="analysis.param"
                        v-model="checkedAnalysis"
                    >
                    <label :for="analysis.param">{{ analysis.name }}</label>
                    <select
                      v-if="analysis['report_select']"
                      v-model="reportForAnalysis"
                      class="margin-subitem"
                    >
                      <option v-for="report in getReports">
                        {{report}}
                      </option>
                    </select>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label class="control-label">Cells (number): </label>
            <div class="controls">
                <input type="number" v-model="numberOfCells" placeholder="Cells (number) to visualize" id="cellsNumber">
            </div>
        </div>
        <div class="footer">
            <div id="tip" class="tip">
                <div class="tips">
                    <div v-for="tip in tipTexts">{{tip}}</div>
                </div>
                <div class="close">
                    <i class="centered material-icons" @click="closeTip">close</i>
                </div>
            </div>
        </div>
        <div class="button-container">
            <input
              :disabled="!from.projectSelected || !to.projectSelected"
              class="ok-button" type="button" @click="editItem" value="Ok">
            <input class="cancel-button" type="button" @click="closeForm" value="Cancel">
        </div>
    </table>
</template>

<script>
    import 'assets/css/simulation.css';
    import targetAutocomplete from 'components/shared/autocomplete-targets.vue';
    import utils from 'assets/utils.js';
    import Vue from 'vue';
    import Autocomplete from 'v-autocomplete';
    import autocompleteTemplate from 'components/shared/autocomplete-template.vue';
    // You need a specific loader for CSS files like https://github.com/webpack/css-loader
    import 'v-autocomplete/dist/v-autocomplete.css';
    Vue.use(Autocomplete);
    import targetList from 'assets/targetList.json';
    import {getUser} from 'mixins/unicore.js';

    export default {
      'props': ['defaultAnalysisConfig', 'jobSelectedForValidation'],
      'data': function() {
        return {
          'from': {
            'workingDirectory': null,
            'computer': this.defaultAnalysisConfig.from,
            'projectsAvailable': [],
            'projectSelected': null,
          },
          'to': {
            'workingDirectory': null, // create a new one
            'computer': this.defaultAnalysisConfig.to,
            'projectsAvailable': [],
            'projectSelected': null,
          },
          'files': [], // this will be filled in later in UnicoreAPI
          'nodes': 1,
          'runtime': 300,
          'title': '',
          'analysisToRun': this.defaultAnalysisConfig.analysisAvailable,
          'checkedAnalysis': [],
          'reportForAnalysis': '',
          'numberOfCells': 5,
          'tipTexts': [
            `To run the Analysis we need to copy the output from the Simulation to ${this.defaultAnalysisConfig.to} (because that machine has the analysis packages installed) and run the new Analysis Job.`,
            'The results of the Analysis will be shown in the detailed page.',
          ],
          'target': 'slice-4',
          'autocompleteTemplate': autocompleteTemplate,
          'targetList': targetList,
          'filteredTargets': [],
        };
      },
      'components': {
        'target-autocomplete': targetAutocomplete,
        'v-autocomplete': Autocomplete,
      },
      'mounted': function() {
        if (localStorage.getItem('showAnalysisTip') === 'false') {
          this.$nextTick(() => this.closeTip());
        }
        this.getUserProjects();
      },
      'methods': {
        'editItem': function() {
          this.title = utils.filterName(this.title);
          if (this.checkInputs()) {
            this.$emit('analysisConfigReady', this.$data);
          }
        },
        'checkInputs': function() {
          let that = this;
          if (!this.target) {
            showAlert('#targetSelector');
            return false;
          }
          if (this.numberOfCells < 1) {
            showAlert('#cellsNumber');
            return false;
          }
          return true;

          function showAlert(id) {
            let targetInput = that.$el.querySelector(id);
            targetInput.classList.toggle('alert');
            setTimeout(() => {
              targetInput.classList.toggle('alert');
            }, 1500);
          }
        },
        'closeForm': function() {
          this.$emit('changeModalVisibility', false);
        },
        'closeTip': function() {
          let tipElement = this.$el.querySelector('#tip');
          tipElement.remove();
          localStorage.setItem('showAnalysisTip', false);
        },
        'targetChanged': function(newTarget) {
          this.target = newTarget;
        },
        'getUserProjects': function() {
          getUser(this.defaultAnalysisConfig.from).then((user) => {
            this.from.projectsAvailable = user.client.xlogin.availableUIDs;
            this.from.projectSelected = this.from.projectsAvailable[0];
          });
          getUser(this.defaultAnalysisConfig.to).then((user) => {
            this.to.projectsAvailable = user.client.xlogin.availableUIDs;
            this.to.projectSelected = this.to.projectsAvailable[0];
          });
        },
      },
      'computed': {
        'getReports': function() {
          let reports = [];
          this.jobSelectedForValidation.children.map((file) => {
            if (file.endsWith('.bbp')) {
              // removes the / and .bbp
              reports.push(file.substr(1, file.length - 5));
            }
          });
          this.reportForAnalysis = reports[0];
          return reports;
        },
        'getTargetsBasedBlueConfig': function() {
          let targetsNames = [];
          this.getReports.map((reportName) => {
            let matched = reportName.match('(.*)_report');
            if (matched && matched.length > 1) {
              let target = matched[1];
              targetsNames.push(target);
            }
          });
          if (targetsNames.length > 0) {
            return targetsNames;
          }
          return [this.target];
        },
        'sameComputer': function() {
          return (this.from.computer === this.to.computer);
        },
      },
      'watch': {
        'to.projectSelected': function(newVal) {
          this.from.projectSelected = newVal;
        },
      },
    };
</script>

<style scoped>
    .launch-form {
        width: 100%;
    }
    .analysis-list {
        flex-direction: column;
    }
    .analysis-list .checkbox-container {
        border-style: solid;
        border-radius: 5px;
        border-width: 1px;
        border-color: lightgray;
        margin-bottom: 5px;
        padding: 5px;
    }
    .analysis-list .small {
        width: 15px;
    }
    .margin-subitem {
        margin-left: 25px;
    }
    .alert {
      background-color: red;
    }
    .spin {
      -webkit-animation: spin 2s infinite linear;
    }
    @-webkit-keyframes spin {
      0%  {-webkit-transform: rotate(0deg);}
      100% {-webkit-transform: rotate(360deg);}
    }
</style>