
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
              />
            </form-item>

            <form-item prop="report" label="Report">
             <i-select
                v-model="reportForAnalysis"
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
                  :has-report="!!reports.length"
                  :default-population="target"
                  ref="analysisPickerRef"
                />
              </tab-pane>

              <tab-pane label="LFP" :disabled="!isLFP">
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
          :disabled="!hasAnalysisSelected || !valuesFilled"
          :loading="processing"
          @click="editItem"
        >Run Analysis</i-button>
      </div>
    </modal>
  </div>
</template>


<script>
import intersection from 'lodash/intersection';
import analysisConfig from '@/config/analysis-config';
import { unmapBlueConfigTerms, mapBlueConfigTerms } from '@/common/utils';
import AnalysisPicker from './analysis-picker.vue';
import LfpAnalysisPicker from './lfp-analysis-picker.vue';
import { jobTags } from '@/common/job-status';
import {
  findAnalysisTargets, findDuration, findLfpAnalysisTargets, getBlueConfigStr,
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
      checkedAnalysis: [],
      targets: [],
      reportForAnalysis: null,
      numberOfCells: 5,
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
    valuesFilled() {
      if (!this.showModalLocal) return false;
      // check based on the selected analysis if each have some value defined
      const configArray = Object.values(this.$store.state.analysis.analysisConfigObj);
      const isEmpty = configArray.some(analysis => !analysis.value);
      return !isEmpty;
    },
    hasAnalysisSelected() {
      if (!this.showModalLocal) return false;
      const configArray = Object.values(this.$store.state.analysis.analysisConfigObj);
      const someIsActive = configArray.some(analysis => analysis.active);
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
        this.target = null;
        this.lfpTarget = null;
        this.simDuration = null;
        this.parseBlueConfig(this.jobSelectedForAnalysis);
        this.$store.commit('resetAnalysisConfigObj');
      }
    },
    reports(newVal) {
      [this.reportForAnalysis] = newVal;
    },
  },
  methods: {
    async editItem() {
      this.$emit('analysis-config-ready', this.generateAnalysisObjectToRun());
    },
    async parseBlueConfig(job) {
      // setup target for default analysis
      const blueConfigStr = await getBlueConfigStr(job);
      const defaultAnalysisTargets = intersection(findAnalysisTargets(blueConfigStr));
      [this.target] = unmapBlueConfigTerms(defaultAnalysisTargets);

      // setup targets for lfp
      const lfpAnalysisTarget = unmapBlueConfigTerms(findLfpAnalysisTargets(blueConfigStr));

      if (lfpAnalysisTarget === this.$store.state.currentCircuitConfig.biggestTarget) {
        // show the full list of targets
        const targetDisplayNames = this.$store.state.currentCircuitConfig.targets.map(t => t.displayName);
        this.lfpTargets = targetDisplayNames;
        this.lfpTarget = this.$store.state.currentCircuitConfig.biggestTarget;
      } else {
        this.lfpTargets = [unmapBlueConfigTerms(lfpAnalysisTarget)];
        [this.lfpTarget] = this.lfpTargets;
      }

      // setup default times for LFP
      const simulationDuration = findDuration(blueConfigStr);
      this.simDuration = simulationDuration;
    },
    generateAnalysisObjectToRun() {
      const analysisObj = this.$refs.analysisPickerRef.generatePlotsConfig();

      if (analysisObj && !this.target) {
        this.$Message.error('Please select Population to analyze');
        return false;
      }

      let lfpAnalysisObj = {};
      if (this.isLFP) {
        lfpAnalysisObj = this.$refs.lfpAnalysisPickerRef.generatePlotsConfig();
        if (lfpAnalysisObj.hasLFPAnalysis && !this.lfpTarget) {
          this.$Message.error('Please select LFP Population');
          return false;
        }
        if (lfpAnalysisObj.hasLFPAnalysis && !lfpAnalysisObj.configOk) {
          this.$Message.error(lfpAnalysisObj.errorMessage);
          return false;
        }
      }

      if (!analysisObj && !lfpAnalysisObj.hasLFPAnalysis) {
        this.$Message.warning('Please select at least one analysis to run');
        return false;
      }

      const defaultRunTime = analysisConfig.runtime;
      const analysisRunTime = lfpAnalysisObj.hasLFPAnalysis ? defaultRunTime * 2 : defaultRunTime;

      return {
        computerSelected: this.$store.state.currentComputer,
        from: {},
        nodes: analysisConfig.nodes,
        runtime: analysisRunTime,
        title: this.title,
        plotsConfig: analysisObj,
        lfpPlotsConfig: lfpAnalysisObj,
        reportForAnalysis: this.reportForAnalysis,
        target: mapBlueConfigTerms(this.target),
        lfpTarget: mapBlueConfigTerms(this.lfpTarget),
      };
    },
  },
};
</script>