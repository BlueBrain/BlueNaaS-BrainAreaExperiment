<template>
    <div class="simulation">
        <transition name="fade">
            <div class="app-content" v-if="!loading">
                <!-- header params -->
                <div class="duration-skip">

                    <div class="border-container model-container">
                      <h2>Model</h2>
                      <div class="subtitle">Defines the model to be loaded</div>
                      <autocomplete-targets
                        @targetChanged="modelTargetChanged"
                        :targetSelected="modelSelected"
                      ></autocomplete-targets>
                    </div>

                    <span title="Time length of stimulus duration, given in milliseconds(ms)">Duration(ms):</span>
                    <input v-model="endTime" type="number" min="0" placeholder="Duration" class="form-control" @blur="checkNegative">
                    <span title="Run without Stimulus or Report for a given duration using a large timestep. This is to get the cells past any initial transience">ForwardSkip(ms):</span>
                    <input v-model="forwardSkip" type="number" min="0" placeholder="Duration" class="form-control" @blur="checkNegative">
                    <span id="errors" class="errors" v-show="errors">{{errors}}</span>

                    <span class="grow-space"></span>
                    <a class="button-with-icon" @click="viewList">
                        <i class="material-icons">list</i>View Simulations
                    </a>
                </div>
                <!-- END header params -->

                <!-- stimulation timeline -->
                <div class="border-container">
                    <h2>Stimulations</h2>
                    <div class="subtitle">Defines pattern of stimuli to be injected into multiple locations</div>
                    <div class="row">
                        <stimulation-timeline
                            :endTime="endTime"
                            :forwardSkip="forwardSkip"
                            :defaultTarget="defaultTarget"
                            :blueConfig="blueConfig"
                            ref="stimulation"
                            class="timeline"></stimulation-timeline>
                        <target-selection @targetSelected="stimulationTargetSelected"></target-selection>
                    </div>
                </div>
                <!-- END stimulation timeline -->

                <!-- report timeline -->
                <div class="border-container">
                    <h2>Reports</h2>
                    <div class="subtitle">Controls data collection during the simulation</div>
                    <div class="row">
                        <report-timeline
                            :endTime="endTime"
                            :forwardSkip="forwardSkip"
                            :defaultTarget="defaultTarget"
                            :blueConfig="blueConfig"
                            ref="report"
                            class="report"></report-timeline>
                        <target-selection @targetSelected="reportTargetSelected"></target-selection>
                    </div>
                </div>
                <!-- END report timeline -->

                <div class="footer">
                    <div id="tip" class="tip">
                        <div class="tips">
                            <div v-for="tip in tipTexts">{{tip}}</div>
                        </div>
                        <div class="close">
                            <i class="centered material-icons" @click="closeTip">close</i>
                        </div>
                    </div>
                    <a class="button-with-icon" @click="runSimulation">
                        <i class="material-icons">play_arrow</i>Run
                    </a>
                </div>

            </div>
        </transition>
        <!-- template for configuration -->
        <modal :show="showRunForm" @changeModalVisibility="toggleModal">
            <h3 slot="header">Edit Parameters</h3>
            <div slot="content">
                <launch-form
                    @runConfigReady="runConfigReady"
                    @previewConfig="previewConfig"
                    @computerChanged="computerChanged"
                    @changeModalVisibility="toggleModal">
                </launch-form>
            </div>
        </modal>
        <!-- END template for configuration -->
    </div>
</template>

