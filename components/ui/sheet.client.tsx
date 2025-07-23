"use client";

import type { ComponentProps } from "react";
import { Dialog } from '@base-ui-components/react/dialog';
import { useRender } from '@base-ui-components/react/use-render';
import { mergeProps } from '@base-ui-components/react/merge-props';
import { XIcon } from "lucide-react";
import { cn } from "../../lib/utils";

// Sheet Root - wraps Dialog.Root
function Sheet({ ...props }: ComponentProps<typeof Dialog.Root>) {
  return <Dialog.Root data-slot="sheet" {...props} />;
}

// Sheet Trigger - wraps Dialog.Trigger
function SheetTrigger({
  ...props
}: ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger data-slot="sheet-trigger" {...props} />;
}

// Sheet Close - wraps Dialog.Close
function SheetClose({ ...props }: ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close data-slot="sheet-close" {...props} />;
}

// Sheet Portal - wraps Dialog.Portal
function SheetPortal({
  ...props
}: ComponentProps<typeof Dialog.Portal>) {
  return <Dialog.Portal data-slot="sheet-portal" {...props} />;
}

// Sheet Overlay - wraps Dialog.Backdrop
function SheetOverlay({
  className,
  ...props
}: ComponentProps<typeof Dialog.Backdrop>) {
  return (
    <Dialog.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:animate-in data-[open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

// Sheet Content - customized Dialog.Popup for sheet behavior
function SheetContent({
  className,
  children,
  side = "right",
  onOpenAutoFocus,
  onCloseAutoFocus,
  hideClose,
  ...props
}: ComponentProps<typeof Dialog.Popup> & {
  side?: "top" | "right" | "bottom" | "left";
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  hideClose?: boolean;
}) {
  // Filter out the custom props that shouldn't be passed to Dialog.Popup
  const dialogProps = { ...props };
  
  return (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[closed]:animate-out data-[closed]:duration-300 data-[open]:animate-in data-[open]:duration-500",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-[closed]:slide-out-to-right data-[open]:slide-in-from-right sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-[closed]:slide-out-to-left data-[open]:slide-in-from-left sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[closed]:slide-out-to-top data-[open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[closed]:slide-out-to-bottom data-[open]:slide-in-from-bottom",
          className,
        )}
        {...dialogProps}
      >
        {children}
        {!hideClose && (
          <Dialog.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        )}
      </Dialog.Popup>
    </SheetPortal>
  );
}

// Sheet Header - custom div with render prop support
interface SheetHeaderProps extends useRender.ComponentProps<'div'> {
  'data-slot'?: string;
}

function SheetHeader({ 
  render = <div />,
  className, 
  ...props 
}: SheetHeaderProps) {
  const defaultProps: useRender.ElementProps<'div'> & { 'data-slot': string } = {
    "data-slot": "sheet-header",
    className: cn("flex flex-col gap-1.5 p-4", className),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });

  return element;
}

// Sheet Footer - custom div with render prop support
interface SheetFooterProps extends useRender.ComponentProps<'div'> {
  'data-slot'?: string;
}

function SheetFooter({ 
  render = <div />,
  className, 
  ...props 
}: SheetFooterProps) {
  const defaultProps: useRender.ElementProps<'div'> & { 'data-slot': string } = {
    "data-slot": "sheet-footer",
    className: cn("mt-auto flex flex-col gap-2 p-4", className),
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });

  return element;
}

// Sheet Title - wraps Dialog.Title
function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

// Sheet Description - wraps Dialog.Description
function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};