// pages/teacher/[slug]/classes.tsx
import { use, useBatch } from 'blade/server/hooks';
import TeacherClassesPageWithData from '../../../components/teacher/TeacherClassesPageWithData.client';

const TeachersClassesPage = () => {
  // Use useBatch to run multiple queries efficiently in a single transaction
  const [allClasses, allGradeLevels, allEducationalContexts] = useBatch(() => {
    // Try to fetch data, but handle the case where models don't exist yet
    let classes: any[] = [];
    let gradeLevels: any[] = [];
    let educationalContexts: any[] = [];

    try {
      classes = use.classes() || [];
    } catch (error) {
      // Model not yet migrated, silently use empty array
      classes = [];
    }

    try {
      gradeLevels = use.gradeLevels() || [];
    } catch (error) {
      // Model not yet migrated, silently use empty array
      gradeLevels = [];
    }

    try {
      educationalContexts = use.educationalContexts() || [];
    } catch (error) {
      // Model not yet migrated, silently use empty array
      educationalContexts = [];
    }

    return [classes, gradeLevels, educationalContexts];
  });

  return (
    <TeacherClassesPageWithData
      allClasses={allClasses}
      allGradeLevels={allGradeLevels}
      allEducationalContexts={allEducationalContexts}
    />
  );
};

export default TeachersClassesPage;
