'use client';

import React, { useState } from 'react';
import { useMutation } from 'blade/client/hooks';
import { StudentManagementDialogTrigger } from '../dialogs';
import StudentEditForm from './student-edit-form.client';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '../../../ui/animate-ui/components/tabs';
import { Users, UserPlus, UserX } from 'lucide-react';

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

interface Teacher {
  id: string;
  name: string;
  email: string;
  slug: string;
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

interface StudentManagementTabsWithDataProps {
  students: Student[];
  removedStudents?: Student[];
  teacher: Teacher;
  availableGradeLevels?: GradeLevel[];
  teacherClasses?: ClassItem[];
}

export default function StudentManagementTabsWithData({
  students: initialStudents,
  removedStudents: initialRemovedStudents = [],
  teacher,
  availableGradeLevels = [],
  teacherClasses = []
}: StudentManagementTabsWithDataProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'add' | 'removed'>('current');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [removedStudents, setRemovedStudents] = useState<Student[]>(initialRemovedStudents);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const { set } = useMutation();

  // Update students when server data changes, but respect pending operations
  React.useEffect(() => {
    // Don't update if we have pending operations for these students
    const filteredActiveStudents = initialStudents.filter(student =>
      !pendingOperations.has(student.id)
    );

    // Only update if there are actual changes
    const currentIds = new Set(students.map(s => s.id));
    const newIds = new Set(filteredActiveStudents.map(s => s.id));
    const hasChanges = currentIds.size !== newIds.size ||
      [...currentIds].some(id => !newIds.has(id)) ||
      [...newIds].some(id => !currentIds.has(id));

    if (hasChanges) {
      setStudents(filteredActiveStudents);
    }
  }, [initialStudents, pendingOperations]); // Removed 'students' dependency to prevent infinite loop

  // Update removed students when server data changes, but respect pending operations
  React.useEffect(() => {
    // Don't update if we have pending operations for these students
    const filteredRemovedStudents = initialRemovedStudents.filter(student =>
      !pendingOperations.has(student.id)
    );

    // Only update if there are actual changes
    const currentRemovedIds = new Set(removedStudents.map(s => s.id));
    const newRemovedIds = new Set(filteredRemovedStudents.map(s => s.id));
    const hasChanges = currentRemovedIds.size !== newRemovedIds.size ||
      [...currentRemovedIds].some(id => !newRemovedIds.has(id)) ||
      [...newRemovedIds].some(id => !currentRemovedIds.has(id));

    if (hasChanges) {
      setRemovedStudents(filteredRemovedStudents);
    }
  }, [initialRemovedStudents, pendingOperations]); // Removed 'removedStudents' dependency to prevent infinite loop

  // Listen for student creation and update events
  React.useEffect(() => {
    const handleStudentCreated = (event: CustomEvent) => {
      // Add the new student to the local state immediately for instant UI update
      const newStudent = event.detail.student;
      if (newStudent && teacher) {
        const studentData: Student = {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          username: newStudent.username,
          grade: newStudent.grade,
          isActive: true,
          teacherId: teacher.id,
          createdAt: new Date().toISOString()
        };

        setStudents(prev => [...prev, studentData].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        ));
      }
    };

    const handleStudentUpdated = (event: CustomEvent) => {
      // Update the student in the local state immediately for instant UI update
      const updatedStudent = event.detail.student;
      if (updatedStudent) {
        setStudents(prev => prev.map(student =>
          student.id === updatedStudent.id
            ? { ...student, ...updatedStudent }
            : student
        ));
      }
    };

    // Listen for custom events from the student creation dialog and edit form
    window.addEventListener('studentCreated', handleStudentCreated as EventListener);
    window.addEventListener('studentUpdated', handleStudentUpdated as EventListener);

    return () => {
      window.removeEventListener('studentCreated', handleStudentCreated as EventListener);
      window.removeEventListener('studentUpdated', handleStudentUpdated as EventListener);
    };
  }, [teacher]);

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to remove this student from your class?')) {
      try {
        // Mark as pending operation to prevent server data from overriding
        setPendingOperations(prev => new Set([...prev, studentId]));

        // Update the local state immediately for instant UI feedback
        setStudents(prev => prev.filter(s => s.id !== studentId));

        // Move the student to removed list immediately
        const studentToRemove = students.find(s => s.id === studentId);
        if (studentToRemove) {
          setRemovedStudents(prev => [...prev, { ...studentToRemove, isActive: false }]);
        }

        // Instead of nullifying teacherId, we'll mark them as inactive
        // but keep the teacher association so we can still find them
        await set.users({
          with: { id: studentId },
          to: {
            isActive: false
            // Keep teacherId intact so we can still find removed students
          }
        });

        // Clear pending operation after successful database update
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(studentId);
          return newSet;
        });

        console.log('Student removed from class successfully:', studentId);
      } catch (error) {
        console.error('Error removing student:', error);

        // Clear pending operation and revert changes
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(studentId);
          return newSet;
        });

        // Revert the UI changes
        setStudents(initialStudents);
        setRemovedStudents(initialRemovedStudents);
        alert('Failed to remove student. Please try again.');
      }
    }
  };

  const handleRestoreStudent = async (studentId: string) => {
    try {
      // Mark as pending operation to prevent server data from overriding
      setPendingOperations(prev => new Set([...prev, studentId]));

      // Move student back to active list immediately
      const studentToRestore = removedStudents.find(s => s.id === studentId);
      if (studentToRestore) {
        setStudents(prev => [...prev, { ...studentToRestore, isActive: true }]);
        setRemovedStudents(prev => prev.filter(s => s.id !== studentId));
      }

      // Re-activate the student and restore the teacher association
      console.log('[MUTATION] Restoring student:', studentId);
      await set.users({
        with: { id: studentId },
        to: {
          isActive: true,
          teacherId: teacher.id // Restore the association with this teacher
        }
      });

      // Clear pending operation after successful database update
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });

      console.log('Student restored to class successfully:', studentId);
    } catch (error) {
      console.error('Error restoring student:', error);

      // Clear pending operation and revert changes
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });

      // Revert the UI changes
      setStudents(initialStudents);
      setRemovedStudents(initialRemovedStudents);
      alert('Failed to restore student. Please try again.');
    }
  };

  const handleToggleStudentStatus = async (student: Student) => {
    try {
      await set.users({
        with: { id: student.id },
        to: { isActive: !student.isActive }
      });
      // Update the local state to reflect the change immediately
      setStudents(prev => prev.map(s => 
        s.id === student.id ? { ...s, isActive: !s.isActive } : s
      ));
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Failed to update student status. Please try again.');
    }
  };

  return (
    <div>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'current' | 'add' | 'removed')}
        className="w-full bg-muted rounded-lg"
      >
        <TabsList
          className="grid w-full grid-cols-3 p-2 mb-6"
          activeClassName="rounded-full border border-black/10 dark:border-white/10 shadow-sm shadow-black/10 dark:shadow-white/10 bg-gradient-to-r from-[#e1dfdf] via-[#d8d7d7] to-[#dad8d8] dark:from-[#242427] dark:via-[#232325] dark:to-[#202023]"
        >
          <TabsTrigger
            value="current"
            className="flex h-9 rounded-full items-center justify-center px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
          >
            <Users className="w-4 h-4 mr-2" />
            Current Students ({students.length})
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="flex h-9 rounded-full items-center justify-center px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Student
          </TabsTrigger>
          <TabsTrigger
            value="removed"
            className="flex h-9 rounded-full items-center justify-center px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
          >
            <UserX className="w-4 h-4 mr-2" />
            Removed Students ({removedStudents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContents className="rounded-sm h-full bg-background">
          <TabsContent value="current" className="flex-1 overflow-y-auto h-full">
            <CurrentStudentsTab
              students={students}
              onEditStudent={handleEditStudent}
              onRemoveStudent={handleRemoveStudent}
              onToggleStatus={handleToggleStudentStatus}
              teacherClasses={teacherClasses}
            />
          </TabsContent>

          <TabsContent value="add" className="flex-1 overflow-y-auto h-full">
            <AddStudentTab teacherClasses={teacherClasses} />
          </TabsContent>

          <TabsContent value="removed" className="flex-1 overflow-y-auto h-full">
            <RemovedStudentsTab
              removedStudents={removedStudents}
              onRestoreStudent={handleRestoreStudent}
            />
          </TabsContent>
        </TabsContents>
      </Tabs>

      {/* Student Edit Modal */}
      {selectedStudent && (
        <StudentEditForm
          student={selectedStudent}
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          availableGradeLevels={availableGradeLevels}
        />
      )}
    </div>
  );
}

