'use client';
import type { ReactNode } from 'react';
import { EnhancedSidebar } from './enhanced-sidebar.client';
import { SidebarProvider } from '../../../../stores/sidebar-store.client';

interface LayoutWrapperProps {
  children: ReactNode;
  showUserNav?: boolean;
  showHeader?: boolean;
  className?: string;
}

/**
 * LayoutWrapper - Similar to TanStack Start's _root.tsx
 * 
 * This component wraps the entire application with the dual sidebar layout.
 * It provides the same functionality as the TanStack Start root component
 * but adapted for Blade framework.
 * 
 * Usage:
 * - Wrap your entire app or specific routes with this component
 * - Similar to how TanStack Start uses _root.tsx to wrap all routes
 * - Provides consistent dual sidebar layout across all pages
 */
export function LayoutWrapper({ 
  children, 
  showUserNav = true, 
  showHeader = true,
  className 
}: LayoutWrapperProps) {
  return (
    <SidebarProvider>
      <EnhancedSidebar 
        showUserNav={showUserNav}
        showHeader={showHeader}
        className={className}
      >
        {children}
      </EnhancedSidebar>
    </SidebarProvider>
  );
}

/**
 * Alternative export for direct use as a layout component
 * This can be used in Blade's routing system or as a wrapper component
 */
export default LayoutWrapper;