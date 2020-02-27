
<template>
  <div>
    <i-select
      v-model="populationSelected"
      filterable
      class="custom-autocomplete-targets"
      :class="{ 'ivu-form-item-error': !populationSelected }"
      ref="targetDropdown"
      @on-change="itemSelected"
    >
      <i-option
        v-for="target in targets"
        :key="target.displayName"
        :value="target.displayName"
        :label="target.displayName"
      >

        <div
          class="custom-select-item-for-preview"
          @mouseenter="showPoptipTarget(target)"
        >{{ target.displayName }}</div>

      </i-option>
    </i-select>

    <div
      class="poptip-preview-container"
      ref="targetImgContainerRef"
    >
      <div class="cells-count" ref="cellCount"/>
      <img
        class="preview-target-popover"
        ref="targetImgRef"
      />
    </div>
  </div>
</template>


<script>
export default {
  props: ['targetSelected', 'itemsAvailable'],
  methods: {
    itemSelected(selection) {
      if (!selection) return;
      this.$emit('target-changed', selection);
    },
    showPoptipTarget(targetObj) {
      if (!targetObj.src) {
        this.hideImg();
        return;
      }
      // using the ref due an issue in iview select losing focus while searching
      this.$refs.targetImgRef.src = targetObj.src;
      this.$refs.targetImgContainerRef.classList.add('showing');
      this.setCellsCount(targetObj);
    },
    setCellsCount(targetObj) {
      this.$refs.cellCount.innerHTML = `Cells: ${targetObj.cells || '?'} / ${this.fullCellsAmount}`;
    },
    hideImg() {
      this.$refs.targetImgContainerRef.classList.remove('showing');
    },
  },
  mounted() {
    // to hide the poptip only when hover outside the i-select
    const targetDropdown = this.$refs.targetDropdown.$el;
    targetDropdown.onmouseleave = () => { this.hideImg(); };

    const { circuitConfig } = this.$store.state.fullConfig;
    const biggestTargetObj = circuitConfig.targets.find(target => (
      target.displayName === circuitConfig.biggestTarget
    ));
    this.fullCellsAmount = biggestTargetObj.cells;
  },
  computed: {
    targets() {
      if (this.itemsAvailable && this.itemsAvailable.length) {
        return this.itemsAvailable;
      }
      return this.$store.state.fullConfig.circuitConfig.targets;
    },
    populationSelected: {
      get() { return this.targetSelected || null; },
      set(newPopulation) { this.itemSelected(newPopulation); },
    },
  },
};
</script>


<style lang="scss">
  .custom-autocomplete-targets {
    /* to show poptip on the entire element */
    .ivu-select-item {
      padding: 0px;

      div.custom-select-item-for-preview {
        padding: 7px 16px;
      }
    }
    .ivu-select-dropdown {
      max-width: 120px;
    }
  }
  .poptip-preview-container {
    transition: opacity 0.4s linear;
    background-color: white;
    height: 500px;
    width: 500px;
    opacity: 0;
    position: absolute;
    z-index: -1;
    border-radius: 6px;
    box-shadow: 0 1px 6px rgba(0,0,0,.2);
    margin-left: 5px;
    display: inline;

    &.showing {
      opacity: 1;
      z-index: 2;
    }
    .cells-count {
      font-size: 14px;
      text-align: center;
      font-weight: bold;
    }
  }
</style>
