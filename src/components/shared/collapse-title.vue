
<template>
  <div class="collapse-title">
    <div
      :class="{sublevel: sublevel}"
      class="item"
      @click="toggle"
    >
      <icon
        type="ios-arrow-forward"
        :class="{collapsed: toggleCollapse}"
        class="toggle-arrow"
      />
      <span>{{ title }}</span>
    </div>
    <div
      :class="{collapsed: toggleCollapse}"
      class="item-container"
    >
      <transition
        name="component-fade"
        mode="out-in"
      >
        <slot
          v-if="!toggleCollapse"
          name="element"
        />
      </transition>
    </div>
  </div>
</template>


<script>
export default {
  name: 'CollapseTitle',
  props: {
    title: { type: String, default: '' },
    collapsed: { type: Boolean, default: true },
    sublevel: { type: Boolean, default: false },
  },
  data() {
    return {
      toggleCollapse: true,
    };
  },
  mounted() {
    if (!this.collapsed) {
      // To avoid overload set timeout
      setTimeout(() => { this.toggle(); }, 600);
    }
  },
  methods: {
    toggle() {
      this.toggleCollapse = !this.toggleCollapse;
      this.$emit(this.toggleCollapse ? 'collapsed' : 'expanded');
    },
  },
  watch: {
    collapsed() {
      this.toggle();
    },
  },
};
</script>


<style scoped>
  .component-fade-enter-active, .component-fade-leave-active {
    max-height: 5000px;
    overflow-y: hidden;
    transition: max-height 0.3s ease;
  }
  .component-fade-enter, .component-fade-leave-to {
    max-height: 0px;
  }
  .collapse-title .item {
    display: inline-flex;
    align-items: center;
    font-size: 25px;
    color: #009688;
    padding: 10px 0px 10px 0px;
    cursor: pointer;
  }
  .collapse-title .item-container {
    padding-left: 24px;
  }
  .collapse-title .item.sublevel {
    color: #4b7a76;
    font-size: 16px;
  }
  .collapse-title .toggle-arrow {
    transition: transform 0.3s;
    transform: rotate(90deg);
  }
  .collapse-title .toggle-arrow.collapsed {
    transform: rotate(0deg);
  }
</style>
