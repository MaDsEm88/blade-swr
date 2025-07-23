'use client';

import React, { useState } from 'react';
import { useMutation } from 'blade/client/hooks';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '../../../ui/animate-ui/components/tabs';
import { School, GraduationCap, Settings, Plus } from 'lucide-react';
import GradeLevelManagementDialogTrigger from '../dialogs/grade-level-management-dialog-trigger.client';

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

interface ClassManagementTabsWithDataProps {
  classes: ClassItem[];
  gradeLevels: GradeLevel[];
  educationalContexts: EducationalContext[];
  teacher: Teacher;
}

export default function ClassManagementTabsWithData({
  classes: initialClasses,
  gradeLevels: initialGradeLevels,
  educationalContexts: initialEducationalContexts,
  teacher
}: ClassManagementTabsWithDataProps) {
  const [activeTab, setActiveTab] = useState<'classes' | 'grades' | 'contexts'>('classes');
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses || []);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>(initialGradeLevels || []);
  const [educationalContexts, setEducationalContexts] = useState<EducationalContext[]>(initialEducationalContexts || []);
  const { set } = useMutation();

  // Listen for class/grade creation and update events
  React.useEffect(() => {
    const handleClassCreated = (event: CustomEvent) => {
      const newClass = event.detail.class;
      if (newClass && teacher) {
        setClasses(prev => [...prev, newClass].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        ));
      }
    };

    const handleGradeLevelCreated = (event: CustomEvent) => {
      const newGradeLevel = event.detail.gradeLevel;
      if (newGradeLevel && teacher) {
        setGradeLevels(prev => [...prev, newGradeLevel].sort((a, b) =>
          (a.sortOrder || 0) - (b.sortOrder || 0)
        ));
      }
    };

    const handleEducationalContextCreated = (event: CustomEvent) => {
      const newContext = event.detail.context;
      if (newContext && teacher) {
        setEducationalContexts(prev => [...prev, newContext].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        ));
      }
    };

    window.addEventListener('classCreated', handleClassCreated as EventListener);
    window.addEventListener('gradeLevelCreated', handleGradeLevelCreated as EventListener);
    window.addEventListener('educationalContextCreated', handleEducationalContextCreated as EventListener);

    return () => {
      window.removeEventListener('classCreated', handleClassCreated as EventListener);
      window.removeEventListener('gradeLevelCreated', handleGradeLevelCreated as EventListener);
      window.removeEventListener('educationalContextCreated', handleEducationalContextCreated as EventListener);
    };
  }, [teacher]);

  return (
    <div>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'classes' | 'grades' | 'contexts')}
        className="w-full bg-muted rounded-lg"
      >
        <TabsList
          className="grid w-full grid-cols-3 p-2 mb-6"
          activeClassName="rounded-full border border-black/10 dark:border-white/10 shadow-sm shadow-black/10 dark:shadow-white/10 bg-gradient-to-r from-[#e1dfdf] via-[#d8d7d7] to-[#dad8d8] dark:from-[#242427] dark:via-[#232325] dark:to-[#202023]"
        >
          <TabsTrigger
            value="classes"
            className="flex h-9 rounded-full items-center justify-center px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
          >
            <School className="w-4 h-4 mr-2" />
            Classes ({classes.length})
          </TabsTrigger>
          <TabsTrigger
            value="grades"
            className="flex h-9 rounded-full items-center justify-center px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Grade Levels ({gradeLevels.length})
          </TabsTrigger>
          <TabsTrigger
            value="contexts"
            className="flex h-9 rounded-full items-center justify-center px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
          >
            <Settings className="w-4 h-4 mr-2" />
            Educational Contexts ({educationalContexts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContents className="rounded-sm h-full bg-background">
          <TabsContent value="classes" className="flex-1 overflow-y-auto h-full">
            <ClassesTab
              classes={classes}
              gradeLevels={gradeLevels}
              teacher={teacher}
            />
          </TabsContent>
          
          <TabsContent value="grades" className="flex-1 overflow-y-auto h-full">
            <GradeLevelsTab
              gradeLevels={gradeLevels}
              teacher={teacher}
            />
          </TabsContent>
          
          <TabsContent value="contexts" className="flex-1 overflow-y-auto h-full">
            <EducationalContextsTab
              educationalContexts={educationalContexts}
              teacher={teacher}
            />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}

// Placeholder components - will be implemented next
function ClassesTab({ classes, gradeLevels, teacher }: { classes: ClassItem[], gradeLevels: GradeLevel[], teacher: Teacher }) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Classes</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your classes and assign students to different grade levels.
        </p>
        <div className="text-center py-8">
          <School className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Classes management coming soon...</p>
        </div>
      </div>
    </div>
  );
}

function GradeLevelsTab({ gradeLevels, teacher }: { gradeLevels: GradeLevel[], teacher: Teacher }) {
  if (gradeLevels.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-4">No Grade Levels Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create grade levels that match your educational context. Whether you're teaching traditional school grades,
            vocational levels, or certification programs, you can customize the grading system to fit your needs.
          </p>
          <GradeLevelManagementDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Your Grade Levels</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage grade levels for your students
            </p>
          </div>
          <GradeLevelManagementDialogTrigger variant="button" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {gradeLevels
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((gradeLevel) => (
                <tr key={gradeLevel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {gradeLevel.name}
                    </div>
                    {gradeLevel.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {gradeLevel.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {gradeLevel.code || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {gradeLevel.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {gradeLevel.educationType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {gradeLevel.sortOrder || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EducationalContextsTab({ educationalContexts, teacher }: { educationalContexts: EducationalContext[], teacher: Teacher }) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Educational Contexts</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Define educational contexts like traditional school, vocational training, or certification programs.
        </p>
        <div className="text-center py-8">
          <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Educational contexts management coming soon...</p>
        </div>
      </div>
    </div>
  );
}
