
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
        :analysis-obj="analysisObj"
      ></component>
    </i-col>

  </row>
</template>


<script>
import findKey from 'lodash/findKey';
import PopupTargetSelector from './popup-target-selector.vue';
import GidsSelector from './gids-selector.vue';
import RandomGidSelector from './random-gid-selector.vue';
import store from '@/services/store';

const pupulationSelectorTypes = {
  entirePopulation: {
    name: 'Whole Population',
    component: 'popup-target-selector',
    mode: store.state.analysis.modes.POPULATION,
  },
  gids: {
    name: 'Cells GIDs',
    component: 'gids-selector',
    mode: store.state.analysis.modes.GIDS,
  },
  randomCells: {
    name: 'Random Cells (Nº)',
    component: 'random-gid-selector',
    mode: store.state.analysis.modes.RANDOM_GIDS,
  },
};

export default {
  name: 'generic-selector',
  props: ['defaultPopulation', 'analysisObj'],
  data() {
    return {
      currentComponentToRender: '',
      pupulationSelectorTypes,
    };
  },
  watch: {
    currentComponentToRender(newVal) {
      const currentPopulationType = findKey(pupulationSelectorTypes, { component: newVal });
      this.$store.commit('changeAnalysisMode', {
        analysisObj: this.analysisObj,
        value: pupulationSelectorTypes[currentPopulationType].mode,
      });
    },
  },
  components: {
    PopupTargetSelector,
    GidsSelector,
    RandomGidSelector,
  },
};
</script>