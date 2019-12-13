
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
import { analysis } from '@/common/constants';

export default {
  name: 'random-gid-selector',
  props: ['analysisObj'],
  data() {
    return {
      randomGids: 5,
    };
  },
  computed: {
    getMaxBoundary() {
      return this.analysisObj.type === analysis.types.VOLTAGE_COLLAGE
        ? analysis[analysis.types.VOLTAGE_COLLAGE].MAX_AMOUNT_GIDS
        : analysis.default.MAX_AMOUNT_GIDS;
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
