// components/teacher/TeacherHomePage.client.tsx
'use client';

import { useParams } from 'blade/hooks';
import { useAuth } from '../../hooks/useAuth';

const TeacherHomePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  
  // Verify the slug matches the current user
  if (user && user.slug !== slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You can only access your own profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6">
        <div className="text-center text-xl text-black mb-6">
         <h1>Welcome back, ${user?.name}</h1>
          <p className="font-manrope_1 text-md text-black/70 dark:text-white/70 leading-relaxed">
            Your teacher portal: /teacher/{user?.slug}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherHomePage;