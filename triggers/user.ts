// triggers/user.ts
import type { AddTrigger, SetTrigger, GetTrigger, RemoveTrigger } from 'blade/types';

// Trigger for creating users
export const add: AddTrigger = (query) => {
  // Ensure query.with exists
  if (!query.with) {
    return query;
  }

  // Handle both single object and array cases
  const processUserData = (userData: any) => {
    // Set default name if not provided (use email prefix)
    if (!userData.name && userData.email) {
      userData.name = userData.email.split('@')[0];
    } else if (!userData.name) {
      userData.name = 'User';
    }

    // Special handling for students
    if (userData.role === 'student') {
      // Generate username from name if not provided
      if (!userData.username && userData.name) {
        userData.username = userData.name.toLowerCase().replace(/\s+/g, '.');
      }

      // Generate email if not provided
      if (!userData.email && userData.name) {
        userData.email = `${userData.username}@student.school.com`;
      }

      // Use username as slug for students
      if (!userData.slug) {
        if (userData.username) {
          userData.slug = userData.username;
        } else if (userData.email) {
          userData.slug = userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '') || 'student';
        } else {
          userData.slug = 'student';
        }
      }

      // Set default values for students
      userData.isActive = userData.isActive ?? true;
      userData.emailVerified = false; // Students don't need email verification initially

      // Note: Password is handled by Better Auth through the Account model, not User model

      // Ensure teacherId is set (should be provided when creating student)
      if (!userData.teacherId) {
        console.warn('Student created without teacherId - this may cause issues');
      }
    } else {
      // Auto-generate slug if not provided - prefer name for non-students
      if (!userData.slug) {
        let baseName = 'user';

        if (userData.name) {
          // Use name as base for slug (more user-friendly)
          baseName = userData.name;
        } else if (userData.email) {
          // Fallback to email if no name is provided
          baseName = userData.email.replace('@', '-at-');
        }

        userData.slug = baseName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'user';
      }
    }

    // Set default emailVerified if not provided (and not already set for students)
    if (userData.emailVerified === undefined && userData.role !== 'student') {
      userData.emailVerified = false;
    }

    // Set default role if not provided
    if (!userData.role) {
      // For OTP users (those with email), default to teacher
      // Students are created by teachers, so OTP users are always teachers or school_admins
      userData.role = userData.email ? 'teacher' : 'student';
    }

    // Remove any password field that might have been accidentally included
    // Password should only be in the Account model, not User model
    if ('password' in userData) {
      delete userData.password;
      console.log('Removed password field from user data - passwords belong in Account model');
    }

    console.log('User trigger - processed user data:', userData);

    // Set default timestamps
    userData.createdAt = new Date();
    userData.updatedAt = new Date();

    return userData;
  };

  // Handle array of users
  if (Array.isArray(query.with)) {
    query.with = query.with.map(processUserData);
  } else {
    // Handle single user
    query.with = processUserData(query.with);
  }

  return query;
};

// Trigger for updating users
export const set: SetTrigger = (query) => {
  // Ensure query.to exists
  if (!query.to) {
    return query;
  }

  // Update timestamp
  (query.to as any)['updatedAt'] = new Date();

  // Handle avatar updates
  if ('image' in (query.to as any)) {
    const imageValue = (query.to as any)['image'];
    console.log('🖼️ Avatar update detected:', imageValue ? 'Setting new avatar' : 'Removing avatar');

    // If removing avatar, ensure it's set to null
    if (imageValue === null || imageValue === '') {
      (query.to as any)['image'] = null;
      console.log('🖼️ Avatar removed - set to null');
    } else if (imageValue) {
      console.log('🖼️ Avatar updated with new image data');

      // If this is a StoredObject with a key but filename in src, fix the src field
      if (typeof imageValue === 'object' && 'key' in imageValue && 'src' in imageValue) {
        const key = imageValue.key;
        const currentSrc = imageValue.src;

        // If src is just a filename, construct the proper RONIN storage URL
        if (typeof currentSrc === 'string' && !currentSrc.startsWith('https://')) {
          const properSrc = `https://storage.ronin.co/${key}`;
          console.log('🔧 Fixing StoredObject src field:', {
            originalSrc: currentSrc,
            key: key,
            newSrc: properSrc
          });

          // Update the src field to the proper URL
          (query.to as any)['image'] = {
            ...imageValue,
            src: properSrc
          };
        }
      }
    }
  }

  // Update slug if name is being changed and slug is not already provided
  if ((query.to as any)['name'] && !(query.to as any)['slug']) {
    (query.to as any)['slug'] = (query.to as any)['name']
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'user';
  }

  // Remove any password field that might have been accidentally included
  if ('password' in (query.to as any)) {
    delete (query.to as any).password;
    console.log('Removed password field from user update - passwords belong in Account model');
  }

  // Remove any fields that don't exist in the User model schema
  const validUserFields = [
    'email', 'emailVerified', 'image', 'name', 'username', 'displayUsername',
    'slug', 'role', 'isActive', 'createdAt', 'updatedAt',
    // Student-specific fields
    'teacherId', 'grade', 'classId',
    // Teacher-specific fields
    'isIndependent', 'schoolId', 'department', 'subjects', 'isVerified',
    // School admin-specific fields
    'schoolName', 'schoolAddress', 'schoolPlaceId', 'schoolType', 'schoolDistrict',
    'studentCount', 'teacherCount'
  ];

  const toUpdate = query.to as any;
  const invalidFields = Object.keys(toUpdate).filter(field => !validUserFields.includes(field));

  if (invalidFields.length > 0) {
    console.log('Removing invalid fields from user update:', invalidFields);
    invalidFields.forEach(field => delete toUpdate[field]);
  }

  console.log('User update trigger - processed data:', query.to);

  return query;
};

