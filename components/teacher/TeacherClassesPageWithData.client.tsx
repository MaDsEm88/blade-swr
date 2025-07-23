// components/teacher/TeacherClassesPageWithData.client.tsx
'use client';

import { useMemo } from 'react';
import { useParams } from 'blade/hooks';
import { useAuth } from '../../hooks/useAuth';
import { TeacherAuthGuard } from '../auth/AuthGuard.client';
import ClassManagementTabsWithData from '../auth/teacher/classes/class-management-tabs-with-data.client';

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

interface GradeLevel {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category: string;
  educationType: string;
  teacherId: string;
  schoolId?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface EducationalContext {
  id: string;
  name: string;
  type: string;
  description?: string;
  defaultGradeLevels?: string;
  teacherId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  slug: string;
}

interface TeacherClassesPageWithDataProps {
  allClasses: ClassItem[];
  allGradeLevels: GradeLevel[];
  allEducationalContexts: EducationalContext[];
}

const TeacherClassesPageWithData = ({
  allClasses,
  allGradeLevels,
  allEducationalContexts
}: TeacherClassesPageWithDataProps) => {
  const { slug } = useParams();
  const { user } = useAuth();

  // Filter data for the current teacher
  const teacherClasses = useMemo(() => {
    return allClasses.filter(classItem => classItem.teacherId === user.id);
  }, [allClasses, user.id]);

  const teacherGradeLevels = useMemo(() => {
    return allGradeLevels.filter(grade => grade.teacherId === user.id);
  }, [allGradeLevels, user.id]);

  const teacherEducationalContexts = useMemo(() => {
    return allEducationalContexts.filter(context => context.teacherId === user.id);
  }, [allEducationalContexts, user.id]);

  const teacher: Teacher = {
    id: user.id,
    name: user.name,
    email: user.email,
    slug: user.slug
  };

  return (
    <TeacherAuthGuard>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
         
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your classes, grade levels, and educational contexts. Create flexible grading systems
            that work for traditional schools, vocational training, or professional certification programs.
          </p>
        </div>

        {/* Class Management Component */}
        <ClassManagementTabsWithData
          classes={teacherClasses}
          gradeLevels={teacherGradeLevels}
          educationalContexts={teacherEducationalContexts}
          teacher={teacher}
        />
      </div>
    </TeacherAuthGuard>
  );
};

export default TeacherClassesPageWithData;
