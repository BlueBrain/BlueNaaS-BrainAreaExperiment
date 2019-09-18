
<template>
  <div class="manipulation-section projection-manipulation">

    <div class="in-corner">
      <icon
        class="toggle-arrow"
        :class="{ 'inverted': tableCollapsed }"
        type="ios-arrow-down"
        @click="tableCollapsed = !tableCollapsed"
      />
    </div>
    <h2>Projection Manipulation (expert users only)</h2>
    <div class="subtitle">Controls the projection in the circuit</div>

    <div
      class="custom-table"
      :class="{ 'table-collapsed': tableCollapsed }"
    >
      <!-- Header for projection manipulation -->
      <row type="flex" class="manipulation-table-header" justify="space-between">
        <i-col span="4">
          <tooltip content="This target defines presynaptic cells">
            <h3>Name</h3>
          </tooltip>
        </i-col>
        <i-col span="2">
          <tooltip content="This target defines postsynaptic cells">
            <h3>Weight</h3>
          </tooltip>
        </i-col>
        <i-col span="2">
          <tooltip content="A delay after which the modifications are applied">
            <h3>Minis Freq</h3>
          </tooltip>
        </i-col>
        <i-col span="4">
          <tooltip content="A scaling factor to adjust the synaptic strength (default = 1)">
            <h3>Target</h3>
          </tooltip>
        </i-col>
        <i-col span="2">
          <tooltip content="The Poisson mean rate for miniature events">
            <h3>Frequency</h3>
          </tooltip>
        </i-col>
        <i-col span="4">
          <tooltip content="Snippets of hoc code to manipulate additional synaptic parameters">
            <h3>Type</h3>
          </tooltip>
        </i-col>
        <i-col span="1" offset="3"/>
      </row>

      <!-- Connection manipulation -->
      <row type="flex" justify="space-between" class="manipulation-table-content hover-colored">
        <i-col span="4">
          <span>{{ currentProjection.name }}</span>
        </i-col>
        <i-col span="2">
          <span>{{ currentProjection.weight }}</span>
        </i-col>
        <i-col span="2">
          <span v-if="currentProjection.isMinis">{{ currentProjection.minisFreq }}</span>
          <span v-else>{{ notAvailableValue }}</span>
        </i-col>
        <i-col span="4">
          <span v-if="currentProjection.isSpikeReplay">{{ currentProjection.target }}</span>
          <span v-else>{{ notAvailableValue }}</span>
        </i-col>
        <i-col span="2">
          <span v-if="currentProjection.isSpikeReplay">{{ currentProjection.freq }}</span>
          <span v-else>{{ notAvailableValue }}</span>
        </i-col>
        <i-col span="4">
          <span v-if="currentProjection.isSpikeReplay">{{ currentProjection.type }}</span>
          <span v-else>{{ notAvailableValue }}</span>
        </i-col>
        <i-col span="1" offset="3">
          <i-button
            type="primary"
            ghost
            icon="md-create"
            @click="editProjection"
          >Edit</i-button>
        </i-col>
      </row>

      <projection-configurator
        :projection-item="projectionBeingEdited"
        @on-ready="projectionChanged"
        @on-close="resetEditableProjection"
      />

    </div>

  </div>
</template>


<script>

import '@/assets/css/manipulations-blocks.scss';
import ProjectionConfigurator from '@/components/run-simulation/projection-manipulation/configurator.vue';
import * as projectionConfig from '@/config/projection-config';
import { replacePrefixPlaceholders } from '@/common/blueconfig-template';
import eventBus from '@/services/event-bus';

export default {
  name: 'ProjectionManipulationList',
  components: {
    ProjectionConfigurator,
  },
  data() {
    return {
      isConfiguring: false,
      tableCollapsed: true,
      projectionBeingEdited: {},
      notAvailableValue: '-',
      simConfigToUse: this.$store.state.currentCircuitConfig.simConfigToUse,
      currentProjection: {},
      globalProjectionBlock: {},
    };
  },
  created() {
    eventBus.$on('create-projection-config', this.creationConfigHandler);
    eventBus.$on('create-projection-file', this.createProjectionFile);
    this.currentProjection = projectionConfig.getDefaultProjection(this.simConfigToUse);
    this.globalProjectionBlock = projectionConfig.getProjectionBlocks(this.simConfigToUse);
  },
  methods: {
    editProjection() {
      const projTarget = this.globalProjectionBlock.projectionSrcTarget;
      this.projectionBeingEdited = Object.assign(
        {},
        this.currentProjection,
        { target: projTarget, isConfiguring: true },
      );
    },
    projectionChanged(newProjectionInfo) {
      this.currentProjection = newProjectionInfo;
      this.resetEditableProjection();
    },
    creationConfigHandler(resolve) {
      const projection = this.generateProjectionBlocks();
      resolve(projection);
    },
    generateProjectionBlocks() {
      const pBlocks = this.globalProjectionBlock;
      if (!pBlocks) this.$Message.error('No probjection blocks were configured');

      const connectionProjectionName = Object.keys(pBlocks.Connection)[0];
      const projConnection = pBlocks.Connection[connectionProjectionName];
      const { Connection } = pBlocks;
      projConnection.Weight = this.currentProjection.weight;
      const circuitPathsPrefixes = this.$store.state.currentCircuitConfig.prefix[this.$store.state.currentComputer];
      const Projection = replacePrefixPlaceholders(pBlocks.Projection, circuitPathsPrefixes);
      const { Stimulus, StimulusInject } = pBlocks.spikeReplay;

      if (this.currentProjection.isMinis && this.currentProjection.isSpikeReplay) {
        projConnection.SpontMinis = this.currentProjection.minisFreq;
        return {
          Projection,
          Connection,
          Stimulus,
          StimulusInject,
        };
      }
      if (this.currentProjection.isSpikeReplay) {
        return {
          Projection,
          Connection,
          Stimulus,
          StimulusInject,
        };
      }
      // minis projection selected
      projConnection.SpontMinis = this.currentProjection.minisFreq;
      return {
        Projection,
        Connection,
      };
    },
    createProjectionFile(resolve) {
      if (!this.currentProjection.isSpikeReplay) return resolve(null);
      const pBlocks = this.globalProjectionBlock;
      return resolve({
        name: projectionConfig.getConfigFileName(),
        data: JSON.stringify({
          frequency: this.currentProjection.freq,
          projectionSrcTarget: pBlocks.projectionSrcTarget,
        }),
      });
    },
    resetEditableProjection() {
      this.projectionBeingEdited = {};
    },
  },
  beforeDestroy() {
    eventBus.$off('create-projection-config', this.creationConfigHandler);
    eventBus.$off('create-projection-file', this.createProjectionFile);
  },
};
</script>
