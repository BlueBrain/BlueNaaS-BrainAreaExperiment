
<template>
  <modal
    v-model="showModalLocal"
    width="350"
    class="computer-config-form"
    @on-cancel="$emit('close-modal')"
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

      <form-item prop="computer" class="uppercase" v-if="!computerIsHidden">
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

      <form-item prop="group" v-if="!groupIsHidden">
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
          :min="1"
          placeholder="Node to allocate"
        />
      </form-item>

      <form-item prop="runtime">
        <tooltip
          slot="label"
          content="Time (seconds) to allocate"
        >RunTime (sec)</tooltip>
        <input-number
          v-model="runParameters.runtime"
          :min="1"
          placeholder="(optional)"
        />
      </form-item>

      <form-item prop="cpus">
        <tooltip
          slot="label"
          content="Number of CPUs per node"
        >CPUs Per Node</tooltip>
        <i-input
          :disabled="true"
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
          :disabled="true"
          :value="runParameters.nodes * runParameters.cpus"
          readonly
        />
      </form-item>

      <form-item>
        <i-button
          shape="circle"
          size="default"
          @click="$emit('preview-blueconfig')"
        >Preview BlueConfig</i-button>
      </form-item>

    </i-form>
    <div slot="footer">
      <div class="flex">
        <i-button
          size="default"
          @click="$emit('close-modal')"
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
import isEqual from 'lodash/isEqual';
import auth from '@/services/auth';
import eventBus from '@/services/event-bus';
import db from '@/services/db';
import { saveParamNames, computers } from '@/common/constants';

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
      computerIsHidden: true,
      groupIsHidden: true,

      groupsFetched: false,
      projectsAvailable: [],

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
      return this.$store.state.fullConfig.computersAvailable;
    },

    computerSelected: {
      get() {
        return this.$store.state.fullConfig.computer;
      },
      set(newComputer) {
        if (!newComputer || newComputer === this.$store.state.fullConfig.computer) return;
        this.refreshUnicoreProjects(newComputer, this.loadDefaultValues);
      },
    },

    groupSelected: {
      get() {
        return this.$store.state.userGroup;
      },
      set(newGroup) {
        if (!newGroup || newGroup === this.$store.state.userGroup) return;
        eventBus.$emit('change-user-group', newGroup);
      },
    },

    groupsAvailable() {
      return this.$store.state.userGroupsAvailable;
    },

    disableGroupSelector() {
      const hasOneGroup = isEqual(this.groupsAvailable, ['*']);
      return !this.groupsAvailable.length || hasOneGroup;
    },

    isLoading() {
      return this.isLaunchingSim ||
        !this.groupsFetched ||
        (!this.accountIsHidden && !this.projectsAvailable.length);
    },
  },
  methods: {
    async checkForm() {
      const { executable } = this.$store.state.fullConfig.simulationConfig;
      const isValid = await this.$refs.formValidate.validate();
      if (isValid) {
        this.runParameters.computerSelected = this.computerSelected;
        this.runParameters.groupSelected = this.groupSelected;
        this.runParameters.tags = [];
        this.runParameters.executable = executable;
        db.setSavedConfig(saveParamNames.UNICORE, this.runParameters);
        // to start spinner
        this.$emit('run-simulation', this.runParameters);
      }
    },

    loadDefaultValues() {
      const simConfig = this.$store.state.fullConfig.simulationConfig;
      this.runParameters.runtime = simConfig.runtime;
      this.runParameters.nodes = simConfig.nodes;
      this.runParameters.cpus = simConfig.cpus;
    },

    async loadPreviousConfig() {
      const savedConfig = await db.getSavedConfig(saveParamNames.UNICORE);
      if (!savedConfig) {
        const defaultComputer = this.$store.state.fullConfig.computer || this.computersAvailable[0];
        this.loadDefaultValues();
        this.loadAccount(defaultComputer);
        this.refreshUnicoreProjects(defaultComputer);
        return;
      }
      this.runParameters = savedConfig;

      this.loadAccount(savedConfig.computerSelected);
      this.refreshUnicoreProjects(savedConfig.computerSelected);

      if (!this.accountIsHidden && savedConfig.accountSelected) {
        this.runParameters.accountSelected = savedConfig.accountSelected;
      }
    },

    refreshUnicoreProjects(computer, callback) {
      this.groupsFetched = false;
      const computerToFetch = computer || this.computersAvailable[0];
      if (computer === this.$store.state.fullConfig.computer && this.groupsAvailable.length) {
        this.groupsFetched = true;
        return;
      }
      eventBus.$emit('change-computer', computerToFetch, () => {
        this.groupsFetched = true;
        if (callback) callback();
      });
    },

    loadAccount(computer) {
      const isHidden = computer !== computers.BB5;
      if (!isHidden) { this.getUserProjects(); }
      this.accountIsHidden = isHidden;
    },

    getUserProjects() {
      auth.getUserProjects().then((projects) => {
        // to sort with string and numbers
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        this.projectsAvailable = projects.sort(collator.compare);
      }).catch((e) => {
        this.$Message.error(`Error fetching user groups - ${e}`);
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
  .uppercase {
    text-transform: uppercase;
  }
</style>
