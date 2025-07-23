"use client";
import { ComponentProps } from "react";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { cn } from "../../lib/utils";

function Avatar({
  className,
  render,
  ...props
}: ComponentProps<typeof BaseAvatar.Root>) {
  return (
    <BaseAvatar.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      render={render}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  render,
  ...props
}: ComponentProps<typeof BaseAvatar.Image>) {
  return (
    <BaseAvatar.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      render={render}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  render,
  ...props
}: ComponentProps<typeof BaseAvatar.Fallback>) {
  return (
    <BaseAvatar.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted",
        className,
      )}
      render={render}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };