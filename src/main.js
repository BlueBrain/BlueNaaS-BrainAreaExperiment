
import Vue from 'vue';
import ViewUI from 'view-design';
import '@/assets/css/style.css';
import 'view-design/dist/styles/iview.css';
import locale from 'view-design/dist/locale/en-US';

import auth from '@/services/auth';
import App from '@/components/shared/frame-template.vue';
import router from '@/services/router';
import store from '@/services/store';
import '@/common/sentry';

Vue.config.productionTip = false;

Vue.use(ViewUI, {
  size: 'small',
  locale,
});

const app = new Vue({
  router,
  store,
  render: h => h(App),
});

auth.init()
  .then(() => {
    app.$mount('#app');
  });
