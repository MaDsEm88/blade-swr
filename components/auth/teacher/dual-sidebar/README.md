# Enhanced Dual Sidebar for Blade Framework

This is a comprehensive dual sidebar solution for Blade framework, inspired by TanStack Start's `_root.tsx` layout pattern. It provides a sophisticated layout system with left icon-based navigation and right content panels, both supporting expandable flyouts.

## 🚀 Features

### Left Sidebar (Icon Mode)
- **Icon Rail**: Compact 72px width with glassmorphism effects
- **Flyout Panels**: Expandable 278px panels for detailed navigation
- **Hover Tooltips**: Smooth animations with proper positioning
- **Active States**: Glow effects and scale transforms
- **Mobile Responsive**: Sheet component integration for mobile devices
- **Z-Index Management**: Proper layering for complex layouts

### Right Sidebar & UserNav
- **UserNav Component**: Fixed top-right navigation with avatar
- **Content Panels**: User info, Settings, Notifications
- **Nested Flyouts**: Additional 350px flyouts for detailed content
- **Quick Actions**: Settings and notifications buttons with tooltips
- **Mobile Support**: Backdrop and touch handling
- **State Persistence**: Cookie-based state management

### Layout System
- **Dynamic Margins**: Automatic content area adjustments
- **Responsive Design**: Mobile-first approach with breakpoints
- **Smooth Transitions**: 300ms ease-in-out animations
- **Squircle Integration**: Smooth rounded corners throughout
- **Blade Optimized**: Uses Blade's native hooks and patterns

## 📁 File Structure

```
components/auth/school/dual-sidebar/
├── enhanced-sidebar.client.tsx     # Main sidebar wrapper component
├── layout-wrapper.client.tsx       # Root layout wrapper (like _root.tsx)
├── app-sidebar.client.tsx          # Left sidebar with icon mode
├── right-sidebar.tsx               # Right sidebar with flyouts
├── user-nav.client.tsx             # User navigation component
├── header.client.tsx               # Header component
├── nav-main.client.tsx             # Main navigation items
├── nav-projects.client.tsx         # Projects navigation
├── nav-user.client.tsx             # User navigation menu
├── team-switcher.client.tsx        # Team switching component
├── index.tsx                       # Component exports
└── README.md                       # This file
```

## 🛠 Installation & Setup

### 1. State Management
The sidebar uses Blade's native `useCookie` hook for persistent state:

```typescript
// stores/sidebar-store.client.tsx
import { useCookie } from 'blade/hooks';

export function useSidebarState() {
  const [leftSidebarState, setLeftSidebarState] = useCookie('sidebar_left_state', 'expanded');
  const [rightSidebarState, setRightSidebarState] = useCookie('sidebar_right_state', 'collapsed');
  // ... more state management
}
```

### 2. Required Dependencies
Ensure you have these components in your `components/ui/` directory:
- `sidebar.client.tsx`
- `sheet.client.tsx`
- `avatar.client.tsx`
- `badge.client.tsx`
- `button.tsx`
- `dropdown-menu.client.tsx`

### 3. Provider Setup
The sidebar includes its own providers:
- `SquircleProvider` for smooth rounded corners
- `SidebarProvider` for sidebar context

## 🎯 Usage

### Basic Usage (Similar to TanStack _root.tsx)

```typescript
// pages/your-page.tsx
import { LayoutWrapper } from '../components/auth/school/dual-sidebar';

export default function YourPage() {
  return (
    <LayoutWrapper>
      <YourPageContent />
    </LayoutWrapper>
  );
}
```

### Advanced Usage with Custom Props

```typescript
// pages/dashboard.tsx
import { LayoutWrapper } from '../components/auth/school/dual-sidebar';

export default function Dashboard() {
  return (
    <LayoutWrapper 
      showUserNav={true}
      showHeader={true}
      className="custom-layout"
    >
      <DashboardContent />
    </LayoutWrapper>
  );
}
```

### Using Individual Components

```typescript
// For custom layouts
import { 
  EnhancedSidebar, 
  UserNav, 
  AppSidebar 
} from '../components/auth/school/dual-sidebar';

export default function CustomLayout() {
  return (
    <EnhancedSidebar showUserNav={false}>
      <CustomUserNav />
      <YourContent />
    </EnhancedSidebar>
  );
}
```

## 🎨 Layout Calculations

