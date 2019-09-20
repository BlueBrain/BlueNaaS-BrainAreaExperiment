
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
      <i-table
        :columns="columns"
        :data="[currentProjection]"
        border
        class="custom-manipulation-table"
      >
        <template slot-scope="{ row, index }" slot="edit">
          <i-button
            type="primary"
            ghost
            icon="md-create"
            @click="editProjection"
          >Edit</i-button>
        </template>

        <template slot-scope="{ row, index }" slot="minisFreq">
          {{ row.isMinis ? row.minisFreq : notAvailableValue}}
        </template>

        <template slot-scope="{ row, index }" slot="target">
          {{ row.isSpikeReplay ? row.target : notAvailableValue}}
        </template>
        <template slot-scope="{ row, index }" slot="freq">
          {{ row.isSpikeReplay ? row.freq : notAvailableValue}}
        </template>
        <template slot-scope="{ row, index }" slot="type">
          {{ row.isSpikeReplay ? row.type : notAvailableValue}}
        </template>

      </i-table>

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
import { mapBlueConfigTerms } from '@/common/utils';

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
      columns: [
        {
          title: 'Weight',
          key: 'weight',
          align: 'center',
        },
        {
          title: 'Minis Projection',
          align: 'center',
          children: [
            {
              title: 'Frequency (Hz)',
              slot: 'minisFreq',
              align: 'center',
            },
          ],
        },
        {
          title: 'Spike Replay Projection',
          align: 'center',
          children: [
            {
              title: 'Target',
              slot: 'target',
              align: 'center',
            },
            {
              title: 'Frequency (Hz)',
              slot: 'freq',
              align: 'center',
            },
            {
              title: 'Type',
              slot: 'type',
              align: 'center',
            },
          ],
        },
        {
          title: ' ',
          slot: 'edit',
          align: 'center',
          width: 100,
        },
      ],
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
        {
          target: projTarget,
          isConfiguring: true,
          freq: 0.1,
          type: 'Poisson',
        },
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
        delete projConnection.SpontMinis;
        return {
          Projection,
          Connection,
          Stimulus,
          StimulusInject,
        };
      }
      if (this.currentProjection.isMinis) {
        projConnection.SpontMinis = this.currentProjection.minisFreq;
        return {
          Projection,
          Connection,
        };
      }
      return {};
    },
    createProjectionFile(resolve) {
      if (!this.currentProjection.isSpikeReplay) return resolve(null);
      const pBlocks = this.globalProjectionBlock;
      return resolve({
        name: projectionConfig.getConfigFileName(),
        data: JSON.stringify({
          frequency: this.currentProjection.freq,
          projectionSrcTarget: mapBlueConfigTerms(pBlocks.projectionSrcTarget),
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
