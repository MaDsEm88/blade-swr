import { blob, boolean, date, link, model, number, string } from 'ronin/schema';

// Core User model - cleaned up for RONIN
export const User = model({
  slug: 'user',
  pluralSlug: 'users',
  fields: {
    email: string({ required: true, unique: true }),
    emailVerified: boolean({ required: true, defaultValue: false }),
    image: blob(),
    name: string({ required: true }),
    username: string({ unique: true }),
    displayUsername: string(),
    slug: string({ required: true, unique: true }),
    role: string({ required: true, defaultValue: 'student' }),
    isActive: boolean({ required: true, defaultValue: true }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
    // Student-specific fields
    teacherId: string(),
    grade: string(),
    classId: string(),
    // Teacher-specific fields
    isIndependent: boolean({ defaultValue: true }),
    schoolId: string(),
    department: string(),
    subjects: string(), // JSON string of array
    isVerified: boolean({ defaultValue: false }),
    // School admin-specific fields
    schoolName: string(),
    schoolAddress: string(),
    schoolPlaceId: string(),
    schoolType: string(),
    schoolDistrict: string(),
    studentCount: number(),
    teacherCount: number(),
  },
});

// Better Auth required models
export const Session = model({
  slug: 'session',
  pluralSlug: 'sessions',
  fields: {
    expiresAt: date({ required: true }),
    ipAddress: string(),
    token: string({ required: true, unique: true }),
    userId: link({ required: true, target: 'user' }),
    userAgent: string(),
    activeOrganizationId: string(),
  },
});

export const Account = model({
  slug: 'account',
  pluralSlug: 'accounts',
  fields: {
    accessToken: string(),
    accessTokenExpiresAt: date(),
    accountId: string({ required: true }),
    idToken: string(),
    password: string(),
    providerId: string({ required: true }),
    refreshToken: string(),
    refreshTokenExpiresAt: date(),
    scope: string(),
    userId: link({ required: true, target: 'user' }),
  },
});

export const Verification = model({
  slug: 'verification',
  pluralSlug: 'verifications',
  fields: {
    expiresAt: date({ required: true }),
    identifier: string({ required: true }),
    value: string({ required: true }),
  },
});

export const Otp = model({
  slug: 'otp',
  pluralSlug: 'otps',
  fields: {
    identifier: string({ required: true }),
    value: string({ required: true }),
    expiresAt: date({ required: true }),
    type: string({ required: true }),
    attempts: number({ required: true, defaultValue: 0 }),
    createdAt: date({ required: true }),
  },
});

// Organization models
export const Organization = model({
  slug: 'organization',
  pluralSlug: 'organizations',
  fields: {
    name: string({ required: true }),
    slug: string({ required: true, unique: true }),
    logo: string(),
    metadata: string(),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

export const Member = model({
  slug: 'member',
  pluralSlug: 'members',
  fields: {
    userId: link({ required: true, target: 'user' }),
    organizationId: link({ required: true, target: 'organization' }),
    role: string({ required: true }),
    createdAt: date({ required: true }),
  },
});

export const Invitation = model({
  slug: 'invitation',
  pluralSlug: 'invitations',
  fields: {
    organizationId: link({ required: true, target: 'organization' }),
    email: string({ required: true }),
    role: string({ required: true }),
    status: string({ required: true, defaultValue: 'pending' }),
    expiresAt: date({ required: true }),
    inviterId: link({ required: true, target: 'user' }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

// School system models
export const School = model({
  slug: 'school',
  pluralSlug: 'schools',
  fields: {
    name: string({ required: true }),
    domain: string({ unique: true }),
    address: string(),
    phone: string(),
    placeId: string(),
    type: string(),
    district: string(),
    studentCount: number(),
    teacherCount: number(),
    isActive: boolean({ required: true, defaultValue: true }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

export const SchoolAdmin = model({
  slug: 'schoolAdmin',
  pluralSlug: 'schoolAdmins',
  fields: {
    userId: link({ required: true, target: 'user', unique: true }),
    schoolId: link({ required: true, target: 'school' }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

export const Teacher = model({
  slug: 'teacher',
  pluralSlug: 'teachers',
  fields: {
    userId: link({ required: true, target: 'user', unique: true }),
    bio: string(),
    isIndependent: boolean({ required: true, defaultValue: false }),
    isVerified: boolean({ required: true, defaultValue: false }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

export const Student = model({
  slug: 'student',
  pluralSlug: 'students',
  fields: {
    userId: link({ required: true, target: 'user', unique: true }),
    grade: string(),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

export const TeacherSchool = model({
  slug: 'teacherSchool',
  pluralSlug: 'teacherSchools',
  fields: {
    teacherId: link({ required: true, target: 'teacher' }),
    schoolId: link({ required: true, target: 'school' }),
    department: string(),
    status: string({ required: true, defaultValue: 'active' }),
    invitedBy: link({ target: 'user' }),
    invitedAt: date(),
    joinedAt: date(),
  },
});

export const Subject = model({
  slug: 'subject',
  pluralSlug: 'subjects',
  fields: {
    name: string({ required: true, unique: true }),
    code: string({ unique: true }),
    description: string(),
    isActive: boolean({ required: true, defaultValue: true }),
    createdAt: date({ required: true }),
  },
});

export const TeacherSubject = model({
  slug: 'teacherSubject',
  pluralSlug: 'teacherSubjects',
  fields: {
    teacherId: link({ required: true, target: 'teacher' }),
    subjectId: link({ required: true, target: 'subject' }),
    gradeLevel: string(),
    createdAt: date({ required: true }),
  },
});

export const Class = model({
  slug: 'class',
  pluralSlug: 'classes',
  fields: {
    name: string({ required: true }),
    description: string(),
    teacherId: link({ required: true, target: 'teacher' }),
    schoolId: link({ target: 'school' }),
    subjectId: link({ target: 'subject' }),
    gradeLevel: string(),
    maxCapacity: number(),
    currentEnrollment: number({ defaultValue: 0 }),
    isActive: boolean({ required: true, defaultValue: true }),
    startDate: date(),
    endDate: date(),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

export const StudentClass = model({
  slug: 'studentClass',
  pluralSlug: 'studentClasses',
  fields: {
    studentId: link({ required: true, target: 'student' }),
    classId: link({ required: true, target: 'class' }),
    enrolledAt: date({ required: true }),
    status: string({ required: true, defaultValue: 'active' }),
    finalGrade: string(),
    completedAt: date(),
  },
});

export const StudentTeacher = model({
  slug: 'studentTeacher',
  pluralSlug: 'studentTeachers',
  fields: {
    studentId: link({ required: true, target: 'student' }),
    teacherId: link({ required: true, target: 'teacher' }),
    assignedAt: date({ required: true }),
    status: string({ required: true, defaultValue: 'active' }),
  },
});

export const Waitlist = model({
  slug: 'waitlist',
  pluralSlug: 'waitlists',
  fields: {
    email: string({ required: true, unique: true }),
    name: string({ required: true }),
    userType: string({ required: true }),
    schoolName: string(),
    schoolAddress: string(),
    schoolPlaceId: string(),
    schoolType: string(),
    schoolDistrict: string(),
    estimatedStudentCount: number(),
    estimatedTeacherCount: number(),
    isApproved: boolean({ required: true, defaultValue: false }),
    approvedAt: date(),
    approvedBy: link({ target: 'user' }),
    createdAt: date({ required: true }),
  },
});

export const UserRole = model({
  slug: 'userRole',
  pluralSlug: 'userRoles',
  fields: {
    userId: link({ required: true, target: 'user', unique: true }),
    role: string({ required: true }),
    roleId: string({ required: true }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

// Grade Level Management - Flexible system for different educational contexts
export const GradeLevel = model({
  slug: 'gradeLevel',
  pluralSlug: 'gradeLevels',
  fields: {
    name: string({ required: true }), // e.g., "9th Grade", "Beginner", "Advanced Fitness"
    code: string(), // e.g., "9", "BEG", "ADV_FIT"
    description: string(), // e.g., "Freshman year", "Basic fitness training"
    category: string({ required: true }), // e.g., "academic", "vocational", "certification"
    educationType: string({ required: true }), // e.g., "traditional", "vocational", "professional"
    teacherId: link({ required: true, target: 'teacher' }), // Teacher who created this grade level
    schoolId: link({ target: 'school' }), // Optional school association
    sortOrder: number({ defaultValue: 0 }), // For ordering grades
    isActive: boolean({ required: true, defaultValue: true }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});

// Educational Context - Defines the type of education (school, vocational, etc.)
export const EducationalContext = model({
  slug: 'educationalContext',
  pluralSlug: 'educationalContexts',
  fields: {
    name: string({ required: true }), // e.g., "Traditional High School", "Fitness Certification", "Medical Training"
    type: string({ required: true }), // e.g., "academic", "vocational", "professional", "certification"
    description: string(),
    defaultGradeLevels: string(), // JSON array of default grade level names
    teacherId: link({ required: true, target: 'teacher' }), // Teacher who created this context
    isActive: boolean({ required: true, defaultValue: true }),
    createdAt: date({ required: true }),
    updatedAt: date({ required: true }),
  },
});