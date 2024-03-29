
<template>
  <div class="analysis">
    <div class="all-plots-container">
      <div
        v-for="plot in plotNames"
        :key="plot"
      >
        <div
          v-if="itemDetails[plot]"
          class="plot-container"
        >
          <a
            :download="plot"
            :href="itemDetails[plot]"
          >
            <img
              :src="itemDetails[plot]"
              class="analysis-plot"
            >
          </a>
          <i-button
            @click="downloadPlotRawData(plot)"
            type="info"
            icon="md-download"
            :disabled="rawDataIsDownloading"
            ghost
          >Download Raw Data</i-button>
        </div>
      </div>
    </div>
    <collapse-title
      v-if="itemDetails.jobURL"
      :collapsed="true"
      title="Analysis Logs"
      :sublevel="true"
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
          :key="Math.random() + line"
        >{{ line }}</div>
      </div>
    </collapse-title>
  </div>
</template>


<script>
import isEqual from 'lodash/isEqual';
import fileSaver from 'file-saver';
import collapseTitle from '@/components/shared/collapse-title.vue';
import analysisConfig from '@/config/analysis-config';
import unicore from '@/services/unicore';

export default {
  name: 'Analysis',
  components: {
    'collapse-title': collapseTitle,
  },
  props: ['itemDetails'],
  data() {
    return {
      analysisConfig,
      plotNames: [],
      rawDataIsDownloading: false,
    };
  },
  computed: {
    analysisFiles() {
      if (!this.itemDetails.children || !this.itemDetails.children.length) return [];
      return this.itemDetails.children;
    },
  },
  watch: {
    analysisFiles(files) {
      if (!files || !files.length) return;
      const plotNames = files.filter(f => f.endsWith('.png')).map(p => p.replace('/', ''));

      const nonLfpPlots = plotNames.filter(p => !p.startsWith('lfp')).sort();
      const lfpPlots = plotNames.filter(p => p.startsWith('lfp')).sort();
      const completeSortedPlots = nonLfpPlots.concat(lfpPlots);

      if (isEqual(completeSortedPlots, this.plotNames)) return;
      completeSortedPlots.forEach((plot) => {
        this.getAnalysisImage(this.itemDetails.workingDirectory, plot, this.itemDetails);
      });
      this.plotNames = completeSortedPlots;
    },
  },
  methods: {
    analysisLogRequest() {
      this.$emit('analysis-log-request', this.itemDetails);
    },
    async getAnalysisImage(analysisURL, plotName, childAnalysis) {
      const plot = await unicore.getImage(`${analysisURL}/files/${plotName}`);
      if (plot) {
        this.$set(childAnalysis, plotName, plot);
        this.$set(childAnalysis, 'fetchingImages', false);
      }
    },
    async downloadPlotRawData(plot) {
      this.rawDataIsDownloading = true;
      const fileName = plot.replace('.png', '_raw_data.json');
      const url = `${this.itemDetails.workingDirectory}/files/${fileName}`;
      this.$Message.loading('Downloading Data...');
      unicore.getFiles(url)
        .catch(() => { this.$Message.error('Data not available'); })
        .then((rawDataBlob) => { fileSaver.saveAs(rawDataBlob, fileName); })
        .finally(() => { this.rawDataIsDownloading = false; });
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
    width: 380px;
    margin: 15px;
  }
</style>
