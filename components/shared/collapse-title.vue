<template>
  <div class="collapse-title">
    <div
      :class="{sublevel: sublevel}"
      class="item"
      @click="toggle">
      <i
        :class="{collapsed: toggleCollapse}"
        class="material-icons toggle-arrow">keyboard_arrow_right</i>
      <i>{{ title }}</i>
    </div>
    <div
      :class="{collapsed: toggleCollapse}"
      class="item-container" >
      <transition
        name="component-fade"
        mode="out-in">
        <slot
          v-if="!toggleCollapse"
          name="element"/>
      </transition>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CollapseTitle',
  props: {
    title: {type: String, default: 'Notes'},
    collapsed: {type: Boolean, default: true},
    sublevel: {type: Boolean, default: false},
  },
  data: function() {
    return {
      toggleCollapse: Boolean, // this is to avoid mutiating the prop
    };
  },
  mounted: function() {
    if (this.collapsed === undefined) {
      this.toggleCollapse = true;
    } else {
      this.toggleCollapse = this.collapsed;
    }
  },
  methods: {
    toggle: function() {
      this.toggleCollapse = !this.toggleCollapse;
      if (this.toggleCollapse === false) {
        this.$emit('expanded');
      }
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
    display: flex;
    align-items: center;
    font-size: 30px;
    color: #009688;
    padding: 10px 0px 10px 0px;
    cursor: pointer;
  }
  .collapse-title .item-container {
    padding-left: 24px;
  }
  .collapse-title .item.sublevel {
    color: black;
    font-size: 20px;
  }
  .collapse-title .toggle-arrow {
    transition: transform 0.3s;
    transform: rotate(90deg);
  }
  .collapse-title .toggle-arrow.collapsed {
    transform: rotate(0deg);
  }
</style>
