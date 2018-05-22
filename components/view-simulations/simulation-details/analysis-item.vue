<template>
  <div class="analysis">
    <div class="all-plots-container">
      <div
        v-for="plot in analysisConfig.plots"
        :key="plot"
        class="plot-container"
      >
        <span class="plot-label">{{ fullName(plot) }}</span>
        <a
          v-if="itemDetails[plot]"
          :download="plot +'.png'"
          :href="itemDetails[plot]"
        >
          <img
            :src="itemDetails[plot]"
            class="analysis-plot">
        </a>
        <div v-else>{{ noValidationText }}</div>
      </div>
    </div>
    <collapse-title
      :collapsed="true"
      title="log"
      @click.native="analysisLogRequest"
    >
      <div
        slot="element"
        class="">
        <div v-if="!itemDetails.log">
          Loading....
        </div>
        <div
          v-for="line in itemDetails.log"
          :key="line"
        >
          {{ line }}
        </div>
      </div>
    </collapse-title>
  </div>
</template>

<script>
import collapseTitle from 'components/shared/collapse-title.vue';
import analysisConfig from 'assets/analysis-config.json';
import _find from 'lodash/find';
export default {
  name: 'Analysis',
  components: {
    'collapse-title': collapseTitle,
  },
  props: ['itemDetails'],
  data: function() {
    return {
      analysisConfig: analysisConfig,
    };
  },
  computed: {
    noValidationText: function() {
      if (this.itemDetails.isLoading) {
        return 'Loading...';
      } else {
        if (this.itemDetails.id) {
          return 'No available image yet';
        } else {
          return 'No Analysis was run yet';
        }
      }
    },
  },
  methods: {
    'fullName'(plotShortName) {
      let plotInfo = _find(this.analysisConfig.analysisAvailable, (elem) => {
        return elem.param === plotShortName;
      });
      if (!plotInfo) return '';
      return plotInfo.name;
    },
    'analysisLogRequest'() {
      this.$emit('analysisLogRequest', this.itemDetails);
    },
  },
};
</script>

<style scoped>
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