// Current Students Tab Component
function CurrentStudentsTab({
  students,
  onEditStudent,
  onRemoveStudent,
  onToggleStatus,
  teacherClasses = []
}: {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onRemoveStudent: (studentId: string) => void;
  onToggleStatus: (student: Student) => void;
  teacherClasses?: ClassItem[];
}) {
  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">No Students Yet</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You haven't added any students yet. Use the sidebar dialog or the "Add New Student" tab to get started.
        </p>
        <StudentManagementDialogTrigger
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          teacherClasses={teacherClasses}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Your Students</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage your current students and their class assignments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {student.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {student.username || 'Not set'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {student.grade || 'Not assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleStatus(student)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                        student.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                      }`}
                    >
                      {student.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => onEditStudent(student)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onRemoveStudent(student.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
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

// Add Student Tab Component
function AddStudentTab({ teacherClasses = [] }: { teacherClasses?: ClassItem[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use the dialog in the sidebar to add new students, or use the options below for bulk operations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-2">Quick Add</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Use the + button in the sidebar for quick student addition
            </p>
            <StudentManagementDialogTrigger
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
              teacherClasses={teacherClasses}
            />
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium mb-2">Bulk Import</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Import multiple students from a CSV file (Coming Soon)
            </p>
            <button
              disabled
              className="text-gray-400 text-sm font-medium cursor-not-allowed"
            >
              Import from CSV → (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Removed Students Tab Component
function RemovedStudentsTab({
  removedStudents,
  onRestoreStudent
}: {
  removedStudents: Student[];
  onRestoreStudent: (studentId: string) => void;
}) {
  if (removedStudents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">No Removed Students</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Students you remove from your class will appear here. You can restore them at any time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Removed Students</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Students removed from your class. Click "Restore" to add them back.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {removedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 opacity-60">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white line-through">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-through">
                      {student.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-through">
                      {student.username || 'Not set'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-through">
                      {student.grade || 'Not assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onRestoreStudent(student.id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Restore
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
