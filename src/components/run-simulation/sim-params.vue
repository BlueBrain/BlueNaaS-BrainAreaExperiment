
<template>
  <div class="sim-params">

    <div>
      <div class="inline">
        <h2 class="margined-right">Define Population to Simulate:</h2>
        <autocomplete-targets
          :target-selected="populationSelected"
          :itemsAvailable="populationTargets"
          @target-changed="targetChanged"
        />
      </div>
      <div class="subtitle">Subpopulation of neurons to be simulated (CircuitTarget)"</div>
    </div>

    <div class="spaced"/>

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
import get from 'lodash/get';
import AutocompleteTargets from '@/components/shared/autocomplete-targets.vue';
import db from '@/services/db';
import eventBus from '@/services/event-bus';
import { mapBlueConfigTerms, unmapBlueConfigTerms } from '@/common/utils';

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
      const prevConfig = await db.retrievePreviousConfig();

      const runDefaultSaved = get(prevConfig, 'bc.Run.Default', {});
      const hasSavedParams = Boolean(runDefaultSaved.ForwardSkip
        && runDefaultSaved.Duration
        && runDefaultSaved.CircuitTarget);

      this.duration = hasSavedParams ? runDefaultSaved.Duration : this.$store.state.simulationDuration;
      this.forwardSkip = hasSavedParams ? runDefaultSaved.ForwardSkip : this.$store.state.simulationForwardSkip;
      this.populationSelected = hasSavedParams
        ? unmapBlueConfigTerms(runDefaultSaved.CircuitTarget)
        : null;

      // setup default computer
      const unicoreSavedParams = get(prevConfig, 'unicore.computerSelected', null);
      const computerToUse = unicoreSavedParams || this.$store.state.computersAvailable[0];
      eventBus.$emit('change-computer', computerToUse);
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

  .spaced {
    width: 250px;
  }

  .inline {
    display: flex;
    align-items: flex-end;
    .margined-right {
      margin-right: 10px;
    }
  }
  .container-grow {
    flex-grow: 1;
  }
  .custom-autocomplete-targets {
    max-width: 400px;
  }
}
</style>
