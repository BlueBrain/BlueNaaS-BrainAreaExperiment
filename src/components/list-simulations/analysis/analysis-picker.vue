
<template>
  <div>
    <divider>Choose Plot(s)</divider>

    <form-item
      v-for="(analysisObj, analysisRawName) in analysisConfigObj"
      :key="analysisRawName"
      v-if="!skipAnalysis(analysisRawName)"
      :label="analysisObj.name"
    >
      <div>
        <radio-group
          v-model="analysisObj.mode"
          type="button"
          size="small"
        >
          <radio :label="modes.NO"/>
          <radio :label="modes.ALL" :disabled="isVoltagePlot(analysisRawName)"/>
          <radio :label="modes.CELLS"/>
        </radio-group>

        <input-number
          v-if="analysisObj.mode === modes.CELLS"
          v-model="analysisObj.cells"
          :min="1"
          :max="getMaxBoundry(analysisRawName)"
          size="small"
          class="small-width"
        />

      </div>
    </form-item>

  </div>
</template>


<script>
import forEach from 'lodash/forEach';

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
  },
}));

export default {
  name: 'analysis-picker',
  props: ['analysisList', 'hasReport'],
  data() {
    return {
      analysisConfigObj: this.analysisList.reduce(analysisConfigObjReduceFn, {}),
      modes,
    };
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
  },
};
</script>


<style scoped>
  .small-width.ivu-input-number.ivu-input-number-small {
    width: 40px;
  }
</style>
