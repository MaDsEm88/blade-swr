'use client';
import { useState, useCallback, createContext, useContext } from 'react';
import { useCookie } from 'blade/hooks';

// Optimized sidebar state management for instant updates
export function useSidebarState() {
  // Get initial values from cookies (for persistence across page reloads)
  const [leftSidebarCookie, setLeftSidebarCookie] = useCookie('sidebar_left_state');
  const [rightSidebarCookie, setRightSidebarCookie] = useCookie('sidebar_right_state');
  const [activeFlyoutCookie, setActiveFlyoutCookie] = useCookie('sidebar_active_flyout');
  const [rightSidebarContentCookie, setRightSidebarContentCookie] = useCookie('sidebar_right_content');
  const [rightFlyoutOpenCookie, setRightFlyoutOpenCookie] = useCookie('sidebar_right_flyout_open');
  const [rightFlyoutContentCookie, setRightFlyoutContentCookie] = useCookie('sidebar_right_flyout_content');
  
  // Local state for immediate UI updates - initialized from cookies
  const [leftSidebarState, setLeftSidebarStateLocal] = useState(() => leftSidebarCookie || 'expanded');
  const [rightSidebarState, setRightSidebarStateLocal] = useState(() => rightSidebarCookie || 'collapsed');
  const [activeFlyout, setActiveFlyoutLocal] = useState(() => activeFlyoutCookie || '');
  const [rightSidebarContent, setRightSidebarContentLocal] = useState(() => rightSidebarContentCookie || '');

  // Persistent flyout state (now persisted across page reloads)
  const [isRightFlyoutOpen, setIsRightFlyoutOpenLocal] = useState(() => rightFlyoutOpenCookie === 'true');
  const [rightFlyoutContent, setRightFlyoutContentLocal] = useState<string | null>(() => rightFlyoutContentCookie || null);

  // Track if we've already cleared states for this session to prevent multiple clears
  const [hasCleared, setHasCleared] = useState(false);
  
  // Derived state
  const isLeftSidebarOpen = leftSidebarState === 'expanded';
  const isRightSidebarOpen = rightSidebarState === 'expanded';
  const isLeftSidebarHidden = leftSidebarState === 'hidden';

  // Left sidebar actions - INSTANT updates
  const toggleLeftSidebar = useCallback(() => {
    const newState = isLeftSidebarOpen ? 'collapsed' : 'expanded';
    setLeftSidebarStateLocal(newState);
    setLeftSidebarCookie(newState);
  }, [isLeftSidebarOpen, setLeftSidebarCookie]);

  const setLeftSidebarOpen = useCallback((open: boolean) => {
    const newState = open ? 'expanded' : 'collapsed';
    setLeftSidebarStateLocal(newState);
    setLeftSidebarCookie(newState);
  }, [setLeftSidebarCookie]);

  const hideLeftSidebar = useCallback(() => {
    setLeftSidebarStateLocal('hidden');
    setLeftSidebarCookie('hidden');
  }, [setLeftSidebarCookie]);

  const showLeftSidebar = useCallback(() => {
    setLeftSidebarStateLocal('expanded');
    setLeftSidebarCookie('expanded');
  }, [setLeftSidebarCookie]);

  // Right sidebar actions - INSTANT updates
  const toggleRightSidebar = useCallback((force?: boolean) => {
    const currentState = rightSidebarState === 'expanded';
    const newState = force !== undefined ? force : !currentState;
    const stateValue = newState ? 'expanded' : 'collapsed';
    
    // INSTANT updates - local state first, then cookie
    setRightSidebarStateLocal(stateValue);
    setRightSidebarCookie(stateValue);
    
    // Close flyout when sidebar closes
    if (!newState) {
      setIsRightFlyoutOpenLocal(false);
      setRightFlyoutContentLocal(null);
    }
  }, [rightSidebarState, setRightSidebarCookie]);

  const setRightSidebarOpen = useCallback((open: boolean) => {
    const stateValue = open ? 'expanded' : 'collapsed';
    
    // INSTANT updates - local state first, then cookie
    setRightSidebarStateLocal(stateValue);
    setRightSidebarCookie(stateValue);
    
    if (!open) {
      setIsRightFlyoutOpenLocal(false);
      setRightFlyoutContentLocal(null);
    }
  }, [setRightSidebarCookie]);

  const closeRightSidebar = useCallback(() => {
    // INSTANT updates - local state first, then cookie
    setRightSidebarStateLocal('collapsed');
    setRightSidebarCookie('collapsed');
    
    setIsRightFlyoutOpenLocal(false);
    setRightFlyoutContentLocal(null);
    setRightFlyoutOpenCookie('false');
    setRightFlyoutContentCookie('');
  }, [setRightSidebarCookie, setRightFlyoutOpenCookie, setRightFlyoutContentCookie]);

  // Flyout actions - INSTANT with persistence
  const openRightFlyout = useCallback((content: string) => {
    console.log('🔧 Store: Opening flyout with content:', content);
    setIsRightFlyoutOpenLocal(true);
    setRightFlyoutContentLocal(content);
    setRightFlyoutOpenCookie('true');
    setRightFlyoutContentCookie(content);
  }, [setRightFlyoutOpenCookie, setRightFlyoutContentCookie]);

  const closeRightFlyout = useCallback(() => {
    console.log('🔧 Store: Closing flyout');
    setIsRightFlyoutOpenLocal(false);
    setRightFlyoutContentLocal(null);
    setRightFlyoutOpenCookie('false');
    setRightFlyoutContentCookie('');
  }, [setRightFlyoutOpenCookie, setRightFlyoutContentCookie]);

  const toggleRightFlyout = useCallback((content?: string) => {
    if (isRightFlyoutOpen && rightFlyoutContent === content) {
      // Close if same content is clicked
      closeRightFlyout();
    } else if (content) {
      // Open with new content or switch content
      openRightFlyout(content);
    } else {
      // Toggle without content
      if (isRightFlyoutOpen) {
        closeRightFlyout();
      }
    }
  }, [isRightFlyoutOpen, rightFlyoutContent, closeRightFlyout, openRightFlyout]);

  // Content management - INSTANT updates
  const updateRightSidebarContent = useCallback((content: string | null) => {
    const contentValue = content || '';

    // INSTANT updates - local state first, then cookie
    setRightSidebarContentLocal(contentValue);
    setRightSidebarContentCookie(contentValue);
  }, [setRightSidebarContentCookie]);

  // Flyout management - INSTANT updates
  const updateActiveFlyout = useCallback((flyout: string | null) => {
    const flyoutValue = flyout || '';

    // INSTANT updates - local state first, then cookie
    setActiveFlyoutLocal(flyoutValue);
    setActiveFlyoutCookie(flyoutValue);
  }, [setActiveFlyoutCookie]);

  // Clear all sidebar and flyout states (for logout - resets everything to defaults)
  const clearAllSidebarStates = useCallback(() => {
    console.log('🧹 Clearing all sidebar and flyout states on logout');

    // Reset left sidebar to default
    setLeftSidebarStateLocal('expanded');
    setLeftSidebarCookie('expanded');

    // Reset right sidebar to default
    setRightSidebarStateLocal('collapsed');
    setRightSidebarCookie('collapsed');

    // Clear right sidebar content
    setRightSidebarContentLocal('');
    setRightSidebarContentCookie('');

    // Clear right flyouts
    setIsRightFlyoutOpenLocal(false);
    setRightFlyoutContentLocal(null);
    setRightFlyoutOpenCookie('false');
    setRightFlyoutContentCookie('');

    // Clear active flyout
    setActiveFlyoutLocal('');
    setActiveFlyoutCookie('');

    // Reset the cleared flag for next session
    setHasCleared(false);
  }, [setLeftSidebarCookie, setRightSidebarCookie, setRightSidebarContentCookie, setActiveFlyoutCookie, setRightFlyoutOpenCookie, setRightFlyoutContentCookie]);

  // Clear all sidebar and flyout states (simplified)
  const clearAllSidebarStatesOnce = useCallback(() => {
    if (hasCleared) {
      console.log('🧹 Sidebar states already cleared for this session, skipping');
      return;
    }

    console.log('🧹 Clearing all sidebar and flyout states');

    // Close right sidebar
    setRightSidebarStateLocal('collapsed');
    setRightSidebarCookie('collapsed');

    // Clear right sidebar content
    setRightSidebarContentLocal('');
    setRightSidebarContentCookie('');

    // Close right flyouts
    setIsRightFlyoutOpenLocal(false);
    setRightFlyoutContentLocal(null);
    setRightFlyoutOpenCookie('false');
    setRightFlyoutContentCookie('');

    // Clear active flyout
    setActiveFlyoutLocal('');
    setActiveFlyoutCookie('');

    // Mark as cleared to prevent multiple clears
    setHasCleared(true);
  }, [hasCleared, setRightSidebarCookie, setRightSidebarContentCookie, setActiveFlyoutCookie, setRightFlyoutOpenCookie, setRightFlyoutContentCookie]);

  return {
    // Left sidebar state
    isLeftSidebarOpen,
    isLeftSidebarHidden,
    leftSidebarState,
    toggleLeftSidebar,
    setLeftSidebarOpen,
    hideLeftSidebar,
    showLeftSidebar,

    // Right sidebar state
    isRightSidebarOpen,
    rightSidebarState,
    toggleRightSidebar,
    setRightSidebarOpen,
    closeRightSidebar,

    // Flyout state
    activeFlyout: activeFlyout || null,
    updateActiveFlyout,
    isRightFlyoutOpen,
    rightFlyoutContent,
    openRightFlyout,
    closeRightFlyout,
    toggleRightFlyout,

    // Content state
    rightSidebarContent: rightSidebarContent || null,
    updateRightSidebarContent,

    // Clear all states (for logout)
    clearAllSidebarStates,

    // Clear all states once (for fresh login)
    clearAllSidebarStatesOnce,
  };
}

