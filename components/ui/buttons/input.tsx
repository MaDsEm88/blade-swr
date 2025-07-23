'use client';
 
import * as React from 'react';
import {forwardRef} from "react"
import {
  AnimatePresence,
  motion,
} from 'motion/react';
import type { HTMLMotionProps, Transition } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
 
type InputButtonContextType = {
  showInput: boolean;
  setShowInput: React.Dispatch<React.SetStateAction<boolean>>;
  transition: Transition;
  id: string;
};
const InputButtonContext = React.createContext<
  InputButtonContextType | undefined
>(undefined);
 
const useInputButton = (): InputButtonContextType => {
  const context = React.useContext(InputButtonContext);
  if (!context) {
    throw new Error('useInputButton must be used within a InputButton');
  }
  return context;
};
 
type InputButtonProviderProps = React.ComponentProps<'div'> &
  Partial<InputButtonContextType>;
 
function InputButtonProvider({
  className,
  transition = { type: 'spring', stiffness: 300, damping: 20 },
  showInput,
  setShowInput,
  id,
  ...props
}: InputButtonProviderProps) {
  const localId = React.useId();
  const [localShowInput, setLocalShowInput] = React.useState(false);
 
  return (
    <InputButtonContext.Provider
      value={{
        showInput: showInput ?? localShowInput,
        setShowInput: setShowInput ?? setLocalShowInput,
        transition,
        id: id ?? localId,
      }}
    >
      <div
        data-slot="input-button-provider"
        className={cn(
          'relative w-fit flex items-center justify-center h-10',
          (showInput || localShowInput) && 'w-full max-w-[400px]',
          className,
        )}
        {...props}
      />
    </InputButtonContext.Provider>
  );
}
 
type InputButtonProps = HTMLMotionProps<'div'>;
 
function InputButton({ className, ...props }: InputButtonProps) {
  return (
    <motion.div
      data-slot="input-button"
      className={cn('flex size-full text-black/80 dark:text-white/80 font-manrope_1 text-xs', className)}
      {...props}
    />
  );
}
 
type InputButtonActionProps = HTMLMotionProps<'button'>;
 
function InputButtonAction({ className, ...props }: InputButtonActionProps) {
  const { transition, setShowInput, id } = useInputButton();
 
  return (
    <motion.button
      data-slot="input-button-action"
      className={cn(
        'size-full selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground placeholder:text-black/60 dark:placeholder:text-white/60 inset-0  text-xs font-manrope_1 font-regular text-black/70 dark:text-white/70',
        className,
      )}
      layoutId={`input-button-action-${id}`}
      transition={transition}
      onClick={() => setShowInput((prev) => !prev)}
      {...props}
    />
  );
}
 
type InputButtonSubmitProps = HTMLMotionProps<'button'> & {
  icon?: React.ElementType;
  message?: string;
  messageType?: 'success' | 'error' | '';
  isSubmitting?: boolean;
  success?: boolean;
};
 
