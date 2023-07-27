
<template>
  <div class="edit-buttons">
    <i-button
      title="Add"
      icon="md-add"
      @click="itemAdd"
      type="primary"
    />
    <i-button
      title="Edit"
      icon="md-create"
      type="primary"
      @click="itemEdit"
    />
    <i-button
      title="Delete"
      icon="md-trash"
      type="primary"
      @click="itemDelete"
    />
  </div>
</template>


<script>
export default {
  name: 'EditButtons',
  methods: {
    itemAdd() {
      this.$emit('item-add');
    },
    itemEdit() {
      this.$emit('item-edit');
    },
    itemDelete() {
      this.$emit('item-delete');
    },
  },
};
</script>


<style scoped lang="scss">
  .edit-buttons {
    display: flex;
    justify-content: flex-end;
    button {
      margin: 0 0 5px 5px;
    }
  }
</style>
