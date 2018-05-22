<template>
  <table class="launch-form">
    <!-- be carefull cause when the popup in swal2 is open the vue models are not related anymore
            so add the functionality in showSimulationParameters -->
    <div
      class="form-group"
      title="Title of the Job">
      <label class="control-label">Title: </label>
      <div class="controls">
        <input
          v-model="title"
          type="text"
          class="title"
          placeholder="Job's title">
      </div>
    </div>
    <div
      class="form-group"
      title="Supercomputer">
      <label class="control-label">Computer: </label>
      <div class="controls">
        <select
          v-model="computer"
          class="computer">
          <option
            v-for="resources in computersAvailable"
            :key="resources">
            {{ resources }}
          </option>
        </select>
      </div>
    </div>
    <div
      class="form-group"
      title="Number of computer resources">
      <label class="control-label">Nodes: </label>
      <div class="controls">
        <input
          v-model="nodes"
          type="number"
          class="nodes"
          placeholder="Node to allocate">
      </div>
    </div>
    <div
      class="form-group"
      title="Time until timeout">
      <label class="control-label">RunTime:</label>
      <div class="controls">
        <input
          v-model="runtime"
          type="number"
          class="runtime"
          placeholder="(optional)">
      </div>
    </div>
    <div
      class="form-group"
      title="CPUs per node">
      <label class="control-label">CPUs Per Node:</label>
      <div class="controls">
        <input
          v-model="cpus"
          type="number"
          class="cpus disabled"
          disabled="disabled">
      </div>
    </div>
    <div
      class="form-group"
      title="Total processors">
      <label class="control-label">Total Processors:</label>
      <div class="controls">
        <input
          :value="nodes * cpus"
          type="number"
          class="cpus disabled"
          disabled="disabled">
      </div>
    </div>
    <div
      class="form-group"
      title="Name of the project to run jobs">
      <label class="control-label">Project:</label>
      <div class="controls">
        <select
          v-model="projectSelected"
          class="project">
          <option
            v-for="project in projectsAvailable"
            :key="project">
            {{ project }}
          </option>
        </select>
        <i
          v-if="!projectSelected"
          class="material-icons spin">autorenew</i>
      </div>
    </div>
    <div class="form-group">
      <div colspan="2">
        <div
          class="preview-config"
          @click="previewConfig"
        >
          Preview Config
        </div>
      </div>
    </div>
    <div class="button-container">
      <input
        :disabled="!projectSelected"
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
import launchConfig from 'assets/simulation-config.json';
import {filterName, compact} from 'assets/utils.js';
import {getUser} from 'mixins/unicore.js';
import 'assets/css/simulation.css';
import 'assets/css/style.css';
export default {
  name: 'LaunchForm',
  data: function() {
    return {
      title: '',
      computer: launchConfig.default,
      computersAvailable: launchConfig.available,
      applicationName: 'Bash shell',
      nodes: 1,
      runtime: 86400,
      cpus: '',
      project: null,
      previousConfig: null,
      projectsAvailable: [],
      projectSelected: null,
    };
  },
  watch: {
    computer: function(newVal) {
      this.getUserProjects();
      if (this.previousConfig &&
              newVal === this.previousConfig.computer) {
        return; // the prev config changed computer
      }
      this.changeValues(newVal);
      this.computer = newVal;
      this.$emit('computerChanged', newVal);
    },
  },
  mounted: function() {
    this.loadPreviousConfig();
  },
  methods: {
    editItem: function() {
      this.title = filterName(this.title);
      let filtered = Object.assign({}, this.$data);
      // remove the empty items
      filtered = compact(filtered);
      this.$emit('runConfigReady', filtered);
    },
    closeForm: function() {
      this.$emit('changeModalVisibility', false);
    },
    previewConfig: function() {
      this.$emit('previewConfig');
    },
    changeValues: function(computer) {
      // the first time load the default values.
      this.runtime = launchConfig[computer].time;
      this.nodes = launchConfig[computer].nodes;
      this.cpus = launchConfig[computer].cpus;
    },
    loadPreviousConfig: function() {
      let lastConfigString = localStorage.getItem('lastLaunchConfig');
      try {
        if (lastConfigString) {
          let lastConfig = JSON.parse(lastConfigString);
          if (lastConfig.blueConfig && lastConfig.runConfig) {
            this.runtime = lastConfig.runConfig.runtime;
            this.nodes = lastConfig.runConfig.nodes;
            this.cpus = lastConfig.runConfig.cpus;
            this.computer = lastConfig.runConfig.computer;
            this.previousConfig = lastConfig.runConfig;
            this.projectsAvailable = lastConfig.runConfig.projectsAvailable;
            this.projectSelected = lastConfig.runConfig.projectSelected;
            this.$emit('computerChanged', this.computer);
          } else {throw String('No all params in previous config');}
        } else {throw String('No previous config');}
      } catch (e) {
        console.debug('error loading previous Run Config loading default', e);
        this.getUserProjects();
        this.changeValues(this.computer);
      }
    },
    getUserProjects: function() {
      console.debug('Getting user projects');
      this.projectSelected = null;
      getUser(this.computer).then((user) => {
        this.projectsAvailable = user.client.xlogin.availableUIDs;
        this.projectSelected = this.projectsAvailable[0];
      });
    },
  },
};
</script>

<style scoped>
  .launch-form {
      width: 100%;
  }
  .computer, .project {
      width: 98%;
  }
  .preview-config {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border-style: dotted;
      border-radius: 15px;
      border-width: 2px;
      padding: 5px 15px;
  }
  .disabled {
    background-color: #e2e0e0;
  }
</style>
