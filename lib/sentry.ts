// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

// Initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
    profilesSampleRate: 1.0, // Capture 100% of profiles for performance monitoring
    // If you're using Next.js 13 App Router
    replaysSessionSampleRate: 0.1, // Sample rate for recording session replays (10%)
    replaysOnErrorSampleRate: 1.0, // Sample rate for recording session replays when an error occurs (100%)
    integrations: [
      // Enable automatic instrumentation for monitoring performance
      new Sentry.BrowserTracing(),
      // Enable session replay
      new Sentry.Replay(),
    ],
  });
}

// Export Sentry to be used elsewhere in your code
export { Sentry };

// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
  });
}

// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

// Initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

// sentry.edge.config.js
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

// Initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}