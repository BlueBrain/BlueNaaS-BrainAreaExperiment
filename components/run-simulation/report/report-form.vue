<template>
  <div class="report-form">
    <form name="reportForm">
      <div class="modal-body">
        <div class="form-group">
          <label
            class="control-label"
            title="Defines the region from where the data will be reported.">Target</label>
          <div class="controls autocomplete-container">
            <autocomplete-targets
              :target-selected="item.reportInfo.Target"
              @targetChanged="targetChanged"
            />
          </div>
        </div>

        <div class="form-group">
          <label
            class="control-label"
            title="Soma (compartment) means that each compartment outputs separately in the report file. Synapse indicates that each synapse will have a separate entry in the report.">Type</label>
          <div class="controls">
            <select
              id="Type"
              v-model="report.Type"
              class="form-control"
              type="text"
              placeholder="Type"
              required>
              <option
                v-for="type in filteredTypes"
                :key="type"
              >
                {{ type }}
              </option>
            </select>
          </div>
        </div>
        <!-- <div class="form-group">
                    <label class="control-label" title="The NEURON variable to access.">ReportOn</label>
                    <div class="controls">
                        <input v-model="report.ReportOn" type="text" id="ReportOn" placeholder="ReportOn" required class="form-control" disabled>
                    </div>
                </div> -->
        <!-- <div class="form-group">
                    <label class="control-label" title="The unit of the NEURON variable.">Unit</label>
                    <div class="controls">
                        <select v-model="report.Unit" type="text" id="Unit" placeholder="Unit" required class="form-control">
                          <option>mV</option>
                        </select>
                    </div>
                </div> -->
        <div class="form-group">
          <label
            class="control-label"
            title="Time to start reporting">StartTime(ms)</label>
          <div class="controls">
            <input
              id="StartTime"
              v-model="report.StartTime"
              type="number"
              placeholder="StartTime"
              required
              class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label
            class="control-label"
            title="Time to stop reporting">EndTime(ms)</label>
          <div class="controls">
            <input
              id="EndTime"
              v-model="report.EndTime"
              type="number"
              min="0"
              placeholder="EndTime"
              required
              class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label
            class="control-label"
            title="The frequency of reporting in milliseconds(ms)">Dt(ms)</label>
          <div class="controls">
            <input
              id="Dt"
              v-model="report.Dt"
              type="number"
              min="0"
              placeholder="Dt"
              required
              step="0.01"
              class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label
            class="control-label"
            title="Defines the report output format">Format</label>
          <div class="controls">
            <select
              id="Format"
              v-model="report.Format"
              class="form-control"
              type="text"
              placeholder="Format"
              required>
              <option>ASCII</option>
              <option>HDF5</option>
              <option>Bin</option>
            </select>
          </div>
        </div>
        <!-- <div class="form-group" v-if="report.Type == 'Summation'">
                    <label class="control-label" title="Handling of density values">Scaling</label>
                    <div class="controls">
                        <select class="form-control" v-model="report.Scaling" type="text" id="Format" placeholder="Format" required>
                            <option>Area</option>
                            <option>None</option>
                        </select>
                    </div>
                </div> -->
      </div>
      <div class="button-container">
        <input
          class="ok-button"
          type="button"
          value="OK"
          @click="editItem">
      </div>
    </form>
  </div>
</template>

<script>
import autocompleteTargets from 'components/shared/autocomplete-targets.vue';
import 'assets/css/simulation.css';
export default {
  name: 'ReportForm',
  components: {
    'autocomplete-targets': autocompleteTargets,
  },
  props: ['reportEditableObject'],
  data: function() {
    return {
      report: this.reportEditableObject.item.reportInfo,
      item: this.reportEditableObject.item,
      typesFull: ['Synapse', 'Soma'],
      filteredTypes: [],
    };
  },
  watch: {
    'report.StartTime': function(newVal) {
      this.item.start = parseFloat(newVal);
      this.form.elements.StartTime.setCustomValidity(''); // clears errors
    },
    'report.EndTime': function(newVal) {
      this.item.end = parseFloat(newVal);
    },
    'report.ReportOn': function(newVal) {
      this.item.content = newVal;
    },
    'report.Target': function(newVal) {
      this.targetChanged(newVal);
    },
  },
  created: function() {
    this.filteredTypes = this.typesFull;
  },
  mounted: function() {
    this.form = this.$el.querySelector('form');
  },
  methods: {
    closeForm: function() {
      this.$emit('changeModalVisibility', false);
    },
    editItem: function(event) {
      if (event.x === 0 && event.y === 0) {
        // avoid Enter key submissions
        return;
      }
      this.checkTimeValues(this.form);
      if (this.form.checkValidity()) {
        this.convertToNumbers();
        this.$emit('editItem', {
          item: this.item,
          callback: this.reportEditableObject.callback,
        });
      }
    },
    convertToNumbers: function() {
      // this converts the number inputs in floats
      let n = this.$el.querySelectorAll('input[type=number]');
      for (let i = 0; i < n.length; i++) {
        let input = n[i];
        this.report[input.id] = parseFloat(input.value);
      }
    },
    checkTimeValues: function(form) {
      let start = parseFloat(this.report.StartTime);
      let end = parseFloat(this.report.EndTime);
      if (start > end) {
        form.elements.StartTime.setCustomValidity('StartTime should be smaller than EndTime');
      } else {
        form.elements.StartTime.setCustomValidity('');
      }
    },
    targetChanged: function(selection) {
      if (this.report.Target !== selection) {
        this.item.group = selection;
        this.report.Target = selection;
        // check for AllCompartments allow only type compartment
        if (this.report.Target === 'AllCompartments') {
          this.filteredTypes = ['Compartment'];
          this.report.Type = this.filteredTypes[0];
        } else {
          this.filteredTypes = this.typesFull;
        }
      }
    },
  },
};
</script>

