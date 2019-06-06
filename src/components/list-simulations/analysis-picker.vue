
<template>
  <div>
    <divider>Choose Plot(s)</divider>

    <form-item
      v-for="analysis in analysisList"
      :key="analysis.param"
      v-if="!skipAnalysis(analysis.param)"
      class="centered"
      :label="analysis.name"
    >
      <div>
        <radio-group
          v-model="selections[analysis.param]"
          type="button"
          size="small"
        >
          <radio :label="modes.NO"/>
          <radio :label="modes.ALL" :disabled="isVoltagePlot(analysis.param)"/>
          <radio :label="modes.CELLS"/>
        </radio-group>
        <input-number
          v-if="showCellsInput(analysis.param)"
          v-model="cellsCount[analysis.param]"
          size="small"
          :min="1"
          :max="getMaxBoundry(analysis.param)"
          class="small-width"
        />
      </div>
    </form-item>

  </div>
</template>


<script>
import forEach from 'lodash/forEach';

export default {
  name: 'analysis-picker',
  props: ['analysisList', 'hasReport'],
  data() {
    return {
      selections: {},
      cellsCount: {},
      modes: {
        NO: 'NO',
        ALL: 'ALL',
        CELLS: 'cells',
      },
    };
  },
  created() {
    // set default values no analysis
    this.analysisList.forEach((analysis) => {
      this.$set(this.selections, analysis.param, this.modes.NO);
    });
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
      forEach(this.selections, (value, key) => {
        if (value === this.modes.NO) return;
        if (value === this.modes.CELLS) {
          plotConfig[key] = this.cellsCount[key] || 1;
          return;
        }
        plotConfig[key] = value;
      });
      if (!Object.keys(plotConfig).length) return false;
      return plotConfig;
    },
    showCellsInput(analysisName) {
      if (this.selections[analysisName] === this.modes.CELLS) {
        this.$set(this.cellsCount, analysisName, 5);
        return true;
      }
      return false;
    },
  },
};
</script>


<style scoped>
  .centered {
    text-align: center;
  }
  .small-width.ivu-input-number.ivu-input-number-small {
    width: 50px;
  }
</style>
