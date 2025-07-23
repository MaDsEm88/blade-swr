'use client';
import { ComponentProps, useCallback, useMemo, useEffect, useState, useRef, memo } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { cn } from "../../../../lib/utils";
import { useIsMobile } from "../../../../hooks/use-mobile";
import { useSharedRightFlyoutState, useSharedSidebarState } from "../../../../stores/sidebar-store.client";
import { useRedirect, useLocation } from 'blade/hooks';
import { useSimpleSession } from '../../../../lib/auth-client';
import { Link } from 'blade/client/components';
import { ProfileManagement } from '../flyout-content';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "../../../ui/sidebar.client";
import { Sheet, SheetContent, SheetTitle } from "../../../ui/sheet.client";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Sparkles,
  HelpCircle,
  Settings,
  User,
  CreditCard,
  Link2,
  Play,
  Square,
  LogOut
} from "lucide-react";

// FIXED: Add proper interface for sidebar state
interface SidebarState {
  isRightSidebarOpen: boolean;
  rightSidebarContent: string | null;
  closeRightSidebar: () => void;
  [key: string]: any;
}

interface RightSidebarProps extends ComponentProps<"div"> {
  sidebarState?: SidebarState;
  showFlyoutControl?: boolean;
  className?: string;
  side?: "left" | "right";
  content?: string | null;
}



