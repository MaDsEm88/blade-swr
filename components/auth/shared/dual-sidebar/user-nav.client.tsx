'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../../lib/utils';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { useSharedSidebarState, useSharedRightFlyoutState } from '../../../../stores/sidebar-store.client';
import { Avatar, AvatarImage, AvatarFallback } from '../../../ui/avatar.client';
import { useSimpleSession  } from '../../../../lib/auth-client';
import { Image } from 'blade/client/components';

interface UserNavClientProps {
  user: any; // The user data from Blade's reactive system
}
import { useUserInitials } from '../../../../hooks/useAvatarUpdate';

// Import the proper getImageUrl function
import { getImageUrl } from '../../../../lib/utils/image';
import { 
  ChevronDown, 
  Settings, 
  Bell, 
  User,
  LogOut,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface UserNavProps {
  onOpenUserInfo?: () => void;
  onOpenSettings?: () => void;
  onOpenNotifications?: () => void;
  className?: string;
  user?: any; // User data from Blade's reactive system
}

export function UserNav({
  onOpenUserInfo,
  onOpenSettings,
  onOpenNotifications,
  className,
  user: propUser
}: UserNavProps) {
  const isMobile = useIsMobile();
  const { session } = useSimpleSession();
  // Use the user from props (Blade reactive data) if available, otherwise fall back to session
  const user = propUser || session?.user;
  const userInitials = useUserInitials(user?.name);

  // Debug: Log user image data
  const processedImageUrl = getImageUrl(user?.image);
  console.log('🖼️ UserNav - User image data:', {
    hasUser: !!user,
    imageType: typeof user?.image,
    imageValue: user?.image,
    imageUrl: processedImageUrl,
    constructedUrl: user?.image ? `https://storage.ronin.co/${typeof user.image === 'string' ? user.image : (user.image as any).src}` : null,
    fullUser: user // Log the full user object to see all fields
  });
  
  // Get sidebar state
  const { 
    isRightSidebarOpen, 
    toggleRightSidebar, 
    updateRightSidebarContent, 
    setRightSidebarOpen,
    rightSidebarContent,
    closeRightSidebar
  } = useSharedSidebarState();
  
  // Get flyout state (using shared context)
  const { isOpen: isRightFlyoutOpen, close: closeRightFlyout } = useSharedRightFlyoutState();
  
  // State for individual button hovers - MOVED BEFORE EARLY RETURN
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [isNotificationsHovered, setIsNotificationsHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);

  // Check active states based on current content - MOVED BEFORE EARLY RETURN
  const isSettingsActive = useMemo(() => {
    return isRightSidebarOpen && rightSidebarContent === 'settings';
  }, [isRightSidebarOpen, rightSidebarContent]);

  const isNotificationsActive = useMemo(() => {
    return isRightSidebarOpen && rightSidebarContent === 'notifications';
  }, [isRightSidebarOpen, rightSidebarContent]);

  const isUserInfoActive = useMemo(() => {
    return isRightSidebarOpen && rightSidebarContent === 'user-info';
  }, [isRightSidebarOpen, rightSidebarContent]);

  // Main user button should show active state when user-info is showing
  const isMainUserButtonActive = useMemo(() => {
    return isUserInfoActive;
  }, [isUserInfoActive]);

  // FIXED: Handle main user button click with proper toggle behavior
  const handleUserClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    console.log('🎯 UserNav - Main button clicked', { 
      type: e.type,
      isRightSidebarOpen, 
      rightSidebarContent,
      isUserInfoActive,
      hasOnOpenUserInfo: !!onOpenUserInfo,
      timestamp: Date.now()
    });

    e.preventDefault();
    e.stopPropagation();
    
    if (onOpenUserInfo) {
      console.log('📱 Using onOpenUserInfo callback');
      onOpenUserInfo();
    } else {
      if (isRightSidebarOpen) {
        // Only close if we're already showing user-info content
        if (rightSidebarContent === 'user-info') {
          console.log('📱 User-info already active - closing sidebar');
          closeRightSidebar();
          if (isRightFlyoutOpen) {
            console.log('🎯 Also closing flyout...');
            closeRightFlyout();
          }
        } else {
          // Switch to user-info content without closing
          console.log('📱 Sidebar open with different content - switching to user-info');
          updateRightSidebarContent('user-info');
        }
      } else {
        // If sidebar is closed, open it with user-info content
        console.log('📱 Sidebar is closed - opening with user-info');
        console.log('📱 Setting content to user-info...');
        updateRightSidebarContent('user-info');
        console.log('📱 Opening sidebar...');
        setRightSidebarOpen(true);
        console.log('📱 Open commands sent');
      }
    }
  }, [
    onOpenUserInfo, 
    isRightSidebarOpen, 
    rightSidebarContent,
    isUserInfoActive,
    updateRightSidebarContent, 
    setRightSidebarOpen,
    closeRightSidebar,
    isRightFlyoutOpen,
    closeRightFlyout
  ]);

  // FIXED: Handle settings click with proper state management
  const handleSettingsClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 UserNav - Settings clicked', { 
      hasOnOpenSettings: !!onOpenSettings,
      isRightSidebarOpen,
      rightSidebarContent 
    });
    
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      if (isRightSidebarOpen && rightSidebarContent === 'settings') {
        // If settings is already showing, close the sidebar
        console.log('📱 Settings already active - closing sidebar');
        closeRightSidebar();
        if (isRightFlyoutOpen) {
          closeRightFlyout();
        }
      } else {
        // Either sidebar is closed or showing different content - show settings
        console.log('📱 Opening/switching to settings');
        updateRightSidebarContent('settings');
        if (!isRightSidebarOpen) {
          setRightSidebarOpen(true);
        }
      }
    }
  }, [
    onOpenSettings, 
    isRightSidebarOpen, 
    rightSidebarContent,
    updateRightSidebarContent, 
    setRightSidebarOpen,
    closeRightSidebar,
    isRightFlyoutOpen,
    closeRightFlyout
  ]);

  // FIXED: Handle notifications click with proper state management
  const handleNotificationsClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 UserNav - Notifications clicked', { 
      hasOnOpenNotifications: !!onOpenNotifications,
      isRightSidebarOpen,
      rightSidebarContent 
    });
    
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      if (isRightSidebarOpen && rightSidebarContent === 'notifications') {
        // If notifications is already showing, close the sidebar
        console.log('📱 Notifications already active - closing sidebar');
        closeRightSidebar();
        if (isRightFlyoutOpen) {
          closeRightFlyout();
        }
      } else {
        // Either sidebar is closed or showing different content - show notifications
        console.log('📱 Opening/switching to notifications');
        updateRightSidebarContent('notifications');
        if (!isRightSidebarOpen) {
          setRightSidebarOpen(true);
        }
      }
    }
  }, [
    onOpenNotifications, 
    isRightSidebarOpen, 
    rightSidebarContent,
    updateRightSidebarContent, 
    setRightSidebarOpen,
    closeRightSidebar,
    isRightFlyoutOpen,
    closeRightFlyout
  ]);

  // Touch handlers for better mobile control
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    console.log('👆 Touch start:', { isOpen: isRightSidebarOpen });
    setIsTouchActive(true);
  }, [isRightSidebarOpen]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    console.log('👆 Touch end:', { isOpen: isRightSidebarOpen, isTouchActive });
    
    if (isTouchActive) {
      setIsTouchActive(false);
      // Don't call handleUserClick here, let the onClick handle it
    }
  }, [isRightSidebarOpen, isTouchActive]);

  const handleTouchCancel = useCallback(() => {
    console.log('👆 Touch cancelled');
    setIsTouchActive(false);
  }, []);

  // Settings touch handlers
  const handleSettingsTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSettingsClick(e);
  }, [handleSettingsClick]);

  // Notifications touch handlers
  const handleNotificationsTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleNotificationsClick(e);
  }, [handleNotificationsClick]);

  const navContent = (
    <>
      {/* External tooltips positioned correctly under each button */}
      {/* Notifications Tooltip */}
     <div 
  className="fixed bg-gradient-to-b from-[#e8e8e8] via-[#e8e8e8] to-[#d8d8d8] dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] px-3 text-sm leading-8 text-black/90 dark:text-white/90 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(200_200_200)_inset,0_0.5px_0_1.5px_#a1a1aa_inset] dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] rounded-full pointer-events-none transition-all duration-100 ease-out whitespace-nowrap"
  style={{
    top: '3rem',
    right: '15.25rem',
    zIndex: 100000001,
    opacity: isNotificationsHovered && !isNotificationsActive && isRightSidebarOpen ? 1 : 0,
    transform: `translate(50%, ${isNotificationsHovered && !isNotificationsActive && isRightSidebarOpen ? '0' : '-8px'})`,
    backdropFilter: 'blur(10px)',
    boxShadow: document.documentElement.classList.contains('dark') 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
  }}
>
  Notifications
  <div 
    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0"
    style={{
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: document.documentElement.classList.contains('dark')
        ? '6px solid #29282e'
        : '6px solid #d8d8d8',
    }}
  />
</div>

{/* Settings Tooltip */}
<div 
  className="fixed bg-gradient-to-b from-[#e8e8e8] via-[#e8e8e8] to-[#d8d8d8] dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] px-3 text-sm leading-8 text-black/90 dark:text-white/90 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(200_200_200)_inset,0_0.5px_0_1.5px_#a1a1aa_inset] dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] rounded-full pointer-events-none transition-all duration-100 ease-out whitespace-nowrap"
  style={{
    top: '3rem',
    right: '13rem',
    zIndex: 100000001,
    opacity: isSettingsHovered && !isSettingsActive && isRightSidebarOpen ? 1 : 0,
    transform: `translate(50%, ${isSettingsHovered && !isSettingsActive && isRightSidebarOpen ? '0' : '-8px'})`,
    backdropFilter: 'blur(10px)',
    boxShadow: document.documentElement.classList.contains('dark') 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
  }}
>
  Settings
  <div 
    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0"
    style={{
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: document.documentElement.classList.contains('dark')
        ? '6px solid #29282e'
        : '6px solid #d8d8d8',
    }}
  />
</div>

      {/* Main UserNav Container - FIXED: Dynamic z-index based on flyout state */}
      <div className={cn(
        "fixed top-2 right-2 flex items-center gap-1 p-1",
        className
      )}
      style={{
        zIndex: isMobile ? (isRightFlyoutOpen ? 99998 : 100001) : 100000000
      }}>
        {/* Quick Actions - Show when sidebar is open */}
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden flex items-center gap-1"
              style={{ 
                pointerEvents: 'auto',
                touchAction: 'manipulation'
              }}
            >
              {/* Notifications Button */}
              <div className="relative group">
               <button
    onClick={handleNotificationsClick}
    onTouchEnd={isMobile ? handleNotificationsTouch : undefined}
    onMouseEnter={() => setIsNotificationsHovered(true)}
    onMouseLeave={() => setIsNotificationsHovered(false)}
    className={cn(
      "relative w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 active:scale-[0.98]",
      "touch-manipulation select-none outline-none z-20",
      isNotificationsActive
        ? 'bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:text-zinc-50 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
    )}
    aria-pressed={isNotificationsActive}
    type="button"
  >
    <Bell
      className={cn(
        "w-4 h-4 transition-colors duration-200",
        isNotificationsActive
          ? "text-zinc-800 dark:text-zinc-200"
          : isNotificationsHovered
          ? "text-zinc-700 dark:text-zinc-300"
          : "text-zinc-500 dark:text-zinc-400"
      )}
    />
  </button>
  {/* Active indicator */}
  <div 
    className="absolute left-[24px] md:left-[19px] bottom-1 md:-bottom-0 transform -translate-x-1/2 transition-all duration-150 ease-out z-20"
    style={{
      opacity: isNotificationsActive ? 1 : 0,
      transform: `translateX(-50%) scale(${isNotificationsActive ? 1 : 0.8})`,
    }}
  >
    <div 
      className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"
      style={{
        boxShadow: document.documentElement.classList.contains('dark')
          ? '0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3)'
          : '0 0 12px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 0, 0, 0.3)',
        filter: 'blur(0.5px)',
      }}
    />
  </div>
</div>

{/* Settings Button */}
<div className="relative group">
  <button
    onClick={handleSettingsClick}
    onTouchEnd={isMobile ? handleSettingsTouch : undefined}
    onMouseEnter={() => setIsSettingsHovered(true)}
    onMouseLeave={() => setIsSettingsHovered(false)}
    className={cn(
      "relative w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 active:scale-[0.98]",
      "touch-manipulation select-none outline-none z-20",
      isSettingsActive
        ? 'bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:text-zinc-50 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
    )}
    aria-pressed={isSettingsActive}
    type="button"
  >
    <Settings
      className={cn(
        "w-4 h-4 transition-colors duration-200",
        isSettingsActive
          ? "text-zinc-800 dark:text-zinc-200"
          : isSettingsHovered
          ? "text-zinc-700 dark:text-zinc-300"
          : "text-zinc-500 dark:text-zinc-400"
      )}
    />
  </button>

                {/* Active indicator */}
                <div 
                  className="absolute left-[24px] md:left-[19px] bottom-1 md:-bottom-0 transform -translate-x-1/2 transition-all duration-150 ease-out z-20"
                  style={{
                    opacity: isSettingsActive ? 1 : 0,
                    transform: `translateX(-50%) scale(${isSettingsActive ? 1 : 0.8})`,
                  }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"
                    style={{
                      boxShadow: '0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3)',
                      filter: 'blur(0.5px)',
                    }}
                  />
                </div>
              </div>
              
              <div className="w-px h-4 bg-black/20 dark:bg-white/20 mx-1" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIXED: Main User Button with improved touch handling */}
        <div 
          className={cn(
            "flex py-1.5 items-center gap-2 rounded-full px-2 transition-colors select-none relative",
            "hover:bg-black/5 dark:hover:bg-white/5 ",
            isTouchActive && "bg-black/10 dark:bg-white/10", // Visual feedback for touch
            isMainUserButtonActive && "bg-black/10 dark:bg-white/10" // Active state when user-info is showing
          )}
          role="button"
          tabIndex={0}
          aria-label={`${isRightSidebarOpen ? 'Close' : 'Open'} user menu`}
          onClick={handleUserClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onMouseEnter={() => setIsUserHovered(true)}
          onMouseLeave={() => setIsUserHovered(false)}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'manipulation',
            cursor: 'pointer',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Chevron */}
          <ChevronDown 
            className={cn(
              "w-3 h-3 text-black/70 dark:text-white/70 transition-transform duration-200 pointer-events-none",
              isRightSidebarOpen && "rotate-180"
            )}
          />
          
          {/* User Name - Show when sidebar is open on large devices */}
          <AnimatePresence>
            {isRightSidebarOpen && !isMobile && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden relative z-[100000001]"
                style={{ zIndex: 100000001 }}
              >
                <span className="font-medium font-manrope_1 text-xs text-black/80 dark:text-white/80 whitespace-nowrap pl-2 pointer-events-none">
                  {user?.name || user?.email || 'User'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Avatar */}
          <div className="relative">
           <Avatar className="h-8 w-8 ring-2 ring-black/20 dark:ring-white/20 pointer-events-none relative overflow-hidden">
  {user?.image ? (
    <>
      {console.log('🖼️ Rendering Blade Image with StoredObject:', user.image)}
      <Image
        src={user.image}
        alt={user?.name || user?.email}
        width={32}
        height={32}
        className="h-full w-full object-cover rounded-full"
      />
    </>
  ) : (
    <>
      {console.log('🚫 No user image, showing fallback')}
      {null}
    </>
  )}
  <AvatarFallback className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 dark:from-blue-500 dark:via-indigo-600 dark:to-purple-600 text-white font-manrope_1 font-semibold relative">
    {/* Light mode overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 dark:hidden" />
    {/* Dark mode overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 hidden dark:block" />
    {/* Subtle inner glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50 dark:opacity-30" />
    <span className="relative z-10">{userInitials}</span>
  </AvatarFallback>
</Avatar>
            {/* Active indicator for main user button */}
            <div 
              className="absolute left-[19px] -bottom-0.5 transform -translate-x-1/2 transition-all duration-150 ease-out z-20"
              style={{
                opacity: isMainUserButtonActive ? 1 : 0,
                transform: `translateX(-50%) scale(${isMainUserButtonActive ? 1 : 0.8})`,
              }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"
                style={{
                  boxShadow: '0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3)',
                  filter: 'blur(0.5px)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile && typeof window !== 'undefined') {
    return createPortal(navContent, document.body);
  }

  return navContent;
}