// Hook for components that only need right flyout state
export function useRightFlyoutState() {
  const {
    isRightFlyoutOpen,
    rightFlyoutContent,
    openRightFlyout,
    closeRightFlyout,
    toggleRightFlyout,
  } = useSidebarState();

  return {
    isOpen: isRightFlyoutOpen,
    content: rightFlyoutContent,
    open: openRightFlyout,
    close: closeRightFlyout,
    toggle: toggleRightFlyout,
  };
}

// Hook for components that only need right sidebar state
export function useRightSidebarState() {
  const {
    isRightSidebarOpen,
    rightSidebarState,
    toggleRightSidebar,
    setRightSidebarOpen,
    closeRightSidebar,
    rightSidebarContent,
    updateRightSidebarContent,
  } = useSidebarState();

  return {
    isOpen: isRightSidebarOpen,
    state: rightSidebarState,
    toggle: toggleRightSidebar,
    setOpen: setRightSidebarOpen,
    close: closeRightSidebar,
    content: rightSidebarContent,
    setContent: updateRightSidebarContent,
  };
}

// Create a global context for shared state
const SidebarContext = createContext<ReturnType<typeof useSidebarState> | null>(null);

// Provider component
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebarState = useSidebarState();
  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook to use the shared context
export function useSharedSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSharedSidebarState must be used within a SidebarProvider');
  }
  return context;
}

// Hook for components that only need right flyout state (using shared context)
export function useSharedRightFlyoutState() {
  const {
    isRightFlyoutOpen,
    rightFlyoutContent,
    openRightFlyout,
    closeRightFlyout,
    toggleRightFlyout,
  } = useSharedSidebarState();

  return {
    isOpen: isRightFlyoutOpen,
    content: rightFlyoutContent,
    open: openRightFlyout,
    close: closeRightFlyout,
    toggle: toggleRightFlyout,
  };
}