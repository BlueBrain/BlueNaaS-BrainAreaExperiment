
<template>
  <i-select
    v-model="populationSelected"
    filterable
    @on-change="itemSelected"
    class="custom-autocomplete-targets"
  >
    <i-option
      v-for="target in targets"
      :key="target.displayName"
      :value="target.displayName"
      :label="target.displayName"
    >
      <Poptip
        v-if="target.src"
        trigger="hover"
        title="Population Preview"
        :transfer="true"
        placement="right-start"
        @on-popper-show="showImg(target.displayName)"
      >
        <span>{{ target.displayName }}</span>
        <div slot="content">
          <img
            v-if="visibleImageTarget === target.displayName"
            :src="target.src"
          >
        </div>
      </Poptip>

      <span v-else>{{ target.displayName }}</span>

    </i-option>
  </i-select>
</template>


<script>
export default {
  props: ['targetSelected', 'itemsAvailable'],
  data() {
    return {
      visibleImageTarget: '',
    };
  },
  methods: {
    matched(search = '', targetValue = '') {
      return targetValue.toLowerCase().indexOf(search.toLowerCase()) >= 0;
    },
    itemSelected(selection) {
      if (!selection) return;
      this.$emit('target-changed', selection);
    },
    showImg(targetName) {
      this.visibleImageTarget = targetName;
    },
  },
  computed: {
    targets() {
      if (this.itemsAvailable && this.itemsAvailable.length) {
        return this.itemsAvailable;
      }
      return this.$store.state.currentCircuitConfig.targets;
    },
    populationSelected: {
      get() { return this.targetSelected || null; },
      set(newPopulation) { this.itemSelected(newPopulation); },
    },
  },
};
</script>


<style>
  .custom-autocomplete-targets .ivu-poptip {
    display: block;
  }
  .custom-autocomplete-targets .ivu-poptip-rel {
    display: block;
  }
</style>
