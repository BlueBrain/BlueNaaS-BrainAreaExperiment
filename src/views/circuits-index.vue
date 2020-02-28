
<template>
  <div class="circuit-index">
    <h3
      v-for="circuit in circuits"
      :key="circuit.route"
      @click="changeCircuit(circuit.route)"
    >
      <card class="circuit-card">
        {{ circuit.name }}
      </card>
    </h3>
  </div>
</template>


<script>
import circuitConfig from '@/config/circuit-config';

export default {
  name: 'CircuitIndex',
  data() {
    return {
      circuits: [],
    };
  },
  created() {
    const circuits = Object.keys(circuitConfig.mapCircuitNameWithUrl).sort();
    this.$store.dispatch('hideLoader');
    this.circuits = circuits.map(circuit => ({
      name: circuit,
      route: `${window.location.href}circuits/${circuit}`,
    }));
  },
  methods: {
    changeCircuit(route) {
      window.history.pushState({}, null, route);
      this.$nextTick(() => { window.location.reload(); });
    },
  },
};
</script>


<style scoped>
  .circuit-index {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
  }
  .circuit-card {
    width: 320px;
    text-align: center;
    margin: 25px;
    background-color: #515a6e;
    color: white;
    cursor: pointer;
    text-transform: uppercase;
  }
  .circuit-card h3 a {
    color: white;
  }
</style>
