
<template>
  <div>
    <dropdown
      trigger="click"
      v-if="computerAllowBulkAnalysis"
    >
      <i-button>
        Bulk Edit
        <icon type="ios-arrow-down"/>
      </i-button>

      <dropdown-menu slot="list">
        <dropdown-item>
          <i-button
            :disabled="isEditing"
            @click="toggleSelection"
            icon="md-done-all"
          >Select Multiple</i-button>
        </dropdown-item>

        <dropdown-item>
          <analysis-in-notebook
            :disabled="!hasSelected"
            :replace-text="listOfSimulationsToAnalyse"
            :config-url="bulkNotebooksConfig"
          />
        </dropdown-item>

        <dropdown-item divided>
          <i-button
            :disabled="!isEditing"
            @click="cancelSelection"
            icon="md-close"
          >Clean Selection</i-button>
        </dropdown-item>
      </dropdown-menu>
    </dropdown>
  </div>
</template>


<script>
import analysisConfig from '@/config/analysis-config';
import AnalysisInNotebook from '@/components/shared/analysis-in-notebook.vue';

export default {
  name: 'BulkEdit',
  components: {
    AnalysisInNotebook,
  },
  data() {
    return {
    };
  },
  computed: {
    isEditing() {
      return this.$store.state.list.bulkEditActivated;
    },
    listOfSimulationsToAnalyse() {
      /* this will return an array in string in format [\"123\", \"456\"] to be passed
      as query param to usecases-wizard and be replaced in notebook placeholder */
      const unescaped = JSON.stringify(this.$store.state.list.simulationsToBulkAnalyse);
      const escaped = unescaped.replace(/"/g, '\\"');
      return escaped;
    },
    hasSelected() {
      return this.$store.state.list.simulationsToBulkAnalyse.length;
    },
    bulkNotebooksConfig() {
      return analysisConfig.externalBulkAnalysisConfig;
    },
    computerAllowBulkAnalysis() {
      if (!this.$store.state.currentComputer) return false;
      return analysisConfig[this.$store.state.currentComputer].bulkAnalysis;
    },
  },
  methods: {
    toggleSelection() {
      this.$store.commit('setBulkEditActivated', true);
    },
    analyzeMultiple() {
      if (!this.hasSelected) return; // double check is able to analyze
      console.log(this.$store.state.list.simulationsToBulkAnalyse);
    },
    cancelSelection() {
      this.$store.commit('cleanSimulationToBulkAnalyse');
      this.$store.commit('setBulkEditActivated', false);
    },
  },
};
</script>
