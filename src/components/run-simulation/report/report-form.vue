
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
          :model="localReportInfo"
        >
          <form-item prop="Target">
            <tooltip
              slot="label"
              content="Defines the population of cells from where the data will be reported"
            >Population</tooltip>
            <autocomplete-targets
              :target-selected="localReportInfo.Target"
              :itemsAvailable="reportTargets"
              @target-changed="targetChanged"
            />
          </form-item>

          <form-item prop="Type">
            <tooltip
              slot="label"
              content="Soma (compartment) means that each compartment outputs separately
              in the report file. Synapse indicates that each synapse will have a
              separate entry in the report"
            >Type</tooltip>
            <i-select
              v-model="localReportInfo.Type"
              placeholder="Type"
            >
              <i-option value="Soma">Soma</i-option>
              <i-option value="Summation">Summation</i-option>
            </i-select>
          </form-item>

          <form-item prop="ReportOn">
            <tooltip
              slot="label"
              content="The NEURON variable to access"
            >ReportOn</tooltip>
            <i-select
              v-model="localReportInfo.ReportOn"
              @on-change="reportOnChanged"
            >
              <i-option
                v-for="(name, value) in reportOptions"
                :key="value"
                :value="name"
              >{{ name }}</i-option>
            </i-select>
          </form-item>

          <form-item prop="StartTime">
            <tooltip
              slot="label"
              content="Time to start reporting"
            >StartTime(ms)</tooltip>
            <input-number
              v-model="localReportInfo.StartTime"
              placeholder="Start Time"
            />
          </form-item>

          <form-item prop="EndTime" required>
            <tooltip
              slot="label"
              content="Time to stop reporting"
            >EndTime(ms)</tooltip>
            <input-number
              v-model="localReportInfo.EndTime"
              placeholder="End Time"
            />
          </form-item>

          <form-item prop="Dt" required>
            <tooltip
              slot="label"
              content="The frequency of reporting in milliseconds(ms)"
            >Dt(ms)</tooltip>
            <input-number
              v-model="localReportInfo.Dt"
              :step="0.01"
              :min="0.01"
              placeholder="Dt"
            />
          </form-item>

          <form-item prop="Format">
            <tooltip
              slot="label"
              content="Report output format"
            >Format</tooltip>
            <i-select
              v-model="localReportInfo.Format"
              placeholder="Output Format"
            >
              <i-option value="ASCII">ASCII</i-option>
              <i-option value="HDF5">HDF5</i-option>
              <i-option value="Bin">Bin</i-option>
            </i-select>
          </form-item>

          <!-- <div class="form-group" v-if="localReportInfo.Type == 'Summation'">
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
          size="default"
          @click="editItem"
        >Save</i-button>
      </div>
    </modal>
  </div>
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import simulationConfig from '@/config/simulation-config';

export default {
  name: 'ReportForm',
  components: {
    AutocompleteTargets,
  },
  props: ['reportInfo', 'showModal'],
  data() {
    return {
      formInvalid: false,
      localReportInfo: Object.assign({}, this.reportInfo),

      ruleValidate: {
        StartTime: [{
          required: true,
          validator: (rule, value, callback) => {
            let message = '';
            if (!this.localReportInfo.StartTime && this.localReportInfo.StartTime !== 0) {
              message = 'should be defined';
            }
            if (this.localReportInfo.StartTime > this.localReportInfo.EndTime) {
              message = 'start time after end time';
            }
            if (message) {
              callback(new Error(message));
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
    reportInfo(newInfo) {
      if (!newInfo) return;
      this.localReportInfo = Object.assign({}, newInfo);
    },
  },
  computed: {
    reportTargets() {
      return this.$store.state.reportTargets;
    },
    reportOptions() {
      return simulationConfig.reportOn;
    },
  },
  methods: {
    onCancel() {
      this.$emit('hide-modal');
    },
    async editItem() {
      const isValid = await this.$refs.formValidate.validate();
      if (!isValid) return;

      this.$emit('item-edited', this.localReportInfo);
      this.formInvalid = false;
    },

    targetChanged(newTarget) {
      if (this.localReportInfo.Target === newTarget) return;
      this.$set(this.localReportInfo, 'Target', newTarget);
    },
    reportOnChanged(newReportOn) {
      if (newReportOn !== this.reportOptions.lfp) return;
      // if report on lfp change other params to run simulation full lfp compatible
      this.$set(this.localReportInfo, 'Type', 'Summation');
      const lfpTarget = this.reportTargets.find(t => t.lfp);
      this.$set(this.localReportInfo, 'Target', lfpTarget.displayName);
    },
  },
};
</script>
