// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://45b55ae4728cd8321ab3a3f9bed15718@o4508871019659264.ingest.us.sentry.io/4510189628227584",

integrations: [
  Sentry.vercelAIIntegration({ 
    recordInputs: true, 
    recordOutputs: true, 
  }),
  Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] })
],
  
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
