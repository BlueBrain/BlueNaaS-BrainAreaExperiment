
<template>
  <div>
    <modal
      width="350"
      v-model="formInvalid"
      @on-cancel="$emit('changeModalVisibility')"
      class="report-form"
    >
      <h3 slot="header">Launch Analysis</h3>
      <div>
        <i-form
          ref="formValidate"
          :rules="ruleValidate"
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

          <analysis-picker
            :analysisList="analysisToRun"
            :hasReport="!!reports.length"
            ref="analysisPickerRef"
          />

        </i-form>
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

export default {
  name: 'AnalysisForm',
  props: ['jobSelectedForAnalysis', 'showModal', 'isRunningAnalysis'],
  components: {
    AnalysisPicker,
  },
  data() {
    return {
      formInvalid: false,
      title: '',
      analysisToRun: analysisConfig.analysisAvailable,
      checkedAnalysis: [],
      targets: [],
      reportForAnalysis: null,
      numberOfCells: 5,
      target: null,

      ruleValidate: {
        target: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.target) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
      },

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
  },
  watch: {
    showModal(newVal) {
      this.formInvalid = newVal;
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
      const isValid = await this.$refs.formValidate.validate();
      if (isValid) {
        this.$emit('analysis-config-ready', this.generateAnalysisObjectToRun());
      }
    },
    targetChanged(newTarget) {
      this.target = newTarget;
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
      return {
        computerSelected: this.$store.state.currentComputer,
        from: {},
        nodes: analysisConfig.nodes,
        runtime: analysisConfig.runtime,
        title: this.title,
        plotsConfig: this.$refs.analysisPickerRef.generatePlotsConfig(),
        reportForAnalysis: this.reportForAnalysis,
        target: mapBlueConfigTerms(this.target),
      };
    },
  },
};
</script>
