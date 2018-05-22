/* jshint esversion: 6 */
import Vue from 'vue/dist/vue.min.js';
import VueRouter from 'vue-router';
import FrameTemplate from 'components/shared/frame-template.vue';
import * as UnicoreAPI from 'mixins/unicore.js';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'hash',
  routes: [
    {
      path: '',
      component: function(resolve) {
        require(['components/run-simulation/index.vue'], resolve);
      },
    },
    {
      path: '/login',
      component: function(resolve) {
        require(['components/shared/login.vue'], resolve);
      },
    },
    {
      path: '/view/:computerParam/status/:statusSearch',
      component: function(resolve) {
        require(['components/view-simulations/view-simulations.vue'], resolve);
      },
      props: true,
      name: 'view',
    },
    {
      path: '/view/:computerParam/:jobId',
      component: function(resolve) {
        require(['components/view-simulations/simulation-details/index.vue'], resolve);
      },
      props: true,
      name: 'details',
    },
  ],
});

// check the authentication for each page
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {next(); return;}
  if (to.fullPath.includes('/&ctx') ||
      to.fullPath.includes('access')) {
    next({path: '/login'}); return;
  }
  UnicoreAPI.init().then(() => {
    next();
  });
});

new Vue({
  // We want to target the div with an id of 'events'
  el: '#app',
  router,
  components: {
    'frame-template': FrameTemplate,
  },
});
