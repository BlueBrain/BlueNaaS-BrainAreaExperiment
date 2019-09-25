
<template>
  <div
    class="target-viewer-container"
    :class="{'rotate': !targetSelectedUrl}"
  >
    <section class="img-container">
      <img v-if="targetSelectedUrl" :src="targetSelectedUrl">
      <span v-else>Preview Not Available</span>
    </section>
  </div>
</template>


<script>
export default {
  name: 'TargetViewer',
  props: ['targetSelectedUrl'],
};
</script>


<style scoped>
  .img-container > img {
    max-width: 100%;
    transform: scale(1.2);
  }
  .target-viewer-container {
    align-self: center;
  }
  .target-viewer-container.rotate {
    transform: rotate(45deg);
    font-size: 20px;
  }
</style>
