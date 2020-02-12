
<template>
  <div class="flex">

    <modal
      v-model="localProjItem.isConfiguring"
      width="350"
      :mask-closable="false"
      @on-cancel="$emit('on-close')"
    >
      <h3 slot="header">Projection Configurator</h3>

      <i-form
        ref="formValidate"
        name="reportForm"
        label-position="right"
        :label-width="150"
        :rules="ruleValidate"
        :model="localProjItem"
      >
        <form-item prop="weight" label="Weight:">
          <input-number v-model="localProjItem.weight"/>
        </form-item>

        <form-item prop="isMinis" label="Use Minis:">
          <checkbox v-model="localProjItem.isMinis"/>
        </form-item>
        <form-item
          v-if="localProjItem.isMinis"
          prop="minisFreq"
          label="Frequency (Hz):"
        >
          <input-number
            :step="0.01"
            v-model="localProjItem.minisFreq"
          />
        </form-item>

        <form-item prop="isSpikeReplay" label="Use Spike Replay:">
          <checkbox v-model="localProjItem.isSpikeReplay"/>
        </form-item>
        <form-item
          v-if="localProjItem.isSpikeReplay"
          prop="target"
          label="Target:"
        >
          <i-select v-model="localProjItem.target" disabled>
            <i-option :value="localProjItem.target">{{ unmapBlueConfigTerms(localProjItem.target) }}</i-option>
          </i-select>
        </form-item>
        <form-item
          v-if="localProjItem.isSpikeReplay"
          prop="replayFreq"
          label="Frequency (Hz):"
        >
          <input-number
            v-model="localProjItem.replayFreq"
            :step="0.1"
            placeholder="0.1"
          />
        </form-item>
        <form-item
          v-if="localProjItem.isSpikeReplay"
          prop="type"
          label="Stimulus Type:"
        >
          <i-select v-model="localProjItem.type" disabled>
            <i-option :value="localProjItem.type">{{ localProjItem.type }}</i-option>
          </i-select>
        </form-item>
      </i-form>

      <div slot="footer">
        <i-button
          type="primary"
          @click="projectionEdited"
        >Save</i-button>
      </div>
    </modal>

  </div>
</template>


<script>
import AutocompleteTarget from '@/components/shared/autocomplete-targets.vue';
import { unmapBlueConfigTerms } from '@/common/utils';

export default {
  name: 'ProjectionConfigurator',
  props: ['projectionItem'],
  components: {
    AutocompleteTarget,
  },
  data() {
    return {
      unmapBlueConfigTerms,
      localProjItem: {},
      ruleValidate: {
        weight: [{ required: true }],
        minisFreq: [{
          validator: (rule, value, callback) => {
            if (!this.localProjItem.isMinis) return callback();
            if (!value) return callback(new Error('minis frequency is required'));
            return callback();
          },
        }],
        target: [{
          validator: (rule, value, callback) => {
            if (!this.localProjItem.isSpikeReplay) return callback();
            if (!value) return callback(new Error('target is required'));
            return callback();
          },
        }],
        replayFreq: [{
          validator: (rule, value, callback) => {
            if (!this.localProjItem.isSpikeReplay) return callback();
            if (!value) return callback(new Error('frequency is required'));
            return callback();
          },
        }],
        type: [{
          validator: (rule, value, callback) => {
            if (!this.localProjItem.isSpikeReplay) return callback();
            if (!value) return callback(new Error('type is required'));
            return callback();
          },
        }],
      },
    };
  },
  watch: {
    projectionItem(newVal) {
      this.localProjItem = Object.assign({}, newVal);
    },
  },
  methods: {
    async projectionEdited() {
      const hasSelectedOne = this.localProjItem.isMinis || this.localProjItem.isSpikeReplay;
      const formIsValid = await this.$refs.formValidate.validate();
      if (!hasSelectedOne) {
        this.$Message.warning('No Projections were selected');
      }
      if (!formIsValid) {
        this.$Message.warning('Please complete the field');
      } else {
        this.$emit('on-ready', this.localProjItem);
      }
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
