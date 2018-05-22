<template>
  <div class="edit-buttons">
    <a
      class="button-with-icon"
      title="Add"
      @click="itemAdd"><i class="material-icons">add</i></a>
    <a
      class="button-with-icon"
      title="Edit"
      @click="itemEdit"><i class="material-icons">edit</i></a>
    <a
      class="button-with-icon"
      title="Delete"
      @click="itemDelete"><i class="material-icons">delete</i></a>
  </div>
</template>

<script>
export default {
  name: 'EditButtons',
  methods: {
    itemAdd: function() {
      this.$emit('itemAdd');
    },
    itemEdit: function() {
      this.$emit('itemEdit');
    },
    itemDelete: function() {
      this.$emit('itemDelete');
    },
  },
};
</script>

<style scoped>
  .button-with-icon {
    display: flex;
    align-items: center;
  }
  .edit-buttons {
    display: flex;
    width: 100%;
    justify-content: flex-end;
  }
  a.button-with-icon {
    color: #fff;
    background-color: #879fcb;
    letter-spacing: .5px;
    cursor: pointer;
    padding: 5px 10px;
    margin: 5px 5px;
    border-radius: 3px;
  }
</style>
