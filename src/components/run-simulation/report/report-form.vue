
<template>
  <div>
    <modal
      width="390"
      v-model="formInvalid"
      @on-cancel="onCancel"
      class="report-form larger-inputs"
    >
      <h3 slot="header">Report Definition</h3>
      <div>
        <i-form
          ref="formValidate"
          name="reportForm"
          label-position="right"
          :rules="ruleValidate"
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

          <form-item prop="Type">
            <tooltip
              slot="label"
              content="Soma (compartment) means that each compartment outputs separately
              in the report file. Soma + Dendrites (AllCompartments + Summation) will sum up the
              compartments and write a single value to the report"
            >Compartments</tooltip>
            <i-select
              v-model="localReportInfo.Type"
              placeholder="Type"
            >
              <i-option value="Soma">Soma</i-option>
              <i-option :value="allCompartmentTargetObj.displayName">{{allCompartmentTargetObj.displayName}}</i-option>
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
                v-for="(reportOnInfo, key) in reportOptions"
                :key="key"
                :value="reportOnInfo.displayName"
              >{{ reportOnInfo.displayName }}</i-option>
            </i-select>
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
              <i-option
                v-if="isSonataCompatible"
                value="SONATA"
              >SONATA</i-option>
              <i-option value="ASCII">ASCII</i-option>
              <i-option value="HDF5">HDF5</i-option>
              <i-option value="Bin">Binary</i-option>
            </i-select>
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
      localReportInfo: Object.assign({}, this.reportInfo),
      allCompartmentTargetObj: this.$store.state.fullConfig.circuitConfig.allCompartmentTargetObj,

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
      const { reportOn } = this.$store.state.fullConfig.simulationConfig.genericSimulationConfig;
      if (!this.allCompartmentTargetObj) {
        const newReportOptions = Object.assign({}, reportOn);
        delete newReportOptions.lfp;
        return newReportOptions;
      }
      return reportOn;
    },
    reportType() {
      return this.localReportInfo.Type;
    },
    isSonataCompatible() {
      return this.$store.state.fullConfig.circuitConfig.isSonata;
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
    showWarningAllCompartments(type) {
      this.$Message.warning(`Simulation for ${type} is an expensive operation`);
    },
    reportOnChanged(newReportOn) {
      if (newReportOn === this.reportOptions.lfp.displayName) {
        // if report on lfp change other params to run simulation full lfp compatible
        this.$set(this.localReportInfo, 'Type', this.allCompartmentTargetObj.displayName);
        this.showWarningAllCompartments('LFP');
      }
      if (newReportOn === this.reportOptions.calcium.displayName) {
        this.$set(this.localReportInfo, 'Type', this.allCompartmentTargetObj.displayName);
        this.showWarningAllCompartments('Calcium');
      }
    },
  },
};
</script>
