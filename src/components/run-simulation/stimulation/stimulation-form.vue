
<template>
  <div>
    <modal
      width="350"
      v-model="formInvalid"
      @on-cancel="onCancel"
      class="stimulation-form"
    >
      <h3 slot="header">Stimulus Definition</h3>
      <div>
        <i-form
          ref="formValidate"
          :rules="ruleValidate"
          name="stimulationForm"
          label-position="right"
          :label-width="150"
          :model="stimulusInfo"
        >
          <form-item prop="target">
            <tooltip
              slot="label"
              content="Name of a population of cells to receive the stimulation"
            >Population</tooltip>
            <autocomplete-targets
              :target-selected="stimulusInfo.Target"
              :itemsAvailable="stimulationTargets"
              @targetChanged="targetChanged"
            />
          </form-item>

          <form-item prop="delay">
            <tooltip
              slot="label"
              content="Time when the stimulus commences. given in milliseconds(ms)"
            >Delay(ms)</tooltip>
            <input-number
              size="small"
              v-model="stimulusInfo.Delay"
              placeholder="Delay"
            />
          </form-item>

          <form-item prop="duration">
            <tooltip
              slot="label"
              content="Time length of stimulus duration, given in milliseconds(ms)"
            >Duration(ms)</tooltip>
            <input-number
              size="small"
              v-model="stimulusInfo.Duration"
              :min="0"
              placeholder="Duration"
              number
            />
          </form-item>

          <form-item prop="numOfSynapses">
            <tooltip
              slot="label"
              content="Number of synapses to add per neuron"
            >Synapses per cell</tooltip>
            <input-number
              size="small"
              v-model="stimulusInfo.NumOfSynapses"
              :min="0"
              placeholder="Number of synapses"
            />
          </form-item>

          <!-- <form-item>
            <tooltip content="Type of the stimulus">
              Pattern
            </tooltip>
            <i-input
              id="Pattern"
              v-model="stimulusInfo.Pattern"
              value="Poisson"
            />
          </form-item> -->

          <form-item prop="lambda">
            <tooltip
              slot="label"
              content="Configure the random distribution"
            >Lambda</tooltip>
            <input-number
              size="small"
              v-model="stimulusInfo.Lambda"
              :min="1"
              placeholder="Lambda"
            />
          </form-item>

          <form-item prop="weight">
            <tooltip
              slot="label"
              content="The strengths of the added synapses"
            >Weight</tooltip>
            <input-number
              size="small"
              v-model="stimulusInfo.Weight"
              :min="0"
              placeholder="Weight"
              :step="0.1"
            />
          </form-item>

        </i-form>
      </div>
      <div slot="footer">
        <i-button
          type="primary"
          @click="editItem"
        >Save</i-button>
      </div>
    </modal>
  </div>
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';

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

      ruleValidate: {
        target: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.stimulusInfo.Target) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        delay: [{
          required: true,
          type: 'number',
          validator: (rule, value, callback) => {
            if (!this.stimulusInfo.Delay && this.stimulusInfo.Delay !== 0) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        duration: [{
          required: true,
          type: 'number',
          validator: (rule, value, callback) => {
            if (!this.stimulusInfo.Duration) {
              callback(new Error('should be defined'));
              return;
            }
            if (this.stimulusInfo.Delay > this.stimulusInfo.Duration) {
              callback(new Error('delay grather than duration'));
              return;
            }
            callback();
          },
        }],
        numOfSynapses: [{
          required: true,
          type: 'number',
          validator: (rule, value, callback) => {
            if (!this.stimulusInfo.NumOfSynapses) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        lambda: [{
          required: true,
          type: 'number',
          validator: (rule, value, callback) => {
            if (!this.stimulusInfo.Lambda) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        weight: [{
          required: true,
          type: 'number',
          validator: (rule, value, callback) => {
            if (!this.stimulusInfo.Weight) {
              callback(new Error('should be defined'));
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
  },
  computed: {
    stimulationTargets() {
      return this.$store.state.stimulationTargets;
    },
  },
  methods: {
    onCancel() {
      this.$emit('hideModal');
    },
    async editItem() {
      // this.form = this.$el.querySelector('form');
      const isValid = await this.$refs.formValidate.validate();
      if (isValid) {
        this.$emit('itemEdited', this.stimulusInfo);
        this.formInvalid = false;
      }
    },
    targetChanged(newTarget) {
      if (this.stimulusInfo.Target !== newTarget) {
        this.stimulusInfo.Target = newTarget;
      }
    },
  },
};
</script>
