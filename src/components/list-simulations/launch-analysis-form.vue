
<template>
  <div>
    <modal
      width="350"
      v-model="showModalLocal"
      @on-cancel="$emit('changeModalVisibility')"
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

            <form-item
              prop="report"
              label="Report"
            >
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
                <form-item prop="target">
                  <tooltip
                    slot="label"
                    content="Define report name to analyze"
                  >
                    Population:
                  </tooltip>
                  <i-select
                    v-model="target"
                  >
                    <i-option
                      v-for="targetElem in targets"
                      :key="targetElem"
                      :value="targetElem"
                    >{{ targetElem }}</i-option>
                  </i-select>
                </form-item>

                <analysis-picker
                  :analysisList="analysisToRun"
                  :hasReport="!!reports.length"
                  ref="analysisPickerRef"
                />
              </tab-pane>

              <tab-pane label="LFP" :disabled="!isLFP">
                <form-item prop="lfpTarget">
                  <tooltip
                    slot="label"
                    content="Define report name to analyze"
                  >
                    Population:
                  </tooltip>
                  <i-select
                    v-model="lfpTarget"
                  >
                    <i-option
                      v-for="targetElem in lfpTargets"
                      :key="targetElem"
                      :value="targetElem"
                    >{{ targetElem }}</i-option>
                  </i-select>
                </form-item>

                <lfp-analysis-picker
                  :analysisList="analysisToRun"
                  :hasReport="!!reports.length"
                  ref="lfpAnalysisPickerRef"
                />

              </tab-pane>
            </tabs>

          </i-form>
        </div>

      </div>

      <div slot="footer">
        <i-button
          @click="$emit('changeModalVisibility')"
        >Cancel</i-button>

        <i-button
          type="primary"
          :disabled="processing"
          :loading="processing"
          @click="editItem"
        >Run Analysis</i-button>
      </div>
    </modal>
  </div>
</template>

<script>
import analysisConfig from '@/config/analysis-config';
import { getFiles } from '@/services/unicore';
import { unmapBlueConfigTerms, mapBlueConfigTerms } from '@/common/utils';
import get from 'lodash/get';
import intersection from 'lodash/intersection';
import AnalysisPicker from '@/components/list-simulations/analysis-picker.vue';
import LfpAnalysisPicker from '@/components/list-simulations/lfp-analysis-picker.vue';
import { jobTags } from '@/common/job-status';

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
    isLFP() {
      return this.jobSelectedForAnalysis.tags.includes(jobTags.LFP_SIMULATION);
    },
  },
  watch: {
    showModal(newVal) {
      this.showModalLocal = newVal;
      if (newVal) this.setupLfpTargets();
    },
    reports(newVal) {
      [this.reportForAnalysis] = newVal;
    },
    jobSelectedForAnalysis(jobForAnalyze) {
      if (!jobForAnalyze) return;
      this.setTargets(jobForAnalyze);
    },
  },
  methods: {
    async editItem() {
      this.$emit('analysis-config-ready', this.generateAnalysisObjectToRun());
    },
    targetChanged(newTarget) {
      this.target = newTarget;
    },
    setupLfpTargets() {
      // set targets for LFP
      const reportRegExp = new RegExp(this.$store.state.currentCircuitConfig.reportsTargetFilter);
      const allTargets = this.$store.state.currentCircuitConfig.targets;
      const filteredTargetsForReport = allTargets.filter(target => reportRegExp.test(target.name));
      this.$set(this, 'lfpTargets', filteredTargetsForReport.map(t => t.displayName));
    },
    async setTargets(job) {
      function findTargetsInBC(BCStr) {
        const regex = /Target (.+)/gm;
        const targets = [];
        let m = regex.exec(BCStr);
        while (m !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) regex.lastIndex += 1;
          targets.push(get(m, '[1]', '').trim());
          m = regex.exec(BCStr);
        }
        return targets;
      }

      async function getBlueConfigStr() {
        const workingDirectory = get(job, '_links.workingDirectory.href');
        const blueConfigBlob = await getFiles(`${workingDirectory}/files/BlueConfig`);
        const blueConfigStr = await new Response(blueConfigBlob).text();
        return blueConfigStr;
      }

      function getTargetsByFileName() {
        const targetsNames = [];
        this.reports.forEach((reportName) => {
          const matched = reportName.match('(.*)_report');
          if (matched && matched.length > 1) targetsNames.push(get(matched, '[1]'));
        });
        [this.target] = targetsNames;
        return targetsNames;
      }

      let targets = getTargetsByFileName.bind(this)();
      if (!targets.length) {
        const blueConfigStr = await getBlueConfigStr();
        targets = intersection(findTargetsInBC(blueConfigStr));
      }
      this.$set(this, 'targets', unmapBlueConfigTerms(targets));
      this.$set(this, 'target', this.targets[0]);
    },
    generateAnalysisObjectToRun() {
      const analysisObj = this.$refs.analysisPickerRef.generatePlotsConfig();
      if (analysisObj && !this.target) {
        this.$Message.error('Please select Population to analyze');
        return false;
      }

      let lfpAnalysisObj = null;
      if (this.isLFP) {
        lfpAnalysisObj = this.$refs.lfpAnalysisPickerRef.generatePlotsConfig();
        if (lfpAnalysisObj && !this.lfpTarget) {
          this.$Message.error('Please select LFP Population');
          return false;
        }
      }

      if (!analysisObj && !lfpAnalysisObj) {
        this.$Message.warning('Please complete the form');
        return false;
      }

      return {
        computerSelected: this.$store.state.currentComputer,
        from: {},
        nodes: analysisConfig.nodes,
        runtime: analysisConfig.runtime,
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
