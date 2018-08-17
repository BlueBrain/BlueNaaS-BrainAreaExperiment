
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

          <span v-if="!sameComputer">
            <form-item prop="originComputer">
              <tooltip
                slot="label"
                content="Where move data from"
              >Origin:</tooltip>
              <i-input
                v-model="from.computer"
                readonly
                size="small"
                placeholder="Origin computer"
              />
            </form-item>

            <form-item prop="originProject" label="Project:">
              <i-select
                v-model="from.projectSelected"
                placeholder="Origin project"
                size="small"
              >
                <i-option
                  v-for="project in from.projectsAvailable"
                  :value="project"
                  :key="project"
                >{{ project }}</i-option>
              </i-select>
            </form-item>

            <form-item prop="destinationComputer">
              <tooltip
                slot="label"
                content="Where move data to"
              >Destination:</tooltip>
              <i-input
                required
                readonly
                size="small"
                v-model="to.computer"
                placeholder="Destination computer"
              />
            </form-item>

            <form-item prop="destinationProject" label="Project:">
              <i-select
                v-model="to.projectSelected"
                placeholder="Destination project"
                size="small"
              >
                <i-option
                  v-for="project in to.projectsAvailable"
                  :value="project"
                  :key="project"
                >{{ project }}</i-option>
              </i-select>
            </form-item>
          </span>

          <span v-else>
            <!-- not possible to run analysis with different project without copying the files -->
            <!-- <form-item prop="destinationProject">
              <tooltip
                slot="label"
                content="Project to run the analysis"
              >
                Destination Project:
              </tooltip>
              <i-select
                v-model="to.projectSelected"
                placeholder="Destination project"
                size="small"
              >
                <i-option
                  v-for="project in to.projectsAvailable"
                  :value="project"
                  :key="project"
                >
                  {{ project }}
                </i-option>
              </i-select>
            </form-item> -->
          </span>

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
              v-if="!analyzeOutsideUnicore"
              v-model="target"
              size="small"
            >
              <i-option
                v-for="targetElem in targetsFromBlueConfig"
                :key="targetElem"
                :value="targetElem"
              >{{ targetElem }}</i-option>
            </i-select>
            <i-input
              v-else
              required
              size="small"
              v-model="target"
            />
          </form-item>

          <form-item prop="report" label="Report">
             <i-select
              v-if="!analyzeOutsideUnicore"
              v-model="reportForAnalysis"
              size="small"
            >
              <i-option
                v-for="report in reports"
                :key="report"
                :value="report"
              >{{ report }}</i-option>
            </i-select>
            <i-input
              v-else
              required
              size="small"
              v-model="reportForAnalysis"
            />
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


          <div v-if="analizeNonUnicore">
            <form-item label="Path to BlueConfig">
              <i-input
                required
                size="small"
                v-model="nonUnicoreSimPath"
              />
            </form-item>
          </div>

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
import { getUser } from '@/services/unicore';

export default {
  name: 'AnalysisForm',
  props: ['jobSelectedForAnalysis', 'showModal', 'isRunningAnalysis', 'analizeNonUnicore'],
  data() {
    return {
      formInvalid: false,
      from: {
        computer: null,
        projectsAvailable: [],
        projectSelected: null,
      },
      to: {
        computer: null,
        projectsAvailable: [],
        projectSelected: null,
      },
      title: '',
      analysisToRun: analysisConfig.analysisAvailable,
      checkedAnalysis: [],
      reportForAnalysis: null,
      numberOfCells: 5,
      target: null,
      // allow run analysis outside unicore https://github.com/cnr-ibf-pa/hbp-bsp-issues/issues/335
      nonUnicoreSimPath: null,

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
    sameComputer() {
      return this.from.computer === this.to.computer;
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
    analyzeOutsideUnicore() {
      return this.analizeNonUnicore && this.sameComputer;
    },
  },
  watch: {
    showModal(newVal) {
      // TODO: check this projects based on the TO computer
      this.$set(this.from, 'computer', this.$store.state.currentComputer);
      this.$set(this.to, 'computer', analysisConfig[this.$store.state.currentComputer].to);

      if (this.from.computer === this.to.computer) {
        console.log('[analysis] same computer');
        this.$set(this.from, 'projectsAvailable', this.$store.state.userProjectsAvailable);
        this.$set(this.from, 'projectSelected', this.$store.state.userProject);
        this.$set(this.to, 'projectsAvailable', this.$store.state.userProjectsAvailable);
        this.$set(this.to, 'projectSelected', this.$store.state.userProject);
      } else {
        console.warn('this.from.computer !== this.to.computer');
        this.$set(this.from, 'projectsAvailable', this.$store.state.userProjectsAvailable);
        this.$set(this.from, 'projectSelected', this.$store.state.userProject);

        // get the projects available for the destination computer
        getUser(this.to.computer)
          .then((userInfo) => {
            if (!userInfo) { console.error('getUserProjects'); }

            this.$set(this.to, 'projectsAvailable', userInfo.client.xlogin.availableUIDs);
            this.$set(this.to, 'projectSelected', userInfo.client.xlogin.availableUIDs[0]);
          });
      }
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
        console.log('Form valid');
        this.$emit('analysisConfigReady', this.generateAnalysisObjectToRun());
        return;
      }
      console.log('Form not valid');
    },
    targetChanged(newTarget) {
      // TODO: is there any way you want to analyze another slice?
      this.target = newTarget;
    },
    generateAnalysisObjectToRun() {
      return {
        to: this.to,
        from: this.from,
        nodes: analysisConfig.nodes,
        runtime: analysisConfig.runtime,
        numberOfCells: this.numberOfCells,
        title: this.title,
        checkedAnalysis: this.checkedAnalysis,
        reportForAnalysis: this.reportForAnalysis,
        target: this.target,
        analizeNonUnicore: this.analizeNonUnicore,
        nonUnicoreSimPath: this.nonUnicoreSimPath,
      };
    },
  },
};
</script>
