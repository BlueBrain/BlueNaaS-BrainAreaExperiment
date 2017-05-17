/* jshint esversion: 6 */
import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './components/app.vue';

Vue.use(VueResource);
Vue.use(VueRouter);

const router = new VueRouter({
  // mode: 'history',
  routes: [
    {
      'path': '',
      'component': App,
    }
  ]
});

// localStorage.clear(); // to have the lastest info on update

new Vue({
  // We want to target the div with an id of 'events'
  el: '#app',
  router,
  components: {
    'app-init': App
  },
});
