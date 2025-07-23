# TypeScript Type System for Authentication

This directory contains comprehensive TypeScript types and utilities for the multi-role authentication system.

## Overview

The type system provides:
- **Type-safe user objects** for each role (Student, Teacher, School Admin)
- **Utility functions** for common operations
- **Type guards** for runtime type checking
- **Consistent interfaces** across the application

## Core Types

### User Types

```typescript
import type { ExtendedUser, StudentUser, TeacherUser, SchoolAdminUser } from './types';

// Base user type - union of all role-specific types
type ExtendedUser = StudentUser | TeacherUser | SchoolAdminUser;

// Role-specific types with their unique properties
interface StudentUser extends BaseUser {
  role: 'student';
  teacherId: string;
  isActive: boolean;
  classId?: string;
  grade?: string;
}

interface TeacherUser extends BaseUser {
  role: 'teacher';
  isIndependent: boolean;
  schoolId?: string;
  department?: string;
  subjects?: string;
  isVerified: boolean;
}

interface SchoolAdminUser extends BaseUser {
  role: 'school_admin';
  schoolName?: string;
  schoolAddress?: string;
  // ... other school-specific fields
}
```

### Session Types

```typescript
interface ExtendedSession {
  user: ExtendedUser;
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    // ... other session fields
  };
}
```

## Usage Examples

### 1. Using Type Guards

```typescript
import { isStudentUser, isTeacherUser, isSchoolAdminUser } from './types';

function handleUser(user: ExtendedUser) {
  if (isStudentUser(user)) {
    // TypeScript knows user is StudentUser here
    console.log(`Student in class: ${user.classId}`);
  } else if (isTeacherUser(user)) {
    // TypeScript knows user is TeacherUser here
    console.log(`Teacher verified: ${user.isVerified}`);
  } else if (isSchoolAdminUser(user)) {
    // TypeScript knows user is SchoolAdminUser here
    console.log(`School: ${user.schoolName}`);
  }
}
```

### 2. Using Utility Functions

```typescript
import { 
  getUserDashboardUrl, 
  formatUserRole, 
  getRoleColorScheme 
} from './types';

function UserCard({ user }: { user: ExtendedUser }) {
  const dashboardUrl = getUserDashboardUrl(user);
  const roleDisplay = formatUserRole(user.role);
  const colors = getRoleColorScheme(user.role);
  
  return (
    <div className={`bg-${colors.secondary} border-${colors.primary}`}>
      <h3>{user.name}</h3>
      <p>{roleDisplay}</p>
      <a href={dashboardUrl}>Go to Dashboard</a>
    </div>
  );
}
```

### 3. Using in Hooks

```typescript
import { useAuth } from '../hooks/useAuth';
import type { ExtendedUser } from './types';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  // user is properly typed as ExtendedUser | null
  if (isAuthenticated && user) {
    // TypeScript knows user is ExtendedUser here
    console.log(user.role); // 'student' | 'teacher' | 'school_admin'
    console.log(user.slug); // string
  }
}
```

### 4. Role-Specific Components

```typescript
import { getTeacherProperties } from './types';

function TeacherDashboard({ user }: { user: ExtendedUser }) {
  const teacherProps = getTeacherProperties(user);
  
  if (!teacherProps) {
    return <div>Access denied - Teachers only</div>;
  }
  
  // teacherProps is typed as TeacherUser
  return (
    <div>
      <h1>Welcome, {teacherProps.name}</h1>
      <p>Department: {teacherProps.department}</p>
      <p>Verified: {teacherProps.isVerified ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## File Structure

```
lib/types/
├── index.ts          # Main exports
├── auth.ts           # Core authentication types
├── utils.ts          # Utility functions
└��─ README.md         # This file
```

## Benefits

1. **Type Safety**: Catch errors at compile time
2. **IntelliSense**: Better autocomplete and documentation
3. **Refactoring**: Safe renaming and restructuring
4. **Documentation**: Types serve as living documentation
5. **Consistency**: Enforced data structures across the app

## Migration Guide

### Before (using any types)
```typescript
function getUser(): any {
  // Returns any type - no type safety
}

const user = getUser();
user.slug; // Could be undefined, no warning
```

### After (using proper types)
```typescript
import type { ExtendedUser } from './types';

function getUser(): ExtendedUser | null {
  // Returns properly typed user
}

const user = getUser();
if (user) {
  user.slug; // TypeScript knows this exists and is a string
}
```

## Best Practices

1. **Always import types with `type` keyword**:
   ```typescript
   import type { ExtendedUser } from './types';
   ```

2. **Use type guards for runtime checks**:
   ```typescript
   if (isStudentUser(user)) {
     // Safe to access student-specific properties
   }
   ```

3. **Prefer utility functions over manual property access**:
   ```typescript
   // Good
   const url = getUserDashboardUrl(user);
   
   // Avoid
   const url = `/${user.role}/${user.slug}`;
   ```

4. **Use proper error handling**:
   ```typescript
   const teacherProps = getTeacherProperties(user);
   if (!teacherProps) {
     throw new Error('User is not a teacher');
   }
   ```

## Testing

The type system includes validation utilities for testing:

```typescript
import { validateUserForRole, createSafeUser } from './types';

// Validate user data
const isValid = validateUserForRole(userData, 'teacher');

// Create safe user objects for testing
const testUser = createSafeUser(mockData, 'student');
```