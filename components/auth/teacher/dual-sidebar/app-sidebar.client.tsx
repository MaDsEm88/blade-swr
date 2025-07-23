'use client';
import type { ComponentProps } from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { cn } from "../../../../lib/utils";
import { useIsMobile } from "../../../../hooks/use-mobile";
import { useRedirect, useLocation, useParams } from 'blade/hooks';
import { useSharedSidebarState } from '../../../../stores/sidebar-store.client';
import useMeasure from 'react-use-measure';
import useClickOutside from '../../../../hooks/useClickOutside';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "../../../ui/sidebar.client";
import { NavMain } from "./nav-main.client";
import { NavProjects } from "./nav-projects.client";
import { NavUser } from "./nav-user.client";
import { TeamSwitcher } from "./team-switcher.client";
import { CanvasRevealEffect } from "../../../ui/canvas-reveal-effect.client"; // Now using CSS fallback
import { Gauge } from "@suyalcinkaya/gauge";
import { CollapseBarIcon } from '../../../ui/icons';

import {
  Bell,
  Plus,
  Compass,
  PlayCircle,
  GalleryVerticalEnd,
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  Frame,
  PieChart,
  Map,
  Brain,
  Circle,
  Home,
  UserPlus,
  X,
} from "lucide-react";
import { Image, Link } from 'blade/client/components';
import { createPortal } from 'react-dom';
import { Dialog } from '@base-ui-components/react/dialog';
import { StudentManagementDialogTrigger } from '../dialogs';



interface AppSidebarProps extends ComponentProps<"div"> {
  flyout: string | null;
  setFlyout: (flyout: string | null) => void;
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

interface IconItem {
  id: string;
  icon: any;
  label: string;
  tooltip: string;
  section: number;
  url?: string; // Optional URL for navigation
  isGauge?: boolean; // Special flag for gauge rendering
  flyoutHeaderStyle?: "title" | "button"; // Header style for flyouts
}

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
  },
  {
    id: "status",
    label: "Status",
    icon: Circle,
    url: "status",
    description: "System status"
  }
];

const iconItems: IconItem[] = [
  // Home - Always first in mobile toolbar
  {
    id: "home",
    icon: Home,
    label: "Home",
    tooltip: "Home",
    section: 0, // New section for home
    url: "" // Empty URL means just /teacher/[slug]
  },
  // First section - Notifications
  {
    id: "calendar",
    icon: Bell,
    label: "Calendar",
    tooltip: "Calendar",
    section: 1,
    url: "calendar" // Relative URL - will be prefixed with /teacher/[slug]/
  },
  // Second section - Navigation
  {
    id: "classes",
    icon: PlayCircle,
    label: "Classes",
    tooltip: "Your Classes",
    section: 3,
    url: "classes" // Relative URL - will be prefixed with /teacher/[slug]/
  },
  {
    id: "discover",
    icon: Compass,
    label: "Discover",
    tooltip: "Discover",
    section: 3,
    url: "discover" // Relative URL - will be prefixed with /teacher/[slug]/
  },
  // Third section - Create New
  {
    id: "new",
    icon: Plus,
    label: "New",
    tooltip: "Create New",
    section: 2,
    url: "create" // Navigate to create page
  },
  // Fourth section - Status (above canvas reveal)
  {
    id: "status",
    icon: Circle,
    label: "Status",
    tooltip: "System Status",
    section: 4,
    flyoutHeaderStyle: "title", // This will show traditional title header
  },
  // Fifth section - Students Gauge (at bottom)
  {
    id: "students-gauge",
    icon: Brain,
    label: "Students",
    tooltip: "Student Overview",
    section: 5,
    url: "students", // Relative URL - will be prefixed with /teacher/[slug]/
    isGauge: true, // Special flag to render as gauge
    flyoutHeaderStyle: "button", // Options: "title" (default) or "button"
  },
];

