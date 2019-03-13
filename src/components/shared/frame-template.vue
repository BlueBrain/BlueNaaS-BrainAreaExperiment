
<template>
  <layout class="frame-template">
    <i-header>
      <i-menu mode="horizontal" theme="dark" active-name="1">
        <div class="layout-nav">
          <menu-item name="1">
            <span @click="goHome" class="no-link">
              <h1>{{ pageTitle }}</h1>
            </span>
          </menu-item>
        </div>
      </i-menu>
    </i-header>

    <Content>
      <router-view/>
    </Content>
  </layout>
</template>


<script>
export default {
  name: 'FrameTemplate',
  computed: {
    pageTitle() {
      return this.$store.state.title;
    },
  },
  mounted() {
    this.$Message.config({
      top: 50,
      duration: 5,
    });
  },
  methods: {
    goHome() {
      this.$router.push({
        name: 'run',
        params: {
          circuitName: this.$store.state.currentCircuit,
        },
      });
    },
  },
};
</script>
