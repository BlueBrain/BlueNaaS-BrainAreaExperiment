<template>
    <v-autocomplete
        class="full-width"
        :items="filteredTargets"
        min-len="0"
        wait="0"
        placeholder="Target"
        :component-item="autocompleteTemplate"
        v-model="modelSelected"
        @update-items="updateItems"
        @item-selected="itemSelected"
        @item-clicked="itemSelected"
    ></v-autocomplete>
</template>

<script>
import Vue from 'vue';
import Autocomplete from 'v-autocomplete';
import autocompleteTemplate from 'components/shared/autocomplete-template.vue';
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'v-autocomplete/dist/v-autocomplete.css';
Vue.use(Autocomplete);
import targetList from 'assets/targetList.json';

export default {
  'data': function() {
    return {
      'autocompleteTemplate': autocompleteTemplate,
      'targetList': targetList,
      'filteredTargets': [],
      'modelSelected': null,
    };
  },
  'components': {
    'v-autocomplete': Autocomplete,
  },
  'mounted': function() {
    this.filteredTargets = this.getSomeTargets();
  },
  'methods': {
    'getSomeTargets': function() {
      // show max 50 elements
      return this.targetList.slice(0, 50);
    },
    'getLabel': function(item) {
      if (item) {
        return item;
      }
      return '';
    },
    'updateItems': function(text) {
      if (text) {
        this.filteredTargets = this.targetList.filter((target) => {
          return target.toLowerCase().indexOf(text.toLowerCase()) >= 0;
        });
      } else {
        this.filteredTargets = this.getSomeTargets();
      }
    },
    'itemSelected': function(selection) {
      this.$emit('targetChanged', selection);
    },
  },
};
</script>

<style scoped>
    .full-width {
        width: 100%;
    }
</style>