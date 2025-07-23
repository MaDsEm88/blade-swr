// components/teacher/TeacherStudentsPageWithData.client.tsx
'use client';

import { useMemo } from 'react';
import { useParams } from 'blade/hooks';
import { useAuth } from '../../hooks/useAuth';
import { TeacherAuthGuard } from '../auth/AuthGuard.client';
import StudentManagementTabsWithData from '../auth/teacher/students/student-management-tabs-with-data.client';

interface User {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: string;
  teacherId?: string;
  username?: string;
  classId?: string;
  grade?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface GradeLevel {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category: string;
  educationType: string;
  teacherId: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface ClassItem {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  schoolId?: string;
  subjectId?: string;
  gradeLevel?: string;
  maxCapacity?: number;
  currentEnrollment?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TeacherStudentsPageWithDataProps {
  allUsers: User[];
  allGradeLevels: GradeLevel[];
  allClasses: ClassItem[];
}

const TeacherStudentsPageWithData = ({ allUsers, allGradeLevels, allClasses }: TeacherStudentsPageWithDataProps) => {
  const { slug } = useParams();
  const { user } = useAuth();

  // Find the teacher by slug
  const teacher = useMemo(() =>
    allUsers.find(u => u.slug === slug && u.role === 'teacher'),
    [allUsers, slug]
  );

  // If teacher not found, return null - AuthGuard will handle instant redirect
  if (!teacher) {
    return null; // Blade's instant redirect will handle this
  }

  // Get ALL students for this teacher (both active and inactive)
  // Memoized to prevent unnecessary re-computation
  const { activeStudents, inactiveStudents } = useMemo(() => {
    const allStudentsForTeacher = allUsers.filter(u =>
      u.teacherId === teacher.id &&
      u.role === 'student'
    ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Separate active and inactive students
    const active = allStudentsForTeacher.filter(u => u.isActive !== false);
    const inactive = allStudentsForTeacher.filter(u => u.isActive === false);

    return {
      activeStudents: active,
      inactiveStudents: inactive
    };
  }, [allUsers, teacher.id]);

  // Filter grade levels for this teacher
  const teacherGradeLevels = useMemo(() => {
    return allGradeLevels.filter(grade => grade.teacherId === teacher.id && grade.isActive !== false);
  }, [allGradeLevels, teacher.id]);

  // Filter classes for this teacher
  const teacherClasses = useMemo(() => {
    return allClasses.filter(classItem => classItem.teacherId === teacher.id && classItem.isActive !== false);
  }, [allClasses, teacher.id]);

  return (
    <TeacherAuthGuard>
      <div className="p-2">
        
        {/* Use the student management tabs component with data */}
        <StudentManagementTabsWithData
          students={activeStudents}
          removedStudents={inactiveStudents}
          teacher={teacher}
          availableGradeLevels={teacherGradeLevels}
          teacherClasses={teacherClasses}
        />

      </div>
    </TeacherAuthGuard>
  );
};

export default TeacherStudentsPageWithData;
