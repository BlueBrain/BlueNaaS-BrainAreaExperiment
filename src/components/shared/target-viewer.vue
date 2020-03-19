
<template>
  <div
    class="target-viewer-container"
    :class="{ 'rotate': !localSrc, 'loading': isLoading }"
  >
    <section class="img-container">
      <span v-if="!localSrc">Preview Not Available</span>
      <img :src="localSrc">
    </section>
  </div>
</template>


<script>
export default {
  name: 'TargetViewer',
  props: ['targetSelectedUrl'],
  data() {
    return {
      isLoading: false,
      localSrc: null,
    };
  },
  watch: {
    targetSelectedUrl(newVal) {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.localSrc = newVal;
      }, 1000);
    },
  },
};
</script>


<style scoped lang="scss">
  .img-container > img {
    max-width: 100%;
  }
  .target-viewer-container {
    align-self: center;
    opacity: 1;
    transition: opacity 1.0s;

    &.rotate {
      transform: rotate(45deg);
      font-size: 20px;
    }

    &.loading {
      opacity: 0;
    }
  }

  @media screen and (max-width: 1490px) {
    .target-viewer-container.rotate {
      font-size: 16px;
    }
  }
</style>
