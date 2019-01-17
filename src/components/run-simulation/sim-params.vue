
<template>
  <div class="inline-centered">
    <tooltip
      content="Defines the Circuit"
    >Model:</tooltip>
    <i-select
      v-model="circuitToUse"
      size="small"
      class="circuit-name"
    >
      <i-option
        v-for="circuit in appCircuitsList"
        :key="circuit.displayName"
        :value="circuit.circuitRawName"
      >{{ circuit.displayName }}</i-option>
    </i-select>

    <tooltip
      content="Subpopulation of neurons to be simulated (CircuitTarget)"
    >Population:</tooltip>
    <autocomplete-targets
      :target-selected="populationSelected"
      :itemsAvailable="populationTargets"
      @targetChanged="targetChanged"
    />

    <tooltip
      content="Time length of stimulus duration, given in milliseconds(ms)"
    >Duration(ms):</tooltip>
    <input-number
      v-model="duration"
      :min="1"
      :step="1"
      :max="50000"
      size="small"
      placeholder="Duration"
    />

  </div>
</template>


<script>
import map from 'lodash/map';

import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import circuitConfig from '@/assets/circuit-config';
import db from '@/services/db';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms, unmapBlueConfigTerms } from '@/assets/utils';

export default {
  name: 'sim-params',
  components: {
    AutocompleteTargets,
  },
  data() {
    return {
      circuitToUse: localStorage.getItem('circuitToUse') || this.$store.state.appCircuitToUse,
    };
  },
  mounted() {
    this.loadPreviousConfig();
    eventBus.$on('createSimParamsConfig', (resolve) => {
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
    });
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
    appCircuitsList() {
      return map(circuitConfig, (circuitValue, circuit) => (
        { displayName: circuitValue.displayName, circuitRawName: circuit }
      ));
    },
    populationTargets() {
      return this.$store.state.populationTargets;
    },
  },
  methods: {
    async loadPreviousConfig() {
      const lastConfig = await db.retrievePreviousConfig();
      try {
        if (lastConfig.bc) {
          this.duration = lastConfig.bc.Run.Default.Duration;
          this.forwardSkip = lastConfig.bc.Run.Default.ForwardSkip;
          this.populationSelected = unmapBlueConfigTerms(lastConfig.bc.Run.Default.CircuitTarget);
        } else { throw String('BlueConfig params missing'); }
      } catch (e) {
        console.log('- Previous config for simulation params not found');
      }
    },
    targetChanged(newModel) {
      this.$store.commit('setSimulationPopulation', newModel);
    },
  },
  watch: {
    circuitToUse(newVal) {
      localStorage.setItem('circuitToUse', newVal);
      this.$store.dispatch('showLoader');
      db.cleanPreviousConfig().then(() => {
        window.location.reload();
      });
    },
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