function InputButtonSubmit({
  className,
  children,
  icon: Icon = ArrowRight,
  message,
  messageType,
  isSubmitting,
  success,
  ...props
}: InputButtonSubmitProps) {
  const { transition, showInput, setShowInput, id } = useInputButton();

  // Determine if we should show the message state (expanded button)
  const showMessage = message && (messageType === 'success' || messageType === 'error');
  const shouldExpand = showInput || showMessage || isSubmitting || success;

  // Get background classes based on message type
  const getBackgroundClasses = () => {
    if (messageType === 'success') {
      return "bg-gradient-to-br from-zinc-100 via-zinc-200 to-green-50/40 text-green-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(34,197,94,0.3)_inset,0_0.5px_0_1.5px_rgba(34,197,94,0.2)_inset] dark:bg-gradient-to-r dark:from-[#212026] dark:via-[#212026] dark:to-green-950/40 dark:text-green-300 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgba(34,197,94,0.3)_inset,0_0.5px_0_1.5px_rgba(34,197,94,0.2)_inset]";
    }
    if (messageType === 'error') {
      return "bg-gradient-to-br from-zinc-100 via-zinc-200 to-red-50/40 text-red-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(239,68,68,0.3)_inset,0_0.5px_0_1.5px_rgba(239,68,68,0.2)_inset] dark:bg-gradient-to-r dark:from-[#212026] dark:via-[#212026] dark:to-red-950/40 dark:text-red-300 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgba(239,68,68,0.3)_inset,0_0.5px_0_1.5px_rgba(239,68,68,0.2)_inset]";
    }
    // Default background
    return "bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:text-zinc-50 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]";
  };

  return (
    <motion.button
      data-slot="input-button-submit"
      layoutId={`input-button-submit-${id}`}
      transition={transition}
      className={cn(
        "z-[1] [&_svg:not([class*='size-'])]:size-4 cursor-pointer disabled:pointer-events-none disabled:opacity-50 shrink-0 [&_svg]:shrink-0 outline-none rounded-full text-xs font-manrope_1 flex items-center justify-center font-medium absolute inset-y-[0.1rem] md:inset-y-1",
        // Position and sizing
        showMessage ? 'left-0.5 md:left-1 right-0.5 md:right-1 px-4' : shouldExpand ? 'right-0.5 md:right-1 px-4' : 'right-0.5 md:right-1 aspect-square',
        // Background styling
        getBackgroundClasses(),
        // Text wrapping for messages
        showMessage ? 'whitespace-normal text-center' : 'whitespace-nowrap',
        className,
      )}
      onClick={() => setShowInput((prev) => !prev)}
      {...props}
    >
      {showMessage ? (
        <motion.span
          key="message"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xs leading-tight"
        >
          {message}
        </motion.span>
      ) : shouldExpand ? (
        <motion.span
          key="show-button"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      ) : (
        <motion.span
          key="show-icon"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="size-4" />
        </motion.span>
      )}
    </motion.button>
  );
}
 
type InputButtonInputProps = React.ComponentProps<'input'>;
 
const InputButtonInput = forwardRef<HTMLInputElement, InputButtonInputProps>(
  ({ className, ...props }, ref) => {
    const { transition, showInput, id } = useInputButton();
 
    return (
      <AnimatePresence>
        {showInput && (
          <div className="absolute inset-0 size-full flex items-center justify-center">
            <motion.div
              layoutId={`input-button-input-${id}`}
              className="size-full flex items-center bg-transparent rounded-full relative"
              transition={transition}
            >
              <input
                data-slot="input-button-input"
                ref={ref}
                className={cn(
                  'size-full selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground placeholder:text-black/60 dark:placeholder:text-white/60 inset-0 pl-4 pr-32 py-2 text-xs font-manrope_1 font-regular bg-white/50 dark:bg-transparent rounded-full focus:outline-none absolute shrink-0 disabled:cursor-not-allowed text-black/90 dark:text-white/90',
                  // Prevent browser autofill styling
                  '[&:-webkit-autofill]:!bg-white/50 [&:-webkit-autofill]:dark:!bg-transparent [&:-webkit-autofill]:!text-black/90 [&:-webkit-autofill]:dark:!text-white/90',
                  '[&:-webkit-autofill:hover]:!bg-white/50 [&:-webkit-autofill:hover]:dark:!bg-transparent',
                  '[&:-webkit-autofill:focus]:!bg-white/50 [&:-webkit-autofill:focus]:dark:!bg-transparent',
                  '[&:-webkit-autofill:active]:!bg-white/50 [&:-webkit-autofill:active]:dark:!bg-transparent',
                  // Dark mode autofill dropdown styling
                  'dark:[color-scheme:dark]',
                  className,
                )}
                style={{
                  // Additional fallback for autofill styling
                  WebkitBoxShadow: '0 0 0 1000px transparent inset',
                  WebkitTextFillColor: 'inherit',
                  transition: 'background-color 5000s ease-in-out 0s',
                }}
                {...props}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  },
);
 
export {
  InputButton,
  InputButtonProvider,
  InputButtonAction,
  InputButtonSubmit,
  InputButtonInput,
  useInputButton,
  type InputButtonProps,
  type InputButtonProviderProps,
  type InputButtonActionProps,
  type InputButtonSubmitProps,
  type InputButtonInputProps,
};