// router.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ronin, type Bindings, type Variables } from "blade-hono";



// Import the unified auth instance
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

// Mount Better Auth API endpoints - single unified endpoint
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const path = c.req.path;
  const method = c.req.method;
  
  console.log(`Better Auth request: ${method} ${path}`);
  
  // Handle waitlist validation BEFORE calling Better Auth for OTP sending
  if (path === "/api/auth/email-otp/send-verification-otp" && method === "POST") {
    try {
      // Clone the request to avoid locking the ReadableStream
      const clonedRequest = c.req.raw.clone();
      const body = await clonedRequest.json();
      const email = body?.email;

      if (email) {
        console.log(`Checking waitlist for email: ${email}`);

        // Get RONIN instance using the correct blade-hono syntax
        const ronin = c.var.ronin;

        // Check if user exists in waitlist
        const waitlistUser = await ronin.get.waitlist({
          with: { email: email }
        });

        if (!waitlistUser) {
          console.error(`User ${email} not found in waitlist - blocking OTP send`);
          return c.json({
            error: {
              message: "Your email is not on the waitlist. Please sign up first.",
              code: "WAITLIST_REQUIRED"
            }
          }, 400);
        }

        // Check if the user has been approved
        if (!waitlistUser.isApproved) {
          console.error(`User ${email} not approved in waitlist - blocking OTP send`);
          return c.json({
            error: {
              message: "Your account is awaiting approval. Please check back later.",
              code: "WAITLIST_NOT_APPROVED"
            }
          }, 400);
        }

        // NEW: Check if the user's role matches the context they're trying to sign in from
        // Get the selected role from the request header
        const selectedRole = c.req.header('X-Selected-Role') || 'teacher'; // default to teacher
        const expectedUserType = selectedRole; // Use the role selected in the UI

        console.log(`User attempting to sign in as: ${expectedUserType}, waitlist shows: ${waitlistUser.userType}`);

        // Check if waitlist userType matches expected role
        if (waitlistUser.userType !== expectedUserType) {
          const correctRole = waitlistUser.userType === 'school_admin' ? 'School Admin' : 'Teacher';

          console.error(`User ${email} is registered as ${waitlistUser.userType} but trying to sign in as ${expectedUserType}`);
          return c.json({
            error: {
              message: `This email is registered for ${correctRole} access.`,
              code: "WRONG_ROLE_SELECTED"
            }
          }, 400);
        }

        console.log(`User ${email} is approved in waitlist with correct role (${waitlistUser.userType}) - allowing OTP send`);
      }
    } catch (error) {
      console.error('Error checking waitlist before OTP send:', error);
      return c.json({
        error: {
          message: "Unable to verify waitlist status. Please try again later.",
          code: "WAITLIST_VALIDATION_ERROR"
        }
      }, 500);
    }
  }
  
  try {
    // Create a wrapped request that handles potential fetch issues
    const wrappedRequest = new Request(c.req.raw.url, {
      method: c.req.raw.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body,
    });
    
    const response = await auth.handler(wrappedRequest);
    
    // Ensure we have a proper Response object
    if (!response) {
      console.error("Better Auth handler returned undefined response for:", path);
      return c.json({
        error: {
          message: "Authentication service error",
          code: "AUTH_SERVICE_ERROR"
        }
      }, 500);
    }

    // Check if response has proper structure before accessing headers
    if (typeof response !== 'object' || !('headers' in response)) {
      console.error("Better Auth response missing headers for:", path);
      return c.json({
        error: {
          message: "Authentication service error",
          code: "AUTH_SERVICE_ERROR"
        }
      }, 500);
    }

    // Log response details for debugging
    console.log(`Better Auth response status: ${response.status} for ${path}`);
    
    // Return the response directly - let Better Auth handle the formatting
    return response;
    
  } catch (error) {
    console.error(`Error in Better Auth handler for ${path}:`, error);
    
    // Handle specific waitlist validation errors first
    if (error instanceof Error) {
      if (error.message === 'WAITLIST_REQUIRED') {
        return c.json({
          error: {
            message: "Your email is not on the waitlist. Please sign up first.",
            code: "WAITLIST_REQUIRED"
          }
        }, 400);
      } else if (error.message === 'WAITLIST_NOT_APPROVED') {
        return c.json({
          error: {
            message: "Your account is awaiting approval. Please check back later.",
            code: "WAITLIST_NOT_APPROVED"
          }
        }, 400);
      } else if (error.message === 'WAITLIST_VALIDATION_ERROR') {
        return c.json({
          error: {
            message: "Unable to verify waitlist status. Please try again later.",
            code: "WAITLIST_VALIDATION_ERROR"
          }
        }, 500);
      } else if (error.message.includes('Email service')) {
        return c.json({
          error: {
            message: "Email service is temporarily unavailable. Please try again later.",
            code: "EMAIL_SERVICE_ERROR"
          }
        }, 500);
      } else if (error.message.includes('result.headers') || error.message.includes('undefined is not an object')) {
        // Handle the specific Better Auth headers error
        console.error('Better Auth headers error detected, likely after successful operation');
        // For OTP send operations, if we get here it might mean the OTP was sent but there's a response formatting issue
        if (path.includes('send-verification-otp')) {
          return c.json({
            error: {
              message: "OTP service temporarily unavailable. Please try again.",
              code: "OTP_SERVICE_ERROR"
            }
          }, 500);
        }
      }
    }
    
    return c.json({
      error: {
        message: "Authentication service error",
        code: "AUTH_SERVICE_ERROR",
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 500);
  }
});



