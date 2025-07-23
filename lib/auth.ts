// lib/auth.ts - Simplified Better Auth configuration
import { betterAuth } from "better-auth"
import { ronin } from "blade-better-auth"
import { createSyntaxFactory } from 'ronin';

// Get environment variables - Blade 0.9.3+ handles server/client context automatically
const RONIN_TOKEN = process.env["BLADE_RONIN_TOKEN"] || '';
const BETTER_AUTH_SECRET = process.env["BLADE_BETTER_AUTH_SECRET"] || '';
const BETTER_AUTH_URL = process.env["BLADE_BETTER_AUTH_URL"] || 'http://localhost:3000';

// Validate required environment variables
if (!BETTER_AUTH_SECRET) {
  console.warn('BETTER_AUTH_SECRET is not set, using default for development');
}

if (!RONIN_TOKEN) {
  console.warn('RONIN_TOKEN is not set, this may cause database connection issues');
}

// Create RONIN client for database operations
const client = createSyntaxFactory({
  token: RONIN_TOKEN,
});

export const auth = betterAuth({
  database: ronin(client),
  secret: BETTER_AUTH_SECRET || 'dev-secret-change-in-production',
  baseURL: BETTER_AUTH_URL,

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  // Optimized session configuration to reduce excessive revalidation
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 * 3, // 3 days (reduced frequency of session updates)
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60 // 30 minutes cache (increased from 5 minutes to reduce polling)
    }
  },
  // User configuration with simplified fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "teacher",
        input: false, // Don't allow direct input - set programmatically
      },
      slug: {
        type: "string",
        required: false, // Allow it to be optional initially
        unique: true,
        input: false, // Don't allow direct input - generated automatically
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },


});

export type AuthType = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}