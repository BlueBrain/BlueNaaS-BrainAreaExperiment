
<template>
  <div class="random-gid-selector">
    <input-number
      v-model="randomGids"
      class="full-width"
      :max="getMaxBoundary"
      :min="1"
    />
  </div>
</template>


<script>
import constants from '@/common/constants';

export default {
  name: 'random-gid-selector',
  props: ['analysisObj'],
  data() {
    return {
      randomGids: 1,
    };
  },
  computed: {
    getMaxBoundary() {
      return this.analysisObj.id === 'voltage_collage'
        ? constants.analysis.voltageCollage.MAX_AMOUNT_GIDS
        : constants.analysis.default.MAX_AMOUNT_GIDS;
    },
  },
  created() {
    this.updateTargetInStore(this.randomGids);
  },
  watch: {
    randomGids(newVal) {
      this.updateTargetInStore(newVal);
    },
  },
  methods: {
    updateTargetInStore(newVal) {
      this.$store.commit('updateAnalysisValue', { analysisObj: this.analysisObj, value: newVal });
    },
  },
};
</script>


<style scoped>
  .full-width {
    width: 100%;
  }
</style>
