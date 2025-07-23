'use client';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../../lib/utils';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { useSharedSidebarState, useSharedRightFlyoutState } from '../../../../stores/sidebar-store.client';
import { SquircleProvider } from '../../../providers/squircle-provider.client';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../../../ui/sidebar.client';
import { AppSidebar } from './app-sidebar.client';
import { RightSidebar } from '../../shared/dual-sidebar/right-sidebar';
import { UserNav } from '../../shared/dual-sidebar/user-nav.client';
import { Popover } from '@base-ui-components/react/popover';
import { useRedirect, useLocation, useParams } from 'blade/hooks';
import {
  ChevronDown,
  Home,
  Bell,
  PlayCircle,
  Compass,
  Brain,
  Circle,
  Plus
} from 'lucide-react';

// Page navigation items for the dropdown
interface PageNavItem {
  id: string;
  label: string;
  icon: any;
  url: string;
  description?: string;
}

const pageNavItems: PageNavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    url: "", // Just /teacher/[slug]
    description: "Teacher dashboard"
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Bell,
    url: "calendar",
    description: "Schedule and events"
  },
  {
    id: "classes",
    label: "Classes",
    icon: PlayCircle,
    url: "classes",
    description: "Manage your classes"
  },
  {
    id: "discover",
    label: "Discover",
    icon: Compass,
    url: "discover",
    description: "Explore resources"
  },
  {
    id: "students",
    label: "Students",
    icon: Brain,
    url: "students",
    description: "Student management"
  }
];

// Arrow SVG component for popover
function ArrowSvg(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-white dark:fill-black"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-gray-200 dark:fill-gray-700"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="dark:fill-gray-600"
      />
    </svg>
  );
}