### Left Sidebar Margins
- **Icon only**: `ml-[4.5rem]` (72px)
- **With flyout**: `ml-[356px]` (72px + 284px)
- **Mobile**: `ml-[4.5rem]` (Sheet overlay)

### Right Sidebar Margins
- **Sidebar only**: `mr-[350px]`
- **With flyout**: `mr-[700px]` (350px + 350px)
- **Mobile**: `mr-[90vw]` or `sm:mr-[350px]`

## 🔧 Customization

### Adding New Left Sidebar Items

```typescript
// In app-sidebar.client.tsx
const iconItems = [
  {
    id: "your-item",
    icon: YourIcon,
    label: "Your Item",
    tooltip: "Your Tooltip",
    section: 2 // 1=notifications, 2=navigation, 3=create
  },
  // ... existing items
];
```

### Adding New Right Sidebar Content

```typescript
// In right-sidebar.tsx
const mainContent = useMemo(() => {
  switch (content) {
    case 'your-content':
      return <YourCustomContent />;
    // ... existing cases
  }
}, [content]);
```

### Custom UserNav Actions

```typescript
// In your page component
import { useSidebarState } from '../stores/sidebar-store.client';

function YourComponent() {
  const { updateRightSidebarContent, toggleRightSidebar } = useSidebarState();
  
  const handleCustomAction = () => {
    updateRightSidebarContent('your-custom-content');
    toggleRightSidebar();
  };
}
```

## 📱 Mobile Responsiveness

The sidebar automatically adapts to mobile devices:

- **Left Sidebar**: Converts to Sheet overlay
- **Right Sidebar**: Full-screen Sheet with backdrop
- **UserNav**: Simplified layout with touch optimization
- **Flyouts**: Mobile-optimized positioning and gestures

## 🎭 Animation System

### Transition Timings
- **Sidebar open/close**: 300ms ease-in-out
- **Flyout animations**: Spring physics with Motion
- **Hover effects**: 500ms ease-out
- **Scale transforms**: GPU-accelerated

### Motion Configuration
```typescript
// Spring animation for flyouts
transition={{
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8
}}
```

## 🔍 State Management

### Available State
```typescript
const {
  // Left sidebar
  isLeftSidebarOpen,
  activeFlyout,
  updateActiveFlyout,
  
  // Right sidebar
  isRightSidebarOpen,
  rightSidebarContent,
  isRightFlyoutOpen,
  
  // Actions
  toggleRightSidebar,
  updateRightSidebarContent,
  openRightFlyout,
  closeRightFlyout,
} = useSidebarState();
```

### Persistence
State is automatically persisted using Blade's `useCookie`:
- Left sidebar state
- Right sidebar state
- Active flyout
- Right sidebar content

## 🚀 Performance Optimizations

- **Memoized Calculations**: Layout styles are memoized
- **Stable References**: Callback functions use useCallback
- **Conditional Rendering**: Components only render when needed
- **GPU Acceleration**: Transform animations use transform-gpu
- **Lazy Loading**: Flyout content loads on demand

## 🔧 Troubleshooting

### Common Issues

1. **Sidebar not showing**: Check if `useSidebarState` is properly imported
2. **Layout jumping**: Ensure all required CSS classes are available
3. **Mobile issues**: Verify Sheet component is properly configured
4. **Z-index conflicts**: Check the z-index hierarchy in your CSS

### Debug Mode
Add this to see current state:
```typescript
const sidebarState = useSidebarState();
console.log('Sidebar State:', sidebarState);
```

## 🎯 Integration with TanStack Pattern

This implementation follows the TanStack Start `_root.tsx` pattern:

### TanStack Start
```typescript
// __root.tsx
export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Sidebar />
    </RootDocument>
  );
}
```

### Blade Equivalent
```typescript
// Using LayoutWrapper
export default function YourPage() {
  return (
    <LayoutWrapper>
      <YourContent />
    </LayoutWrapper>
  );
}
```

## 📚 Examples

See `pages/test-sidebar.tsx` for a comprehensive example demonstrating:
- All sidebar features
- State management
- Mobile responsiveness
- Custom content panels
- Performance monitoring

## 🤝 Contributing

When adding new features:
1. Follow the existing component patterns
2. Add proper TypeScript types
3. Include mobile responsiveness
4. Test with different screen sizes
5. Update this README

## 📄 License

This component system is part of the Blade framework project.