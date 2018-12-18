
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
              size="small"
              v-model="title"
              placeholder="Title of the analysis"
            />
          </form-item>

          <form-item prop="typesAnalysis" label="Analysis:">
            <checkbox-group v-model="checkedAnalysis">
              <checkbox
                v-for="analysis in analysisToRun"
                :key="analysis.param"
                :label="analysis.param"
              >
                <span>{{ analysis.name }}</span>
              </checkbox>
            </checkbox-group>
          </form-item>

          <form-item prop="target">
            <tooltip
              slot="label"
              content="Define report name to analyze"
            >
              Target:
            </tooltip>
            <i-select
              v-model="target"
              size="small"
            >
              <i-option
                v-for="targetElem in targetsFromBlueConfig"
                :key="targetElem"
                :value="targetElem"
              >{{ targetElem }}</i-option>
            </i-select>
          </form-item>

          <form-item prop="report" label="Report">
           <i-select
              v-model="reportForAnalysis"
              size="small"
            >
              <i-option
                v-for="report in reports"
                :key="report"
                :value="report"
              >{{ report }}</i-option>
            </i-select>
          </form-item>

          <form-item prop="cellsNumber" label="Cells (number):">
            <input-number
              v-model="numberOfCells"
              size="small"
              :min="1"
              :max="200"
              placeholder="Cells (number) to visualize"
            />
          </form-item>

        </i-form>
      </div>

      <div slot="footer">
        <i-button
          @click="$emit('changeModalVisibility')"
        >Cancel</i-button>

        <i-button
          type="primary"
          :disabled="isRunningAnalysis"
          :loading="isRunningAnalysis"
          @click="editItem"
        >Run Analysis</i-button>
      </div>
    </modal>
  </div>
</template>

<script>
import analysisConfig from '@/assets/analysis-config';

export default {
  name: 'AnalysisForm',
  props: ['jobSelectedForAnalysis', 'showModal', 'isRunningAnalysis'],
  data() {
    return {
      formInvalid: false,
      from: {},
      title: '',
      analysisToRun: analysisConfig.analysisAvailable,
      checkedAnalysis: [],
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
        typesAnalysis: [{
          required: true,
          validator: (rule, value, callback) => {
            if (this.checkedAnalysis.length === 0) {
              callback(new Error('select at least one analysis'));
              return;
            }
            if (!this.analysisSelectedCorrectly) {
              callback(new Error('report should be defined'));
              return;
            }
            callback();
          },
        }],
        cellsNumber: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.numberOfCells) {
              callback(new Error('should be defined'));
              return;
            }
            callback();
          },
        }],
        report: [{
          required: true,
          validator: (rule, value, callback) => {
            if (!this.reportForAnalysis) {
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
    targetsFromBlueConfig() {
      const targetsNames = [];
      this.reports.forEach((reportName) => {
        const matched = reportName.match('(.*)_report');
        if (matched && matched.length > 1) {
          const target = matched[1];
          targetsNames.push(target);
        }
      });
      [this.target] = targetsNames;
      return targetsNames;
    },
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
    analysisSelectedCorrectly() {
      // check if based on the analaysis selected a report was selected too
      let analysisCheckCorrect = true;
      this.checkedAnalysis.forEach((analysisSelected) => {
        const matched = analysisConfig.analysisAvailable.find(analysis => (
          analysis.param === analysisSelected
        ));

        if (matched.report_select && !this.reportForAnalysis) {
          analysisCheckCorrect = false;
        }
      });
      return analysisCheckCorrect;
    },
  },
  watch: {
    showModal(newVal) {
      this.formInvalid = newVal;
    },
    reports(newVal) {
      [this.reportForAnalysis] = newVal;
    },
  },
  methods: {
    async editItem() {
      const isValid = await this.$refs.formValidate.validate();
      if (isValid) {
        this.$emit('analysisConfigReady', this.generateAnalysisObjectToRun());
      }
    },
    targetChanged(newTarget) {
      // TODO: is there any way you want to analyze another slice?
      this.target = newTarget;
    },
    generateAnalysisObjectToRun() {
      return {
        computerSelected: this.$store.state.currentComputer,
        from: this.from,
        nodes: analysisConfig.nodes,
        runtime: analysisConfig.runtime,
        numberOfCells: this.numberOfCells,
        title: this.title,
        checkedAnalysis: this.checkedAnalysis,
        reportForAnalysis: this.reportForAnalysis,
        target: this.target,
      };
    },
  },
};
</script>
