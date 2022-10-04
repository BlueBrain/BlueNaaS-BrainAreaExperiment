
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

function processErrors(message) {
  switch (message) {
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
      console.warn('General error:', message);
      break;
  }
}

function showErrorPage() {
  const container = document.getElementById('noAuth');
  container.setAttribute('style', 'display: block');
  const spinnerContainer = document.getElementById('loading-component');
  spinnerContainer.setAttribute('style', 'display: none');
}

auth.init()
  .then((response) => {
    if (response === errorMessages.IS_INDEX) {
      app.$mount('#app');
      return;
    }
    app.$mount('#app');
  })
  .catch((e) => {
    if (e.message === errorMessages.TOKEN_EXPIRED) {
      showErrorPage();
      return;
    }
    processErrors(e.message);
  });
