
<!--
This component allows to create or modify the connections in the circuit for the simulation
-->
<template>
  <div class="connection-manipulation">

    <div class="in-corner">
      <icon
        class="toggle-arrow"
        :class="{ 'inverted': tableCollapsed }"
        type="ios-arrow-down"
        @click="toggleTable()"
      />
    </div>
    <h2>Connection Manipulation (expert users only)</h2>
    <div class="subtitle">Controls the connection between populations</div>

    <div
      class="custom-table"
      :class="{ 'table-collapsed': tableCollapsed }"
    >
      <!-- Header for connection manipulation -->
      <row type="flex" class="connection-table-header" justify="space-between">
        <i-col span="4">
          <tooltip content="This target defines presynaptic cells">
            <h3>Source</h3>
          </tooltip>
        </i-col>
        <i-col span="4">
          <tooltip content="This target defines postsynaptic cells">
            <h3>Destination</h3>
          </tooltip>
        </i-col>
        <i-col span="2">
          <tooltip content="A delay after which the modifications are applied">
            <h3>Delay (ms)</h3>
          </tooltip>
        </i-col>
        <i-col span="2">
          <tooltip content="A scaling factor to adjust the synaptic strength (default = 1)">
            <h3>Weight</h3>
          </tooltip>
        </i-col>
        <i-col span="2">
          <tooltip content="The Poisson mean rate for miniature events">
            <h3>MinisFreq</h3>
          </tooltip>
        </i-col>
        <i-col span="7">
          <tooltip content="Snippets of hoc code to manipulate additional synaptic parameters">
            <h3>Synapse Configuration</h3>
          </tooltip>
        </i-col>
        <i-col span="1">
          <i-button
            type="success"
            icon="md-add"
            @click="addNewConnection()"
          />
        </i-col>
      </row>

      <!-- Connection manipulation -->
      <transition-group name="list">
        <div v-for="(connection, index) in connectionsArray" :key="connection.id">
          <row type="flex" justify="space-between" class="connection-table-content">
            <i-col span="4">
              <i-input
                :value="connection.source"
                readonly
              >
                <i-button slot="append"
                  type="primary"
                  @click="editConnectionTarget(connection, 'source')"
                >Change</i-button>
              </i-input>

            </i-col>
            <i-col span="4">
              <i-input
                :value="connection.destination"
                readonly
              >
                <i-button slot="append"
                  type="primary"
                  @click="editConnectionTarget(connection, 'destination')"
                >Change</i-button>
              </i-input>
            </i-col>
            <i-col span="2">
              <input-number
                :min="0"
                :step="10"
                v-model="connection.delay"
                :value="connection.delay"
              />
            </i-col>
            <i-col span="2">
              <input-number
                :min="0"
                :max="3"
                :step="0.01"
                v-model="connection.weight"
                :value="connection.weight"
              />
            </i-col>
            <i-col span="2">
              <input-number
                :min="0"
                :step="0.01"
                v-model="connection.spontMinis"
                :value="connection.spontMinis"
              />
            </i-col>
            <i-col span="7">
              <synapse-configurator
                :predefined-synapses="connection.synapseConfigure"
                @on-ready="setNewSynapseString(connection, ...arguments)"
              />
            </i-col>
            <i-col span="1">
              <i-button
                type="primary"
                ghost
                icon="md-remove"
                @click="removeConnection(index)"
              />
            </i-col>
          </row>
        </div>
      </transition-group>

      <modal v-model="changeTargetModal.showModal" width="300">
        <h3 slot="header">Target Configurator</h3>

        <autocomplete-targets
          :target-selected="changeTargetModal.currentTarget"
          :itemsAvailable="targets"
          @target-changed="updateConnectionTarget"
        />

        <div slot="footer">
          <i-button
            type="primary"
            @click="updateConnectionTarget"
          >Save</i-button>
        </div>
      </modal>
    </div>

  </div>
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import SynapseConfigurator from '@/components/run-simulation/connection-manipulation/synapse-configurator.vue';
import { getDefaultConnections } from '@/services/helper/connection-helper';
import { mapBlueConfigTerms } from '@/common/utils';
import eventBus from '@/services/event-bus';
import cleanDeep from 'clean-deep';
import uuidGen from 'uuid';

export default {
  name: 'ConnectionManipulation',
  components: {
    AutocompleteTargets,
    SynapseConfigurator,
  },
  data() {
    return {
      connectionsArray: {},
      tableCollapsed: true,
      changeTargetModal: {
        currentTarget: null,
        currentConnectionObj: null,
        currentConnectionAttribute: null,
        showModal: false,
      },
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
  created() {
    this.connectionsArray = getDefaultConnections();
    this.creationConfigHandlerBinded = this.creationConfigHandler.bind(this);
    eventBus.$on('create-connection-config', this.creationConfigHandlerBinded);
  },
  methods: {
    addNewConnection() {
      this.connectionsArray.push({
        id: uuidGen(),
        delay: 0,
        spontMinis: 0,
      });
    },
    removeConnection(index) {
      this.connectionsArray.splice(index, 1);
    },
    creationConfigHandler(resolve) {
      const connections = this.pruneConnections();
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
    toggleTable() {
      this.tableCollapsed = !this.tableCollapsed;
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
  },
  beforeDestroy() {
    eventBus.$off('create-connection-config', this.creationConfigHandlerBinded);
  },
};
</script>


<style scoped>
  .ivu-input-number.ivu-input-number-small {
    width: 100%;
  }
  .connection-table-header,
  .connection-table-content {
    margin-bottom: 2px;
  }
  .ivu-col label.ivu-checkbox-wrapper {
    vertical-align: sub;
  }
  .in-corner {
    float: right;
    margin-left: 5px;
  }
  .custom-table {
    transition: max-height 0.3s;
    max-height: 700px;
  }
  .table-collapsed {
    max-height: 0px;
    overflow: hidden;
  }
  .toggle-arrow {
    margin-right: 10px;
    font-size: 30px;
  }
  .inverted {
    transform: rotate(180deg);
  }
  .error-indicator {
    width: 20px;
    color: #d81414;
    font-size: 16px;
  }
</style>
