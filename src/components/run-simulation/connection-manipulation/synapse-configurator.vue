
<!-- synapse is composed by 1 or multiple attibutes -->
<template>
  <div>

    <i-input
      v-if="predefinedSynapses"
      class="raw-synapse-connection"
      :disabled="true"
      :value="predefinedSynapses"
    />

    <i-button
      type="primary"
      @click="isConfiguring = true"
    >Configure</i-button>

    <Modal v-model="isConfiguring" width="300">
      <h3 slot="header">Synapse Configurator</h3>

      <Row
        type="flex"
        justify="space-between"
      >
        <i-col span="10"><h3>Attribute</h3></i-col>
        <i-col span="10"><h3>Value</h3></i-col>
        <i-col span="3">
          <i-button
            type="success"
            icon="md-add"
            @click="addNewSynapseAttribute()"
          />
        </i-col>
      </Row>

      <transition-group name="list">
        <Row
          v-for="(synapseFragment, index) in synapseConfigList"
          :key="synapseFragment.uuid"
          type="flex" justify="space-between"
          class="spaced-row"
        >
          <i-col span="10">
            <i-select
              v-model="synapseFragment.attr"
            >
              <i-option
                v-for="synapseName in synapseAttributes"
                :value="synapseName"
                :key="synapseName"
              >
                {{ synapseName }}
              </i-option>
            </i-select>
          </i-col>
          <i-col span="10">
            <input-number
              v-model="synapseFragment.value"
            />
          </i-col>
          <i-col span="3">
            <i-button
              type="primary"
              ghost
              icon="md-remove"
              @click="removeSynapseAttr(index)"
            />
          </i-col>
        </Row>
      </transition-group>

      <div slot="footer">
        <i-button
          type="primary"
          @click="processSynapse"
        >Save</i-button>
      </div>
    </Modal>

  </div>
</template>


<script>
import { synapseAttributes } from '@/config/connection-config';
import { synapseStringToArray, synapseArrayToString } from '@/services/helper/connection-helper';
import uuidGen from 'uuid';

export default {
  name: 'SynapseConfigurator',
  props: ['predefinedSynapses'],
  data() {
    return {
      synapseConfigList: [],
      isConfiguring: false,
      synapseAttributes,
    };
  },
  mounted() {
    this.synapseConfigList = synapseStringToArray(this.predefinedSynapses);
  },
  methods: {
    processSynapse() {
      const synapseString = synapseArrayToString(this.synapseConfigList);
      this.$emit('on-ready', synapseString);
      this.isConfiguring = false;
    },
    addNewSynapseAttribute() {
      this.synapseConfigList.push({
        attr: synapseAttributes[0],
        value: 0,
        uuid: uuidGen(),
      });
    },
    removeSynapseAttr(index) {
      this.synapseConfigList.splice(index, 1);
    },
  },
};
</script>


<style>
.raw-synapse-connection {
  width: 80%;
}
.spaced-row {
  margin-bottom: 2px;
}
</style>
