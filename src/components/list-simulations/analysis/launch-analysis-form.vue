
<template>
  <div>
    <modal
      width="400"
      v-model="showModalLocal"
      @on-cancel="$emit('change-modal-visibility')"
      :mask-closable="false"
      class="report-form"
    >
      <h3 slot="header">Launch Analysis</h3>

      <div v-if="showModalLocal">
        <div>
          <i-form
            ref="formValidate"
            name="reportForm"
            label-position="right"
            :label-width="150"
            :model="{}"
          >
            <form-item prop="title" label="Title:">
              <i-input
                required
                v-model="title"
                placeholder="Title of the analysis"
                class="custom-small-width"
              />
            </form-item>

            <form-item prop="report" label="Report">
             <i-select
                v-model="reportForAnalysis"
                class="custom-small-width"
                :disabled="!reports.length"
              >
                <i-option
                  v-for="report in reports"
                  :key="report"
                  :value="report"
                >{{ report }}</i-option>
              </i-select>
            </form-item>

            <tabs>
              <tab-pane label="Raster/Traces">
                <analysis-picker
                  :analysis-list="analysisToRun"
                  :has-reports="!!reports.length"
                  :default-population="target"
                  ref="analysisPickerRef"
                />
              </tab-pane>

              <tab-pane label="LFP" :disabled="!isLFP || !reports.length">
                <lfp-analysis-picker
                  :sim-duration="simDuration"
                  :lfp-targets="lfpTargets"
                  :default-population="lfpTarget"
                  ref="lfpAnalysisPickerRef"
                />
              </tab-pane>
            </tabs>

          </i-form>
        </div>

      </div>

      <div slot="footer">
        <i-button
          @click="$emit('change-modal-visibility')"
        >Cancel</i-button>

        <i-button
          type="primary"
          :disabled="!hasAnalysisSelected"
          :loading="processing"
          @click="editItem"
        >Run Analysis</i-button>
      </div>
    </modal>
  </div>
</template>


<script>
import analysisConfig from '@/config/analysis-config';
import AnalysisPicker from './analysis-picker.vue';
import LfpAnalysisPicker from './lfp-analysis-picker.vue';
import { jobTags } from '@/common/job-status';
import {
  findDuration, getBlueConfigStr, getTargetByReport,
} from '@/services/helper/blueconfig-helper';

export default {
  name: 'AnalysisForm',
  props: ['jobSelectedForAnalysis', 'showModal', 'isRunningAnalysis'],
  components: {
    AnalysisPicker,
    LfpAnalysisPicker,
  },
  data() {
    return {
      showModalLocal: false,
      title: '',
      analysisToRun: analysisConfig.analysisAvailable,
      reportForAnalysis: null,
      target: null,
      lfpTarget: null,
      lfpTargets: [],
      simDuration: null,
    };
  },
  computed: {
    reports() {
      if (!this.jobSelectedForAnalysis) return [];
      const filteredNames = [];
      this.jobSelectedForAnalysis.children.forEach((file) => {
        if (file.endsWith('.bbp')) {
          // removes the / and .bbp
          filteredNames.push(file.substr(1, file.length - 5));
        }
      });
      return filteredNames;
    },
    processing() {
      return this.isRunningAnalysis || !this.target;
    },
    hasAnalysisSelected() {
      if (!this.showModalLocal) return false;
      const configArray = Object.values(this.$store.state.analysis.analysisConfigObj);
      const someIsActive = configArray.some(analysis => analysis.active && !!analysis.value);
      // TODO: check if the lfp analysis is fulfilled
      return (this.isLFP && this.$store.state.analysis.lfpAnalysisFulfilled) || someIsActive;
    },
    isLFP() {
      return this.jobSelectedForAnalysis.tags.includes(jobTags.LFP_SIMULATION);
    },
  },
  watch: {
    showModal(newVal) {
      this.showModalLocal = newVal;
      if (newVal) {
        // reset params
        this.reportForAnalysis = null;
        this.target = null;
        this.lfpTarget = null;
        this.lfpTargets = [];
        this.simDuration = null;
        this.$store.commit('resetAnalysisConfigObj');
        this.parseJobBlueConfig(this.jobSelectedForAnalysis);
      }
    },
    reports(newVal) {
      [this.reportForAnalysis] = newVal;
    },
    reportForAnalysis() {
      this.target = null;
      this.parseJobBlueConfig(this.jobSelectedForAnalysis);
    },
  },
  methods: {
    async editItem() {
      this.$emit('analysis-config-ready', this.generateAnalysisObjectToRun());
    },
    async parseJobBlueConfig(job) {
      // setup target for basic analysis
      const blueConfigStr = await getBlueConfigStr(job);
      const circuitTarget = getTargetByReport(blueConfigStr, this.reportForAnalysis);
      this.target = circuitTarget;

      // setup targets for lfp
      const lfpAnalysisTarget = circuitTarget;

      if (lfpAnalysisTarget === this.$store.state.fullConfig.circuitConfig.biggestTarget) {
        // show the full list of targets
        const targetNames = this.$store.state.fullConfig.circuitConfig.targets.map(t => t.name);
        this.lfpTargets = targetNames;
        this.lfpTarget = this.$store.state.fullConfig.circuitConfig.biggestTarget;
      } else {
        this.lfpTargets = [lfpAnalysisTarget];
        [this.lfpTarget] = this.lfpTargets;
      }

      // setup default times for LFP
      const simulationDuration = findDuration(blueConfigStr);
      this.simDuration = simulationDuration;
    },
    generateAnalysisObjectToRun() {
      let lfpAnalysisObj = {};
      if (this.isLFP) {
        lfpAnalysisObj = this.$refs.lfpAnalysisPickerRef.generatePlotsConfig();
        if (lfpAnalysisObj.hasLFPAnalysis && !lfpAnalysisObj.configOk) {
          this.$Message.error(`LFP Analysis - ${lfpAnalysisObj.errorMessage}`);
          return false;
        }
      }

      const basicAnalysisObj = this.$refs.analysisPickerRef.generatePlotsConfig();
      if (!lfpAnalysisObj.hasLFPAnalysis && !basicAnalysisObj.configOk) {
        this.$Message.error(`Basic Analysis - ${basicAnalysisObj.errorMessage}`);
        return false;
      }

      const defaultRunTime = analysisConfig.runtime;
      const analysisRunTime = lfpAnalysisObj.hasLFPAnalysis ? defaultRunTime * 2 : defaultRunTime;

      return {
        computerSelected: this.$store.state.fullConfig.computer,
        from: {},
        nodes: analysisConfig.nodes,
        runtime: analysisRunTime,
        title: this.title,
        basicPlotsConfig: basicAnalysisObj.configValues,
        lfpPlotsConfig: lfpAnalysisObj,
        reportForAnalysis: this.reportForAnalysis,
        lfpTarget: this.lfpTarget,
      };
    },
  },
};
</script>


<style scoped>
  .report-form .custom-small-width {
    width: 180px;
  }
</style>
