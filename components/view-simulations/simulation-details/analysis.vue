<template>
    <div class="analysis">
        <div class="all-plots-container">
          <div
              class="plot-container"
              v-for="plot in analysisConfig.plots"
          >
              <span class="plot-label">{{fullName(plot)}}</span>
              <a
                v-if="itemDetails[plot]"
                :download="plot +'.png'"
                :href="itemDetails[plot]"
              >
                <img class="analysis-plot" :src="itemDetails[plot]">
              </a>
              <div v-else>{{ noValidationText }}</div>
          </div>
        </div>
        <collapse-title
          title="log"
          :collapsed="true"
          @click.native="analysisLogRequest"
        >
            <div slot="element" class="">
              <div v-if="!itemDetails.log">
                Loading....
              </div>
              <div v-for="line in itemDetails.log">
                {{line}}
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
      'name': 'analysis',
      'props': ['itemDetails'],
      'data': function() {
        return {
          'analysisConfig': analysisConfig,
        };
      },
      'components': {
        'collapse-title': collapseTitle,
      },
      'computed': {
        'noValidationText': function() {
          if (this.itemDetails.id) {
            return 'No available image yet';
          } else {
            return 'No Analysis was run yet';
          }
        },
      },
      'methods': {
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