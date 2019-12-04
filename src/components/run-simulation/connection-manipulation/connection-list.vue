
<!--
This component allows to create or modify the connections in the circuit for the simulation
-->
<template>
  <div class="manipulation-section connection-manipulation">

    <div class="in-corner">
      <icon
        class="toggle-arrow"
        :class="{ 'inverted': sectionCollapsed }"
        type="ios-arrow-down"
        @click="sectionCollapsed = !sectionCollapsed"
      />
    </div>
    <h2>Connection Manipulation (expert users only)</h2>
    <div class="subtitle">Controls the connection between populations</div>

    <div
      class="custom-collapsable-section"
      :class="{ 'section-collapsed': sectionCollapsed }"
    >
      <i-table
        :columns="columns"
        :data="connectionsArray"
        :loading="connectionsAreLoading"
        border
        class="custom-manipulation-table"
      >
        <template slot-scope="{ row, index }" slot="source">
          <i-input
            :value="row.source"
            readonly
          >
            <i-button slot="append"
              type="primary"
              @click="editConnectionTarget(connectionsArray[index], 'source')"
            >Change</i-button>
          </i-input>
        </template>

        <template slot-scope="{ row, index }" slot="destination">
          <i-input
            :value="row.destination"
            readonly
          >
            <i-button slot="append"
              type="primary"
              @click="editConnectionTarget(connectionsArray[index], 'destination')"
            >Change</i-button>
          </i-input>
        </template>

        <template slot-scope="{ row, index }" slot="delay">
          <input-number
            :min="0"
            :step="10"
            v-model="connectionsArray[index].delay"
          />
        </template>

        <template slot-scope="{ row, index }" slot="weight">
          <input-number
            :min="0"
            :max="3"
            :step="0.01"
            v-model="connectionsArray[index].weight"
          />
        </template>

        <template slot-scope="{ row, index }" slot="spontMinis">
          <input-number
            :min="0"
            :step="0.01"
            v-model="connectionsArray[index].spontMinis"
          />
        </template>

        <template slot-scope="{ row, index }" slot="synapseConfigure">
          <synapse-configurator
            :predefined-synapses="row.synapseConfigure"
            @on-ready="setNewSynapseString(connectionsArray[index], ...arguments)"
          />
        </template>

        <template slot-scope="{ row, index }" slot="remove">
          <i-button
            type="error"
            ghost
            icon="md-remove"
            @click="removeConnection(index)"
          />
        </template>
      </i-table>

      <h3 class="end-line">
        <i-button
          type="success"
          icon="md-add"
          @click="addNewConnection"
        >Add new Connection</i-button>
      </h3>

      <modal
        v-model="changeTargetModal.showModal"
        width="300"
        :mask-closable="false"
      >
        <h3 slot="header">Target Configurator</h3>

        <autocomplete-targets
          :target-selected="changeTargetModal.currentTarget"
          :itemsAvailable="targets"
          @target-changed="updateConnectionTarget"
        />

        <div slot="footer"/>
      </modal>
    </div>

  </div>
</template>


<script>
import cleanDeep from 'clean-deep';
import uuidGen from 'uuid';
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import SynapseConfigurator from '@/components/run-simulation/connection-manipulation/synapse-configurator.vue';
import { getDefaultConnections } from '@/services/helper/connection-helper';
import { mapBlueConfigTerms } from '@/common/utils';
import eventBus from '@/services/event-bus';
import { saveParamNames } from '@/common/constants';
import db from '@/services/db';
import '@/assets/css/manipulations-blocks.scss';