<script>
import StimulationTimeline from 'components/run-simulation/stimulation/stimulation-timeline.vue';
import ReportTimeline from 'components/run-simulation/report/report-timeline.vue';
import templateBluepyConfig from 'assets/blueconfig.json';
import Unicore from 'mixins/unicore.js';
import TargetSelection from 'components/target-selection/target-selection.vue';
import LaunchForm from 'components/run-simulation/launch-form.vue';
import Modal from 'components/shared/modal-component.vue';
import launchConfiguration from 'assets/simulation-config.json';
import autocompleteTargets from 'components/shared/autocomplete-targets.vue';
import utils from 'assets/utils.js';
export default {
  'name': 'run_simulation',
  'data': function() {
    return {
      'endTime': 50,
      'errors': '',
      'forwardSkip': null,
      'blueConfig': {},
      'loading': true,
      'unicore': Unicore,
      'modelSelected': launchConfiguration.defaultTarget,
      'header': {},
      'showRunForm': false,
      'currentComputer': launchConfiguration.default,
      'defaultTarget': launchConfiguration.defaultTarget,
      'tipTexts': [
        'You can scroll in the timeline to zoom in/out',
        'Drag the stimuli to modify its duration',
      ],
    };
  },
  'components': {
    'stimulation-timeline': StimulationTimeline,
    'report-timeline': ReportTimeline,
    'target-selection': TargetSelection,
    'launch-form': LaunchForm,
    'modal': Modal,
    'autocomplete-targets': autocompleteTargets,
  },
  'methods': {
    'toggleModal': function(value) {
      if (value) {
        this.showRunForm = value;
        return;
      }
      this.showRunForm = !this.showRunForm;
    },
    'saveConfig': function() {
      this.saveCompleteConfig(this.blueConfig)
      .then(function(message) {
        swal('Great!', 'Configuration was saved', 'success');
      }, function(error) {
        swal('Opss', 'Configuration was not saved. ' + error, 'error');
      });
    },
    'computerChanged': function(computer) {
      // runBlueConfig has the placeholder to replace the work directory
      let runBlueConfig = Object.assign({}, templateBluepyConfig.Run.Default);
      let inMemoryBlueConfig = this.blueConfig.Run.Default;
      let newPathWork = launchConfiguration[computer].pathWork;
      let placeholder = '{{WORK_DIRECTORY}}';
      Object.keys(runBlueConfig).forEach((key) => {
        if (runBlueConfig[key].toString().startsWith(placeholder)) {
          inMemoryBlueConfig[key] = runBlueConfig[key].toString().replace(placeholder, newPathWork);
        }
      });
    },
    'modelTargetChanged': function(modelTarget) {
      this.modelSelected = utils.mapAll(modelTarget);
    },
    'closeTip': function() {
      let tipElement = this.$el.querySelector('#tip');
      tipElement.classList.add('hidden');
      localStorage.setItem('showTip', false);
    },
    'runSimulation': function() {
      this.createConfig();
      this.blueConfig.Run.Default.CircuitTarget = this.modelSelected;
      if (this.checkSimulationConsistancy()) {
        this.toggleModal();
      }
    },
    'checkSimulationConsistancy': function() {
      // this will check if the model, stimulations and reports have coherence
      // only one stimulus and one report -> compare with Model
      let reportKeys = Object.keys(this.blueConfig.Report);
      let stimulusKeys = Object.keys(this.blueConfig.StimulusInject);
      let model = this.modelSelected;
      if (reportKeys.length === 0 || stimulusKeys.length === 0) {
        swal(
          'Missing parameter(s)',
          'Select at least one stimulus and one report.',
          'error'
        );
        return false;
      }
      return checkMultipleEquals([reportKeys, stimulusKeys, this.modelSelected]);

      function checkMultipleEquals(arrays) {
        let reg = new RegExp('(.+)_(.+)_');
        let targets = [];

        arrays.forEach((arr) => {
          // add String like modelSelected
          if (!Array.isArray(arr)) {targets.push(arr); return;}
          arr.map((item) => {
            let match = item.match(reg);
            if (match && match.length > 1) {
              targets.push(match[1]);
            }
          });
        });
        if (utils.unionArray(targets).length > 1) {
          return checkModel();
        }
        return true;
      }

      function checkModel() {
        if (model !== utils.mapAll('FullCA1')) {
          swal('Incorrect Model', 'Select the model as FullCA1.', 'error');
          return false;
        }
        return true;
      }
    },
    'fillToken': function(renew) {
      let that = this;
      this.getToken(renew).then(function(token) {
        that.header = {'headers': {'Authorization': token}};
      }); // from collabAuthentication
    },
    'viewList': function() {
      this.$router.push({
        'name': 'view',
        'params': {
          'computerParam': this.currentComputer,
          'statusSearch': 'ALL',
        },
      });
    },
    'stimulationTargetSelected': function(target) {
      // an event in stimulation-timeline will be called
      this.$emit('stimulationTargetSelected', target);
    },
    'reportTargetSelected': function(target) {
      // an event in report-timeline will be called
      this.$emit('reportTargetSelected', target);
    },
    'createConfig': function() {
      // modify the config object respectively
      this.$refs.stimulation.createConfig(this.blueConfig);
      this.$refs.report.createConfig(this.blueConfig);
      this.computerChanged(launchConfiguration.default);
    },
    'previewConfig': function() {
      let myjson = JSON.stringify(this.blueConfig, null, 2);
      let x = window.open();
      x.document.open();
      x.document.write('<html><body><pre>' + myjson + '</pre></body></html>');
      x.document.close();
    },
    'checkNegative': function(event) {
      if (event.target.value < 0) {
        this.errors = 'Duration and ForwardSkip should be possitive';
      } else {
        this.errors = '';
      }
    },
    'runConfigReady': function(runConfig) {
      let that = this;
      this.toggleModal();
      swal.enableLoading();
      // save config for future use
      localStorage.setItem('lastLaunchConfig', JSON.stringify({
        'blueConfig': this.blueConfig, 'runConfig': runConfig,
      }));
      let submittedJob = {};
      let files = [{'To': 'blueconfig.json', 'Data': this.blueConfig}];
      return this.unicore.submitJob(runConfig, files)
      .then((jobObject) => {
        submittedJob = jobObject;
        console.debug('starting job...');
        that.unicore.actionJob(submittedJob._links['action:start'].href);
        swal.disableLoading();
        return swal({
          'title': 'Simulation submitted!',
          'showCancelButton': true,
          'confirmButtonText': 'View Job',
          'cancelButtonText': 'OK',
          'type': 'success',
        });
      })
      .then((choice) => {
        if (choice.value) {
          this.showDetails(submittedJob, runConfig.computer);
        }
      }, (error) => {
        swal('Error launching the simulation', error.message, 'error');
      });
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
    'loadPreviousConfig': function() {
      let lastConfigString = localStorage.getItem('lastLaunchConfig');
      let bc = {}; // blueConfig (template or previous one)
      try {
        if (lastConfigString) {
          let lastConfig = JSON.parse(lastConfigString);
          if (lastConfig.blueConfig && lastConfig.runConfig) {
            bc = lastConfig.blueConfig;
            this.modelSelected = utils.unMapAll(bc.Run.Default.CircuitTarget);
          } else {throw String('No all params in previous config');}
        } else {throw String('No previous config');}
      } catch (e) {
        console.debug('No previous configuration. Loading default', e);
        bc = JSON.parse(JSON.stringify( templateBluepyConfig ));
      } finally {
        this.$set(this.$data, 'blueConfig', bc);
      }
    },
  },
  'mounted': function() {
    document.getElementById('frameTemplateTitle').innerText = 'Configure & Launch Simulations';
    this.loadPreviousConfig();
    let loadingComp = document.querySelector('#loading-component');
    if (loadingComp) {
      loadingComp.style.display = 'none';
    }
    this.endTime = this.blueConfig.Run.Default.Duration;
    this.forwardSkip = this.blueConfig.Run.Default.ForwardSkip;
    this.loading = false;
    if (localStorage.getItem('showTip') === 'false') {
      this.$nextTick(() => this.closeTip());
    }
  },
  'watch': {
    'endTime': function(newVal) {
      this.blueConfig.Run.Default.Duration = parseFloat(newVal);
    },
    'forwardSkip': function(newVal) {
      this.blueConfig.Run.Default.ForwardSkip = parseFloat(newVal);
    },
  },
};
</script>

<style scoped>
    a.button-with-icon {
        color: #fff;
        background-color: #879fcb;
        letter-spacing: .5px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        float: right;
        max-height: 30px;
    }
    .duration-skip {
        padding-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }
    .duration-skip input {
        width: 100px;
        margin: 0px 0;
        display: inline-block;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 3px #ddd;
        border-radius: 4px;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 9px;
        padding-bottom: 9px;
    }
    .duration-skip span {
        margin-left: 15px;
    }
    .simulation h2 {
        width: 100%;
        background-color: transparent;
        margin: 0 0 0 0;
        border-radius: 3px;
        font-size: 26px;
    }
    .border-container {
        background-color: rgba(216, 223, 239, 0.38);
        border-radius: 5px;
        padding: 20px 10px;
        margin: 30px 0;
    }
    .fade-enter-active, .fade-leave-active {
      transition: opacity .5s
    }
    .fade-enter, .fade-leave-to {
      opacity: 0
    }
    .right-margin a {
        margin: 0 15px 0 0;
    }
    .app-content {
      padding: 0 15px;
    }
    .app-content .duration-skip + .border-container {
        /* the first block simulation */
        margin-top: 10px;
    }
    .config-template {
        margin: 0 23%;
    }
    .config-template input {
        border-radius: 4px;
        border-style: groove;
    }
    .config-template .computer {
        min-width: 120px;
    }
    .config-template > tr {
        display: inline-flex;
        justify-content: space-between;
        width: 100%;
        align-items: center;
    }
    .row {
        display: flex;
    }
    .timeline, .report {
        flex-grow: 1;
    }
    .preview-config {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-style: solid;
        border-radius: 15px;
        border-width: 1px;
        padding: 5px 0;
    }
    .config-template tr {
        min-height: 40px;
    }
    .errors {
        background-color: #f81b00;
        color: white;
        padding: 5px;
        border-radius: 5px;
    }
    .footer {
        display: flex;
        justify-content: space-between;
        margin-left: 15px;
    }
    .model-container {
      width: 25%;
      min-width: 500px;
      display: flex;
      justify-content: space-between;
      margin: 0;
      align-items: center;
      z-index: 2;
      padding: 10px;
    }
    .model-container h2, .model-container .v-autocomplete {
      width: auto;
    }
    .model-container .subtitle {
      white-space: nowrap;
    }
    .grow-space {
      flex-grow: 1;
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
