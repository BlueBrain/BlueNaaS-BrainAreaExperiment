
<template>
  <modal
    v-model="showModalLocal"
    width="350"
    class="computer-config-form"
    @on-cancel="$emit('closeModal')"
  >
    <h3 slot="header">Edit Parameters</h3>
    <i-form
      ref="formValidate"
      :rules="ruleValidate"
      name="computerConfigForm"
      label-position="right"
      :label-width="150"
      v-model="runParameters"
    >
      <form-item prop="title">
        <tooltip
          slot="label"
          content="Title of the Job"
        >Title</tooltip>
        <i-input
          size="small"
          v-model="runParameters.title"
          placeholder="Title"
        />
      </form-item>

      <form-item prop="computer">
        <tooltip
          slot="label"
          content="Supercomputer"
        >Computer</tooltip>
        <i-select
          size="small"
          v-model="computerSelected"
        >
          <i-option
            v-for="computer in computersAvailable"
            :key="computer"
            :value="computer"
          >{{ computer }}</i-option>
        </i-select>
      </form-item>

      <form-item prop="project">
        <tooltip
          slot="label"
          content="Name of the project to run jobs"
        >Project</tooltip>
        <i-select
          size="small"
          v-model="groupSelected"
          :disabled="disableGroupSelector"
        >
          <i-option
            v-for="project in groupsAvailable"
            :key="project"
            :value="project"
          >{{ project }}</i-option>
        </i-select>
      </form-item>

      <form-item prop="nodes">
        <tooltip
          slot="label"
          content="Number of computer resources"
        >Nodes</tooltip>
        <input-number
          size="small"
          v-model="runParameters.nodes"
          placeholder="Node to allocate"
        />
      </form-item>

      <form-item prop="runtime">
        <tooltip
          slot="label"
          content="Time until the job is killed"
        >RunTime</tooltip>
        <input-number
          :disabled="runtimeIsHidden"
          size="small"
          v-model="runParameters.runtime"
          placeholder="(optional)"
        />
      </form-item>

      <form-item prop="cpus">
        <tooltip
          slot="label"
          content="Number of CPUs per node"
        >CPUs Per Node</tooltip>
        <i-input
          size="small"
          v-model="runParameters.cpus"
          readonly
        />
      </form-item>

      <form-item prop="processors">
        <tooltip
          slot="label"
          content="Total number of processors"
        >Total Processors</tooltip>
        <i-input
          size="small"
          :value="runParameters.nodes * runParameters.cpus"
          readonly
        />
      </form-item>

      <form-item>
        <i-button
          shape="circle"
          @click="$emit('previewBlueConfig')"
        >Preview BlueConfig</i-button>
      </form-item>

    </i-form>
    <div slot="footer">
      <div class="flex">
        <i-button
          @click="$emit('closeModal')"
        >Cancel</i-button>

        <i-button
          type="success"
          :loading="isLaunchingSim || !projectsFetched"
          @click="checkForm"
        >Run Simulation</i-button>
      </div>
    </div>
  </modal>
</template>


<script>
import simulationConfig from '@/config/simulation-config';
import eventBus from '@/services/event-bus';
import isEqual from 'lodash/isEqual';
import { getComputersAvailableForCurrentModel } from '@/services/helper/computer-group-helper';
import db from '@/services/db';

export default {
  name: 'UnicoreConfigForm',
  props: ['showModal', 'isLaunchingSim'],
  data() {
    return {
      showModalLocal: false,
      runParameters: {
        title: '',
        nodes: null,
        runtime: null,
        cpus: null,
      },
      projectsFetched: false,

      previousConfig: null,

      ruleValidate: {
        computer: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.computerSelected) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        nodes: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.runParameters.nodes) {
              callback(new Error('should be defined'));
              return;
            }
            if (this.runParameters.nodes < 1) {
              callback(new Error('should be > 0'));
              return;
            }
            callback();
          },
        }],
        runtime: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.runParameters.runtime) {
              callback(new Error('should be defined'));
              return;
            }
            if (this.runParameters.runtime < 1) {
              callback(new Error('should be > 1'));
              return;
            }
            callback();
          },
        }],
      },
    };
  },
  watch: {
    showModal(newVal) {
      this.showModalLocal = newVal;
      if (newVal) {
        this.loadPreviousConfig().then((selectedComputer) => {
          this.refreshProjects(selectedComputer);
        });
      }
    },
  },
  computed: {
    computersAvailable() {
      if (!this.showModalLocal) return [];
      return getComputersAvailableForCurrentModel();
    },

    computerSelected: {
      get() {
        return this.$store.state.currentComputer;
      },
      set(newComputer) {
        if (!newComputer || newComputer === this.$store.state.currentComputer) return;
        this.refreshProjects(newComputer, this.loadDefaultValues);
      },
    },

    groupSelected: {
      get() {
        return this.$store.state.userGroup;
      },
      set(newGroup) {
        if (!newGroup || newGroup === this.$store.state.userGroup) return;
        eventBus.$emit('changeUserGroup', newGroup);
      },
    },

    groupsAvailable() {
      return this.$store.state.userGroupsAvailable;
    },

    disableGroupSelector() {
      const hasOneGroup = isEqual(this.groupsAvailable, ['*']);
      return !this.groupsAvailable.length || hasOneGroup;
    },

    runtimeIsHidden() {
      return this.$store.state.currentComputer === 'NUVLA';
    },
  },
  methods: {
    async checkForm() {
      const isValid = await this.$refs.formValidate.validate();
      if (isValid) {
        this.runParameters.computerSelected = this.computerSelected;
        this.runParameters.groupSelected = this.groupSelected;
        // to start spinner
        this.$emit('run-simulation', this.runParameters);
      }
    },

    loadDefaultValues() {
      const computer = this.$store.state.currentComputer || this.computersAvailable[0];
      const defaultValues = simulationConfig[computer];
      this.runParameters.runtime = defaultValues.runtime;
      this.runParameters.nodes = defaultValues.nodes;
      this.runParameters.cpus = defaultValues.cpus;
    },

    async loadPreviousConfig() {
      const lastConfig = await db.retrievePreviousConfig();
      if (
        !lastConfig ||
        !lastConfig.unicore ||
        !lastConfig.unicore.runtime ||
        !lastConfig.unicore.nodes ||
        !lastConfig.unicore.title ||
        !lastConfig.unicore.computerSelected
      ) {
        this.loadDefaultValues();
        return null;
      }
      this.runParameters.runtime = lastConfig.unicore.runtime;
      this.runParameters.nodes = lastConfig.unicore.nodes;
      this.runParameters.title = lastConfig.unicore.title;
      this.runParameters.cpus = simulationConfig[lastConfig.unicore.computerSelected].cpus;
      return lastConfig.unicore.computerSelected;
    },

    refreshProjects(computer, callback) {
      this.projectsFetched = false;
      const computerToFetch = computer || this.computersAvailable[0];
      eventBus.$emit('changeComputer', computerToFetch, () => {
        this.projectsFetched = true;
        if (callback) callback();
      });
    },
  },
};
</script>


<style lang="scss" scoped>
  .computer-config-form {
    .flex {
      display: flex;
      justify-content: space-between;
    }
  }
  .hide-param {
    display: none;
  }
</style>