// Page Navigation Popover Component
function PageNavigationPopover() {
  const redirect = useRedirect();
  const location = useLocation();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get current theme for shadow animation
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Get current page info
  const getCurrentPage = (): PageNavItem => {
    const pathname = location.pathname;

    // Extract the page from the URL
    if (pathname.match(/^\/teacher\/[^\/]+$/)) {
      const homePage = pageNavItems.find(item => item.id === 'home');
      return homePage || pageNavItems[0] || { id: 'home', label: 'Home', icon: Home, url: '', description: 'Teacher dashboard' };
    }

    // Check for specific pages
    for (const item of pageNavItems) {
      if (item.url && pathname.includes(`/${item.url}`)) {
        return item;
      }
    }

    // Default fallback
    return pageNavItems[0] || { id: 'home', label: 'Home', icon: Home, url: '', description: 'Teacher dashboard' };
  };

  const currentPage = getCurrentPage();

  const handlePageNavigation = (item: PageNavItem) => {
    const slug = Array.isArray(params['slug']) ? params['slug'][0] : params['slug'];
    const fullUrl = item.url ? `/teacher/${slug}/${item.url}` : `/teacher/${slug}`;

    // Set navigating state and close popover immediately
    setIsNavigating(true);
    setIsOpen(false);

    redirect(fullUrl);
  };

  // Reset navigation state when location changes
  useEffect(() => {
    setIsOpen(false);
    // Reset navigation state after a delay to maintain trigger appearance
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        render={(props) => (
          <motion.button
            {...(props as any)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#eeeef0] dark:bg-[#313035] text-black/80 dark:text-white/80 select-none hover:bg-[#fefefe] dark:hover:bg-[#3a3b40] active:bg-[#fefefe] dark:active:bg-[#3a3b40]"
            animate={{
              borderRadius: (isOpen || isNavigating) ? "0.75rem" : "9999px",
              boxShadow: (isOpen || isNavigating)
                ? isDarkMode
                  ? [
                      "inset 0 -1px 0 1px rgba(0,0,0,0.8)",
                      "inset 0 0 0 1px rgb(9,9,11)",
                      "inset 0 0.5px 0 1.5px #71717a"
                    ].join(", ")
                  : [
                      "inset 0 -1px 0 1px rgba(255,255,255,0.8)",
                      "inset 0 0 0 1px rgb(220,220,220)",
                      "inset 0 0.5px 0 1.5px #ccc"
                    ].join(", ")
                : "none"
            }}
            transition={{
              borderRadius: {
                duration: 0
              },
              boxShadow: {
                delay: isOpen ? 0 : 0,
                duration: 0.1,
                ease: "easeInOut"
              }
            }}
          >
            <currentPage.icon className="w-4 h-4" />
            <span className="text-xs md:text-sm font-manrope_1">{currentPage.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </motion.button>
        )}
      />
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start">
          <Popover.Popup className="origin-[var(--transform-origin)] rounded-xl bg-[#eeeef0] dark:bg-[#313035] px-2 py-2 text-black/90 dark:text-white/90 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 min-w-[200px] shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset]  dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] ">
          
            <div className="space-y-1">
              {pageNavItems.map((item) => {
                const isActive = item.id === currentPage.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageNavigation(item)}
                    className={cn(
                      "w-full flex font-manrope_1 items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                      isActive
                        ? "bg-[#fefefe] dark:bg-[#3a3b40] hover:bg-[#fefefe]/70 dark:hover:bg-[#3a3b40]/70 text-black/90 dark:text-white/90"
                        : "hover:text-black/40 dark:hover:text-white/40"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive
                        ? "text-black/90 dark:text-white/90"
                        : "text-black/40 dark:text-white/40 hover:text-black/90 dark:hover:text-white/90"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-manrope_1 font-medium",
                        isActive
                          ? "text-black/90 dark:text-white/90"
                          : "text-black/40 dark:text-white/40 hover:text-black/90 dark:hover:text-white/90"
                      )}>{item.label}</div>
                      {item.description && (
                        <div className={cn(
                          "text-xs font-manrope_1 truncate",
                          isActive
                            ? "text-black/90 dark:text-white/90"
                            : "text-black/40 dark:text-white/40"
                        )}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface EnhancedSidebarProps {
  children: React.ReactNode;
  className?: string;
  showUserNav?: boolean;
  showHeader?: boolean;
}

export function EnhancedSidebar({
  children,
  className,
  showUserNav = true,
  showHeader = true
}: EnhancedSidebarProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const {
    isLeftSidebarOpen,
    isRightSidebarOpen,
    activeFlyout,
    isRightFlyoutOpen,
    rightSidebarContent,
    updateActiveFlyout,
    updateRightSidebarContent,
    toggleRightSidebar,
    clearAllSidebarStatesOnce,
  } = useSharedSidebarState();

  // Flyout state (no longer used to hide UserNav)
  const { isOpen: flyoutOpen } = useSharedRightFlyoutState();

  // Note: Removed automatic sidebar clearing to prevent loops
  // Sidebar states will be managed by user interactions instead

  // Calculate main content styles based on sidebar states - FASTER TRANSITIONS
  const mainContentStyles = useMemo(() => {
    const styles: Record<string, string> = {
      "transition-all": "true",
      "duration-100": "true", // FASTER: 100ms instead of 300ms
      "ease-out": "true", // FASTER: ease-out instead of ease-in-out
      "flex-1": "true",
      "flex": "true",
      "flex-col": "true",
      "h-full": "true",
      "overflow-hidden": "true",
    };

    // Left sidebar adjustments - FIXED: Only check activeFlyout since we're always in icon mode
    if (!isMobile) {
      if (activeFlyout) {
        styles["ml-[354px]"] = "true"; // Icon sidebar (72px) + flyout (284px) = 356px
      } else {
        styles["ml-[4.5rem]"] = "true"; // Icon sidebar only (72px)
      }
    }

    // Right sidebar adjustments - ONLY for desktop, mobile uses Sheet overlay
    if (!isMobile && isRightSidebarOpen) {
      styles["mr-[350px]"] = "true"; // Desktop: push content left
    }
    // Mobile: No margin adjustments - right sidebar is a Sheet overlay
    // No explicit mr-0 needed as it's the default

  
    return cn(styles);
  }, [isMobile, activeFlyout, isLeftSidebarOpen, isRightSidebarOpen, isRightFlyoutOpen]);



  return (
    <SquircleProvider>
      
        <SidebarProvider
          defaultOpenLeft={true}
          defaultOpenRight={false}
          className="min-h-screen bg-fixed bg-gradient-to-r from-[#f2f2f2] via-[#e8e8e8] to-[#eeeeee] dark:from-[#101012] dark:via-[#18181a] dark:to-[#171719]"
        >
        <div className="flex h-screen w-full overflow-hidden">
          {/* Left App Sidebar - Icon mode with flyouts */}
          <AppSidebar
            variant="floating"
            collapsible="icon"
            flyout={activeFlyout}
            setFlyout={updateActiveFlyout}
          />

          {/* User Navigation - Fixed position top-right */}
          {showUserNav && (
            <UserNav />
          )}

          {/* Main Content Area */}
          <SidebarInset className={cn("flex-1 md:mt-2 border-l border-r border-t border-black/20 dark:border-white/20 md:rounded-t-4xl flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#1f1f21]", mainContentStyles)}>            {/* Header */}
            {showHeader && (
              <header className="flex h-12 items-center mt-3 ml-8 md:ml-0 md:mt-0  gap-2 px-4 backdrop-blur-md z-10">
                <div className="items-start">
                  <div className="flex items-center gap-4">
                  <PageNavigationPopover />
                  {/* Show current page description */}
                  {(() => {
                    const currentPageInfo = pageNavItems.find(item => {
                      if (!location.pathname) return false;
                      const pathname = location.pathname;
                      if (item.url && pathname.includes(`/${item.url}`)) {
                        return true;
                      }
                      return false;
                    }) || pageNavItems[0];

                    return currentPageInfo?.description && (
                      <div className="text-xs md:text-sm font-manrope_1 truncate text-black/60 dark:text-white/60 ml-2">
                        {currentPageInfo.description}
                      </div>
                    );
                  })()}
                  </div>
                 
                </div>
              </header>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="max-w-full mx-auto">
                  {children}
                </div>
              </div>
            </main>
          </SidebarInset>

          {/* Right Sidebar */}
          {rightSidebarContent && (
            <RightSidebar
              content={rightSidebarContent}
            />
          )}
        </div>
        </SidebarProvider>
      
    </SquircleProvider>
  );
}
