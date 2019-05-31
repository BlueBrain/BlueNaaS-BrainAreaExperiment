
import Vue from 'vue';
import VueRouter from 'vue-router';

import SimulationRun from '@/views/run.vue';
import Details from '@/views/details.vue';
import List from '@/views/list.vue';
import CircuitIndex from '@/views/circuits-index.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/circuits/:circuitName',
    component: SimulationRun,
    name: 'run',
  },
  {
    path: '/circuits/:circuitName/view/:computerParam/',
    component: List,
    name: 'view',
    props: true,
  },
  {
    path: '/circuits/:circuitName/details/:computerParam/:jobId',
    component: Details,
    props: true,
    name: 'details',
  },
  {
    path: '/',
    component: CircuitIndex,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
