'use client';

import { useState } from 'react';
import { useMutation } from 'blade/client/hooks';
import { Dialog } from '@base-ui-components/react/dialog';
import { User, X, School } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '../../../ui/animate-ui/components/tabs';
import { Switch } from '../../../animate-ui/base/switch';

interface Student {
  id: string;
  name: string;
  email: string;
  username?: string;
  classId?: string;
  grade?: string;
  isActive?: boolean;
  teacherId?: string;
  createdAt?: string;
}

interface ClassItem {
  id: string;
  name: string;
  studentCount: number;
  maxCapacity: number;
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

interface StudentEditFormProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  availableGradeLevels?: GradeLevel[];
}

type EditTab = 'info' | 'classes';

export default function StudentEditForm({ student, isOpen, onClose, availableGradeLevels = [] }: StudentEditFormProps) {
  const [activeTab, setActiveTab] = useState<EditTab>('info');
  const [formData, setFormData] = useState({
    name: student.name || '',
    email: student.email || '',
    username: student.username || '',
    grade: student.grade || '',
    isActive: student.isActive ?? true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generateUsername, setGenerateUsername] = useState(false);
  const { set } = useMutation();

  // Mock classes data - in real implementation, this would come from the teacher's classes
  const teacherClasses: ClassItem[] = [
    { id: '1', name: 'Math 101', studentCount: 25, maxCapacity: 30 },
    { id: '2', name: 'Physics Advanced', studentCount: 18, maxCapacity: 25 },
    { id: '3', name: 'Chemistry Basics', studentCount: 22, maxCapacity: 28 },
  ];

  // Student class assignments (mock data - would come from database)
  const [studentClassAssignments, setStudentClassAssignments] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await set.users({
        with: { id: student.id },
        to: {
          name: formData.name,
          email: formData.email,
          username: formData.username || null,
          grade: formData.grade || null,
          isActive: formData.isActive
        }
      });

      // Dispatch custom event to notify other components of the update
      const updatedStudent = {
        ...student,
        name: formData.name,
        email: formData.email,
        username: formData.username || null,
        grade: formData.grade || null,
        isActive: formData.isActive
      };

      window.dispatchEvent(new CustomEvent('studentUpdated', {
        detail: { student: updatedStudent }
      }));

      onClose();
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleStudentInClass = (classId: string) => {
    setStudentClassAssignments(prev => {
      const isInClass = prev.includes(classId);
      return isInClass
        ? prev.filter(id => id !== classId)
        : [...prev, classId];
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 opacity-100 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 z-[100000]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-[96vw] md:max-w-[500px] max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-[#f2f2f2] via-[#e8e8e8] to-[#eeeeee] dark:from-[#101012] dark:via-[#18181a] dark:to-[#171719] text-gray-900 dark:text-gray-100 outline-1 outline-black/10 dark:outline-white/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 z-[100001] max-h-[90vh] overflow-hidden">

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as EditTab)}
            className="w-full md:w-[500px] bg-muted rounded-lg"
          >
            <div className="pb-12">
              <TabsList
                className="grid w-full grid-cols-2 p-2 md:p-6"
                activeClassName="rounded-full border border-black/10 dark:border-white/10 shadow-sm shadow-black/10 dark:shadow-white/10 bg-gradient-to-r from-[#e1dfdf] via-[#d8d7d7] to-[#dad8d8] dark:from-[#242427] dark:via-[#232325] dark:to-[#202023]"
              >
                <TabsTrigger
                  value="info"
                  className="flex h-9 rounded-full items-center justify-center px-2 md:px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
                >
                  <User className="w-4 h-4 mr-2" />
                  Student Info
                </TabsTrigger>
                <TabsTrigger
                  value="classes"
                  className="flex h-9 rounded-full items-center justify-center px-2 md:px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
                >
                  <School className="w-4 h-4 mr-2" />
                  Class Assignments
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContents className="mx-1 mb-1 -mt-2 rounded-sm h-full bg-background">
              {/* Student Info Tab Panel */}
              <TabsContent value="info" className="flex-1 px-6 pb-6 overflow-y-auto h-full">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">
                      Edit Student Information
                    </h3>
                  </div>

                  <form id="student-edit-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="edit-student-name" className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Student Name
                      </label>
                      <input
                        id="edit-student-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        placeholder="Enter student's full name"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-student-email" className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Email Address
                      </label>
                      <input
                        id="edit-student-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        placeholder="student@example.com"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">
                          Generate Username
                        </label>
                        <Switch
                          checked={generateUsername}
                          onCheckedChange={setGenerateUsername}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                      <p className="text-[10px] font-manrope_1 text-black/60 dark:text-white/60">
                        {generateUsername
                          ? "Username will be generated automatically from the student's name"
                          : "Student will use their email address to log in"
                        }
                      </p>
                    </div>

                    {!generateUsername && (
                      <div>
                        <label htmlFor="edit-student-username" className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                          Username (for login)
                        </label>
                        <input
                          id="edit-student-username"
                          type="text"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                          placeholder="student_username"
                          disabled={isLoading}
                        />
                        <p className="text-[10px] font-manrope_1 text-black/60 dark:text-white/60 mt-1">
                          Students use their username to log in (no password required)
                        </p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="edit-student-grade" className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Grade Level
                      </label>
                      <select
                        id="edit-student-grade"
                        value={formData.grade}
                        onChange={(e) => handleInputChange('grade', e.target.value)}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      >
                        <option value="">Select grade level</option>
                        {availableGradeLevels.length > 0 ? (
                          availableGradeLevels
                            .filter(grade => grade.isActive !== false)
                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                            .map((grade) => (
                              <option key={grade.id} value={grade.code || grade.name}>
                                {grade.name}
                                {grade.description && ` - ${grade.description}`}
                              </option>
                            ))
                        ) : (
                          <>
                            <option value="9">9th Grade</option>
                            <option value="10">10th Grade</option>
                            <option value="11">11th Grade</option>
                            <option value="12">12th Grade</option>
                          </>
                        )}
                      </select>
                      {availableGradeLevels.length === 0 && (
                        <p className="text-[10px] font-manrope_1 text-black/60 dark:text-white/60 mt-1">
                          Using default grade levels. Create custom grade levels in the Classes page.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        id="edit-student-active"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isLoading}
                      />
                      <label htmlFor="edit-student-active" className="block text-xs font-manrope_1 text-black/80 dark:text-white/80">
                        Student is active
                      </label>
                    </div>
                  </form>
                </div>
              </TabsContent>

              {/* Classes Tab Panel */}
              <TabsContent value="classes" className="flex-1 px-6 pb-6 overflow-y-auto h-full">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">
                      Class Assignments for {student.name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-manrope_1 font-medium text-gray-700 dark:text-gray-300">
                      Select classes for this student:
                    </h4>
                    {teacherClasses.map((classItem) => {
                      const isInClass = studentClassAssignments.includes(classItem.id);
                      return (
                        <div
                          key={classItem.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isInClass}
                              onChange={() => toggleStudentInClass(classItem.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {classItem.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {classItem.studentCount}/{classItem.maxCapacity} students
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </TabsContents>

            {/* Footer with Update Button */}
            <div className="px-6 py-4 border-t border-black/10 dark:border-white/10">
              <div className="flex justify-end gap-4">
                <Dialog.Close
                  className="flex h-10 items-center justify-center rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3.5 text-base font-medium text-gray-900 dark:text-gray-100 select-none hover:bg-gray-100 dark:hover:bg-gray-600 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 dark:active:bg-gray-600"
                  disabled={isLoading}
                >
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  form="student-edit-form"
                  disabled={isLoading}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-md px-3.5 text-base font-medium text-white select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800",
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-700"
                  )}
                >
                  {isLoading ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </div>
          </Tabs>

          {/* Close button in top right */}
          <Dialog.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
