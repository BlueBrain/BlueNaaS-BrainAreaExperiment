
<template>
  <div>
    <dropdown
      trigger="click"
      v-if="bulkNotebooksConfig"
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
      /* this will return an array in string format to be passed as query
      param to usecases-wizard and be replaced in notebook placeholder */
      return JSON.stringify(this.$store.state.list.simulationsToBulkAnalyse);
    },
    hasSelected() {
      return this.$store.state.list.simulationsToBulkAnalyse.length;
    },
    bulkNotebooksConfig() {
      if (!this.$store.state.fullConfig.computer) return false;
      return this.$store.state.fullConfig.analysisConfig.bulkAnalysisConfig;
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
