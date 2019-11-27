
<template>
  <div class="popup-target-selector">

    <modal
      width="250"
      v-model="isModalVisible"
      @on-cancel="closeModal"
      :mask-closable="false"
    >
      <h3 slot="header">Select Population</h3>

      <autocomplete-targets
        :target-selected="targetSelected"
        @target-changed="changePopulation"
      />

      <div slot="footer">
        <i-button
          @click="closeModal"
        >Cancel</i-button>

        <i-button
          type="primary"
          @click="closeModal"
        >Apply</i-button>
      </div>
    </modal>

    <i-input
      :value="targetSelected"
      class="full-width"
      readonly
    >
      <i-button
        slot="append"
        icon="md-create"
        @click="openModal"
      />
    </i-input>
  </div>
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';

export default {
  name: 'popup-target-selector',
  props: ['defaultPopulation', 'analysisObj'],
  data() {
    return {
      isModalVisible: false,
      targetSelected: this.defaultPopulation,
    };
  },
  components: {
    AutocompleteTargets,
  },
  watch: {
    defaultPopulation(newPopulation) {
      // if default population is loaded later, set it
      this.changePopulation(newPopulation);
    },
  },
  created() {
    if (!this.defaultPopulation) return;
    this.updateTargetInStore(this.defaultPopulation);
  },
  methods: {
    changePopulation(newPopulation) {
      this.targetSelected = newPopulation;
      this.updateTargetInStore(newPopulation);
      this.closeModal();
    },
    updateTargetInStore(newPopulation) {
      this.$store.commit('updateAnalysisValue', { analysisObj: this.analysisObj, value: newPopulation });
    },
    closeModal() {
      this.isModalVisible = false;
    },
    openModal() {
      this.isModalVisible = true;
    },
  },
};
</script>
