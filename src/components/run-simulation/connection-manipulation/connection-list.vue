
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
      <Row type="flex" class="connection-table-header" justify="space-between">
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
          <tooltip content="The Poisson mean rate for spontaneous synaptic activation">
            <h3>SpontMinis</h3>
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
      </Row>
      <!-- Connection manipulation -->
      <transition-group name="list">
        <div v-for="(connection, index) in connectionsArray" :key="connection.id">
          <Row type="flex" justify="space-between" class="connection-table-content">
            <i-col span="4">
              <autocomplete-targets
                :target-selected="connection.source"
                :itemsAvailable="targets"
                @target-changed="updateValue(connection, 'source', ...arguments)"
              />
            </i-col>
            <i-col span="4">
              <autocomplete-targets
                :target-selected="connection.destination"
                :itemsAvailable="targets"
                @target-changed="updateValue(connection, 'destination', ...arguments)"
              />
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
                :min="1"
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
                v-if="connection.synapseConfigure"
                :predefined-synapses="connection.synapseConfigure"
                @on-ready="setNewSynapseString(connection, ...arguments)"
              />
              <Checkbox
                v-else
                @on-change="configureSynapseSelected(connection)"
              >Configure Synapse</Checkbox>
            </i-col>
            <i-col span="1">
              <i-button
                type="primary"
                ghost
                icon="md-remove"
                @click="removeConnection(index)"
              />
            </i-col>
          </Row>
        </div>
      </transition-group>
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
    eventBus.$on('createConnectionConfig', this.creationConfigHandlerBinded);
  },
  methods: {
    updateValue(connection, subitem, newValue) {
      this.$set(connection, subitem, newValue);
    },
    configureSynapseSelected(connection) {
      this.$set(connection, 'synapseConfigure', ' ');
    },
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
  },
  beforeDestroy() {
    eventBus.$off('createConnectionConfig', this.creationConfigHandlerBinded);
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
