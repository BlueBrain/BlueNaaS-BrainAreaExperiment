
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/circuits/:circuitName',
    component: () => import(/* webpackChunkName: "run" */ '@/views/run.vue'),
    name: 'run',
  },
  {
    path: '/circuits/:circuitName/view/:computerParam/',
    component: () => import(/* webpackChunkName: "list" */ '@/views/list.vue'),
    name: 'view',
    props: true,
  },
  {
    path: '/circuits/:circuitName/details/:computerParam/:jobId',
    component: () => import(/* webpackChunkName: "details" */ '@/views/details.vue'),
    props: true,
    name: 'details',
  },
  {
    path: '/',
    component: () => import(/* webpackChunkName: "circuits-index" */ '@/views/circuits-index.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
