// Export school-specific dual sidebar components
export { AppSidebar } from './app-sidebar.client';
export { NavMain } from './nav-main.client';
export { NavProjects } from './nav-projects.client';
export { NavUser } from './nav-user.client';
export { TeamSwitcher } from './team-switcher.client';
export { LayoutWrapper } from './layout-wrapper.client';
export { EnhancedSidebar } from './enhanced-sidebar.client';

// Re-export shared components for convenience
export { RightSidebar } from '../../shared/dual-sidebar/right-sidebar';
export { UserNav } from '../../shared/dual-sidebar/user-nav.client';

// Export the main layout wrapper as default for easy importing
export { LayoutWrapper as default } from './layout-wrapper.client';

// Legacy Sidebar component for backward compatibility
import { EnhancedSidebar } from './enhanced-sidebar.client';
import React from 'react';

interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar = ({ children }: SidebarProps) => {
  return (
    <EnhancedSidebar>
      {children}
    </EnhancedSidebar>
  );
};
  