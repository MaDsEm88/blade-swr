// router.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ronin, type Bindings, type Variables } from "blade-hono";// Import the unified auth instance
import { auth } from "./lib/auth";


// Define the Hono app with proper typing for RONIN and auth context
interface AppContext extends Variables {
  ronin: any;
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
}

const app = new Hono<{
  Bindings: Bindings;
  Variables: AppContext;
}>();

// Get environment variables - Blade 0.9.3+ handles server/client context automatically
const RONIN_TOKEN = process.env["BLADE_RONIN_TOKEN"] || process.env["RONIN_TOKEN"] || '';
const CORS_ORIGIN = process.env["BLADE_BETTER_AUTH_URL"] || 'http://localhost:3000';

// Add RONIN middleware with explicit token since Blade doesn't set up c.env properly
if (RONIN_TOKEN) {
  app.use("*", ronin({
    token: RONIN_TOKEN
  }));
} else {
  console.error('RONIN_TOKEN not found in environment variables');
}

// Configure CORS specifically for auth routes (Better Auth needs this)
app.use(
  "/api/auth/*",
  cors({
    origin: CORS_ORIGIN,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Configure CORS for other routes
app.use(
  "*",
  cors({
    origin: CORS_ORIGIN,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Add Better Auth session middleware (skip for auth endpoints to avoid circular calls)
app.use("*", async (c, next) => {
  // Skip session middleware for auth endpoints to avoid circular dependency
  if (c.req.path.startsWith('/api/auth/')) {
    return next();
  }

  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    // Set session data in context for API routes
    c.set("user", session?.user || null);
    c.set("session", session?.session || null);
  } catch (error) {
    console.error('Session middleware error:', error);
    // Set null values if session retrieval fails
    c.set("user", null);
    c.set("session", null);
  }

  return next();
});

// Mount Better Auth API endpoints - simplified version
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const path = c.req.path;
  const method = c.req.method;

  console.log(`Better Auth request: ${method} ${path}`);

  try {
    const response = await auth.handler(c.req.raw);
    console.log(`Better Auth response status: ${response.status} for ${path}`);
    return response;
  } catch (error) {
    console.error(`Error in Better Auth handler for ${path}:`, error);
    return c.json({
      error: {
        message: "Authentication service error",
        code: "AUTH_SERVICE_ERROR"
      }
    }, 500);
  }
});


// Create test user endpoint for development
app.post("/api/create-test-user", async (c) => {
  try {
    console.log('Creating test user...');

    // Get RONIN instance
    const ronin = c.var.ronin;

    if (!ronin) {
      console.error('RONIN instance not available');
      return c.json({ error: "Database service unavailable" }, 500);
    }

    // Check if test user already exists
    try {
      const existingUser = await ronin.get.user({
        with: { email: 'testuser@example.com' }
      });

      if (existingUser) {
        console.log('Test user already exists');
        return c.json({
          success: true,
          message: 'Test user already exists',
          user: {
            email: 'testuser@example.com',
            slug: existingUser.slug
          }
        });
      }
    } catch (error) {
      // User doesn't exist, continue with creation
      console.log('Test user does not exist, creating...');
    }

    // Create test user using Better Auth API directly
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpass',
      }
    });

    // Check if signup was successful
    if (!signUpResult.user) {
      console.error('Error creating test user - no user returned');
      return c.json({ error: 'Failed to create user' }, 400);
    }

    // Update the user with additional fields (role and slug)
    await ronin.set.user({
      with: { id: signUpResult.user.id },
      to: {
        role: 'teacher',
        slug: 'testuser',
        isActive: true
      }
    });

    console.log('Updated user with role and slug');

    console.log('Test user created successfully!');
    return c.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        email: 'testuser@example.com',
        slug: 'testuser'
      },
      credentials: {
        email: 'testuser@example.com',
        password: 'testpass'
      }
    });

  } catch (error) {
    console.error('Failed to create test user:', error);
    return c.json({ error: 'Failed to create test user' }, 500);
  }
});

export default app;

