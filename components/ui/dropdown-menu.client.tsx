"use client";

import * as React from "react";
import { useRender } from "@base-ui-components/react/use-render";
import { mergeProps } from "@base-ui-components/react/merge-props";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "../../lib/utils";

// Note: This is a conceptual conversion. Base UI may have different component names
// and APIs. You'll need to check the actual Base UI documentation for the correct
// dropdown/menu component imports and usage.

// Base UI dropdown components would be imported like:
// import { DropdownMenu as BaseDropdownMenu, ... } from "@base-ui-components/react/dropdown-menu";

interface DropdownMenuProps extends useRender.ComponentProps<'div'> {}

function DropdownMenu({ 
  render = <div />, 
  ...props 
}: DropdownMenuProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu',
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

function DropdownMenuPortal({ 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  // Base UI likely handles portals differently
  // This is a placeholder implementation
  return (
    <div data-slot="dropdown-menu-portal" {...props}>
      {children}
    </div>
  );
}

interface DropdownMenuTriggerProps extends useRender.ComponentProps<'button'> {}

function DropdownMenuTrigger({
  render = <button />,
  ...props
}: DropdownMenuTriggerProps) {
  const defaultProps: useRender.ElementProps<'button'> = {
    'data-slot': 'dropdown-menu-trigger',
  };

  const element = useRender({
    render,
    props: mergeProps<'button'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuContentProps extends useRender.ComponentProps<'div'> {
  sideOffset?: number;
}

function DropdownMenuContent({
  render = <div />,
  className,
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-content',
    className: cn(
      "z-50 max-h-96 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "animate-in fade-in-0 zoom-in-95",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });

  return (
    <DropdownMenuPortal>
      {element}
    </DropdownMenuPortal>
  );
}

interface DropdownMenuGroupProps extends useRender.ComponentProps<'div'> {}

function DropdownMenuGroup({
  render = <div />,
  ...props
}: DropdownMenuGroupProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-group',
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuItemProps extends useRender.ComponentProps<'div'> {
  inset?: boolean;
  variant?: "default" | "destructive";
}

function DropdownMenuItem({
  render = <div />,
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-item',
    'data-inset': inset,
    'data-variant': variant,
    className: cn(
      "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:!text-destructive",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuCheckboxItemProps extends useRender.ComponentProps<'div'> {
  checked?: boolean;
}

function DropdownMenuCheckboxItem({
  render = <div />,
  className,
  children,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-checkbox-item',
    className: cn(
      "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });

  return (
    <div {...defaultProps}>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </div>
  );
}

interface DropdownMenuRadioGroupProps extends useRender.ComponentProps<'div'> {}

function DropdownMenuRadioGroup({
  render = <div />,
  ...props
}: DropdownMenuRadioGroupProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-radio-group',
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuRadioItemProps extends useRender.ComponentProps<'div'> {
  value?: string;
  checked?: boolean;
}

function DropdownMenuRadioItem({
  render = <div />,
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-radio-item',
    className: cn(
      "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });

  return (
    <div {...defaultProps}>
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <CircleIcon className="size-2 fill-current" />
      </span>
      {children}
    </div>
  );
}

interface DropdownMenuLabelProps extends useRender.ComponentProps<'div'> {
  inset?: boolean;
}

function DropdownMenuLabel({
  render = <div />,
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-label',
    'data-inset': inset,
    className: cn(
      "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuSeparatorProps extends useRender.ComponentProps<'div'> {}

function DropdownMenuSeparator({
  render = <div />,
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-separator',
    className: cn("-mx-1 my-1 h-px bg-border", className),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuShortcutProps extends useRender.ComponentProps<'span'> {}

function DropdownMenuShortcut({
  render = <span />,
  className,
  ...props
}: DropdownMenuShortcutProps) {
  const defaultProps: useRender.ElementProps<'span'> = {
    'data-slot': 'dropdown-menu-shortcut',
    className: cn(
      "ml-auto text-xs tracking-widest text-muted-foreground",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'span'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuSubProps extends useRender.ComponentProps<'div'> {}

function DropdownMenuSub({
  render = <div />,
  ...props
}: DropdownMenuSubProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-sub',
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

interface DropdownMenuSubTriggerProps extends useRender.ComponentProps<'div'> {
  inset?: boolean;
}

function DropdownMenuSubTrigger({
  render = <div />,
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-sub-trigger',
    'data-inset': inset,
    className: cn(
      "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });

  return (
    <div {...defaultProps}>
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </div>
  );
}

interface DropdownMenuSubContentProps extends useRender.ComponentProps<'div'> {}

function DropdownMenuSubContent({
  render = <div />,
  className,
  ...props
}: DropdownMenuSubContentProps) {
  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'dropdown-menu-sub-content',
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
      className,
    ),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });
  return element;
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};