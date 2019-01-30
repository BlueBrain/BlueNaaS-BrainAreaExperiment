
import Vue from 'vue';
import iView from 'iview';
import '@/assets/css/style.css';
import 'iview/dist/styles/iview.css';
import locale from 'iview/dist/locale/en-US';

import auth from '@/services/auth';
import App from '@/components/shared/frame-template.vue';
import router from '@/services/router';
import store from '@/services/store';
import '@/assets/sentry';

Vue.config.productionTip = false;

Vue.use(iView, { locale });

const app = new Vue({
  router,
  store,
  render: h => h(App),
});

auth.init()
  .then(() => {
    app.$mount('#app');
  });
