
<template>
  <div class="analysis-in-notebook in-corner">
    <i-button
      type="primary"
      icon="md-flask"
      size="small"
      @click="showModal = true"
    >Analyze in Notebook</i-button>

    <Modal
      v-model="showModal"
      title="Choose Analysis"
      width="250"
    >
      <i-select
        v-model="analysisSelected"
        placeholder="Select an analysis"
        size="small"
      >
        <i-option
          v-for="analysis in analysisList"
          :value="analysis.name"
          :key="analysis.name"
        >{{ analysis.name }}</i-option>
      </i-select>
      <div slot="footer">
        <i-button
          @click="showModal = false"
        >Cancel</i-button>
        <i-button
          type="primary"
          :loading="!configReady"
          @click="prepareAnalysis"
        >Continue</i-button>
      </div>
    </Modal>
  </div>
</template>


<script>
import analysisConfig from '@/assets/analysis-config';
import forEach from 'lodash/forEach';
import pick from 'lodash/pick';

export default {
  name: 'AnalysisInNotebook',
  props: ['simulationDetails'],
  data() {
    return {
      showModal: false,
      analysisList: [],
      analysisSelected: '',
      configReady: false,
    };
  },
  created() {
    fetch(analysisConfig.externalDynamicAnalysisConfig)
      .then(result => result.json())
      .then((config) => {
        if (!config) return;
        this.analysisList = config;
        this.configReady = true;
      });
  },
  methods: {
    prepareAnalysis() {
      const analysisInfo = this.analysisList.find(elem => elem.name === this.analysisSelected);
      // select only the information that is needed
      const replaceObj = pick(analysisInfo, ['uri', 'txtToReplace', 'name', 'appId']);
      const queryParams = new URLSearchParams();
      forEach(replaceObj, (value, key) => {
        queryParams.append(key, value);
      });
      queryParams.append('replaceText', this.simulationDetails.url);

      const url = analysisConfig.usecasesCreationForm + queryParams.toString();
      window.open(url, '_blank');
    },
  },
};
</script>
