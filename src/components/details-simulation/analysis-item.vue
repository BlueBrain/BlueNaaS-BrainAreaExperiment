
<template>
  <div class="analysis">
    <div class="all-plots-container">
      <div
        v-for="plot in analysisConfig.plots"
        :key="plot"
      >
        <div
          v-if="itemDetails[plot]"
          class="plot-container"
        >
          <span class="plot-label">{{ fullName(plot) }}</span>
          <a
            :download="plot +'.png'"
            :href="itemDetails[plot]"
          >
            <img
              :src="itemDetails[plot]"
              class="analysis-plot"
            >
          </a>
        </div>
      </div>
    </div>
    <collapse-title
      :collapsed="true"
      title="log"
      @expanded="analysisLogRequest"
    >
      <div
        slot="element"
        class="output-log"
      >
        <div v-if="!itemDetails.stderr">Loading...</div>
        <div
          v-else
          v-for="line in itemDetails.stderr"
          :key="line"
        >{{ line }}</div>
      </div>
    </collapse-title>
  </div>
</template>


<script>
import find from 'lodash/find';

import collapseTitle from '@/components/shared/collapse-title.vue';
import analysisConfig from '@/config/analysis-config';

export default {
  name: 'Analysis',
  components: {
    'collapse-title': collapseTitle,
  },
  props: ['itemDetails'],
  data() {
    return {
      analysisConfig,
    };
  },
  methods: {
    fullName(plotShortName) {
      const plotInfo = find(this.analysisConfig.analysisAvailable, elem => elem.param === plotShortName);
      if (!plotInfo) return '';
      return plotInfo.name;
    },
    analysisLogRequest() {
      this.$emit('analysisLogRequest', this.itemDetails);
    },
  },
};
</script>


<style scoped>
  .output-log {
    margin-bottom: 10px;
  }
  .analysis-plot {
    max-width: 400px;
    height: 400px;
  }
  .all-plots-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .plot-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .plot-label {
    font-size: 24px;
    margin: 5px 0;
  }
</style>
