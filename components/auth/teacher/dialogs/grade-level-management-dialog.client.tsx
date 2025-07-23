'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useMutation } from 'blade/client/hooks';
import { Dialog } from '@base-ui-components/react/dialog';
import { Switch } from '../../../animate-ui/base/switch';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '../../../ui/animate-ui/components/tabs';
import { GraduationCap, X, Plus, Settings } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface GradeLevelManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogTab = 'create' | 'contexts';

export function GradeLevelManagementDialog({ isOpen, onOpenChange }: GradeLevelManagementDialogProps) {
  const { user } = useAuth();
  const { add } = useMutation();
  const [activeTab, setActiveTab] = useState<DialogTab>('create');
  
  // Grade Level Form State
  const [gradeName, setGradeName] = useState('');
  const [gradeCode, setGradeCode] = useState('');
  const [gradeDescription, setGradeDescription] = useState('');
  const [gradeCategory, setGradeCategory] = useState('academic');
  const [educationType, setEducationType] = useState('traditional');
  const [sortOrder, setSortOrder] = useState(0);
  
  // Educational Context Form State
  const [contextName, setContextName] = useState('');
  const [contextType, setContextType] = useState('academic');
  const [contextDescription, setContextDescription] = useState('');
  const [defaultGrades, setDefaultGrades] = useState<string[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dialogInitializedRef = useRef(false);

  const resetForm = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setGradeName('');
    setGradeCode('');
    setGradeDescription('');
    setGradeCategory('academic');
    setEducationType('traditional');
    setSortOrder(0);
    setContextName('');
    setContextType('academic');
    setContextDescription('');
    setDefaultGrades([]);
    setMessage('');
    setMessageType('');
  }, []);

  const resetDialog = useCallback(() => {
    resetForm();
    setActiveTab('create');
  }, [resetForm]);

  // Reset dialog to initial state when first opened (not on every change)
  useEffect(() => {
    if (isOpen && !dialogInitializedRef.current) {
      // Only reset on first open, not on subsequent state changes
      dialogInitializedRef.current = true;
      resetDialog();
    } else if (!isOpen) {
      // Reset the flag when dialog is closed so it can be initialized again next time
      dialogInitializedRef.current = false;
    }
  }, [isOpen, resetDialog]);

  const handleCreateGradeLevel = async () => {
    if (!gradeName.trim()) {
      setMessage('Please enter a grade level name');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      // Create grade level using Blade mutation
      const newGradeLevel = await add.gradeLevels({
        with: {
          name: gradeName,
          code: gradeCode || undefined,
          description: gradeDescription || undefined,
          category: gradeCategory,
          educationType,
          sortOrder,
          teacherId: user?.id,
          isActive: true
        }
      });

      console.log('Grade level created successfully:', newGradeLevel);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('gradeLevelCreated', {
        detail: {
          gradeLevel: newGradeLevel
        }
      }));

      setMessage('Grade level created successfully!');
      setMessageType('success');

      // Reset dialog after success (including tab state)
      setTimeout(() => {
        resetDialog();
      }, 2000);

    } catch (error) {
      console.error('Error creating grade level:', error);
      setMessage('Failed to create grade level. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEducationalContext = async () => {
    if (!contextName.trim()) {
      setMessage('Please enter a context name');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      // Create educational context using Blade mutation
      const newContext = await add.educationalContexts({
        with: {
          name: contextName,
          type: contextType,
          description: contextDescription || undefined,
          defaultGradeLevels: JSON.stringify(defaultGrades),
          teacherId: user?.id,
          isActive: true
        }
      });

      console.log('Educational context created successfully:', newContext);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('educationalContextCreated', {
        detail: {
          context: newContext
        }
      }));

      setMessage('Educational context created successfully!');
      setMessageType('success');

      // Reset dialog after success (including tab state)
      setTimeout(() => {
        resetDialog();
      }, 2000);

    } catch (error) {
      console.error('Error creating educational context:', error);
      setMessage('Failed to create educational context. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined grade templates for different educational contexts
  const gradeTemplates = {
    traditional: [
      { name: '9th Grade', code: '9', description: 'Freshman year' },
      { name: '10th Grade', code: '10', description: 'Sophomore year' },
      { name: '11th Grade', code: '11', description: 'Junior year' },
      { name: '12th Grade', code: '12', description: 'Senior year' }
    ],
    vocational: [
      { name: 'Beginner', code: 'BEG', description: 'Basic level training' },
      { name: 'Intermediate', code: 'INT', description: 'Intermediate level training' },
      { name: 'Advanced', code: 'ADV', description: 'Advanced level training' },
      { name: 'Expert', code: 'EXP', description: 'Expert level training' }
    ],
    professional: [
      { name: 'Foundation', code: 'FOUND', description: 'Foundation level' },
      { name: 'Practitioner', code: 'PRAC', description: 'Practitioner level' },
      { name: 'Specialist', code: 'SPEC', description: 'Specialist level' },
      { name: 'Master', code: 'MAST', description: 'Master level' }
    ],
    certification: [
      { name: 'Level 1', code: 'L1', description: 'Basic certification level' },
      { name: 'Level 2', code: 'L2', description: 'Intermediate certification level' },
      { name: 'Level 3', code: 'L3', description: 'Advanced certification level' },
      { name: 'Instructor', code: 'INST', description: 'Instructor certification level' }
    ]
  };

  const applyTemplate = (templateType: keyof typeof gradeTemplates) => {
    const templates = gradeTemplates[templateType];
    if (templates && templates.length > 0) {
      const template = templates[0]; // Apply first template item
      if (template) {
        setGradeName(template.name);
        setGradeCode(template.code);
        setGradeDescription(template.description);
        setEducationType(templateType);
      }
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 opacity-100 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 z-[100000]" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-[96vw] md:max-w-[500px] max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-[#f2f2f2] via-[#e8e8e8] to-[#eeeeee] dark:from-[#101012] dark:via-[#18181a] dark:to-[#171719] text-gray-900 dark:text-gray-100 outline-1 outline-black/10 dark:outline-white/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 z-[100001] max-h-[90vh] overflow-hidden">

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as DialogTab)}
            className="w-full md:w-[500px] bg-muted rounded-lg"
          >
            <div className="pb-12">
              <TabsList
                className="grid w-full grid-cols-2 p-2 md:p-6"
                activeClassName="rounded-full border border-black/10 dark:border-white/10 shadow-sm shadow-black/10 dark:shadow-white/10 bg-gradient-to-r from-[#e1dfdf] via-[#d8d7d7] to-[#dad8d8] dark:from-[#242427] dark:via-[#232325] dark:to-[#202023]"
              >
                <TabsTrigger
                  value="create"
                  className="flex h-9 rounded-full items-center justify-center px-2 md:px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Create Grade Level
                </TabsTrigger>
                <TabsTrigger
                  value="contexts"
                  className="flex h-9 rounded-full items-center justify-center px-2 md:px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Educational Context
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContents className="mx-1 mb-1 -mt-2 rounded-sm h-full bg-background">
              {/* Create Grade Level Tab */}
              <TabsContent value="create" className="flex-1 px-6 pb-6 overflow-y-auto h-full">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">
                      Create New Grade Level
                    </h3>
                  </div>

                  {/* Quick Templates */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">
                      Quick Templates
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(gradeTemplates).map(([key, _templates]) => (
                        <button
                          key={key}
                          onClick={() => applyTemplate(key as keyof typeof gradeTemplates)}
                          className="p-2 text-xs font-manrope_1 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grade Level Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Grade Level Name *
                      </label>
                      <input
                        type="text"
                        value={gradeName}
                        onChange={(e) => setGradeName(e.target.value)}
                        placeholder="e.g., 9th Grade, Beginner, Level 1"
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Grade Code
                      </label>
                      <input
                        type="text"
                        value={gradeCode}
                        onChange={(e) => setGradeCode(e.target.value)}
                        placeholder="e.g., 9, BEG, L1"
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Description
                      </label>
                      <textarea
                        value={gradeDescription}
                        onChange={(e) => setGradeDescription(e.target.value)}
                        placeholder="Describe this grade level..."
                        rows={3}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                          Category
                        </label>
                        <select
                          value={gradeCategory}
                          onChange={(e) => setGradeCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                          disabled={isLoading}
                        >
                          <option value="academic">Academic</option>
                          <option value="vocational">Vocational</option>
                          <option value="professional">Professional</option>
                          <option value="certification">Certification</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                          Education Type
                        </label>
                        <select
                          value={educationType}
                          onChange={(e) => setEducationType(e.target.value)}
                          className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                          disabled={isLoading}
                        >
                          <option value="traditional">Traditional</option>
                          <option value="vocational">Vocational</option>
                          <option value="professional">Professional</option>
                          <option value="certification">Certification</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      />
                      <p className="text-[10px] font-manrope_1 text-black/60 dark:text-white/60 mt-1">
                        Lower numbers appear first in lists
                      </p>
                    </div>
                  </div>

                  {/* Message Display */}
                  {message && (
                    <div className={cn(
                      "p-3 rounded-md text-xs font-manrope_1",
                      messageType === 'success' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                      messageType === 'error' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}>
                      {message}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Educational Context Tab */}
              <TabsContent value="contexts" className="flex-1 px-6 pb-6 overflow-y-auto h-full">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">
                      Create Educational Context
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Context Name *
                      </label>
                      <input
                        type="text"
                        value={contextName}
                        onChange={(e) => setContextName(e.target.value)}
                        placeholder="e.g., Traditional High School, Fitness Certification"
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Context Type
                      </label>
                      <select
                        value={contextType}
                        onChange={(e) => setContextType(e.target.value)}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      >
                        <option value="academic">Academic</option>
                        <option value="vocational">Vocational</option>
                        <option value="professional">Professional</option>
                        <option value="certification">Certification</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80 mb-2">
                        Description
                      </label>
                      <textarea
                        value={contextDescription}
                        onChange={(e) => setContextDescription(e.target.value)}
                        placeholder="Describe this educational context..."
                        rows={3}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-manrope_1 text-xs"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Message Display */}
                  {message && (
                    <div className={cn(
                      "p-3 rounded-md text-xs font-manrope_1",
                      messageType === 'success' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                      messageType === 'error' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}>
                      {message}
                    </div>
                  )}
                </div>
              </TabsContent>
            </TabsContents>

            {/* Footer with Action Buttons */}
            <div className="px-6 py-4 border-t border-black/10 dark:border-white/10">
              <div className="flex justify-between items-center">
                <div className="text-xs font-manrope_1 text-black/80 dark:text-white/80">
                  {activeTab === 'create' ? 'Create grade levels for your students' : 'Define your educational context'}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-xs font-manrope_1 text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={activeTab === 'create' ? handleCreateGradeLevel : handleCreateEducationalContext}
                    disabled={isLoading || (activeTab === 'create' ? !gradeName.trim() : !contextName.trim())}
                    className={cn(
                      "px-4 py-2 text-xs font-manrope_1 rounded-md transition-colors",
                      isLoading || (activeTab === 'create' ? !gradeName.trim() : !contextName.trim())
                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                  >
                    {isLoading ? 'Creating...' : (activeTab === 'create' ? 'Create Grade Level' : 'Create Context')}
                  </button>
                </div>
              </div>
            </div>
          </Tabs>

          {/* Close button in top right */}
          <Dialog.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
