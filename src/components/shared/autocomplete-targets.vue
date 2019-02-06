
<template>
  <i-select
    v-model="populationSelected"
    filterable
    @on-change="itemSelected"
  >
    <i-option
      v-for="target in targets"
      :key="target.displayName"
      :value="target.displayName"
      :label="target.displayName"
    >
      <div class="target-img-container">
        <span>{{ target.displayName }}</span>
        <img :src="getTargetImage(target)">
      </div>
    </i-option>
  </i-select>
</template>


<script>
export default {
  props: ['targetSelected', 'itemsAvailable'],
  data() {
    return {
      populationSelected: this.targetSelected || null,
    };
  },
  methods: {
    matched(search = '', targetValue = '') {
      return targetValue.toLowerCase().indexOf(search.toLowerCase()) >= 0;
    },
    itemSelected(selection) {
      this.$emit('target-changed', selection);
    },
    getTargetImage(targetObj) {
      return targetObj.src;
    },
  },
  computed: {
    targets() {
      if (this.itemsAvailable && this.itemsAvailable.length) {
        return this.itemsAvailable;
      }
      return this.$store.state.currentCircuitConfig.targets;
    },
  },
  watch: {
    targetSelected(newTarget) {
      this.populationSelected = newTarget;
      this.itemSelected(this.populationSelected);
    },
  },
};
</script>


<style scoped lang="scss">
  .target-img-container {
    display: inline-flex;
    align-items: center;
    flex-direction: row;
    img {
      max-width: 50px;
    }
  }
</style>
