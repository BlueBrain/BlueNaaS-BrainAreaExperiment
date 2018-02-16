<template>
  <div>
    <span class="item-autocomplete">{{ item }}</span>
  </div>
</template>

<script>
export default {
  'props': {
    'item': {'required': true},
    'searchText': {'required': true},
  },
};
</script>

<style>
    .v-autocomplete-list {
        width: 100%;
        text-align: left;
        border: none;
        border-top: none;
        max-height: 400px;
        overflow-y: auto;
        border-bottom: 1px solid #157977; 
    }
    .v-autocomplete-list .v-autocomplete-list-item {
        background-color: lightgray;
        padding: 5px;
    }
</style>