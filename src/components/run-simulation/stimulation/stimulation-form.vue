
<template>
  <div>
    <modal
      width="390"
      v-model="formInvalid"
      @on-cancel="onCancel"
      class="stimulation-form larger-inputs"
    >
      <h3 slot="header">Stimulus Definition</h3>
      <div v-if="hasStimulusInfo">
        <i-form
          ref="formValidate"
          name="stimulationForm"
          label-position="right"
          :rules="ruleValidate"
          :label-width="150"
          :model="localStimInfo"
        >
          <form-item prop="Target">
            <tooltip
              slot="label"
              content="Name of a population of cells to receive the stimulation"
            >Population</tooltip>
            <autocomplete-targets
              :target-selected="localStimInfo.Target"
              :itemsAvailable="stimulationTargets"
              @target-changed="targetChanged"
            />
          </form-item>

          <form-item prop="Delay">
            <tooltip
              slot="label"
              content="Time when the stimulus commences. given in milliseconds(ms)"
            >Delay(ms)</tooltip>
            <input-number
              v-model="localStimInfo.Delay"
              placeholder="0"
            />
          </form-item>

          <form-item prop="Duration">
            <tooltip
              slot="label"
              content="Time length of stimulus duration, given in milliseconds(ms)"
            >Duration(ms)</tooltip>
            <input-number
              v-model="localStimInfo.Duration"
              :min="0"
              placeholder="300"
              number
            />
          </form-item>

          <form-item>
            <tooltip
              slot="label"
              content="Type of the stimulus"
            >Pattern</tooltip>
            <i-select v-model="localPattern">
              <i-option
                v-for="stimulus in stimuliAvailable"
                :key="stimulus"
                :value="stimulus"
              >{{ stimulus }}</i-option>
            </i-select>
          </form-item>

          <form-item
            v-if="showStimulusParam('NumOfSynapses')"
            prop="NumOfSynapses"
            required
          >
            <tooltip
              slot="label"
              content="Number of synapses to add per neuron"
            >Synapses per cell</tooltip>
            <input-number
              v-model="localStimInfo.NumOfSynapses"
              :min="0"
              placeholder="10"
            />
          </form-item>

          <form-item
            v-if="showStimulusParam('Lambda')"
            prop="Lambda"
            required
          >
            <tooltip
              slot="label"
              content="Configure the random distribution"
            >Lambda</tooltip>
            <input-number
              v-model="localStimInfo.Lambda"
              :min="1"
              placeholder="1"
            />
          </form-item>

          <form-item
            v-if="showStimulusParam('Weight')"
            prop="Weight"
            required
          >
            <tooltip
              slot="label"
              content="The strengths of the added synapses"
            >Weight</tooltip>
            <input-number
              v-model="localStimInfo.Weight"
              :min="0"
              placeholder="0.2"
              :step="0.1"
            />
          </form-item>

          <form-item
            v-if="showStimulusParam('AmpStart')"
            prop="AmpStart"
            required
          >
            <tooltip
              slot="label"
              content="The amount of current initially injected when the stimulus activates (mA)"
            >AmpStart</tooltip>
            <input-number
              v-model="localStimInfo.AmpStart"
              :min="0"
              placeholder="1"
              :step="0.1"
            />
          </form-item>

          <form-item
            v-if="showStimulusParam('AmpEnd')"
            prop="AmpEnd"
            required
          >
            <tooltip
              slot="label"
              content="The final current when a stimulus concludes (mA)"
            >AmpEnd</tooltip>
            <input-number
              v-model="localStimInfo.AmpEnd"
              :min="0"
              placeholder="2"
              :step="0.1"
            />
          </form-item>

          <form-item
            v-if="showStimulusParam('MeanPercent')"
            prop="MeanPercent"
            required
          >
            <tooltip
              slot="label"
              content="Mean value of current to inject is a percentage of a cell’s threshold current"
            >MeanPercent</tooltip>
            <input-number
              v-model="localStimInfo.MeanPercent"
              placeholder="95"
            />
          </form-item>

          <form-item
            v-if="showStimulusParam('Variance')"
            prop="Variance"
            required
          >
            <tooltip
              slot="label"
              content="The variance around the mean (mV)"
            >Variance</tooltip>
            <input-number
              v-model="localStimInfo.Variance"
              placeholder="0.001"
              :step="0.001"
            />
          </form-item>

        </i-form>
      </div>
      <div slot="footer">
        <i-button
          type="primary"
          size="default"
          @click="editItem"
        >Save</i-button>
      </div>
    </modal>
  </div>
</template>


<script>
import pick from 'lodash/pick';
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import { unmapBlueConfigTerms, mapBlueConfigTerms } from '@/common/utils';

export default {
  name: 'StimulationForm',
  components: {
    AutocompleteTargets,
  },
  props: ['stimulusInfo', 'showModal'],
  data() {
    return {
      processedTargetList: undefined,
      formInvalid: false,
      localPattern: '',
      localStimInfo: Object.assign({}, this.stimulusInfo),

      ruleValidate: {
        Delay: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.localStimInfo.Delay && this.localStimInfo.Delay !== 0) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        Duration: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.localStimInfo.Duration) {
              callback(new Error('should be defined'));
              return;
            }
            if (this.localStimInfo.Delay > this.localStimInfo.Duration) {
              callback(new Error('delay grather than duration'));
              return;
            }
            callback();
          },
        }],
      },

    };
  },
  watch: {
    showModal(newVal) {
      this.formInvalid = newVal;
    },
    stimulusInfo(newInfo) {
      if (!newInfo) return;
      this.localStimInfo = Object.assign({}, newInfo);
      this.localPattern = newInfo.Pattern;
    },
    localPattern() {
      if (!this.$refs.formValidate) return;
      // clean the previous errors
      this.$nextTick(() => { this.$refs.formValidate.validate(); });
    },
  },
  computed: {
    stimulationTargets() {
      return this.$store.state.stimulationTargets;
    },
    stimuliAvailable() {
      const simConfig = this.$store.state.currentSimulationConfig;
      return simConfig.stimuli.map(stimulus => unmapBlueConfigTerms(stimulus.name));
    },
    hasStimulusInfo() {
      return !!Object.keys(this.localStimInfo).length;
    },
    paramsToShow() {
      const patternName = mapBlueConfigTerms(this.localPattern);
      const simConfig = this.$store.state.currentSimulationConfig;
      const stimulus = simConfig.stimuli.find(s => s.name === patternName);
      return stimulus ? stimulus.params : [];
    },
  },
  methods: {
    onCancel() {
      this.$emit('hide-modal');
    },
    async editItem() {
      this.localStimInfo.Pattern = this.localPattern;
      const isValid = await this.$refs.formValidate.validate();
      if (!isValid) return;

      const valuesToKeep = ['Delay', 'Duration', 'Mode', 'Pattern', 'Target', ...this.paramsToShow];
      const prunedStimulusInfo = pick(this.localStimInfo, valuesToKeep);
      this.$emit('item-edited', prunedStimulusInfo);
      this.formInvalid = false;
    },
    targetChanged(newTarget) {
      if (this.localStimInfo.Target !== newTarget) {
        this.localStimInfo.Target = newTarget;
      }
    },
    showStimulusParam(paramName) {
      const showParam = this.paramsToShow.includes(paramName);
      if (showParam && !this.localStimInfo[paramName]) {
        this.$set(this.localStimInfo, paramName, null);
      }
      return showParam;
    },
  },
};
</script>
