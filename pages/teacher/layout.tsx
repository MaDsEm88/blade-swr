// pages/teacher/layout.tsx (Server Component - NO hooks allowed)
import { LayoutWrapper } from '../../components/auth/teacher/dual-sidebar';

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutWrapper
      showUserNav={true}
      showHeader={true}
    >
      {children}
    </LayoutWrapper>
  );
};

export default TeacherLayout;