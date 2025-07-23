'use client';

import React, { useState } from 'react';
import { GradeLevelManagementDialog } from './grade-level-management-dialog.client';
import { GraduationCap, Plus } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface GradeLevelManagementDialogTriggerProps {
  className?: string;
  variant?: 'button' | 'icon' | 'text';
  children?: React.ReactNode;
}

export function GradeLevelManagementDialogTrigger({ 
  className, 
  variant = 'button',
  children 
}: GradeLevelManagementDialogTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  const renderTrigger = () => {
    if (children) {
      return (
        <button onClick={handleClick} className={className}>
          {children}
        </button>
      );
    }

    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={handleClick}
            className={cn(
              "p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors",
              className
            )}
            title="Create Grade Level"
          >
            <Plus className="w-5 h-5" />
          </button>
        );

      case 'text':
        return (
          <button
            onClick={handleClick}
            className={cn(
              "text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1",
              className
            )}
          >
            <GraduationCap className="w-4 h-4" />
            Create Grade Level
          </button>
        );

      case 'button':
      default:
        return (
          <button
            onClick={handleClick}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2",
              className
            )}
          >
            <GraduationCap className="w-4 h-4" />
            Create Grade Level
          </button>
        );
    }
  };

  return (
    <>
      {renderTrigger()}
      <GradeLevelManagementDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

export default GradeLevelManagementDialogTrigger;
