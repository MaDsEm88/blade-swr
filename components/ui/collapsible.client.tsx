"use client";

import type { ComponentProps } from "react";
import { Collapsible as BaseCollapsible } from '@base-ui-components/react/collapsible';

// Collapsible Root - wraps Base UI Collapsible.Root
function Collapsible({
  ...props
}: ComponentProps<typeof BaseCollapsible.Root>) {
  return <BaseCollapsible.Root data-slot="collapsible" {...props} />;
}

// Collapsible Trigger - wraps Base UI Collapsible.Trigger
function CollapsibleTrigger({
  ...props
}: ComponentProps<typeof BaseCollapsible.Trigger>) {
  return (
    <BaseCollapsible.Trigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

// Collapsible Content/Panel - wraps Base UI Collapsible.Panel
function CollapsibleContent({
  ...props
}: ComponentProps<typeof BaseCollapsible.Panel>) {
  return (
    <BaseCollapsible.Panel
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };