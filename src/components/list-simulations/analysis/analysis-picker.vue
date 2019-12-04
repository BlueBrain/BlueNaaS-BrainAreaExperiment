
<template>
  <div>
    <divider>Choose Plot(s)</divider>

    <collapse
      simple
      @on-change="analysisSelectionChanged"
    >
      <panel
        v-for="(analysisObj, analysisRawName) in filteredAnalysisAvailable"
        :key="analysisRawName"
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
import pick from 'lodash/pick';
import GenericSelector from './generic-selector.vue';
import { analysis } from '@/common/constants';

export default {
  name: 'analysis-picker',
  props: ['hasReports', 'defaultPopulation'],
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
    filteredAnalysisAvailable() {
      const analysisToPick = [
        analysis.types.FIRING_RATE_HISTOGRAM,
        analysis.types.RASTER,
      ];
      if (this.hasReports) {
        analysisToPick.push(analysis.types.VOLTAGE_COLLAGE);
      }
      return pick(this.analysisConfigObj, analysisToPick);
    },
  },
  methods: {
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
