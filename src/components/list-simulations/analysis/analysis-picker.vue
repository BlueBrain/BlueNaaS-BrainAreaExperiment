
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
          <generic-selector :default-population="defaultPopulation"/>
        </p>
      </panel>
    </collapse>

  </div>
</template>


<script>
import forEach from 'lodash/forEach';
import GenericSelector from './generic-selector.vue';

const modes = {
  NO: 'NO',
  ALL: 'ALL',
  CELLS: 'RANDOM CELLS',
};
const defaultMode = modes.NO;
const defaultCellsNumber = 5;
const analysisConfigObjReduceFn = ((endObj, analysisObj) => ({
  ...endObj,
  [analysisObj.realName]: {
    mode: defaultMode,
    cells: defaultCellsNumber,
    name: analysisObj.displayName,
    active: false,
  },
}));

export default {
  name: 'analysis-picker',
  props: ['analysisList', 'hasReport', 'defaultPopulation'],
  data() {
    return {
      analysisConfigObj: this.analysisList.reduce(analysisConfigObjReduceFn, {}),
      modes,
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
    getMaxBoundry(analysisName) {
      return this.isVoltagePlot(analysisName) ? 20 : 800;
    },
    skipAnalysis(analysisName) {
      return this.isVoltagePlot(analysisName) && !this.hasReport;
    },
    isVoltagePlot(analysisName) {
      return analysisName === 'voltage_collage';
    },
    generatePlotsConfig() {
      const plotConfig = {};
      forEach(this.analysisConfigObj, (analysisValue, analysisKey) => {
        if (analysisValue.mode === this.modes.NO) return;
        if (analysisValue.mode === this.modes.CELLS) {
          plotConfig[analysisKey] = analysisValue.cells || 1;
          return;
        }
        plotConfig[analysisKey] = analysisValue.mode;
      });
      if (!Object.keys(plotConfig).length) return false;
      return plotConfig;
    },
    analysisSelectionChanged(analysisSelectedList) {
      // tick or untick checkboxes based on expanded panels
      this.analysisAvailableKeys.forEach((analysisName, index) => {
        const isActive = analysisSelectedList.includes(index.toString());
        this.$set(this.analysisConfigObj[analysisName], 'active', isActive);
      });
    },
  },
};
</script>


<style scoped>
  .small-width.ivu-input-number.ivu-input-number-small {
    width: 40px;
  }
</style>
