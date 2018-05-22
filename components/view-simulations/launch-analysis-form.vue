<template>
  <table class="launch-form">
    <div class="form-group">
      <label class="control-label">Title:</label>
      <div class="controls">
        <input
          v-model="title"
          type="text"
          name=""
          class="title"
          placeholder="Job's title">
      </div>
    </div>

    <div class="form-group">
      <label class="control-label">Target:</label>
      <div
        id="targetSelector"
        class="controls">
        <target-autocomplete
          :target-selected="getTargetsBasedBlueConfig[0]"
          :items-available="getTargetsBasedBlueConfig"
          @targetChanged="targetChanged"/>
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
            v-model="from.projectSelected"
            class="project"
            name="Name of the project to run jobs">
            <option
              v-for="project in from.projectsAvailable"
              :key="project">
              {{ project }}
            </option>
          </select>
          <i
            v-if="from.projectsAvailable.length < 1"
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
            v-model="to.projectSelected"
            class="project"
            name="Name of the project to run jobs">
            <option
              v-for="project in to.projectsAvailable"
              :key="project">
              {{ project }}
            </option>
          </select>
          <i
            v-if="to.projectsAvailable.length < 1"
            class="material-icons spin">autorenew</i>
        </div>
      </div>
    </span>
    <span v-else>
      <div class="form-group">
        <label class="control-label">Project:</label>
        <div class="controls">
          <select
            v-model="to.projectSelected"
            class="project"
            name="Name of the project to run jobs">
            <option
              v-for="project in to.projectsAvailable"
              :key="project">
              {{ project }}
            </option>
          </select>
          <i
            v-if="to.projectsAvailable.length < 1"
            class="material-icons spin">autorenew</i>
        </div>
      </div>
    </span>
    <div class="form-group">
      <label class="control-label">Analysis: </label>
      <div class="controls analysis-list">
        <div
          v-for="analysis in analysisToRun"
          :key="analysis.param"
          class="checkbox-container"
        >
          <input
            :id="analysis.param"
            :value="analysis.param"
            v-model="checkedAnalysis"
            class="small"
            type="checkbox"
          >
          <label
            :for="analysis.param"
            :key="analysis.name"
          >
            {{ analysis.name }}
          </label>
          <select
            v-if="analysis['report_select']"
            v-model="reportForAnalysis"
            class="margin-subitem"
          >
            <option
              v-for="report in getReports()"
              :key="report">
              {{ report }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label">Cells (number): </label>
      <div class="controls">
        <input
          id="cellsNumber"
          v-model="numberOfCells"
          type="number"
          placeholder="Cells (number) to visualize">
      </div>
    </div>
    <div class="footer">
      <div
        v-if="!sameComputer"
        id="tip"
        class="tip">
        <div class="tips">
          <div
            v-for="tip in tipTexts"
            :key="tip">{{ tip }}</div>
        </div>
        <div class="close">
          <i
            class="centered material-icons"
            @click="closeTip">close</i>
        </div>
      </div>
    </div>
    <div class="button-container">
      <input
        :disabled="!from.projectSelected || !to.projectSelected"
        class="ok-button"
        type="button"
        value="Ok"
        @click="editItem">
      <input
        class="cancel-button"
        type="button"
        value="Cancel"
        @click="closeForm">
    </div>
  </table>
</template>

<script>
import targetAutocomplete from 'components/shared/autocomplete-targets.vue';
import {filterName} from 'assets/utils.js';
import Vue from 'vue';
import Autocomplete from 'v-autocomplete';
import autocompleteTemplate from 'components/shared/autocomplete-template.vue';
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import targetList from 'assets/target-list.json';
import {getUser} from 'mixins/unicore.js';
import 'v-autocomplete/dist/v-autocomplete.css';
import 'assets/css/simulation.css';
import 'assets/css/style.css';
Vue.use(Autocomplete);

export default {
  name: 'AnalysisForm',
  components: {
    'target-autocomplete': targetAutocomplete,
    'v-autocomplete': Autocomplete,
  },
  props: ['defaultAnalysisConfig', 'jobSelectedForValidation'],
  data: function() {
    return {
      from: {
        workingDirectory: null,
        computer: this.defaultAnalysisConfig.from,
        projectsAvailable: [],
        projectSelected: null,
      },
      to: {
        workingDirectory: null, // create a new one
        computer: this.defaultAnalysisConfig.to,
        projectsAvailable: [],
        projectSelected: null,
      },
      files: [], // this will be filled in later in UnicoreAPI
      nodes: 1,
      runtime: 300,
      title: '',
      analysisToRun: this.defaultAnalysisConfig.analysisAvailable,
      checkedAnalysis: [],
      reportForAnalysis: '',
      numberOfCells: 5,
      tipTexts: [
        `To run the Analysis we need to copy the output from the Simulation to ${this.defaultAnalysisConfig.to} (because that machine has the analysis packages installed) and run the new Analysis Job.`,
        'The results of the Analysis will be shown in the detailed page.',
      ],
      target: 'slice-4',
      autocompleteTemplate: autocompleteTemplate,
      targetList: targetList,
      filteredTargets: [],
    };
  },
  computed: {
    getTargetsBasedBlueConfig: function() {
      let targetsNames = [];
      this.getReports().map((reportName) => {
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
    sameComputer: function() {
      return (this.from.computer === this.to.computer);
    },
  },
  watch: {
    'to.projectSelected': function(newVal) {
      this.from.projectSelected = newVal;
    },
  },
  mounted: function() {
    if (localStorage.getItem('showAnalysisTip') === 'false') {
      this.$nextTick(() => this.closeTip());
    }
    this.getUserProjects();
  },
  methods: {
    editItem: function() {
      this.title = filterName(this.title);
      if (this.checkInputs()) {
        this.$emit('analysisConfigReady', this.$data);
      }
    },
    checkInputs: function() {
      let that = this;
      if (!this.target) {
        showAlert('#targetSelector');
        return false;
      }
      if (parseInt(this.numberOfCells) < 2) {
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
    closeForm: function() {
      this.$emit('changeModalVisibility', false);
    },
    closeTip: function() {
      let tipElement = this.$el.querySelector('#tip');
      tipElement.remove();
      localStorage.setItem('showAnalysisTip', false);
    },
    targetChanged: function(newTarget) {
      this.target = newTarget;
    },
    getUserProjects: function() {
      getUser(this.defaultAnalysisConfig.from).then((user) => {
        this.from.projectsAvailable = user.client.xlogin.availableUIDs;
        this.from.projectSelected = this.from.projectsAvailable[0];
      });
      getUser(this.defaultAnalysisConfig.to).then((user) => {
        this.to.projectsAvailable = user.client.xlogin.availableUIDs;
        this.to.projectSelected = this.to.projectsAvailable[0];
      });
    },
    getReports: function() {
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
  select.project {
    width: 100%;
  }
</style>
