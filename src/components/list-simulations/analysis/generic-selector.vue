
<template>
  <row :gutter="16">
    <i-col span="11">
      <i-select
        v-model="currentComponentToRender"
        placement="top"
      >
        <i-option
          v-for="option in pupulationSelectorTypes"
          :key="option.name"
          :value="option.component"
        >{{ option.name }}</i-option>
      </i-select>
    </i-col>

    <i-col span="13">
      <component
        :is="currentComponentToRender"
        :default-population="defaultPopulation"
      ></component>
    </i-col>

  </row>
</template>


<script>
import PopupTargetSelector from './popup-target-selector.vue';
import GidsSelector from './gids-selector.vue';

const pupulationSelectorTypes = {
  entirePopulation: {
    name: 'Whole Population',
    component: 'popup-target-selector',
  },
  gids: {
    name: 'Cells GIDs',
    component: 'gids-selector',
  },
};

export default {
  name: 'generic-selector',
  props: ['defaultPopulation'],
  data() {
    return {
      currentComponentToRender: '',
      pupulationSelectorTypes,
    };
  },
  components: {
    PopupTargetSelector,
    GidsSelector,
  },
};
</script>


<style scoped>
  .inline-flex {
    display: flex;
    justify-content: space-evenly;
  }
</style>
