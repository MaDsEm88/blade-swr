# Teacher Dialog Components

This folder contains dialog components specifically for the teacher application, keeping the main sidebar component clean and organized.

## Components

### StudentManagementDialog

A comprehensive dialog for adding new students to a teacher's class.

**Features:**
- Student information form (name, email, phone, class, grade)
- Form validation
- Integration with Blade framework mutations (TODO)
- Automatic invitation sending (TODO)
- Responsive design with dark mode support

**Usage:**
```tsx
import { StudentManagementDialog, StudentManagementDialogTrigger } from '../dialogs';

// As a trigger button
<StudentManagementDialogTrigger className="custom-class" />

// Or controlled
const [isOpen, setIsOpen] = useState(false);
<StudentManagementDialog isOpen={isOpen} onOpenChange={setIsOpen} />
```

## Integration with Sidebar

The dialog trigger is integrated into the students-gauge flyout in the dual-sidebar component:

```tsx
<div className="flex items-center gap-2">
  <StudentManagementDialogTrigger className="" />
  <FlyoutTrigger className="" setFlyout={setFlyout} />
</div>
```

## Future Enhancements

- [ ] Integrate with Blade mutations for actual student creation
- [ ] Add email invitation system
- [ ] Add student editing dialog
- [ ] Add class management dialogs
- [ ] Add bulk student import functionality
- [ ] Add student analytics dialogs

## Blade Framework Integration

This component follows Blade framework patterns:
- Uses client components (`.client.tsx`) for interactivity
- Ready for Blade mutations integration
- Follows Blade's server-first architecture principles
- Uses proper TypeScript patterns

## Styling

- Uses Tailwind CSS for styling
- Supports dark mode
- Follows the application's design system
- Uses `@base-ui-components/react/dialog` for accessibility