function IconButton({
  item,
  isActive,
  onClick,
  isMobile = false,
  isCurrentPage = false
}: {
  item: IconItem;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
  isCurrentPage?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const redirect = useRedirect();
  const params = useParams();

  const handleButtonClick = (e: React.MouseEvent) => {
    // Toggle the flyout
    onClick();

    // If this button has a URL and we're using Link wrapper,
    // let the Link handle navigation (don't prevent default)
    // The Link component will handle the navigation automatically
  };

  // Special rendering for gauge items
  if (item.isGauge) {
    const handleGaugeClick = () => {
      // Toggle the flyout
      onClick();

      // Navigate to the URL if it exists
      if (item.url) {
        const slug = Array.isArray(params['slug']) ? params['slug'][0] : params['slug'];
        const fullUrl = item.url.startsWith('/')
          ? item.url
          : `/teacher/${slug}/${item.url}`;
        redirect(fullUrl);
      }
    };

    return (
      <div className="w-12 z-20">
        <button
          onClick={handleGaugeClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex w-full items-center justify-center h-36 select-none rounded-xl overflow-hidden shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] transition-all duration-200 cursor-pointer group"
        >
          {/* Canvas Reveal Effect Background */}
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[
                [244, 244, 245], // zinc-100 - cool white (default for now)
                [250, 250, 250], // white
                [228, 228, 231]  // zinc-200
              ]}
              dotSize={1.5}
              opacities={[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0]}
              showGradient={false}
            />
          </div>

          {/* Gauge at the top */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className="relative">
              <Gauge
                value={getStudentCountPercentage()}
                size="sm"
                showValue={true}
                showAnimation={true}
                primary="#f4f4f5" // Default color for now
                secondary="rgba(255,255,255,0.2)"
              />
              {/* Custom percentage display overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                  className="text-xs font-bold text-white"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))'
                  } as React.CSSProperties}
                >
                  {Math.round(getStudentCountPercentage())}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom fade overlay to make dots less visible at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(10,5,2,0.4) 50%, rgba(8,4,1,0.8) 100%)`
            } as React.CSSProperties}
          />

          {/* Brain icon at bottom */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
            <item.icon className="w-4 h-4 text-zinc-50 group-hover:text-white transition-colors duration-200" />
          </div>

          <span className="relative z-10 text-xs font-medium writing-vertical-rl transform rotate-180 text-zinc-50">{item.label}</span>
        </button>
      </div>
    );
  }

  // Alternative approach: You could also add different behaviors per item
  // For example, some items might only navigate, others might only toggle flyout
  // const handleClick = () => {
  //   switch (item.id) {
  //     case 'notifications':
  //       // Only toggle flyout for notifications
  //       onClick();
  //       break;
  //     case 'projects':
  //       // Both toggle flyout and navigate for projects
  //       onClick();
  //       if (item.url) redirect(item.url);
  //       break;
  //     case 'runs':
  //       // Only navigate for runs (no flyout)
  //       if (item.url) redirect(item.url);
  //       break;
  //     default:
  //       // Default behavior: toggle flyout and navigate if URL exists
  //       onClick();
  //       if (item.url) redirect(item.url);
  //   }
  // };

  const ButtonContent = () => (
    <item.icon
      className={cn(
        "w-5 h-5 transition-colors duration-200",
        isActive
          ? "text-zinc-800 dark:text-zinc-200"
          : isCurrentPage
          ? "text-black dark:text-white"
          : isHovered
          ? "text-zinc-700 dark:text-zinc-300"
          : "text-zinc-500 dark:text-zinc-400"
      )}
    />
  );

  // Create the button content
  const buttonContent = (
    <>
      <button
        onClick={handleButtonClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative w-12 h-12 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 active:scale-[0.98]",
          "z-20 touch-manipulation select-none outline-none",
          isActive
            ? 'bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:text-zinc-50 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]'
            : isCurrentPage
            ? 'text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
        )}
        type="button"
        aria-pressed={isActive}
        aria-label={item.tooltip}
      >
        <ButtonContent />
      </button>

      {/* Enhanced active indicator */}
      <div
        className="absolute -right-1 top-[28px] transform -translate-y-1/2 transition-all duration-300 ease-out z-20"
        style={{
          opacity: isActive ? 1 : 0,
          transform: `translateY(-50%) scale(${isActive ? 1 : 0.8})`,
        } as React.CSSProperties}
      >
        <div
          className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"
          style={{
            boxShadow: '0 0 12px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 0, 0, 0.3)',
            filter: 'blur(0.5px)',
          } as React.CSSProperties}
        />
      </div>

      {/* Hover tooltip - Hide on mobile */}
      {!isMobile && (
        <div
          className="absolute left-16 top-[2.5rem] font-manrope_1 transform -translate-y-1/2 bg-gradient-to-b from-[#f8f9fa] via-[#f8f9fa] to-[#e9ecef] dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] px-3 text-sm leading-8 text-black/80 dark:text-white/80 dark:shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(226_232_240)_inset,0_0.5px_0_1.5px_#64748b_inset] shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] rounded-full pointer-events-none transition-all duration-300 ease-out whitespace-nowrap z-[100000]"
          style={{
            opacity: isHovered && !isActive ? 1 : 0,
            transform: `translate(${isHovered && !isActive ? '0' : '-8px'}, -50%)`,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          } as React.CSSProperties}
        >
          {item.tooltip}
          <div
            className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0 dark:border-r-[#e9ecef] border-r-[#212026]"
            style={{
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRightWidth: '6px',
              borderRightStyle: 'solid',
            } as React.CSSProperties}
          />
        </div>
      )}
    </>
  );

  // If item has URL, wrap in Link for navigation
  if (item.url) {
    const slug = Array.isArray(params['slug']) ? params['slug'][0] : params['slug'];
    const fullUrl = item.url.startsWith('/')
      ? item.url
      : `/teacher/${slug}/${item.url}`;

    return (
      <div className="relative group">
        <Link href={fullUrl}>
          <a className="block">
            {buttonContent}
          </a>
        </Link>
      </div>
    );
  }

  // If no URL, return button without Link wrapper
  return (
    <div className="relative group">
      {buttonContent}
    </div>
  );
}
// Add a Separator component
function Separator() {
  return (
    <div className="w-8 h-px bg-black/10 dark:bg-white/10 my-2 mx-auto" />
  );
}

// Mobile Horizontal Toolbar Component
function MobileHorizontalToolbar({
  flyout,
  setFlyout,
  data,
  handleToggleFlyout
}: {
  flyout: string | null;
  setFlyout: (flyout: string | null) => void;
  data: any;
  handleToggleFlyout: (itemId: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [contentRef, { height: heightContent }] = useMeasure();
  const [menuRef, { width: widthContainer }] = useMeasure();
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Add hooks for navigation
  const redirect = useRedirect();
  const params = useParams();
  const location = useLocation();

  // Function to check if an item is the current page based on URL (mobile version)
  const isCurrentPageMobile = useCallback((item: IconItem): boolean => {
    const pathname = location.pathname;

    // Home page check
    if (item.id === 'home') {
      return !!(pathname.match(/^\/teacher\/[^\/]+$/) && !pathname.includes('/calendar') && !pathname.includes('/classes') && !pathname.includes('/discover') && !pathname.includes('/students'));
    }

    // Other pages check
    if (item.url) {
      return pathname.includes(`/${item.url}`);
    }

    return false;
  }, [location.pathname]);

  // Get all icon items sorted by section (Home first, then others)
  const toolbarItems = iconItems.sort((a, b) => a.section - b.section);

  useClickOutside(ref as React.RefObject<Element>, () => {
    setIsOpen(false);
    setActive(null);
  });

  useEffect(() => {
    if (!widthContainer || maxWidth > 0) return;
    setMaxWidth(widthContainer);
  }, [widthContainer, maxWidth]);

  // Sync with parent flyout state
  useEffect(() => {
    setActive(flyout);
    setIsOpen(!!flyout);
  }, [flyout]);

  // Don't automatically set home as active - let the parent state control this

  // Don't reset toolbar state on location changes - let it work like desktop

  const handleItemClick = (item: IconItem) => {
    // For home item, close any open flyouts and navigate
    if (item.id === 'home') {
      // Close any open flyouts
      setIsOpen(false);
      setActive(null);
      setFlyout(null);

      // Navigate to home
      const slug = Array.isArray(params['slug']) ? params['slug'][0] : params['slug'];
      const fullUrl = `/teacher/${slug}`;
      redirect(fullUrl);
      return;
    }

    // For other items, toggle flyout
    // Navigation will be handled by Link wrapper (similar to desktop)
    handleToggleFlyout(item.id);
  };

  const transition = {
    type: 'spring' as const,
    bounce: 0.1,
    duration: 0.25,
  };

  return (
    <MotionConfig transition={transition}>
      <div className="fixed bottom-2 left-1/2 w-[96vw] transform -translate-x-1/2 z-[100000004]" ref={ref}>
        <div className={cn(
          "h-full w-full bg-gradient-to-b from-zinc-100 to-zinc-200 text-zinc-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:text-zinc-50 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]",
          isOpen ? "rounded-xl" : "rounded-full"
        )}>
          <div className={cn(
            "overflow-hidden",
            isOpen ? "rounded-xl" : "rounded-full"
          )}>
            <AnimatePresence initial={false} mode='sync'>
              {isOpen ? (
                <motion.div
                  key='content'
                  initial={{ height: 0 }}
                  animate={{ height: heightContent || 0 }}
                  exit={{ height: 0 }}
                  style={{
                    width: maxWidth,
                  } as React.CSSProperties}
                >
                  <div ref={contentRef} className="p-2 max-h-[80vh] overflow-y-auto">
                    {toolbarItems.map((item) => {
                      const isSelected = active === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isSelected ? 1 : 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <div
                            className={cn(
                              'px-2 pt-2 text-sm',
                              isSelected ? 'block' : 'hidden'
                            )}
                          >
                            {renderFlyoutContent(item.id, data, setFlyout)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Horizontal scrollable toolbar */}
          <div className="relative">
            {/* Left blur gradient */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-4 z-10 pointer-events-none bg-gradient-to-r from-zinc-100 via-zinc-150 to-transparent dark:from-[#212026] dark:via-[#25242a] dark:to-transparent",
              isOpen ? "rounded-l-xl" : "rounded-l-full"
            )} />

            {/* Right blur gradient */}
            <div className={cn(
              "absolute right-0 top-0 bottom-0 w-4 z-10 pointer-events-none bg-gradient-to-l from-zinc-100 via-zinc-150 to-transparent dark:from-[#212026] dark:via-[#25242a] dark:to-transparent",
              isOpen ? "rounded-r-xl" : "rounded-r-full"
            )} />

            <div
              ref={scrollContainerRef}
              className="flex space-x-2 p-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              } as React.CSSProperties}
            >
              <div ref={menuRef} className="flex space-x-2 min-w-max">
                {toolbarItems.map((item) => {
                  const isCurrentPage = isCurrentPageMobile(item);

                  const buttonElement = (
                    <button
                      key={item.id}
                      aria-label={item.label}
                      className={cn(
                        'relative flex h-9 w-9 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 active:scale-[0.98]',
                        active === item.id
                          ? 'bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:text-zinc-50 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]'
                          : isCurrentPage
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                      )}
                      type='button'
                      onClick={() => handleItemClick(item)}
                    >
                      {/* For gauge items, show just the icon, not the full gauge */}
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          active === item.id
                            ? "text-zinc-800 dark:text-zinc-200"
                            : isCurrentPage
                            ? "text-black dark:text-white"
                            : "text-zinc-500 dark:text-zinc-400"
                        )}
                      />
                    </button>
                  );

                  // If item has URL, wrap in Link for navigation
                  if (item.url) {
                    const slug = Array.isArray(params['slug']) ? params['slug'][0] : params['slug'];
                    const fullUrl = item.url.startsWith('/')
                      ? item.url
                      : `/teacher/${slug}/${item.url}`;

                    return (
                      <Link key={item.id} href={fullUrl}>
                        <a className="block">
                          {buttonElement}
                        </a>
                      </Link>
                    );
                  }

                  // If no URL, return button without Link wrapper
                  return buttonElement;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export function AppSidebar({
  flyout,
  setFlyout,
  variant = "sidebar",
  collapsible = "none",
  className,
  ...props
}: AppSidebarProps) {
  // Removed unused activeItem state
  const isMobile = useIsMobile();
  const { isRightSidebarOpen } = useSharedSidebarState();
  const redirect = useRedirect();
  const location = useLocation();
  const params = useParams();

  // Simplified toggle handler without debouncing - matches working right-sidebar pattern
  const handleToggleFlyout = useCallback((itemId: string) => {
    console.log(`🎯 Toggle flyout for ${itemId}:`, { currentFlyout: flyout, itemId });
    const newFlyout = flyout === itemId ? null : itemId;
    console.log(`🎯 Setting flyout to:`, newFlyout);
    setFlyout(newFlyout);

    // On mobile, don't close the mobile menu when toggling flyouts
    // Only close mobile menu when explicitly closing via logo/minus button
  }, [flyout, setFlyout]);

  const handleHomeClick = useCallback(() => {
    // Close any open flyouts
    setFlyout(null);

    // Navigate to home
    const slug = Array.isArray(params['slug']) ? params['slug'][0] : params['slug'];
    const fullUrl = `/teacher/${slug}`;
    redirect(fullUrl);
  }, [setFlyout, params, redirect]);

  // Function to check if an item is the current page based on URL
  const isCurrentPage = useCallback((item: IconItem): boolean => {
    const pathname = location.pathname;

    // Home page check
    if (item.id === 'home') {
      return !!(pathname.match(/^\/teacher\/[^\/]+$/) && !pathname.includes('/calendar') && !pathname.includes('/classes') && !pathname.includes('/discover') && !pathname.includes('/students'));
    }

    // Other pages check
    if (item.url) {
      return pathname.includes(`/${item.url}`);
    }

    return false;
  }, [location.pathname]);

  const data = {
    user: {
      name: "School Admin",
      email: "admin@school.com",
      avatar: "/avatars/admin.jpg",
    },
    teams: [
      {
        name: "School District",
        logo: GalleryVerticalEnd,
        plan: "Education",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "#",
          },
          {
            title: "Analytics",
            url: "#",
          },
          {
            title: "Reports",
            url: "#",
          },
        ],
      },
      {
        title: "Students",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "All Students",
            url: "#",
          },
          {
            title: "Enrollment",
            url: "#",
          },
          {
            title: "Attendance",
            url: "#",
          },
        ],
      },
      {
        title: "Teachers",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "All Teachers",
            url: "#",
          },
          {
            title: "Schedules",
            url: "#",
          },
          {
            title: "Performance",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Users",
            url: "#",
          },
          {
            title: "Security",
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Academic Year 2024",
        url: "#",
        icon: Frame,
      },
      {
        name: "Summer Programs",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Extracurriculars",
        url: "#",
        icon: Map,
      },
    ],
  };

  if (collapsible === "icon") {
    return (
      <div className="flex h-full">
        {/* Mobile Layout */}
        {isMobile ? (
          <>
            {/* Fixed Mobile Logo - Always visible using Portal (hidden when right sidebar is open) */}
            {typeof window !== 'undefined' && !isRightSidebarOpen && createPortal(
              <div className="fixed top-4 left-2 z-[100000003] flex items-center gap-2">
                {/* Main Logo Button - No longer toggles menu, just shows logo */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  {/* Logo */}
                  <div className="flex items-center justify-center pointer-events-none">
                    <img
                      src="/logo-lightmode.png"
                      alt="Penned Logo"
                      className="w-6 h-6 dark:hidden pointer-events-none"
                      width={24}
                      height={24}
                      draggable={false}
                    />
                    <img
                      src="/logo-darkmode.png"
                      alt="Penned Logo"
                      className="w-6 h-6 hidden dark:block pointer-events-none"
                      width={24}
                      height={24}
                      draggable={false}
                    />
                  </div>
                </div>


              </div>,
              document.body
            )}

            {/* Mobile Horizontal Toolbar */}
            <MobileHorizontalToolbar
              flyout={flyout}
              setFlyout={setFlyout}
              data={data}
              handleToggleFlyout={handleToggleFlyout}
            />
          </>
        ) : (
          /* Desktop Layout */
          <>
            {/* Icon Rail */}
            <div className="flex flex-col w-18 h-svh z-30 fixed left-0 top-0">
              <div className="flex flex-col items-center gap-2 p-2">
                {/* Logo Section */}
                <div className="w-10 h-10 flex items-center justify-center z-20">
                  <Image
                    src="/logo-lightmode.png"
                    alt="Penned Logo"
                    className="w-6 h-6 dark:hidden"
                    width={28}
                    height={28}
                  />
                  <Image
                    src="/logo-darkmode.png"
                    alt="Penned Logo"
                    className="w-6 h-6 hidden dark:block"
                    width={28}
                    height={28}
                  />
                </div>

                {/* Home Icon - First option */}
                {(() => {
                  const homeItem = iconItems.find(item => item.id === 'home');
                  return homeItem && (
                    <IconButton
                      item={homeItem}
                      isActive={false}
                      onClick={() => handleHomeClick()}
                      isMobile={false}
                      isCurrentPage={isCurrentPage(homeItem)}
                    />
                  );
                })()}

                <Separator />

                {/* Bell Icon */}
                {(() => {
                  const calendarItem = iconItems.find(item => item.id === 'calendar');
                  return calendarItem && (
                    <IconButton
                      item={calendarItem}
                      isActive={flyout === 'calendar'}
                      onClick={() => handleToggleFlyout('calendar')}
                      isMobile={false}
                      isCurrentPage={isCurrentPage(calendarItem)}
                    />
                  );
                })()}

                <Separator />

                {/* Create New Section */}
                {iconItems
                  .filter(item => item.section === 3)
                  .map((item) => (
                    <IconButton
                      key={item.id}
                      item={item}
                      isActive={flyout === item.id}
                      onClick={() => handleToggleFlyout(item.id)}
                      isMobile={false}
                      isCurrentPage={isCurrentPage(item)}
                    />
                  ))}

                <Separator />

                {/* Navigation Section */}
                {iconItems
                  .filter(item => item.section === 2)
                  .map((item) => (
                    <IconButton
                      key={item.id}
                      item={item}
                      isActive={flyout === item.id}
                      onClick={() => handleToggleFlyout(item.id)}
                      isMobile={false}
                      isCurrentPage={isCurrentPage(item)}
                    />
                  ))}

                <Separator />

                {/* Status Section */}
                {iconItems
                  .filter(item => item.section === 4)
                  .map((item) => (
                    <IconButton
                      key={item.id}
                      item={item}
                      isActive={flyout === item.id}
                      onClick={() => handleToggleFlyout(item.id)}
                      isMobile={false}
                      isCurrentPage={isCurrentPage(item)}
                    />
                  ))}
              </div>

              {/* Students Gauge at bottom with 0.5rem spacing */}
              <div className="absolute bottom-2 px-2">
                {iconItems
                  .filter(item => item.section === 5)
                  .map((item) => (
                    <IconButton
                      key={item.id}
                      item={item}
                      isActive={flyout === item.id}
                      onClick={() => handleToggleFlyout(item.id)}
                      isMobile={false}
                      isCurrentPage={isCurrentPage(item)}
                    />
                  ))}
              </div>
            </div>

            {/* Desktop Flyout Panel */}
            <>
              {/* Flyout separator line */}
              <AnimatePresence>
                {flyout && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="fixed left-[71px] top-0 h-svh w-[1px] z-[99998]"
                  />
                )}
              </AnimatePresence>

              {/* Flyout content panel */}
              <AnimatePresence mode="wait">
                {flyout && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      mass: 0.6,
                      duration: 0.15
                    }}
                    className="fixed left-[72px] border-l border-black/20 dark:border-white/20 rounded-tl-4xl top-0 h-svh w-[278px] bg-gradient-to-r from-[#f4f4f4] via-[#f4f4f4] to-[#f0f0f0] dark:from-[#18181a] dark:via-[#18181a] dark:to-[#141416] z-[99999] flex flex-col"
                  >
                    {renderFlyoutContent(flyout, data, setFlyout)}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          </>
        )}
      </div>
    );
  }

  // Regular sidebar for non-icon modes
  return (
    <Sidebar
      side="left"
      variant={variant}
      collapsible={collapsible}
      className={cn("border-r", className)}
      {...props}
    >
      <SidebarHeader className="border-b">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

// Function to calculate student count percentage (placeholder for now)
const getStudentCountPercentage = () => {
  // TODO: Replace with actual student count logic
  // For now, return a mock percentage based on current students vs max capacity
  const currentStudents = 24; // Mock current student count
  const maxCapacity = 30; // Mock max capacity for teacher
  return (currentStudents / maxCapacity) * 100;
};

// Helper function to render flyout header based on style
const renderFlyoutHeader = (
  item: IconItem,
  setFlyout: (flyout: string | null) => void
) => {
  const headerStyle = item.flyoutHeaderStyle || "title";

  if (headerStyle === "button") {
    return (
      <div className="flex items-center justify-between mb-3">
        <StudentManagementDialogTrigger
          variant="button"
          className="text-sm flex-1 text-center rounded-xl py-1.5 font-manrope_1 font-medium text-white/80 dark:text-black/80 bg-gradient-to-b from-[#c7c7c7] via-[#d9d9d9] to-[#ececec] hover:from-[#b8b8b8] hover:via-[#cacaca] hover:to-[#dddddd] transition-all duration-200"
        >
          New Student
        </StudentManagementDialogTrigger>
        <div className="flex items-center gap-2 ml-2">
          <FlyoutTrigger className="" setFlyout={setFlyout} />
        </div>
      </div>
    );
  }

  // Default "title" style
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl text-left font-manrope_1 font-semibold text-black/80 dark:text-white/80">
        {item.label}
      </h2>
      <div className="flex items-center gap-2">
        <FlyoutTrigger className="" setFlyout={setFlyout} />
      </div>
    </div>
  );
};

// Custom FlyoutTrigger that closes the flyout but keeps IconButton active
const FlyoutTrigger = ({
  className,
  setFlyout
}: {
  className?: string;
  setFlyout: (flyout: string | null) => void;
}) => {
  return (
    <button
      onClick={() => setFlyout(null)} // Close flyout but keep IconButton active
      className={cn(
        "inline-flex items-center justify-center gap-2 w-4 h-4 text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white/90",
        className
      )}
    >
     <CollapseBarIcon/>
    </button>
  );
};

function renderFlyoutContent(flyout: string | null, data: any, setFlyout: (flyout: string | null) => void) {
  if (!flyout) return null;

  switch (flyout) {
    case "home":
      // Home has no flyout content - just navigation
      return null;

    case "calendar":
      return (
        <div className="flex py-2 flex-col h-full">
          <div className="p-2 px-4 border-b border-black/20 dark:border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl text-left font-manrope_1 font-semibold text-black/80 dark:text-white/80">
                Calendar
              </h2>
              <FlyoutTrigger className="" setFlyout={setFlyout} />
            </div>
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">
              View your schedule and upcoming events
            </p>
            <Link href="/teacher/calendar">
              <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full">
                Go to Calendar Page
              </a>
            </Link>
          </div>
        </div>
      );

       case "new":
      return (
        <div className="flex py-2 flex-col h-full">
          <div className="p-2 px-4 border-b border-black/20 dark:border-white/20 flex items-center justify-between">
            <button className="text-sm flex-1 text-center rounded-lg py-2 font-manrope_1 font-semibold text-white/80 dark:text-black/80 bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] dark:from-[#c7c7c7] dark:via-[#d9d9d9] dark:to-[#ececec]">
              New Assignment
            </button>
            <FlyoutTrigger className="ml-2" setFlyout={setFlyout} />
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent">
                New Student
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent">
                New Teacher
              </button>
              <button className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent">
                New Class
              </button>
            </div>
          </div>
        </div>
      );
    


    case "discover":
      return (
        <div className="flex py-2 flex-col h-full">
         <div className="p-2 px-4 border-b border-black/20 dark:border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl text-left font-manrope_1 font-semibold text-black/80 dark:text-white/80">
                Discover
              </h2>
              <FlyoutTrigger className="" setFlyout={setFlyout} />
            </div>
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">
              Explore new features and resources
            </p>
            <Link href="/teacher/discover">
              <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full mb-4">
                Go to Discover Page
              </a>
            </Link>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-2">
              <div className="p-3 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent cursor-pointer">
                <p className="text-sm font-medium">New Features</p>
              </div>
              <div className="p-3 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent cursor-pointer">
                <p className="text-sm font-medium">Training Resources</p>
              </div>
            </div>
          </div>
        </div>
      );

    case "classes":
      return (
        <div className="flex py-2 flex-col h-full">
          <div className="p-2 px-4 border-b border-black/20 dark:border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl text-left font-manrope_1 font-semibold text-black/80 dark:text-white/80">
                Classes
              </h2>
              <FlyoutTrigger className="" setFlyout={setFlyout} />
            </div>
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">
              Manage your classes and assignments
            </p>
            <Link href="/teacher/classes">
              <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full mb-4">
                Go to Classes Page
              </a>
            </Link>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <NavProjects
              projects={data.projects}
            />
          </div>
        </div>
      );

    case "status":
      return (
        <div className="flex py-2 flex-col h-full">
          <div className="p-2 px-4 border-b border-black/20 dark:border-white/20 flex items-center justify-between">
            <h2 className="text-xl text-left font-manrope_1 font-semibold text-black/80 dark:text-white/80">
              System Status
            </h2>
            <FlyoutTrigger className="" setFlyout={setFlyout} />
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">All Systems Operational</span>
                </div>
              </div>
              <div className="p-3 rounded-md bg-sidebar-accent/50">
                <p className="text-sm font-medium mb-1">Student Management</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">24/30 students enrolled</p>
              </div>
              <div className="p-3 rounded-md bg-sidebar-accent/50">
                <p className="text-sm font-medium mb-1">Class Sessions</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">5 active classes</p>
              </div>
              <div className="p-3 rounded-md bg-sidebar-accent/50">
                <p className="text-sm font-medium mb-1">Assignments</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">12 pending reviews</p>
              </div>
            </div>
          </div>
        </div>
      );

   

    case "students-gauge":
      const studentsItem = iconItems.find(item => item.id === "students-gauge");
      return (
        <div className="flex py-2 flex-col h-full">
          <div className="p-2 px-4 border-b border-black/20 dark:border-white/20">
            {studentsItem && renderFlyoutHeader(studentsItem, setFlyout)}
            <p className="text-sm text-black/60 dark:text-white/60 mb-4">
              Manage your students and view analytics
            </p>
            <Link href="/teacher/students">
              <a className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full mb-4">
                Go to Students Page
              </a>
            </Link>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-sidebar-accent/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Current Students</span>
                  <span className="text-lg font-bold">24</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Max Capacity</span>
                  <span className="text-lg font-bold">30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${getStudentCountPercentage()}%` } as React.CSSProperties}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {Math.round(getStudentCountPercentage())}% capacity used
                </p>
              </div>
              <div className="p-3 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent cursor-pointer">
                <p className="text-sm font-medium">Manage Students</p>
                <p className="text-xs text-gray-600">Add, remove, or edit student information</p>
              </div>
              <div className="p-3 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent cursor-pointer">
                <p className="text-sm font-medium">Student Analytics</p>
                <p className="text-xs text-gray-600">View performance and attendance data</p>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a panel</p>
        </div>
      );
  }
}