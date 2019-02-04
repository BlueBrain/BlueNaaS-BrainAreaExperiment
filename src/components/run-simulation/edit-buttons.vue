
<template>
  <div class="edit-buttons">
    <i-button
      title="Add"
      icon="md-add"
      @click="itemAdd"
      size="small"
      type="primary"
    />
    <i-button
      title="Edit"
      icon="md-create"
      size="small"
      type="primary"
      @click="itemEdit"
    />
    <i-button
      title="Delete"
      icon="md-trash"
      size="small"
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
