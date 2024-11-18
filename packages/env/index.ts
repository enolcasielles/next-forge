import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 *
 * If you want a granular control over the services that are enabled, you can use the `ENABLE_SERVICES_FLAGS` environment variable.
 * Setting this to true, will allow you to enable or disable each service individually. Otherwise, all services are enabled.
 * Only variables from enabled services are validated.
 */

enum Services {
  CLERK = 'CLERK', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_CLERK` to true to validate variables from clerk
  RESEND = 'RESEND', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_RESEND` to true to validate variables from resend
  DATABASE = 'DATABASE', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_DATABASE` to true to validate variables from database
  STRIPE = 'STRIPE', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_STRIPE` to true to validate variables from stripe
  BETTERSTACK = 'BETTERSTACK', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_BETTERSTACK` to true to validate variables from betterstack
  ARCJET = 'ARCJET', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_ARCJET` to true to validate variables from arcjet
  SVIX = 'SVIX', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_SVIX` to true to validate variables from svix
  POSTHOG = 'POSTHOG', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_POSTHOG` to true to validate variables from posthog
  GA = 'GA', // When ENABLE_SERVICES_FLAGS is true, add `ENABLE_GA` to true to validate variables from google analytics
  /* Add new services here... */
}

const servicesFlagsEnabled = process.env.ENABLE_SERVICES_FLAGS === 'true';

const mustAddSchema = (service: Services): boolean => {
  // If services flags (ENABLE_SERVICES_FLAGS) is not enabled, all services are added
  // Otherwise, only the services explicitly enabled are added
  return !servicesFlagsEnabled || process.env[`ENABLE_${service}`] === 'true';
};

// These variables have to be defined always
const requiredSchema = {
  NEXT_PUBLIC_APP_URL: z.string().min(1).url(),
  NEXT_PUBLIC_WEB_URL: z.string().min(1).url(),
  NEXT_PUBLIC_DOCS_URL: z.string().min(1).url(),
  FLAGS_SECRET: z.string().min(1),
};

// These variables are optional
const optionalSchema = {
  ANALYZE: z.string().optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
  VERCEL: z.string().optional(),
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1).url().optional(),
};

// Clerk variables schema
const clerkSchema = mustAddSchema(Services.CLERK)
  ? {
      CLERK_SECRET_KEY: z.string().min(1).startsWith('sk_'),
      CLERK_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_'),
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).startsWith('pk_'),
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1).startsWith('/'),
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1).startsWith('/'),
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1).startsWith('/'),
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1).startsWith('/'),
    }
  : {};

// Resend variables schema
const resendSchema = mustAddSchema(Services.RESEND)
  ? {
      RESEND_AUDIENCE_ID: z.string().min(1),
      RESEND_FROM: z.string().min(1).email(),
      RESEND_TOKEN: z.string().min(1).startsWith('re_'),
    }
  : {};

// Database variables schema
const databaseSchema = mustAddSchema(Services.DATABASE)
  ? {
      DATABASE_URL: z.string().min(1).url(),
    }
  : {};

// Stripe variables schema
const stripeSchema = mustAddSchema(Services.STRIPE)
  ? {
      STRIPE_SECRET_KEY: z.string().min(1).startsWith('sk_'),
      STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_'),
    }
  : {};

// BetterStack variables schema
const betterstackSchema = mustAddSchema(Services.BETTERSTACK)
  ? {
      BETTERSTACK_API_KEY: z.string().min(1),
      BETTERSTACK_URL: z.string().min(1).url(),
    }
  : {};

// Arcjet variables schema
const arcjetSchema = mustAddSchema(Services.ARCJET)
  ? {
      ARCJET_KEY: z.string().min(1).startsWith('ajkey_'),
    }
  : {};

// Svix variables schema
const svixSchema = mustAddSchema(Services.SVIX)
  ? {
      SVIX_TOKEN: z
        .string()
        .min(1)
        .startsWith('sk_')
        .or(z.string().min(1).startsWith('testsk_')),
    }
  : {};

// Posthog variables schema
const posthogSchema = mustAddSchema(Services.POSTHOG)
  ? {
      NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).startsWith('phc_'),
      NEXT_PUBLIC_POSTHOG_HOST: z.string().min(1).url(),
    }
  : {};

// Google Analytics variables schema
const gaSchema = mustAddSchema(Services.GA)
  ? {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1).startsWith('G-'),
    }
  : {};

/**
 * Define new services here
 */

const allVariables = {
  ...requiredSchema,
  ...clerkSchema,
  ...resendSchema,
  ...databaseSchema,
  ...stripeSchema,
  ...betterstackSchema,
  ...arcjetSchema,
  ...svixSchema,
  ...posthogSchema,
  ...gaSchema,
  ...optionalSchema,
  /** Destruct variables from new services here */
};

const server: Parameters<typeof createEnv>[0]['server'] = Object.entries(
  allVariables
)
  .filter(([key]) => !key.startsWith('NEXT_PUBLIC_'))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

const client: Parameters<typeof createEnv>[0]['client'] = Object.entries(
  allVariables
)
  .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

// Runtime variables, Next needs all variables to be defined in this object
const runtimeEnv = {
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID,
  RESEND_FROM: process.env.RESEND_FROM,
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_TOKEN: process.env.RESEND_TOKEN,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
  BETTERSTACK_URL: process.env.BETTERSTACK_URL,
  ARCJET_KEY: process.env.ARCJET_KEY,
  ANALYZE: process.env.ANALYZE,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  VERCEL: process.env.VERCEL,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  FLAGS_SECRET: process.env.FLAGS_SECRET,
  SVIX_TOKEN: process.env.SVIX_TOKEN,
  /** Add server side variables from new services here */

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
  NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
  /** Add client side variables from new services here */
};

export const env = createEnv({
  server,
  client,
  runtimeEnv,
});
