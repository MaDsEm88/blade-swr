// pages/teacher/[slug]/students.tsx
import { use, useBatch } from 'blade/server/hooks';
import TeacherStudentsPageWithData from '../../../components/teacher/TeacherStudentsPageWithData.client';

const TeachersStudentsPage = () => {
  // Use useBatch to run multiple queries efficiently in a single transaction
  const [allUsers, allGradeLevels, allClasses] = useBatch(() => {
    // Fetch all users from the database
    const users = use.users();

    // Try to fetch grade levels, but handle the case where the model doesn't exist yet
    let gradeLevels: any[] = [];
    try {
      gradeLevels = use.gradeLevels() || [];
    } catch (error) {
      // Model not yet migrated, silently use empty array
      gradeLevels = [];
    }

    // Try to fetch classes, but handle the case where the model doesn't exist yet
    let classes: any[] = [];
    try {
      classes = use.classes() || [];
    } catch (error) {
      // Model not yet migrated, silently use empty array
      classes = [];
    }

    return [users || [], gradeLevels, classes];
  });

  return (
    <TeacherStudentsPageWithData
      allUsers={allUsers}
      allGradeLevels={allGradeLevels}
      allClasses={allClasses}
    />
  );
};

// Export as default for Blade framework
export default TeachersStudentsPage;
