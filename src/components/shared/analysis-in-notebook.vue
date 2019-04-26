
<template>
  <div
    class="analysis-in-notebook in-corner"
    v-if="canAnalyse"
  >
    <i-button
      type="primary"
      icon="md-flask"
      @click="showModal = true"
      :disabled="disabled"
    >Analyze in Notebook</i-button>

    <modal
      v-model="showModal"
      title="Choose Analysis Notebook"
      width="250"
    >
      <i-select
        v-model="analysisSelected"
        placeholder="Select an analysis"
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
    </modal>
  </div>
</template>


<script>
import analysisConfig from '@/config/analysis-config';
import axios from 'axios';
import forEach from 'lodash/forEach';
import pick from 'lodash/pick';
import get from 'lodash/get';


export default {
  name: 'AnalysisInNotebook',
  props: ['replaceText', 'disabled', 'configUrl'],
  data() {
    return {
      showModal: false,
      analysisList: [],
      analysisSelected: '',
      configReady: false,
    };
  },
  created() {
    axios(this.configUrl)
      .then((config) => {
        if (!config) return;
        this.analysisList = config.data;
        this.configReady = true;
      })
      .catch((error) => {
        console.error(error);
        this.$Message.error('Error fetching analysis in notebook config');
      });
  },
  computed: {
    canAnalyse() {
      if (!this.$store.state.currentComputer) return false;
      return get(analysisConfig, `${this.$store.state.currentComputer}.dynamicAnalysis`);
    },
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

      queryParams.append('replaceText', this.replaceText);

      const url = analysisConfig.usecasesCreationForm + queryParams.toString();
      window.open(url, '_blank');
    },
  },
};
</script>
