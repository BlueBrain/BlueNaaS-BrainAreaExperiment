
<template>
  <div class="sim-params">

    <div>
      <div class="inline">
        <h2 class="margined-right">Define Population to Simulate:</h2>
        <autocomplete-targets
          :target-selected="populationSelected"
          :itemsAvailable="populationTargets"
          @target-changed="targetChanged"
          class="custom-autocomplete-targets"
        />
      </div>
      <div class="subtitle">Subpopulation of neurons to be simulated (CircuitTarget)"</div>
    </div>

    <div class="space-divider"/>

    <div>
      <div class="inline">
        <h2 class="margined-right">Duration:</h2>
        <input-number
          v-model="duration"
          :min="1"
          :step="1"
          :max="50000"
          placeholder="Duration"
        />
      </div>
      <div class="subtitle">Total duration of the simulation (ms)</div>
    </div>

  </div>
</template>


<script>
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import db from '@/services/db';
import eventBus from '@/services/event-bus';
import { saveParamNames } from '@/common/constants';

import { mapBlueConfigTerms } from '@/common/utils';

export default {
  name: 'sim-params',
  components: {
    AutocompleteTargets,
  },
  mounted() {
    this.loadPreviousConfig();
    this.creationConfigHandlerBinded = this.creationConfigHandler.bind(this);
    eventBus.$on('create-sim-params-config', this.creationConfigHandlerBinded);
  },
  computed: {
    duration: {
      get() { return this.$store.state.simulationDuration; },
      set(newVal) {
        if (!newVal || newVal < 1) return;
        this.$store.commit('setSimulationDuration', newVal);
        eventBus.$emit('simulation-duration-changed', newVal);
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
      const { runSection, isSonata, sonataNeuronsPopulation } = this.$store.state.fullConfig.circuitConfig;
      const circuitTarget = isSonata
        ? `${sonataNeuronsPopulation}:${mapBlueConfigTerms(this.populationSelected)}`
        : mapBlueConfigTerms(this.populationSelected);

      const params = {
        Run: {
          Default: {
            Duration: this.duration,
            CircuitTarget: circuitTarget,
            ...runSection,
          },
        },
      };
      const configUsed = {
        duration: this.duration,
        circuitTarget: this.populationSelected,
      };
      db.setSavedConfig(saveParamNames.SIM_PARAMS, configUsed);
      resolve(params);
    },
    async loadPreviousConfig() {
      const prevConfig = await db.getSavedConfig(saveParamNames.SIM_PARAMS);
      const { runSection } = this.$store.state.fullConfig.circuitConfig;
      this.duration = prevConfig ? prevConfig.duration : runSection.duration;
      this.populationSelected = prevConfig ? prevConfig.circuitTarget : null;
    },
    targetChanged(newModel) {
      this.$store.commit('setSimulationPopulation', newModel);
    },
  },
  beforeDestroy() {
    eventBus.$off('create-sim-params-config', this.creationConfigHandlerBinded);
  },
};
</script>


<style scoped lang="scss">
.sim-params {
  display: flex;

  .space-divider {
    width: 250px;
  }

  .inline {
    display: flex;
    .margined-right {
      margin-right: 10px;
    }
    .custom-autocomplete-targets {
      width: 180px;
    }
  }
  .container-grow {
    flex-grow: 1;
  }

}
</style>
