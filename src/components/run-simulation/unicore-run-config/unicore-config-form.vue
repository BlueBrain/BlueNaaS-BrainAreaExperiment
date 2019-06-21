
<template>
  <modal
    v-model="showModalLocal"
    width="350"
    class="computer-config-form"
    @on-cancel="$emit('closeModal')"
    :mask-closable="false"
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
          v-model="computerSelected"
        >
          <i-option
            v-for="computer in computersAvailable"
            :key="computer"
            :value="computer"
          >{{ computer }}</i-option>
        </i-select>
      </form-item>

      <form-item prop="group">
        <tooltip
          slot="label"
          content="Name of the group to run jobs"
        >Unicore Group</tooltip>
        <i-select
          v-model="groupSelected"
          :disabled="disableGroupSelector"
        >
          <i-option
            v-for="group in groupsAvailable"
            :key="group"
            :value="group"
          >{{ group }}</i-option>
        </i-select>
      </form-item>

      <form-item prop="account" v-if="!accountIsHidden">
        <tooltip
          slot="label"
          content="Name of the account to run jobs"
        >Account</tooltip>
        <i-select
          v-model="runParameters.accountSelected"
        >
          <i-option
            v-for="project in projectsAvailable"
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
          v-model="runParameters.nodes"
          placeholder="Node to allocate"
        />
      </form-item>

      <form-item prop="runtime">
        <tooltip
          slot="label"
          content="Time (seconds) to allocate"
        >RunTime</tooltip>
        <input-number
          :disabled="runtimeIsHidden"
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
          :value="runParameters.nodes * runParameters.cpus"
          readonly
        />
      </form-item>

      <form-item>
        <i-button
          shape="circle"
          size="default"
          @click="$emit('previewBlueConfig')"
        >Preview BlueConfig</i-button>
      </form-item>

    </i-form>
    <div slot="footer">
      <div class="flex">
        <i-button
          size="default"
          @click="$emit('closeModal')"
        >Cancel</i-button>

        <i-button
          type="success"
          size="default"
          :loading="isLoading"
          @click="checkForm"
        >Run Simulation</i-button>
      </div>
    </div>
  </modal>
</template>


<script>
import auth from '@/services/auth';
import eventBus from '@/services/event-bus';
import isEqual from 'lodash/isEqual';
import db from '@/services/db';
import constants from '@/common/constants';

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
        accountSelected: null,
      },

      accountIsHidden: true,
      groupsFetched: false,
      projectsAvailable: [],
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
        account: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.runParameters.accountSelected) {
              callback(new Error('should be defined'));
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
        this.loadPreviousConfig();
      }
    },
  },
  computed: {
    computersAvailable() {
      if (!this.showModalLocal) return [];
      return this.$store.state.computersAvailable;
    },

    computerSelected: {
      get() {
        return this.$store.state.currentComputer;
      },
      set(newComputer) {
        if (!newComputer || newComputer === this.$store.state.currentComputer) return;
        this.refreshUnicoreProjects(newComputer, this.loadDefaultValues);
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
      return this.$store.state.currentComputer === constants.computers.NUVLA;
    },

    isLoading() {
      return this.isLaunchingSim ||
        !this.groupsFetched ||
        (!this.accountIsHidden && !this.projectsAvailable.length);
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
      const simConfig = this.$store.state.currentSimulationConfig;
      const defaultParams = simConfig[this.$store.state.currentComputer];
      this.runParameters.runtime = defaultParams.runtime;
      this.runParameters.nodes = defaultParams.nodes;
      this.runParameters.cpus = defaultParams.cpus;
    },

    async loadPreviousConfig() {
      const prevConfig = await db.retrievePreviousConfig();
      if (
        !prevConfig ||
        !prevConfig.unicore ||
        !prevConfig.unicore.runtime ||
        !prevConfig.unicore.nodes ||
        !prevConfig.unicore.computerSelected
      ) {
        const defaultComputer = this.$store.state.currentComputer || this.computersAvailable[0];
        this.loadDefaultValues();
        this.loadAccount(defaultComputer);
        this.refreshUnicoreProjects(defaultComputer);

        return null;
      }
      this.runParameters.runtime = prevConfig.unicore.runtime;
      this.runParameters.nodes = prevConfig.unicore.nodes;
      this.runParameters.title = prevConfig.unicore.title;
      const simConfig = this.$store.state.currentSimulationConfig;
      this.runParameters.cpus = simConfig[this.$store.state.currentComputer].cpus;

      this.loadAccount(prevConfig.unicore.computerSelected);
      this.refreshUnicoreProjects(prevConfig.unicore.computerSelected);

      if (!this.accountIsHidden && prevConfig.unicore.accountSelected) {
        this.runParameters.accountSelected = prevConfig.unicore.accountSelected;
      }

      return prevConfig.unicore.computerSelected;
    },

    refreshUnicoreProjects(computer, callback) {
      this.groupsFetched = false;
      const computerToFetch = computer || this.computersAvailable[0];
      if (computer === this.$store.state.currentComputer && this.groupsAvailable.length) {
        this.groupsFetched = true;
        return;
      }
      eventBus.$emit('changeComputer', computerToFetch, () => {
        this.groupsFetched = true;
        if (callback) callback();
      });
    },

    loadAccount(computer) {
      const isHidden = computer !== constants.computers.BB5;
      if (!isHidden) { this.getUserProjects(); }
      this.accountIsHidden = isHidden;
    },

    getUserProjects() {
      auth.getUserProjects().then((projects) => {
        this.projectsAvailable = projects;
      }).catch((e) => {
        this.$Message.error('Error fetching user groups', e);
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
