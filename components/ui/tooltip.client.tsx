"use client";

import type { ComponentProps } from "react";
import { Tooltip } from '@base-ui-components/react/tooltip';
import { cn } from "../../lib/utils";

function TooltipProvider({
  delay = 0,
  closeDelay = 0,
  timeout = 400,
  ...props
}: ComponentProps<typeof Tooltip.Provider>) {
  return (
    <Tooltip.Provider
      delay={delay}
      closeDelay={closeDelay}
      timeout={timeout}
      {...props}
    />
  );
}

function TooltipRoot({ 
  defaultOpen = false,
  delay = 600,
  closeDelay = 0,
  hoverable = true,
  ...props 
}: ComponentProps<typeof Tooltip.Root>) {
  return (
    <Tooltip.Root
      defaultOpen={defaultOpen}
      delay={delay}
      closeDelay={closeDelay}
      hoverable={hoverable}
      {...props}
    />
  );
}

function TooltipTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Tooltip.Trigger>) {
  return (
    <Tooltip.Trigger
      className={cn(className)}
      {...props}
    >
      {children}
    </Tooltip.Trigger>
  );
}

function TooltipContent({
  className,
  sideOffset = 8,
  side = "top",
  align = "center",
  children,
  ...props
}: ComponentProps<typeof Tooltip.Popup> & {
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}) {
  return (
    <Tooltip.Portal>
      <Tooltip.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
      >
        <Tooltip.Popup
          className={cn(
            "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        >
          {children}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  );
}

// Convenience wrapper that combines Root with the common structure
function TooltipWrapper({ 
  children, 
  content, 
  ...rootProps 
}: ComponentProps<typeof Tooltip.Root> & { 
  content: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <TooltipRoot {...rootProps}>
      <TooltipTrigger>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
}

export { 
  TooltipProvider, 
  TooltipRoot as Tooltip, 
  TooltipTrigger, 
  TooltipContent,
  TooltipWrapper
};