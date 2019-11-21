
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
  props: ['defaultPopulation'],
  data() {
    return {
      isModalVisible: false,
      targetSelected: this.defaultPopulation,
    };
  },
  components: {
    AutocompleteTargets,
  },
  methods: {
    changePopulation(newPopulation) {
      this.targetSelected = newPopulation;
      this.closeModal();
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
