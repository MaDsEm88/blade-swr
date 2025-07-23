# Blade SWR Revalidation Issue Reproduction

This repository demonstrates an issue with Blade's SWR (Stale-While-Revalidate) revalidation system where server logs show excessive revalidation calls when navigating between pages that use the `use server` hook.

## 🐛 **Issue Description**

When navigating between two pages that use Blade's `use server` hook, the server logs show revalidation requests running more frequently than the expected 5-second interval. The issue persists even when staying on a single page, suggesting the revalidation system is not properly managing its intervals after the first redirect.

### **Affected Pages:**
- `/teacher/testuser/students` - Uses server-side data fetching
- `/teacher/testuser/classes` - Uses server-side data fetching

### **Expected Behavior:**
- Revalidation should occur every 5 seconds as per Blade's documentation
- Revalidation should not compound or increase frequency after navigation

### **Actual Behavior:**
- After navigating between pages, revalidation occurs more frequently than 5 seconds
- Multiple revalidation requests appear to be running simultaneously
- Issue persists even when remaining on a single page

## 🚀 **Quick Setup for Blade/Ronin Team**

### **Prerequisites:**
- Bun runtime installed
- RONIN account with a space created

### **1. Configure RONIN Space**

Edit `.ronin/config.json` and replace with your RONIN space ID:
```json
{
    "space": "spa_your_actual_space_id"
}
```

### **2. Environment Variables**

Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

**Required variables:**
```env
# RONIN Database
BLADE_RONIN_TOKEN=your_ronin_token_here
RONIN_TOKEN=your_ronin_token_here

# Better Auth (for authentication)
BLADE_BETTER_AUTH_SECRET="your-secret-key-here"
BLADE_BETTER_AUTH_URL=http://localhost:3000
BLADE_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** Social provider variables (GitHub, Google) are optional and not used in this reproduction.

### **3. Install Dependencies & Run**

```bash
bun install
bun run dev
```

The application will be available at `http://localhost:3000`

## 🧪 **Testing the Issue**

### **Step 1: Create Test User**
1. Navigate to `http://localhost:3000`
2. Click the **"Create Test User"** button
3. Wait for success message

### **Step 2: Login**
1. Use the login form with:
   - **Email:** `testuser@example.com`
   - **Password:** `testpass`
2. You'll be redirected to `/teacher/testuser`

### **Step 3: Reproduce the Issue**
1. Navigate to **Students** page: `/teacher/testuser/students`
2. Navigate to **Classes** page: `/teacher/testuser/classes`
3. Navigate back to **Students** page
4. **Monitor server logs** in your terminal

### **Expected Server Logs:**
```
[Normal 5-second interval revalidation requests]
```

### **Actual Server Logs (Issue):**
[Multiple rapid revalidation requests, more frequent than 5 seconds]
```

## 📁 **Project Structure**

### **Active Pages (For Testing):**
- `pages/index.tsx` - Login page with test user creation
- `pages/teacher/[slug]/students.tsx` - Students page (uses `use server`)
- `pages/teacher/[slug]/classes.tsx` - Classes page (uses `use server`)
- `pages/teacher/layout.tsx` - Teacher layout wrapper

### **Simplified Authentication:**
- `lib/auth.ts` - Basic Better Auth configuration (email/password only)
- `lib/auth-client.ts` - Simplified auth client
- `hooks/useAuth.tsx` - Basic auth hook
- `components/SimpleLoginForm.client.tsx` - Login form with test user creation


## 🔧 **Simplified Configuration**

This reproduction uses a **minimal setup** to isolate the SWR revalidation issue:

### **Authentication:**
- ✅ Basic email/password authentication via Better Auth
- ✅ Single "teacher" role
- ✅ Test user creation endpoint

### **Session Management:**
```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24 * 3, // 3 days
  cookieCache: {
    enabled: true,
    maxAge: 30 * 60 // 30 minutes cache
  }
}
```

### **User Schema:**
```typescript
user: {
  additionalFields: {
    role: { type: "string", defaultValue: "teacher" },
    slug: { type: "string", required: false },
    isActive: { type: "boolean", defaultValue: true }
  }
}
```

## 🎯 **Focus Areas for Investigation**

1. **SWR Revalidation Timing** - Why does the 5-second interval become irregular?
2. **Navigation Impact** - How does page navigation affect revalidation scheduling?
3. **Session Caching** - Is the session cache properly managing revalidation requests?
4. **Memory Leaks** - Are old revalidation timers being properly cleaned up?


This reproduction was created to help the Blade/Ronin team investigate and resolve the SWR revalidation timing issue. The setup is intentionally minimal to focus on the core problem without distractions from complex authentication flows.

