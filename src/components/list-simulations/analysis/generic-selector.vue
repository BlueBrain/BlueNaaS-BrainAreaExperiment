
<template>
  <row :gutter="12" class="generic-selector">
    <i-col span="12">
      <i-select
        v-model="currentComponentToRender"
        placement="top"
        class="full-width"
      >
        <i-option
          v-for="option in filteredPopulationSelectorTypes"
          :key="option.name"
          :value="option.component"
        >{{ option.name }}</i-option>
      </i-select>
    </i-col>

    <i-col span="12">
      <component
        :is="currentComponentToRender"
        :default-population="defaultPopulation"
        :analysis-obj="analysisObj"
        class="full-width"
      ></component>
    </i-col>

  </row>
</template>


<script>
import findKey from 'lodash/findKey';
import pick from 'lodash/pick';
import store from '@/services/store';
import { analysis } from '@/common/constants';
import PopupTargetSelector from './popup-target-selector.vue';
import GidsSelector from './gids-selector.vue';
import RandomGidSelector from './random-gid-selector.vue';

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
  computed: {
    filteredPopulationSelectorTypes() {
      let typesToPick = ['gids', 'randomCells'];
      if (this.analysisObj.type !== analysis.types.VOLTAGE_COLLAGE) {
        typesToPick = ['entirePopulation', ...typesToPick];
      }
      return pick(pupulationSelectorTypes, typesToPick);
    },
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


<style>
  .generic-selector .ivu-col .full-width {
    width: 100%;
  }
</style>
