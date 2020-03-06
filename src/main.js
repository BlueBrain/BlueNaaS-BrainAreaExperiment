
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
import { errorMessages } from '@/common/constants';
import initialStateGenerator from '@/services/helper/initial-state-generator';
import { restoreQueries } from '@/services/helper/dynamic-circuit-loader-helper';


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
  .then((response) => {
    if (response === errorMessages.IS_INDEX) {
      app.$mount('#app');
    } else {
      restoreQueries();
      const fullConfig = initialStateGenerator.setupInitialStates();
      store.commit('setCurrentSimulationConfig', fullConfig);
      app.$mount('#app');
    }
  })
  .catch((e) => {
    switch (e.message) {
      case errorMessages.NO_SESSION_ENDPOINT:
        console.debug('No session. Reloading window');
        window.location.reload();
        break;
      case errorMessages.REDIRECT_LOGIN_REQUIRED:
        console.debug('Redirect login in progress');
        break;
      case errorMessages.NO_QUERY_PARAMS:
        console.debug('Query params not provided for dynamic circuit');
        break;
      default:
        console.warn('General error:', e);
        break;
    }
  });
