'use client';
import * as React from 'react';

// Inject CSS fallback styles immediately
const injectSquircleStyles = () => {
  if (typeof document === 'undefined') return;
  
  // Check if styles are already injected
  if (document.getElementById('squircle-fallback-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'squircle-fallback-styles';
  style.textContent = `
    /* Enhanced CSS-only Squircle fallback styles */
    .squircle {
      background: var(--squircle-background-color, #3b82f6);
      border: var(--squircle-border-width, 0) solid var(--squircle-border-color, transparent);
      border-radius: calc(var(--squircle-border-radius, 20px) * 0.65);
      transition: all 0.2s ease;
    }
    
    /* Ensure existing squircle classes work */
    .squircle-xs { --squircle-border-radius: 4px; border-radius: calc(var(--squircle-border-radius) * 0.65); }
    .squircle-sm { --squircle-border-radius: 6px; border-radius: calc(var(--squircle-border-radius) * 0.65); }
    .squircle-md { --squircle-border-radius: 8px; border-radius: calc(var(--squircle-border-radius) * 0.65); }
    .squircle-lg { --squircle-border-radius: 12px; border-radius: calc(var(--squircle-border-radius) * 0.65); }
    .squircle-xl { --squircle-border-radius: 16px; border-radius: calc(var(--squircle-border-radius) * 0.65); }
    .squircle-2xl { --squircle-border-radius: 20px; border-radius: calc(var(--squircle-border-radius) * 0.65); }
    .squircle-3xl { --squircle-border-radius: 24px; border-radius: calc(var(--squircle-border-radius) * 0.65); }
    
    /* Mask support fallback */
    .squircle-mask {
      border-radius: calc(var(--squircle-border-radius, 12px) * 0.65);
    }
    
    /* Active state styles */
    .squircle-active {
      --squircle-border-width: 1.5px;
      --squircle-border-color: #3e3e44;
      border: var(--squircle-border-width) solid var(--squircle-border-color);
    }
    
    /* Hover animations */
    .squircle:hover {
      --squircle-background-color: #2a2a2e;
      background: var(--squircle-background-color);
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ Squircle CSS fallback styles injected');
};

// Attempt squircle worklet initialization (non-blocking)
const initSquircle = async () => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Check if CSS.paintWorklet is supported
    const hasNativeSupport = 'paintWorklet' in CSS;
    
    if (!hasNativeSupport) {
      console.log('🎨 CSS Paint Worklet not supported, loading polyfill...');
      
      // Load polyfill with error handling
      try {
        await import('@squircle/paint-polyfill');
        console.log('🎨 Polyfill loaded successfully');
        
        // Give polyfill time to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (polyfillError) {
        console.log('🎨 Polyfill loading failed, using CSS fallback');
        return;
      }
    }

    // Dynamic import to avoid SSR bundling issues
    const { init } = await import('@squircle/core');
    
    // Initialize with shorter timeout to avoid hanging
    const initPromise = init();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Initialization timeout')), 3000)
    );
    
    await Promise.race([initPromise, timeoutPromise]);
    console.log('✅ Squircle worklet initialized successfully');
    
  } catch (error) {
    console.log('🎨 Squircle worklet failed, using CSS fallback (this is normal)');
    
    // Don't log errors as errors since CSS fallback works fine
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('ℹ️ Worklet module loading blocked - CSS fallback active');
    }
    
    // Don't throw - CSS fallback is already active
  }
};

export function SquircleProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);
  const initRef = React.useRef(false);

  // Ensure we're on the client side to avoid hydration issues
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient || initRef.current) return;
    initRef.current = true;

    // Inject CSS styles immediately for instant fallback
    injectSquircleStyles();
    
    // Try worklet initialization in background (non-blocking)
    initSquircle().catch(() => {
      // Ignore errors - CSS fallback is already active
    });
  }, [isClient]);

  // Always render children immediately - no blocking on squircle initialization
  return <>{children}</>;
}