// Update user endpoint for post-OTP user updates
app.post("/api/update-user", async (c) => {
  try {
    const { userId, updates } = await c.req.json();

    if (!userId || !updates) {
      c.header('Content-Type', 'application/json');
      return c.json({ error: "Missing userId or updates" }, 400);
    }

    console.log('Updating user:', userId, 'with:', updates);

    // Get RONIN instance
    const ronin = c.var.ronin;

    if (!ronin) {
      console.error('RONIN instance not available');
      c.header('Content-Type', 'application/json');
      return c.json({ error: "Database service unavailable" }, 500);
    }

    // Update user in database
    await ronin.set.user({
      with: { id: userId },
      to: updates
    });

    console.log('User updated successfully:', userId);

    c.header('Content-Type', 'application/json');
    return c.json({ success: true });

  } catch (error) {
    console.error('Error updating user:', error);
    c.header('Content-Type', 'application/json');
    return c.json({ error: "Failed to update user" }, 500);
  }
})


// Ensure role-specific record exists (Teacher/Student/SchoolAdmin)
app.post('/api/ensure-role-record', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, role, userData } = body;

    if (!userId || !role) {
      c.header('Content-Type', 'application/json');
      return c.json({ error: 'Missing userId or role' }, 400);
    }

    console.log('🔍 Checking if role-specific record exists for:', { userId, role });

    let recordExists = false;
    let createRecord = null;

    // Check if role-specific record exists and create if needed
    switch (role) {
      case 'teacher':
        try {
          const existingTeacher = await c.var.ronin.get.teacher({
            with: { userId: userId }
          });
          recordExists = !!existingTeacher;

          if (!recordExists) {
            createRecord = {
              userId: userId,
              bio: '',
              isVerified: false,
              isIndependent: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
        } catch (error) {
          console.log('Teacher record not found, will create');
          recordExists = false;
        }
        break;

      case 'student':
        try {
          const existingStudent = await c.var.ronin.get.student({
            with: { userId: userId }
          });
          recordExists = !!existingStudent;

          if (!recordExists) {
            createRecord = {
              userId: userId,
              grade: '',
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
        } catch (error) {
          console.log('Student record not found, will create');
          recordExists = false;
        }
        break;

      case 'school_admin':
        try {
          const existingSchoolAdmin = await c.var.ronin.get.schoolAdmin({
            with: { userId: userId }
          });
          recordExists = !!existingSchoolAdmin;

          if (!recordExists && userData?.schoolId) {
            createRecord = {
              userId: userId,
              schoolId: userData.schoolId,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
        } catch (error) {
          console.log('SchoolAdmin record not found, will create');
          recordExists = false;
        }
        break;

      default:
        c.header('Content-Type', 'application/json');
        return c.json({ error: 'Invalid role' }, 400);
    }

    if (recordExists) {
      console.log('✅ Role-specific record already exists for:', role);
      c.header('Content-Type', 'application/json');
      return c.json({
        success: true,
        message: `${role} record already exists`,
        created: false
      });
    }

    if (createRecord) {
      // Create the role-specific record
      switch (role) {
        case 'teacher':
          await c.var.ronin.add.teacher({ with: createRecord });
          console.log('✅ Created Teacher record for user:', userId);
          break;
        case 'student':
          await c.var.ronin.add.student({ with: createRecord });
          console.log('✅ Created Student record for user:', userId);
          break;
        case 'school_admin':
          await c.var.ronin.add.schoolAdmin({ with: createRecord });
          console.log('✅ Created SchoolAdmin record for user:', userId);
          break;
      }

      c.header('Content-Type', 'application/json');
      return c.json({
        success: true,
        message: `${role} record created successfully`,
        created: true
      });
    } else {
      console.warn('⚠️ Could not create record for role:', role, '(missing required data)');
      c.header('Content-Type', 'application/json');
      return c.json({
        error: `Cannot create ${role} record - missing required data`
      }, 400);
    }

  } catch (error) {
    console.error('❌ Error in ensure-role-record:', error);
    c.header('Content-Type', 'application/json');
    return c.json({ error: 'Internal server error' }, 500);
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

