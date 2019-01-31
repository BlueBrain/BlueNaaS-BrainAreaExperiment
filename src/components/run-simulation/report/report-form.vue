
<template>
  <div>
    <modal
      width="350"
      v-model="formInvalid"
      @on-cancel="onCancel"
      class="report-form"
    >
      <h3 slot="header">Report Definition</h3>
      <div>
        <i-form
          ref="formValidate"
          :rules="ruleValidate"
          name="reportForm"
          label-position="right"
          :label-width="150"
          :model="reportInfo"
        >
          <form-item prop="target">
            <tooltip
              slot="label"
              content="Defines the population of cells from where the data will be reported"
            >Population</tooltip>
            <autocomplete-targets
              :target-selected="reportInfo.Target"
              :itemsAvailable="reportTargets"
              @targetChanged="targetChanged"
            />
          </form-item>

          <form-item prop="type">
            <tooltip
              slot="label"
              content="Soma (compartment) means that each compartment outputs separately
              in the report file. Synapse indicates that each synapse will have a
              separate entry in the report"
            >Type</tooltip>
            <i-select
              v-model="reportInfo.Type"
              placeholder="Type"
              size="small"
            >
              <i-option
                v-for="type in filteredTypes"
                :value="type"
                :key="type"
              >{{ type }}</i-option>
            </i-select>
          </form-item>

          <!-- <div class="form-group">
            <label class="control-label" title="The NEURON variable to access.">ReportOn</label>
            <div class="controls">
                <input v-model="reportInfo.ReportOn" type="text"
                id="ReportOn" placeholder="ReportOn" required class="form-control" disabled>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label" title="The unit of the NEURON variable.">Unit</label>
            <div class="controls">
              <select v-model="reportInfo.Unit" type="text"
              id="Unit" placeholder="Unit" required class="form-control">
                <option>mV</option>
              </select>
            </div>
          </div> -->

          <form-item prop="startTime">
            <tooltip
              slot="label"
              content="Time to start reporting"
            >StartTime(ms)</tooltip>
            <input-number
              size="small"
              v-model="reportInfo.StartTime"
              placeholder="Start Time"
            />
          </form-item>

          <form-item prop="endTime">
            <tooltip
              slot="label"
              content="Time to stop reporting"
            >EndTime(ms)</tooltip>
            <input-number
              size="small"
              v-model="reportInfo.EndTime"
              placeholder="End Time"
            />
          </form-item>

          <form-item prop="dt">
            <tooltip
              slot="label"
              content="The frequency of reporting in milliseconds(ms)"
            >Dt(ms)</tooltip>
            <input-number
              size="small"
              v-model="reportInfo.Dt"
              :step="0.01"
              :min="0.01"
              placeholder="Dt"
            />
          </form-item>

          <form-item prop="format">
            <tooltip
              slot="label"
              content="Report output format"
            >Format</tooltip>
            <i-select
              size="small"
              v-model="reportInfo.Format"
              placeholder="Output Format"
            >
              <i-option value="ASCII">ASCII</i-option>
              <i-option value="HDF5">HDF5</i-option>
              <i-option value="Bin">Bin</i-option>
            </i-select>
          </form-item>

          <!-- <div class="form-group" v-if="reportInfo.Type == 'Summation'">
            <label class="control-label" title="Handling of density values">Scaling</label>
            <div class="controls">
              <select class="form-control" v-model="report.Scaling"
              type="text" id="Format" placeholder="Format" required>
                <option>Area</option>
                <option>None</option>
              </select>
            </div>
          </div> -->

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
  name: 'ReportForm',
  components: {
    AutocompleteTargets,
  },
  props: ['reportInfo', 'showModal'],
  data() {
    return {
      formInvalid: false,
      typesFull: ['Synapse', 'Soma'],
      filteredTypes: [],

      ruleValidate: {
        target: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.reportInfo.Target) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        type: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.reportInfo.Type) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        startTime: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.reportInfo.StartTime && this.reportInfo.StartTime !== 0) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        endTime: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.reportInfo.EndTime) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        dt: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.reportInfo.Dt) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        format: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.reportInfo.Format) {
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
    reportTargets() {
      return this.$store.state.reportTargets;
    },
  },
  mounted() {
    this.filteredTypes = this.typesFull;
  },
  methods: {
    onCancel() {
      this.$emit('hideModal');
    },
    async editItem() {
      const isValid = await this.$refs.formValidate.validate();
      if (isValid) {
        this.$emit('itemEdited', this.reportInfo);
        this.formInvalid = false;
      }
    },

    targetChanged(newTarget) {
      if (this.reportInfo.Target !== newTarget) {
        this.reportInfo.Target = newTarget;
      }
    },
  },
};
</script>
