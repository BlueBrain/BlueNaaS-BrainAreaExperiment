
<!--
This component allows to create or modify the connections in the circuit for the simulation
-->
<template>
  <div class="connection-manipulation">

    <!-- Header for connection manipulation -->
    <Row type="flex" class="connection-table-header" justify="space-between">
      <i-col span="4"><h3>Source</h3></i-col>
      <i-col span="4"><h3>Destination</h3></i-col>
      <i-col span="2"><h3>Delay (ms)</h3></i-col>
      <i-col span="2"><h3>Weight</h3></i-col>
      <i-col span="2"><h3>SpontMinis</h3></i-col>
      <i-col span="6"><h3>Synapse Configuration</h3></i-col>
      <i-col span="1">
        <i-button
          size="small"
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
              @targetChanged="updateValue(connection, 'source', ...arguments)"
            />
          </i-col>
          <i-col span="4">
            <autocomplete-targets
              :target-selected="connection.destination"
              :itemsAvailable="targets"
              @targetChanged="updateValue(connection, 'destination', ...arguments)"
            />
          </i-col>
          <i-col span="2">
            <input-number
              :min="0"
              :step="10"
              size="small"
              v-model="connection.delay"
              :value="connection.delay"
            />
          </i-col>
          <i-col span="2">
            <input-number
              size="small"
              :min="1"
              v-model="connection.weight"
              :value="connection.weight"
            />
          </i-col>
          <i-col span="2">
            <input-number
              size="small"
              :min="0"
              :step="0.01"
              v-model="connection.spontMinis"
              :value="connection.spontMinis"
            />
          </i-col>
          <i-col span="6">
            <i-input
              v-if="connection.synapseConfigure"
              size="small"
              v-model="connection.synapseConfigure"
            />
            <Checkbox
              v-else
              @on-change="$set(connection, 'synapseConfigure', '%')"
            >Configure Synapse</Checkbox>
          </i-col>
          <i-col span="1">
            <i-button
              size="small"
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
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import { getDefaultConnections } from '@/services/helper/connection-helper';
import { mapBlueConfigTerms } from '@/common/utils';
import eventBus from '@/services/event-bus';
import cleanDeep from 'clean-deep';

export default {
  name: 'ConnectionManipulation',
  components: {
    AutocompleteTargets,
  },
  data() {
    return {
      connectionsArray: {},

    };
  },
  computed: {
    targets() {
      return this.$store.state.connectionTargets;
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
      this.$set(connection, 'hasSynapseConfigure', true);
      this.$set(connection, 'synapseConfigure', '');
    },
    addNewConnection() {
      this.connectionsArray.push({ id: Date.now() });
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
        if (!connectionItem.destination || !connectionItem.source) return;
        conn.Source = mapBlueConfigTerms(connectionItem.source);
        conn.Destination = mapBlueConfigTerms(connectionItem.destination);
        conn.Delay = connectionItem.delay > 0 ? connectionItem.delay : null;
        conn.SpontMinis = connectionItem.spontMinis;
        conn.SynapseConfigure = connectionItem.synapseConfigure !== '' ? connectionItem.synapseConfigure : null;
        conn.Weight = connectionItem.weight;
        const name = `${conn.Source}-${conn.Destination}`;
        prunedConnections[name] = cleanDeep(conn);
      });
      return ({ Connection: prunedConnections });
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
  .list-enter-active, .list-leave-active {
    transition: all 0.3s;
  }
  .list-enter, .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
</style>
