
<template>
  <div class="inline-centered">
    <tooltip
      content="Subpopulation of neurons to be simulated (CircuitTarget)"
    >Population:</tooltip>
    <autocomplete-targets
      :target-selected="populationSelected"
      :itemsAvailable="populationTargets"
      @target-changed="targetChanged"
    />

    <tooltip
      content="Time length of stimulus duration, given in milliseconds(ms)"
    >Duration(ms):</tooltip>
    <input-number
      v-model="duration"
      :min="1"
      :step="1"
      :max="50000"
      placeholder="Duration"
    />
  </div>
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import db from '@/services/db';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms, unmapBlueConfigTerms } from '@/common/utils';
import get from 'lodash/get';

export default {
  name: 'sim-params',
  components: {
    AutocompleteTargets,
  },
  mounted() {
    this.loadPreviousConfig();
    this.creationConfigHandlerBinded = this.creationConfigHandler.bind(this);
    eventBus.$on('createSimParamsConfig', this.creationConfigHandlerBinded);
  },
  computed: {
    duration: {
      get() { return this.$store.state.simulationDuration; },
      set(newVal) {
        if (!newVal || newVal < 1) return;
        this.$store.commit('setSimulationDuration', newVal);
        eventBus.$emit('simulationDurationChanged', newVal);
      },
    },
    populationSelected: {
      get() { return this.$store.state.simulationPopulation; },
      set(newVal) { this.$store.commit('setSimulationPopulation', newVal); },
    },
    populationTargets() {
      return this.$store.state.populationTargets;
    },
  },
  methods: {
    creationConfigHandler(resolve) {
      const params = {
        Run: {
          Default: {
            Duration: this.duration,
            ForwardSkip: this.$store.state.simulationForwardSkip,
            CircuitTarget: mapBlueConfigTerms(this.populationSelected),
          },
        },
      };
      resolve(params);
    },
    async loadPreviousConfig() {
      const lastConfig = await db.retrievePreviousConfig();
      const defaultSaved = get(lastConfig, 'bc.Run.Default', {});
      if (
        !defaultSaved.ForwardSkip || !defaultSaved.Duration || !defaultSaved.CircuitTarget
      ) {
        this.duration = this.$store.state.simulationDuration;
        this.forwardSkip = this.$store.state.simulationForwardSkip;
        this.populationSelected = this.$store.state.simulationPopulation;
      } else {
        this.duration = lastConfig.bc.Run.Default.Duration;
        this.forwardSkip = lastConfig.bc.Run.Default.ForwardSkip;
        this.populationSelected = unmapBlueConfigTerms(lastConfig.bc.Run.Default.CircuitTarget);
      }
    },
    targetChanged(newModel) {
      this.$store.commit('setSimulationPopulation', newModel);
    },
  },
  beforeDestroy() {
    eventBus.$off('createSimParamsConfig', this.creationConfigHandlerBinded);
  },
};
</script>


<style scoped lang="scss">
  .inline-centered {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    .ivu-tooltip {
      margin-right: 5px;
    }
    .ivu-select,
    .ivu-input-number {
      margin-right: 5px;
    }
    .ivu-select {
      width: 120px;
    }
    .circuit-name {
      width: 220px;
    }
  }
</style>
