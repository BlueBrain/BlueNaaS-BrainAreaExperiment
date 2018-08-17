
<template>
  <Modal v-model="showModal" width="360">
    <p slot="header" class="text-header text-centered">
      <Icon type="ios-information-circle"></Icon>
      <span>Delete confirmation</span>
    </p>
    <div class="text-centered">
      <p>You won't be able to revert this.</p>
      <p>Will you delete it?</p>
    </div>
    <div slot="footer">
      <Button
        type="error"
        size="large"
        long
        :loading="isLoading"
        @click="del"
      >Delete</Button>
    </div>
  </Modal>
</template>


<script>
export default {
  name: 'DeleteConfirmModal',
  data() {
    return {
      showModal: false,
      isLoading: false,
      deleteFn: () => {},
    };
  },
  methods: {
    changeVisibility() {
      this.showModal = !this.showModal;
    },
    async del() {
      this.isLoading = true;
      await this.deleteFn();
      this.isLoading = false;
      this.changeVisibility();
    },
    setDeleteFn(fn) {
      this.deleteFn = fn;
    },
  },
};
</script>


<style scoped>
  .text-header {
    color: #f60;
  }
  .text-centered {
    text-align: center;
  }
</style>
