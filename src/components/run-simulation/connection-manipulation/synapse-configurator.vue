
<!-- synapse is composed by 1 or multiple attibutes -->
<template>
  <div class="flex">
    <i-input
      class="raw-synapse-connection"
      :value="predefinedSynapses"
      readonly
    >
      <i-button slot="append"
        type="primary"
        @click="isConfiguring = true"
      >Configure</i-button>
    </i-input>


    <modal v-model="isConfiguring" width="300">
      <h3 slot="header">Synapse Configurator</h3>

      <row
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
      </row>

      <transition-group name="list">
        <row
          v-for="(synapseFragment, index) in synapseConfigList"
          :key="synapseFragment.uuid"
          type="flex" justify="space-between"
          class="spaced-row"
        >
          <i-col span="10">
            <i-select v-model="synapseFragment.attr">
              <option-group label="Scoped">
                  <i-option
                    v-for="item in synapseAttributes.scoped"
                    :value="item"
                    :key="item"
                  >{{ item }}</i-option>
              </option-group>
              <option-group label="Globals">
                  <i-option
                    v-for="item in synapseAttributes.global"
                    :value="item"
                    :key="item"
                  >{{ item }}</i-option>
              </option-group>
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
        </row>
      </transition-group>

      <div slot="footer">
        <i-button
          type="primary"
          @click="processSynapse"
        >Save</i-button>
      </div>
    </modal>

  </div>
</template>


<script>
import uuidGen from 'uuid';
import { synapseAttributes } from '@/config/connection-config';
import { synapseStringToArray, synapseArrayToString } from '@/services/helper/connection-helper';

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
.spaced-row {
  margin-bottom: 2px;
}
.flex {
  display: flex;
}
</style>