export default {
  name: 'ConnectionManipulation',
  components: {
    AutocompleteTargets,
    SynapseConfigurator,
  },
  data() {
    return {
      connectionsArray: [],
      sectionCollapsed: true,
      connectionsAreLoading: true,
      changeTargetModal: {
        currentTarget: null,
        currentConnectionObj: null,
        currentConnectionAttribute: null,
        showModal: false,
      },
      columns: [
        {
          title: 'Source',
          slot: 'source',
          align: 'center',
          tooltip: 'This target defines presynaptic cells',

        },
        {
          title: 'Destination',
          slot: 'destination',
          align: 'center',
          tooltip: 'This target defines postsynaptic cells',

        },
        {
          title: 'Delay (ms)',
          slot: 'delay',
          width: 150,
          align: 'center',
          tooltip: 'A delay after which the modifications are applied',

        },
        {
          title: 'Weight',
          slot: 'weight',
          width: 150,
          align: 'center',
          tooltip: 'A scaling factor to adjust the synaptic strength (default = 1)',

        },
        {
          title: 'MinisFreq',
          slot: 'spontMinis',
          width: 150,
          align: 'center',
          tooltip: 'The Poisson mean rate for miniature events',

        },
        {
          title: 'Synapse Configuration',
          slot: 'synapseConfigure',
          align: 'center',
          tooltip: 'Snippets of hoc code to manipulate additional synaptic parameters',

        },
        {
          title: 'Remove',
          slot: 'remove',
          align: 'center',
          width: 150,
        },
      ],
    };
  },
  computed: {
    targets() {
      return this.$store.state.connectionTargets;
    },
    targetsNameList() {
      return this.$store.state.connectionTargets.map(target => target.displayName);
    },
  },
  async created() {
    this.creationConfigHandlerBinded = this.creationConfigHandler.bind(this);
    eventBus.$on('create-connection-config', this.creationConfigHandlerBinded);
    this.connectionsArray = await this.loadPreviousConfig();
    this.connectionsAreLoading = false;
  },
  methods: {
    addNewConnection() {
      this.connectionsArray.push({
        id: uuidGen(),
      });
    },
    removeConnection(index) {
      this.connectionsArray.splice(index, 1);
    },
    creationConfigHandler(resolve) {
      const connections = this.pruneConnections();
      db.setSavedConfig(saveParamNames.CONNECTION, this.connectionsArray);
      resolve(connections);
    },
    pruneConnections() {
      const prunedConnections = {};
      this.connectionsArray.forEach((connectionItem) => {
        const conn = {};
        if (!this.populationExists(connectionItem.source, connectionItem.destination)) return;
        conn.Source = mapBlueConfigTerms(connectionItem.source);
        conn.Destination = mapBlueConfigTerms(connectionItem.destination);
        conn.Delay = connectionItem.delay > 0 ? connectionItem.delay : null;
        conn.SpontMinis = connectionItem.spontMinis;
        conn.SynapseConfigure = connectionItem.synapseConfigure !== '' ? connectionItem.synapseConfigure : null;
        conn.Weight = connectionItem.weight;
        let name = `${conn.Source}-${conn.Destination}`;
        if (!conn.SpontMinis && !conn.SynapseConfigure) {
          const warning = `Connection ${conn.Source} to ${conn.Destination} missing parameters`;
          this.$Message.warning(warning);
        }
        if (prunedConnections[name]) { // avoid overwrite existing connection
          name = `${name}-${uuidGen()}`;
        }
        prunedConnections[name] = cleanDeep(conn);
      });
      return ({ Connection: prunedConnections });
    },
    populationExists(source, destination) {
      if (!source || !destination) return false;
      if (!this.targetsNameList.includes(source) || !this.targetsNameList.includes(destination)) return false;
      return true;
    },
    setNewSynapseString(connection, synapseString) {
      this.$set(connection, 'synapseConfigure', synapseString);
    },
    editConnectionTarget(connectionObj, connectionAttribute) {
      this.$set(this.changeTargetModal, 'currentTarget', connectionObj[connectionAttribute]);
      this.$set(this.changeTargetModal, 'currentConnectionObj', connectionObj);
      this.$set(this.changeTargetModal, 'currentConnectionAttribute', connectionAttribute);
      this.$set(this.changeTargetModal, 'showModal', true);
    },
    updateConnectionTarget(newTarget) {
      this.$set(
        this.changeTargetModal.currentConnectionObj,
        this.changeTargetModal.currentConnectionAttribute,
        newTarget,
      );
      this.$set(this.changeTargetModal, 'showModal', false);
      this.$set(this.changeTargetModal, 'currentTarget', '');
    },
    async loadPreviousConfig() {
      const savedConnections = await db.getSavedConfig(saveParamNames.CONNECTION);
      if (!savedConnections) {
        return getDefaultConnections();
      }
      return savedConnections;
    },
  },
  beforeDestroy() {
    eventBus.$off('create-connection-config', this.creationConfigHandlerBinded);
  },
};
</script>


<style scoped>
  .end-line {
    text-align: right;
    margin-top: 15px;
  }
</style>
