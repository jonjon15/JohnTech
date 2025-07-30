import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, // Ajuste para produção se necessário
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV !== "development",
});
