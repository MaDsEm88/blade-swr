"use client";
import { useRender } from '@base-ui-components/react/use-render';
import { mergeProps } from '@base-ui-components/react/merge-props';
import { cn } from "../../lib/utils";

interface SeparatorProps extends useRender.ComponentProps<'div'> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  'data-orientation'?: "horizontal" | "vertical";
}

function Separator({
  render = <div />,
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const defaultProps: useRender.ElementProps<'div'> & {
    'data-orientation': "horizontal" | "vertical";
    'aria-orientation'?: "horizontal" | "vertical";
    role?: "none" | "separator";
  } = {
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    ),
    role: decorative ? "none" : "separator",
    "aria-orientation": decorative ? undefined : orientation,
    "data-orientation": orientation,
  };

  const element = useRender({
    render,
    props: mergeProps<'div'>(defaultProps, props),
  });

  return element;
}

export { Separator };