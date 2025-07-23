// components/auth/teacher/TeacherNavigation.client.tsx
'use client';

import { useAuth } from '../../../hooks/useAuth';
import LogoutButton from '../../LogoutButton.client';

const TeacherNavigation = () => {
  const { user } = useAuth();
  
  // This component assumes user is authenticated and is a teacher
  // because it's wrapped by TeacherAuthWrapper
  if (!user) return null;
  
  return (
    <header className="bg-green-600 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Teacher Portal</h1>
            <div className="hidden md:flex space-x-6">
              <a href={`/teacher/${user.slug}`} className="hover:text-green-200">
                Home
              </a>
              <a href="/teacher/classes" className="hover:text-green-200">
                My Classes
              </a>
              <a href="/teacher/students" className="hover:text-green-200">
                Students
              </a>
              <a href="/teacher/assignments" className="hover:text-green-200">
                Assignments
              </a>
              <a href="/teacher/grades" className="hover:text-green-200">
                Grade Book
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-green-100">Welcome, {user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default TeacherNavigation;