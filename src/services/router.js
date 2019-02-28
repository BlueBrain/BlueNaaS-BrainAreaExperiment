
import Vue from 'vue';
import VueRouter from 'vue-router';

import SimulationRun from '@/views/run.vue';
// TODO: lazy load pages
import Details from '@/views/details.vue';
import List from '@/views/list.vue';

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
];

const router = new VueRouter({
  routes,
});

export default router;
