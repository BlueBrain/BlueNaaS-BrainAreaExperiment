<template>
  <div class="frame-template">
    <router-link to="/">
      <div class="title" id="frameTemplateTitle">{{ title }}</div>
    </router-link>

    <div class="item-container">
      <slot name="element"> </slot>
    </div>
  </div>
</template>
<script>
  export default {
      'name': 'frame-template',
      'props': {
          'title': {'type': String, 'default': ''},
      },
  };
</script>

<style scoped>
  .title {
    box-shadow: 0 2px 5px rgba(0,0,0,.26);
    color: #fff;
    background-color: rgba(172,96,103,.95);
    padding: 20px;
    font-size: 24px;
    margin-bottom: 10px;
    min-height: 26px;
  }
  a.router-link-exact-active,
  a.router-link-active,
  a.router-link-active {
    text-decoration: none;
  }
</style>
