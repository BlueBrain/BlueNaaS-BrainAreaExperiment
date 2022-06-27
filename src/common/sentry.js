
import Vue from 'vue';
import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

const sentryDsn = process.env.VUE_APP_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    Vue,
    dsn: sentryDsn,
    integrations: [
      new BrowserTracing({
        tracingOrigins: [
          'localhost',
          'simulation-launcher-bsp-epfl.apps.hbp.eu',
          /^\//,
        ],
      }),
    ],
    tracesSampleRate: 0.2,
  });
}
