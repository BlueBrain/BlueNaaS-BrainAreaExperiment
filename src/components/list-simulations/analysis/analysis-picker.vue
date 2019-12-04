
<template>
  <div>
    <divider>Choose Plot(s)</divider>

    <collapse
      simple
      @on-change="analysisSelectionChanged"
    >
      <panel
        v-for="(analysisObj, analysisRawName) in analysisConfigObj"
        :key="analysisRawName"
        v-if="!skipAnalysis(analysisRawName)"
        :hide-arrow="true"
      >
        <p class="title-container">
          <checkbox v-model="analysisObj.active"/>
          <span>{{ analysisObj.name }}</span>
        </p>
        <p slot="content">
          <generic-selector
            :default-population="defaultPopulation"
            :analysis-obj="analysisObj"
          />
        </p>
      </panel>
    </collapse>

  </div>
</template>


<script>
import GenericSelector from './generic-selector.vue';
import { analysis } from '@/common/constants';

export default {
  name: 'analysis-picker',
  props: ['disable', 'defaultPopulation'],
  data() {
    return {
      analysisConfigObj: this.$store.state.analysis.analysisConfigObj,
    };
  },
  components: {
    GenericSelector,
  },
  computed: {
    analysisAvailableKeys() {
      return Object.keys(this.analysisConfigObj);
    },
  },
  methods: {
    skipAnalysis(analysisName) {
      return this.isVoltagePlot(analysisName) && this.disable;
    },
    isVoltagePlot(analysisName) {
      return analysisName === analysis.types.VOLTAGE_COLLAGE;
    },
    analysisSelectionChanged(analysisSelectedList) {
      // tick or untick checkboxes based on expanded panels
      this.analysisAvailableKeys.forEach((analysisName, index) => {
        const isActive = analysisSelectedList.includes(index.toString());
        this.$set(this.analysisConfigObj[analysisName], 'active', isActive);
      });
    },
    generatePlotsConfig() {
      this.$store.commit('generateFinalPlotsConfig');
      return this.$store.state.analysis.analysisConfigToSend;
    },
  },
};
</script>


<style scoped>
  .small-width.ivu-input-number.ivu-input-number-small {
    width: 40px;
  }
</style>
