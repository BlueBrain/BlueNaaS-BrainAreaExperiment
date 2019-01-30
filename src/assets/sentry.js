
import Vue from 'vue';
import * as Sentry from '@sentry/browser';

const sentryDsn = process.env.VUE_APP_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new Sentry.Integrations.Vue({ Vue })],
  });
}
