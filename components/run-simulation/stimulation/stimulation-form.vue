<template>
  <div class="stimulation-form">
    <form name="stimulationForm">
      <div class="modal-body">
        <div class="form-group">
          <label
            class="control-label"
            title="Name of a target to receive the stimulation">Target</label>
          <div class="controls autocomplete-container">
            <autocomplete-targets
              :target-selected="item.stimulusInfo.Target"
              @targetChanged="targetChanged"
            />
          </div>
        </div>

        <div class="form-group">
          <label
            class="control-label"
            title="Time when the stimulus commences. given in milliseconds(ms)">Delay(ms)</label>
          <div class="controls">
            <input
              id="Delay"
              v-model="stimulus.Delay"
              type="number"
              required
              placeholder="Delay"
              class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label
            class="control-label"
            title="Time length of stimulus duration, given in milliseconds(ms)">Duration(ms)</label>
          <div class="controls">
            <input
              id="Duration"
              v-model="stimulus.Duration"
              type="number"
              min="0"
              required
              placeholder="Duration"
              class="form-control">
          </div>
        </div>

        <div
          v-if="stimulus.Pattern == 'Poisson'"
          class="form-group">
          <label
            class="control-label"
            title="Number of synapses to add per neuron">Synapses per cell</label>
          <div class="controls">
            <input
              id="NumOfSynapses"
              v-model="stimulus.NumOfSynapses"
              type="number"
              min="0"
              placeholder="Number of synapses"
              required
              class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label
            class="control-label"
            title="Type of the stimulus">Pattern</label>
          <div class="controls">
            <input
              id="Pattern"
              v-model="stimulus.Pattern"
              type="text"
              min="0"
              required
              class="form-control"
              disabled
              value="Poisson">
          </div>
        </div>

        <div
          v-if="stimulus.Pattern == 'Poisson'"
          class="form-group">
          <label
            class="control-label"
            title="Configure the random distribution">Lambda</label>
          <div class="controls">
            <input
              id="Lambda"
              v-model="stimulus.Lambda"
              type="number"
              min="0"
              placeholder="Lambda"
              required
              class="form-control">
          </div>
        </div>

        <div
          v-if="stimulus.Pattern == 'Poisson'"
          class="form-group">
          <label
            class="control-label"
            title="The strengths of the added synapses">Weight</label>
          <div class="controls">
            <input
              id="Weight"
              v-model="stimulus.Weight"
              type="number"
              min="0"
              placeholder="Weight"
              required
              class="form-control"
              step="0.1">
          </div>
        </div>

        <div class="button-container">
          <input
            class="ok-button"
            type="button"
            value="Ok"
            @click="editItem">
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import autocompleteTargets from 'components/shared/autocomplete-targets.vue';
import 'assets/css/simulation.css';
export default {
  name: 'StimulationForm',
  components: {
    'autocomplete-targets': autocompleteTargets,
  },
  props: ['editableItem'],
  data: function() {
    return {
      processedTargetList: undefined,
      item: this.editableItem.item,
      stimulus: this.editableItem.item.stimulusInfo,
      form: undefined,
    };
  },
  watch: {
    'stimulus.Delay': function(newVal) {
      this.item.start = parseFloat(newVal);
      this.form.elements.Delay.setCustomValidity(''); // clears errors
    },
    'stimulus.Duration': function(newVal) {
      this.item.end = parseFloat(newVal);
    },
    'stimulus.Pattern': function(newVal) {
      this.item.content = newVal;
      this.item.className = newVal;
      this.cleanStimulus();
    },
    'stimulus.Target': function(newVal) {
      this.targetChanged(newVal);
    },
  },
  mounted: function() {
    this.form = this.$el.querySelector('form');
  },
  methods: {
    closeForm: function() {
      this.$emit('changeModalVisibility', false);
    },
    convertToNumbers: function() {
      // this converts the number inputs in floats
      let n = this.$el.querySelectorAll('input[type=number]');
      for (let i = 0; i < n.length; i++) {
        let input = n[i];
        this.stimulus[input.id] = parseFloat(input.value);
      }
    },
    editItem: function(event) {
      if (event.x === 0 && event.y === 0) {
        // avoid Enter key submissions
        return;
      }
      this.checkTimeValues(this.form);
      if (this.form.checkValidity()) {
        this.items;
        this.convertToNumbers();
        this.item.stimulusInfo = this.stimulus;
        this.$emit('editItem', {
          item: this.item,
          callback: this.editableItem.callback,
        });
        this.item = null;
        this.stimulus = null;
      }
    },
    checkTimeValues: function(form) {
      let start = parseFloat(this.stimulus.Delay);
      let end = parseFloat(this.stimulus.Duration);
      if (start > end) {
        form.elements.Delay.setCustomValidity('Delay should be smaller than duration');
      } else {
        form.elements.Delay.setCustomValidity('');
      }
    },
    cleanStimulus: function() {
      let cleanStim = {
        Delay: this.stimulus.Delay,
        Duration: this.stimulus.Duration,
        Pattern: this.stimulus.Pattern,
        Target: this.stimulus.Target,
      };
      this.stimulus = cleanStim;
    },
    targetChanged: function(selection) {
      if (this.stimulus.Target !== selection) {
        this.item.group = selection;
        this.stimulus.Target = selection;
      }
    },
  },
};
</script>

