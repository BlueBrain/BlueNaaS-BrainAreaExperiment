
<template>
  <div>
    <i-select
      v-model="populationSelected"
      filterable
      class="custom-autocomplete-targets"
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
          @mouseenter="showPoptipTarget(target.src)"
        >{{ target.displayName }}</div>

      </i-option>
    </i-select>

    <div
      class="poptip-preview-container"
      :class="{ showing: currentPreviewSrc }"
    >
      <img
        class="preview-target-popover"
        :src="currentPreviewSrc"
      />
    </div>
  </div>
</template>


<script>
export default {
  props: ['targetSelected', 'itemsAvailable'],
  data() {
    return {
      currentPreviewSrc: '',
    };
  },
  methods: {
    itemSelected(selection) {
      if (!selection) return;
      this.$emit('target-changed', selection);
    },
    showPoptipTarget(targetSrc) {
      this.currentPreviewSrc = targetSrc;
    },
  },
  mounted() {
    // to hide the poptip only when hover outside the i-select
    const targetDropdown = this.$refs.targetDropdown.$el;
    targetDropdown.onmouseleave = () => { this.currentPreviewSrc = ''; };
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


<style lang="scss">
  .custom-autocomplete-targets {
    /* to show poptip on the entire element */
    .ivu-select-item {
      padding: 0px;

      div.custom-select-item-for-preview {
        padding: 7px 16px;
      }
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
    margin-left: 10px;
    display: inline;

    &.showing {
      opacity: 1;
      z-index: 1;
    }
  }
</style>
