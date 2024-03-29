
<template>
  <div class="manipulation-section projection-manipulation">

    <div class="in-corner">
      <icon
        class="toggle-arrow"
        :class="{ 'inverted': sectionCollapsed }"
        type="ios-arrow-down"
        @click="sectionCollapsed = !sectionCollapsed"
      />
    </div>
    <h2>Projection Manipulation (expert users only)</h2>
    <div class="subtitle">Controls the projection in the circuit</div>

    <div
      class="custom-collapsable-section"
      :class="{ 'section-collapsed': sectionCollapsed }"
    >
      <i-table
        :columns="columns"
        :data="[currentProjection]"
        :loading="isProjLoading"
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
        <template slot-scope="{ row, index }" slot="replayFreq">
          {{ row.isSpikeReplay ? row.replayFreq : notAvailableValue}}
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

import get from 'lodash/get';
import '@/assets/css/manipulations-blocks.scss';
import ProjectionConfigurator from '@/components/run-simulation/projection-manipulation/configurator.vue';
import { getConfigFileName } from '@/config/projection-config';
import { replacePrefixPlaceholders } from '@/common/blueconfig-template';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms } from '@/common/utils';
import { saveParamNames } from '@/common/constants';
import db from '@/services/db';

export default {
  name: 'ProjectionManipulationList',
  components: {
    ProjectionConfigurator,
  },
  data() {
    return {
      isConfiguring: false,
      sectionCollapsed: true,
      isProjLoading: true,
      projectionBeingEdited: {},
      notAvailableValue: '-',
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
              slot: 'replayFreq',
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
  async created() {
    eventBus.$on('create-projection-config', this.creationConfigHandler);
    eventBus.$on('create-projection-file', this.createProjectionFile);
    this.globalProjectionBlock = get(this, '$store.state.fullConfig.projectionConfig.projectionBlock');
    this.currentProjection = await this.loadPreviousConfig();
    this.isProjLoading = false;
  },
  methods: {
    editProjection() {
      if (!this.globalProjectionBlock) {
        this.$Message.error('No probjection blocks can be configured. Not in the configuration files');
        return;
      }
      const projTarget = this.globalProjectionBlock.projectionSrcTarget;
      this.projectionBeingEdited = Object.assign(
        {},
        this.currentProjection,
        {
          target: projTarget,
          isConfiguring: true,
          type: 'Poisson',
          replayFreq: 0.1,
        },
      );
    },
    projectionChanged(newProjectionInfo) {
      this.currentProjection = newProjectionInfo;
      this.currentProjection.isConfiguring = false;
      this.resetEditableProjection();
    },
    creationConfigHandler(resolve) {
      const projection = this.generateProjectionBlocks();
      resolve(projection);
    },
    generateProjectionBlocks() {
      const pBlocks = this.globalProjectionBlock;
      if (!pBlocks) return {};

      db.setSavedConfig(saveParamNames.PROJECTION, this.currentProjection);
      const connectionProjectionName = Object.keys(pBlocks.Connection)[0];
      const projConnection = pBlocks.Connection[connectionProjectionName];
      const { Connection } = pBlocks;
      projConnection.Weight = this.currentProjection.weight;
      const { circuitConfig, computer } = this.$store.state.fullConfig;
      const circuitPathsPrefixes = circuitConfig.prefix ? circuitConfig.prefix[computer] : null;
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
        name: getConfigFileName(),
        data: JSON.stringify({
          frequency: this.currentProjection.replayFreq,
          projectionSrcTarget: mapBlueConfigTerms(pBlocks.projectionSrcTarget),
        }),
      });
    },
    resetEditableProjection() {
      this.projectionBeingEdited = {};
    },
    async loadPreviousConfig() {
      const savedProjection = await db.getSavedConfig(saveParamNames.PROJECTION);
      if (!savedProjection) {
        return get(this, '$store.state.fullConfig.projectionConfig.defaultProjection', {});
      }
      return savedProjection;
    },
  },
  beforeDestroy() {
    eventBus.$off('create-projection-config', this.creationConfigHandler);
    eventBus.$off('create-projection-file', this.createProjectionFile);
  },
};
</script>