// Trigger for getting users (can be used for access control)
export const get: GetTrigger = (query) => {
  // Add any access control logic here if needed
  return query;
};

// Trigger for removing users
export const remove: RemoveTrigger = (query) => {
  // Add any validation or cleanup logic for deletions
  console.log('User removal trigger called with query:', query);
  return query;
};

// Trigger to run after user creation (synchronous)
export const afterAdd = async (query: any, _multiple: any, _options: any) => {
  const additionalQueries = [];
  const userData = query.with;

  if (!userData) {
    return [];
  }

  console.log('🔥 User afterAdd trigger called for role:', userData.role, 'email:', userData.email);

  // Handle STUDENT creation
  if (userData.role === 'student') {
    console.log('👨‍🎓 Creating Student record for user:', userData.id);

    // Create Student record
    additionalQueries.push({
      add: {
        student: {
          with: {
            userId: userData.id,
            grade: userData.grade || '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }
    });

    // Send invitation email for students created by teachers
    if (userData.email && userData.teacherId && (userData.username || userData.name)) {
      try {
        const studentData = {
          name: userData.name || 'Student',
          email: userData.email,
          username: userData.username || userData.email.split('@')[0],
          slug: userData.slug,
          teacherId: userData.teacherId,
          role: 'student'
        };

        console.log('Sending invitation email for new student:', studentData);
      } catch (error) {
        console.error('Failed to send student invitation email:', error);
      }
    }

    console.log('✅ Student record creation queued for:', userData.email);
  }

  // Handle TEACHER creation
  else if (userData.role === 'teacher') {
    console.log('👨‍🏫 Creating Teacher record for user:', userData.id);

    additionalQueries.push({
      add: {
        teacher: {
          with: {
            userId: userData.id,
            bio: '',
            isVerified: userData.isVerified || false,
            isIndependent: userData.isIndependent !== false, // Default to true
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }
    });

    console.log('✅ Teacher record creation queued for:', userData.email);
  }

  // Handle SCHOOL_ADMIN creation
  else if (userData.role === 'school_admin') {
    console.log('🏫 Creating SchoolAdmin record for user:', userData.id);

    // For school admins, we need a schoolId
    if (userData.schoolId) {
      additionalQueries.push({
        add: {
          schoolAdmin: {
            with: {
              userId: userData.id,
              schoolId: userData.schoolId,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }
      });

      console.log('✅ SchoolAdmin record creation queued for:', userData.email);
    } else {
      console.warn('⚠️ School admin user created without schoolId:', userData.email);
      // For now, we'll skip creating the SchoolAdmin record if no schoolId
      // This could be handled by creating a default school or requiring schoolId
    }
  }

  console.log('🔥 afterAdd returning', additionalQueries.length, 'additional queries');
  return additionalQueries;
};

// Trigger to run after user update (synchronous)
export const afterSet = async (query: any, _multiple: any, _options: any) => {
  console.log('🔥 afterSet trigger called with query.to:', query.to);

  // Note: Student invitation emails are now handled directly in the API endpoint
  // This trigger is kept for any future user update logic

  return [];
};

// Trigger to run after user removal (synchronous)
export const afterRemove = (query: any, _multiple: any, _options: any) => {
  console.log('🗑️ afterRemove trigger called - user removed successfully');

  // Here you could add cleanup logic:
  // 1. Remove related records (assignments, grades, etc.)
  // 2. Send notification emails to teachers
  // 3. Archive user data instead of hard delete

  // For now, just log the removal
  return [];
};

// Asynchronous trigger to run after user update is committed to database
export const followingSet = async (query: any, _multiple: any, before: any, after: any, options: any) => {
  console.log('🔄 followingSet trigger called - user update committed to database');

  // Check if image was updated
  if ('image' in (query.to as any)) {
    console.log('🖼️ Image update committed to database');

    const updatedUser = Array.isArray(after) ? after[0] : after;
    if (updatedUser) {
      console.log('📊 Updated user image data in database:', {
        userId: updatedUser.id,
        imageKey: updatedUser.image?.key,
        imageSrc: updatedUser.image?.src,
        imageType: typeof updatedUser.image
      });
    }
  }

  // Note: Better Auth and Blade both read from the same database,
  // so Better Auth will automatically get the updated data on the next session read
};