// Terms/Privacy with Logout Button Overlay
const TermsPrivacyWithLogout = memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const transition = { type: 'spring' as const, stiffness: 400, damping: 30 };

  // Auth hooks
  const { signOut, session } = useSimpleSession();
  const redirect = useRedirect();
  const location = useLocation();

  // Sidebar state for clearing on logout
  const sidebarState = useSharedSidebarState();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);
  const handleCancel = () => setIsExpanded(false);
  const handleInitialClick = () => setIsExpanded(true);

  const handleLogout = async () => {
    console.log('Logout button clicked - starting sign out process');

    // Determine the user's role for redirect
    const userRole = session?.user?.role;
    const loginUrl = userRole ? `/login?role=${userRole}` : '/login';

    console.log('User role for logout redirect:', userRole, '-> URL:', loginUrl);

    // Set signing out state to trigger prefetching
    setIsSigningOut(true);

    // Clear all sidebar and flyout states before signing out
    if (sidebarState.clearAllSidebarStates) {
      sidebarState.clearAllSidebarStates();
    }

    // Sign out with prefetching - shorter delay since login page is prefetched
    await signOut();

    // Small delay to let prefetching work, then redirect to role-specific login
    setTimeout(() => {
      redirect(loginUrl);
    }, 100);

    console.log('Sign out complete with prefetched redirect to:', loginUrl);
  };

  // Prefetch role-specific login page when signing out
  const userRole = session?.user?.role;
  const loginUrl = userRole ? `/login?role=${userRole}` : '/login';

  const PrefetchLoginLink = isSigningOut ? (
    <Link href={loginUrl} prefetch={true} className="hidden">
      <a>Prefetch login</a>
    </Link>
  ) : null;

  return (
    <div className="relative h-8 w-full group select-none">
      {PrefetchLoginLink}
      {/* Base Layer - Terms and Privacy (always visible) */}
      <div className="flex items-center justify-between w-full">
        {/* Terms and Privacy */}
        <div className="flex gap-6 text-xs text-black/60 dark:text-white/60 items-center">
          <span className="hover:text-black/80 dark:hover:text-white/80 transition-colors duration-100 cursor-pointer">Terms</span>
          <span className="h-4 w-px bg-black/30 dark:bg-white/30" />
          <span className="hover:text-black/80 dark:hover:text-white/80 transition-colors duration-100 cursor-pointer">Privacy</span>
        </div>

        {/* Logout X Button */}
        <div
          ref={buttonRef}
          className="flex-shrink-0 relative"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={handleInitialClick}
            className={cn(
              'group cursor-pointer relative flex items-center justify-center overflow-hidden rounded-lg border border-red-500/20 bg-gradient-to-r from-red-900/60 dark:from-red-900/20 to-red-950/60 dark:to-red-950/20 px-2 py-1 text-xs font-light text-red-500 dark:text-red-300 shadow-sm transition-all duration-300 hover:border-red-500/30 hover:text-red-800 dark:hover:text-red-200 focus:outline-none'
            )}
          >
            <X className="h-3 w-3" />
          </button>

          {/* Animated border effect - only for X button */}
          <div
            className="pointer-events-none absolute inset-0 rounded-lg border-2 border-red-500/50 dark:border-red-400/50 transition-opacity duration-500"
            style={{
              opacity,
              WebkitMaskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
              maskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Overlay Layer - Logout Confirmation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={transition}
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 dark:bg-white/5 rounded-lg"
          >
            {/* Logout Confirmation Content */}
            <div className="flex items-center w-full justify-between  overflow-hidden rounded-lg border border-red-500/20 bg-gradient-to-r from-red-900/20 to-red-950/20 px-3 py-1 shadow-lg backdrop-blur-sm whitespace-nowrap">
              {/* Sign out text */}
              <div className="text-xs text-red-300 font-medium whitespace-nowrap">
                Sign out?
              </div>

              {/* Yes button */}
              <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className={cn(
                  'cursor-pointer relative flex items-center justify-center overflow-hidden rounded border border-red-500/30 bg-gradient-to-r from-red-800/30 to-red-900/30 px-2 py-0.5 text-xs font-light text-red-200 transition-all duration-200 hover:border-red-500/50 hover:text-red-100 focus:outline-none'
                )}
              >
                <div className="flex items-center">
                  <LogOut className="mr-1 h-2.5 w-2.5" />
                  <span>Yes</span>
                </div>
              </button>

              {/* No button */}
              <button
                onClick={handleCancel}
                className={cn(
                  'cursor-pointer relative flex items-center justify-center overflow-hidden rounded border border-gray-500/30 bg-gradient-to-r from-gray-800/30 to-gray-900/30 px-2 py-0.5 text-xs font-light text-gray-200 transition-all duration-200 hover:border-gray-500/50 hover:text-gray-100 focus:outline-none'
                )}
              >
                No
              </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
});

// Helper function to get the title based on content
function getSidebarTitle(content: string): string {
  switch (content) {
    case 'login': return 'Sign In';
    case 'user-info': return 'User Information';
    case 'settings': return 'Settings';
    case 'help': return 'Help';
    case 'attachments': return 'Attachments';
    case 'notifications': return 'Notifications';
    default: return 'Panel';
  }
}

// Sample content components with flyout integration
interface ContentProps {
  toggleFlyout: (content: string) => void;
}

// Content components receive toggleFlyout from RightSidebar so they share the same state instance
const UserInfoContent = ({ toggleFlyout }: ContentProps) => {
  const handleFlyoutOpen = useCallback((content: string) => {
    console.log('🎯 UserInfoContent opening flyout:', content);
    toggleFlyout(content);
  }, [toggleFlyout]);
  
  return (
    <div className="p-2 ">
      <div className="text-black dark:text-white">
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#f8f8f8] via-[#f8f8f8] to-[#f0f0f0] shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(229_229_229)_inset,0_0.5px_0_1.5px_#d4d4d8_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] transition-all duration-200 overflow-hidden">
            <h4 className="font-medium font-manrope_1 text-black/90 dark:text-white/90 mb-2">Profile Settings</h4>
            <p className="text-sm font-manrope_1 text-black/70 dark:text-white/70 mb-3">Manage your account preferences</p>
            <button
              onClick={() => handleFlyoutOpen('profile-management')}
              className="w-full p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-md text-sm transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#f8f8f8] via-[#f8f8f8] to-[#f0f0f0] shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(229_229_229)_inset,0_0.5px_0_1.5px_#d4d4d8_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] transition-all duration-200 overflow-hidden">
            <h4 className="font-medium font-manrope_1 text-black/90 dark:text-white/90 mb-2">Security</h4>
            <p className="text-sm font-manrope_1 text-black/70 dark:text-white/70 mb-3">Password and authentication settings</p>
            <button 
              onClick={() => handleFlyoutOpen('byok-setup')}
              className="w-full p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-md text-sm transition-colors"
            >
              Security Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsContent = ({ toggleFlyout }: ContentProps) => {
  const handleFlyoutOpen = useCallback((content: string) => {
    console.log('🎯 SettingsContent opening flyout:', content);
    toggleFlyout(content);
  }, [toggleFlyout]);
  
  return (
    <div className="p-2">
      <div className="text-black dark:text-white">        
        <div className="space-y-4">
          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg">
            <h4 className="font-medium mb-2">General Settings</h4>
            <p className="text-sm text-black/70 dark:text-white/70 mb-3">Configure general application settings</p>
            <button 
              onClick={() => handleFlyoutOpen('connections-test')}
              className="w-full p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-md text-sm transition-colors"
            >
              Configure
            </button>
          </div>
          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg">
            <h4 className="font-medium mb-2">Billing & Subscription</h4>
            <p className="text-sm text-black/70 dark:text-white/70 mb-3">Manage your subscription and billing</p>
            <button 
              onClick={() => handleFlyoutOpen('subscription-test')}
              className="w-full p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-md text-sm transition-colors"
            >
              Billing Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationsContent = () => (
  <div className="p-2">
    <div className="text-black dark:text-white">
      
      <div className="space-y-4">
        <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">Recent Notifications</h4>
          <div className="space-y-2">
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded text-sm">
              <p className="font-medium">System Update</p>
              <p className="text-black/70 dark:text-white/70 text-xs">2 hours ago</p>
            </div>
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded text-sm">
              <p className="font-medium">New Message</p>
              <p className="text-black/70 dark:text-white/70 text-xs">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Flyout content components
const AccountFlyoutContent = () => (
  <div className="p-4">
    <div className="text-white">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6 text-orange-400" />
        <h3 className="text-lg font-semibold">Account Details</h3>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">Account Information</h4>
          <p className="text-sm text-white/70 mb-3">View and edit your account details</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Email:</span>
              <span>admin@school.com</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Role:</span>
              <span>School Administrator</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Status:</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SubscriptionFlyoutContent = () => (
  <div className="p-4 h-full flex flex-col">
    <div className="text-white">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-6 w-6 text-yellow-400" />
        <h3 className="text-lg font-semibold">Subscription</h3>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">Current Plan</h4>
          <p className="text-sm text-white/70 mb-3">Education Premium</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Students:</span>
              <span>500 / 1000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Storage:</span>
              <span>2.5GB / 10GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Next billing:</span>
              <span>Jan 15, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConnectionsFlyoutContent = () => (
  <div className="p-4">
    <div className="text-white">
      <div className="flex items-center gap-3 mb-6">
        <Link2 className="h-6 w-6 text-orange-400" />
        <h3 className="text-lg font-semibold">Connections</h3>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">Connected Accounts</h4>
          <p className="text-sm text-white/70 mb-3">Manage your linked social accounts</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Google</span>
              </div>
              <span className="text-xs text-green-300">Connected</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm">GitHub</span>
              </div>
              <button className="text-xs text-blue-400 hover:text-blue-300">Connect</button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">API Integrations</h4>
          <p className="text-sm text-white/70 mb-3">Connect with external services</p>
          <button className="w-full p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-md text-sm transition-colors">
            Manage Integrations
          </button>
        </div>
      </div>
    </div>
  </div>
);

const BYOKSetupFlyoutContent = () => (
  <div className="p-4">
    <div className="text-white">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-green-400" />
        <h3 className="text-lg font-semibold">API Keys Setup</h3>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium mb-2">Bring Your Own Keys</h4>
          <p className="text-sm text-white/70 mb-3">Configure your own API keys for enhanced security</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
              <input 
                type="password" 
                placeholder="sk-..." 
                className="w-full p-2 bg-white/10 border border-white/20 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anthropic API Key</label>
              <input 
                type="password" 
                placeholder="sk-ant-..." 
                className="w-full p-2 bg-white/10 border border-white/20 rounded text-sm"
              />
            </div>
            <button className="w-full p-2 bg-green-500/20 hover:bg-green-500/30 rounded-md text-sm transition-colors">
              Save Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);


export const RightSidebar = memo(function RightSidebar({ sidebarState, showFlyoutControl = true, className, content }: RightSidebarProps) {
  const isMobile = useIsMobile();
  
  // Get sidebar state from hooks if not provided via props
  const hookState = useSharedSidebarState();
  
  // FIXED: Use sidebarState from props or fallback to hooks
  const { isRightSidebarOpen, rightSidebarContent, closeRightSidebar } = sidebarState || {
    isRightSidebarOpen: hookState.isRightSidebarOpen,
    rightSidebarContent: content || hookState.rightSidebarContent,
    closeRightSidebar: hookState.closeRightSidebar,
  };
  
  // Use the actual content from the store
  const actualContent = rightSidebarContent || hookState.rightSidebarContent;
  
  // Check if user is authenticated (assume authenticated if we have user-info, settings, or notifications content)
  const isAuthenticated = actualContent && ['user-info', 'settings', 'notifications'].includes(actualContent);
  
  const { 
    isOpen: flyoutIsOpen, 
    content: flyoutContent, 
    open: openFlyout, 
    close: closeFlyout, 
    toggle: toggleFlyout 
  } = useSharedRightFlyoutState();

  // Debug flyout state changes (only when flyout state changes)
  // console.log('🎨 RightSidebar flyout state:', { flyoutIsOpen, flyoutContent, isMobile });



 

  // Handle flyout toggle
  const handleFlyoutToggle = useCallback(() => {
    toggleFlyout('account-test');
  }, [toggleFlyout]);

  // Handle flyout close
  const handleFlyoutClose = useCallback(() => {
    closeFlyout();
  }, [closeFlyout]);

  // Handle sidebar close
  const handleSidebarClose = useCallback(() => {
    closeRightSidebar();
    if (flyoutIsOpen) {
      closeFlyout();
    }
  }, [closeRightSidebar, flyoutIsOpen, closeFlyout]);

  // FIXED: Memoize main content renderer using actualContent
  const mainContent = useMemo(() => {
    console.log('🎨 Rendering content for:', actualContent);
    
    switch (actualContent) {
      case 'user-info':
        return <UserInfoContent toggleFlyout={toggleFlyout} />;
      case 'settings':
        return <SettingsContent toggleFlyout={toggleFlyout} />;
      case 'notifications':
        return <NotificationsContent />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No content selected</p>
          </div>
        );
    }
  }, [actualContent, toggleFlyout]);

  // Memoize flyout content renderer
  const flyoutContentComponent = useMemo(() => {
    switch (flyoutContent) {
      case 'profile-management':
        return <ProfileManagement />;
      case 'account-test':
        return <AccountFlyoutContent />;
      case 'subscription-test':
        return <SubscriptionFlyoutContent />;
      case 'connections-test':
        return <ConnectionsFlyoutContent />;
      case 'byok-setup':
        return <BYOKSetupFlyoutContent />;
      default:
        return (
          <div className="p-6 h-full flex items-center justify-center">
            <p className="text-white/70">Select an option to view details</p>
          </div>
        );
    }
  }, [flyoutContent]);

  // Helper function to get flyout title
  const getFlyoutTitle = useCallback(() => {
    switch (flyoutContent) {
      case 'profile-management': return 'Profile Settings';
      case 'account-test': return 'Account Settings';
      case 'subscription-test': return 'Subscription';
      case 'connections-test': return 'Connections';
      case 'byok-setup': return 'API Keys Setup';
      default: return 'Panel';
    }
  }, [flyoutContent]);

  // Calculate flyout positioning classes
  const getFlyoutClasses = useCallback(() => {
    if (isMobile) {
      return "inset-0";
    } else {
      return "top-0 h-full w-[350px] right-[350px]";
    }
  }, [isMobile]);

  // Enhanced body scroll prevention for mobile - disabled to prevent user-nav movement
  useEffect(() => {
    if (!isMobile || !isRightSidebarOpen) return;

    // Commented out body style changes that cause user-nav to move
    // const originalOverflow = document.body.style.overflow;
    // const originalPosition = document.body.style.position;
    // const originalTop = document.body.style.top;
    // const originalWidth = document.body.style.width;
    // const scrollY = window.scrollY;

    // // Prevent body scroll but don't use position fixed which breaks flyout scrolling
    // document.body.style.overflow = 'hidden';
    // document.body.style.width = '100%';

    // // Add touch-action to body to prevent scroll but allow flyout scrolling
    // document.body.style.touchAction = 'none';

    // return () => {
    //   document.body.style.overflow = originalOverflow;
    //   document.body.style.position = originalPosition;
    //   document.body.style.top = originalTop;
    //   document.body.style.width = originalWidth;
    //   document.body.style.touchAction = '';
    // };
  }, [isMobile, isRightSidebarOpen]);

  // FIXED: Early return if not open
  if (!isRightSidebarOpen) {
    return null;
  }

  // Mobile: Use Sheet for overlay behavior
  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-full w-fit relative", className)}>
        <Sheet 
          open={isRightSidebarOpen} 
          onOpenChange={(open) => !open && handleSidebarClose()} 
          modal={true}
        >
          <SheetContent
            side="right"
            hideClose={true}
            className={cn(
              "border-l z-[99999] p-0 flex flex-col dark:bg-[#171719] overflow-hidden",
              "w-screen sm:w-[350px] h-screen rounded-none"
            )}
          >
            {/* Mobile content structure */}
            {!isAuthenticated && (
              <SidebarHeader className="border-b border-black/20 dark:border-white/20 flex-shrink-0">
            <div className="px-3 py-2 md:py-4 flex items-center justify-between min-h-[52px] md:min-h-[64px]">
                  <SheetTitle className="text-xl font-manrope_1 text-left font-semibold text-black dark:text-white">
                    {getSidebarTitle(actualContent || '')}
                  </SheetTitle>
                </div>
              </SidebarHeader>
            )}
            
            {/* Mobile header for authenticated users with close button */}
            {isAuthenticated && (
              <>
                <SidebarHeader className="border-b border-black/20 dark:border-white/20 flex-shrink-0">
            <div className="px-3 py-2 md:py-4 flex items-center justify-between min-h-[52px] md:min-h-[64px]">
                    <SheetTitle className="text-xl font-manrope_1 text-left font-semibold text-black dark:text-white">
                      {getSidebarTitle(actualContent || '')}
                    </SheetTitle>
                  </div>
                </SidebarHeader>
              </>
            )}
            
            <SidebarContent className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden",
              isAuthenticated ? "mt-0" : "-mt-[1rem]"
            )}>
              <div className="h-full">
                {mainContent}
              </div>
            </SidebarContent>
            
            {/* Mobile Flyout Overlay - stays within SheetContent but with very high z-index */}
            <AnimatePresence mode="wait">
              {flyoutIsOpen && flyoutContentComponent && (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
                  className="fixed inset-0 dark:bg-[#171719] flex flex-col"
                  style={{ zIndex: 99999 }}
                >
            <div className="px-4 py-3 flex items-center justify-between min-h-[52px] md:min-h-[64px]">
                    <h3 className="text-lg font-manrope_1 font-semibold text-black dark:text-white">
                      {getFlyoutTitle()}
                    </h3>
                    <button
                      onClick={handleFlyoutClose}
                      className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-100"
                      aria-label="Close flyout"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                    {flyoutContentComponent}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          

            <SidebarFooter className="flex-shrink-0">
              <div className="px-4 py-2 pb-2">
                {/* Terms/Privacy with Logout using InputButtonProvider */}
                <TermsPrivacyWithLogout />
              </div>
            </SidebarFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop: Use fixed positioned sidebar like the working example
  return (
    <div className={cn("flex flex-col h-full w-fit relative", className)}>
      {/* Fixed positioned sidebar for desktop - NO SHEET */}
     <div
  className={cn(
    "fixed top-0 right-0 pt-12 h-full z-[99999] flex flex-col",
    "bg-[#eeeeee] dark:bg-[#171719]",
    "transition-transform duration-100 ease-out", // Fast transitions for instant feel
    "w-[350px] rounded-tl-xl",
    isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
  )}
>
        {/* Desktop sidebar header - for unauthenticated users */}
        {!isAuthenticated && (
          <div className="border-b border-black/20 dark:border-white/20 flex-shrink-0">
            <div className="px-3 py-2 md:py-4 flex items-center justify-between min-h-[52px] md:min-h-[64px]">
              <h2 className="text-xl font-manrope_1 text-left font-semibold text-black dark:text-white">
                {getSidebarTitle(actualContent || '')}
              </h2>
            </div>
          </div>
        )}
        
        {/* Desktop sidebar header - for authenticated users */}
        {isAuthenticated && (
          <div className="border-b border-black/20 dark:border-white/20 flex-shrink-0">
            <div className="px-3 py-2 md:py-4 flex items-center justify-between min-h-[52px] md:min-h-[64px]">
              <h2 className="text-xl font-manrope_1 text-left font-semibold text-black dark:text-white">
                {getSidebarTitle(actualContent || '')}
              </h2>
            </div>
          </div>
        )}
        
        {/* Desktop sidebar content */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          isAuthenticated ? "mt-0" : "-mt-[1rem]"
        )}>
          <div className="h-full">
            {mainContent}
          </div>
        </div>
        
        {/* Desktop sidebar footer */}
         <SidebarFooter className="flex-shrink-0">
              <div className="px-4 py-2 pb-2">
                {/* Terms/Privacy with Logout using InputButtonProvider */}
                <TermsPrivacyWithLogout />
              </div>
            </SidebarFooter>
      </div>

      {/* Desktop Flyout - positioned to the left of sidebar */}
      <AnimatePresence mode="wait">
        {flyoutIsOpen && flyoutContentComponent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className={cn(
              "fixed top-[0.5rem] h-full z-[100000000000] flex flex-col rounded-tl-4xl rounded-tr-4xl bg-[#eeeeee] dark:bg-[#171719] ",
              "w-[350px] right-[350px]" // Positioned to the left of the sidebar
            )}
          >
            {/* Flyout Header */}
            <div className="px-4 py-3 flex items-center justify-between min-h-[52px] md:min-h-[64px]">
               <h3 className="text-lg font-manrope_1 font-semibold text-black dark:text-white">
                {getFlyoutTitle()}
              </h3>
              <button
                onClick={handleFlyoutClose}
                className="text-black/10 hover:text-black dark:text-white/70 dark:hover:text-white p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-100"
                aria-label="Close flyout"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Flyout Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              {flyoutContentComponent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
