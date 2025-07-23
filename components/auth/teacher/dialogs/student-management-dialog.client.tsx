'use client';

import { useState, useRef, useCallback } from 'react';

import { useAuth } from '../../../../hooks/useAuth';
import { Dialog } from '@base-ui-components/react/dialog';
import { Switch } from '../../../animate-ui/base/switch';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '../../../ui/animate-ui/components/tabs';
import { UserPlus, X, Users, School, Trash2, Check, User, Mail, AtSign, UserCheck, ChevronDown, GraduationCap } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '../../../animate-ui/base/accordion';
import { cn } from '../../../../lib/utils';
import { useRedirect } from 'blade/hooks';
import {
  InputButton,
  InputButtonProvider,
  InputButtonAction,
  InputButtonSubmit,
  InputButtonInput,
} from '../../../ui/buttons/input';
import { motion, AnimatePresence } from 'motion/react';

interface PendingStudent {
  id: string;
  name: string;
  email: string;
  generateUsername: boolean;
  classes: string[];
}

interface ClassItem {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  schoolId?: string;
  subjectId?: string;
  gradeLevel?: string;
  maxCapacity?: number;
  currentEnrollment?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StudentManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teacherClasses?: ClassItem[];
}

type StudentFormStep = 'name' | 'email';
type DialogTab = 'invite' | 'classes';

export function StudentManagementDialog({ isOpen, onOpenChange, teacherClasses = [] }: StudentManagementDialogProps) {
  // Tab and form state
  const [activeTab, setActiveTab] = useState<DialogTab>('invite');
  const [currentStep, setCurrentStep] = useState<StudentFormStep>('name');
  const [showInput, setShowInput] = useState(false);

  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [generateUsername, setGenerateUsername] = useState(true);

  // Students and classes
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [studentClassAssignments, setStudentClassAssignments] = useState<Record<string, string[]>>({});

  // State for managing which accordion is open (only one at a time)
  const [openAccordionId, setOpenAccordionId] = useState<string[]>([]);

  // Handler to ensure only one accordion is open at a time
  const handleAccordionChange = (value: string[]) => {
    // If trying to open a new accordion, close others and open the new one
    if (value.length > openAccordionId.length) {
      // Opening a new accordion - keep only the newest one
      const newlyOpened = value.find(id => !openAccordionId.includes(id));
      setOpenAccordionId(newlyOpened ? [newlyOpened] : []);
    } else {
      // Closing an accordion
      setOpenAccordionId(value);
    }
  };

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Refs
  const inputRef = useRef<HTMLDivElement>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const redirect = useRedirect();

  // Utility functions
  const createUsername = useCallback((name: string, email: string): string => {
    // Create username from name and email
    const namePart = name.toLowerCase().replace(/\s+/g, '');
    const emailPart = email.split('@')[0]?.toLowerCase() || '';
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');

    // Prefer name-based username, fallback to email-based
    const baseUsername = namePart.length >= 3 ? namePart : emailPart;
    return `${baseUsername}${randomNum}`;
  }, []);

  const resetForm = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setName('');
    setEmail('');
    setCurrentStep('name');
    setShowInput(false);
    setMessage('');
    setMessageType('');
  }, []);

  const resetDialog = useCallback(() => {
    resetForm();
    setPendingStudents([]);
    setSelectedClass(null);
    setStudentClassAssignments({});
    setActiveTab('invite');
    setShowCancelConfirmation(false);
  }, [resetForm]);

  const handleGoToClasses = useCallback(() => {
    // Close the current dialog
    onOpenChange(false);
    // Navigate to the classes page
    redirect(`/teacher/${user?.slug}/classes`);
  }, [onOpenChange, redirect, user?.slug]);

  // Handle dialog close with confirmation if needed
  const handleDialogClose = useCallback((open: boolean) => {
    if (!open && pendingStudents.length > 0 && !showCancelConfirmation) {
      setShowCancelConfirmation(true);
      return;
    }

    if (!open) {
      resetDialog();
    }

    onOpenChange(open);
  }, [pendingStudents.length, showCancelConfirmation, resetDialog, onOpenChange]);

  const handleCancelConfirm = useCallback(() => {
    setShowCancelConfirmation(false);
    resetDialog();
    onOpenChange(false);
  }, [resetDialog, onOpenChange]);

  const handleCancelDeny = useCallback(() => {
    setShowCancelConfirmation(false);
  }, []);

  // Form submission handlers
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 'name') {
      if (!showInput) {
        setShowInput(true);
        return;
      }

      if (!name.trim()) {
        setMessage('Please enter a student name');
        setMessageType('error');

        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
        return;
      }

      setCurrentStep('email');
      return;
    }

    if (currentStep === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setMessage('Please enter a valid email address');
        setMessageType('error');

        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
        return;
      }

      // Check if email already exists in pending students
      if (pendingStudents.some(student => student.email === email)) {
        setMessage('This email is already added');
        setMessageType('error');

        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
        return;
      }

      // Add student to pending list
      const newStudent: PendingStudent = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        generateUsername,
        classes: []
      };

      setPendingStudents(prev => [...prev, newStudent]);

      // Reset form for next student
      setName('');
      setEmail('');
      setCurrentStep('name');
      setShowInput(false);

      setMessage('Student added successfully!');
      setMessageType('success');

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 2000);
    }
  };

  // Student and class management handlers
  const removeStudent = (studentId: string) => {
    setPendingStudents(prev => prev.filter(s => s.id !== studentId));
    // Also remove from class assignments
    setStudentClassAssignments(prev => {
      const updated = { ...prev };
      delete updated[studentId];
      return updated;
    });
  };

  const toggleStudentInClass = (studentId: string, classId: string) => {
    setStudentClassAssignments(prev => {
      const studentClasses = prev[studentId] || [];
      const isInClass = studentClasses.includes(classId);

      return {
        ...prev,
        [studentId]: isInClass
          ? studentClasses.filter(id => id !== classId)
          : [...studentClasses, classId]
      };
    });
  };

  const handleInviteStudents = async () => {
    if (pendingStudents.length === 0) {
      setMessage('No students to invite');
      setMessageType('error');
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsLoading(true);

    try {
      if (!user || user.role !== 'teacher') {
        throw new Error('Only teachers can add students');
      }

      // Collect all created student IDs for a single batch update
      const createdStudentIds: string[] = [];

      // Process each student
      for (const student of pendingStudents) {
        // Only generate username if the student has the generateUsername flag set to true
        const username = student.generateUsername ? createUsername(student.name, student.email) : undefined;

        // Generate a unique password for this student
        const generateStudentPassword = () => {
          const adjectives = ['Smart', 'Bright', 'Quick', 'Sharp', 'Clever', 'Wise', 'Bold', 'Swift'];
          const nouns = ['Lion', 'Eagle', 'Tiger', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Owl'];
          const numbers = Math.floor(Math.random() * 100).toString().padStart(2, '0');

          const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
          const noun = nouns[Math.floor(Math.random() * nouns.length)];

          return `${adjective}${noun}${numbers}`;
        };

        const uniquePassword = generateStudentPassword();
        const assignedClasses = studentClassAssignments[student.id] || [];

        const response = await fetch('/api/create-student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: student.email,
            password: uniquePassword,
            name: student.name,
            username,
            teacherId: user.id,
            classes: assignedClasses
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to create ${student.name}: ${errorData.error || 'Unknown error'}`);
        }

        const result = await response.json();
        createdStudentIds.push(result.user.id);
      }

      // Note: Blade automatically revalidates data every 5 seconds, so no manual trigger needed
      if (createdStudentIds.length > 0) {
        console.log('[MUTATION] Successfully created', createdStudentIds.length, 'students');
        console.log('[MUTATION] Blade will automatically revalidate data within 5 seconds');
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('studentsCreated', {
        detail: { count: pendingStudents.length }
      }));

      setMessage(`Successfully invited ${pendingStudents.length} student${pendingStudents.length > 1 ? 's' : ''}!`);
      setMessageType('success');

      // Reset and close dialog after success
      setTimeout(() => {
        resetDialog();
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Error inviting students:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to invite students. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // Mouse handlers for input animation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleDialogClose}>
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
                key={`tabs-${pendingStudents.length}`}
                className="grid w-full grid-cols-2 p-2 md:p-6"
                activeClassName="rounded-full border border-black/10 dark:border-white/10 shadow-sm shadow-black/10 dark:shadow-white/10 bg-gradient-to-r from-[#e1dfdf] via-[#d8d7d7] to-[#dad8d8] dark:from-[#242427] dark:via-[#232325] dark:to-[#202023]"
              >
                <TabsTrigger
                  value="invite"
                  className="flex h-9 rounded-full items-center justify-center px-2 md:px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Students
                </TabsTrigger>
                <TabsTrigger
                  value="classes"
                  className="flex h-9 rounded-full items-center justify-center px-2 md:px-3 py-1.5 text-xs font-manrope_1 text-black/40 dark:text-white/40 data-[state=active]:text-black/80 dark:data-[state=active]:text-white/80 transition-all"
                >
                  <School className="w-4 h-4 mr-2" />
                  Assign Classes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContents className="mx-1 mb-1 -mt-2 rounded-sm h-full bg-background">
              {/* Invite Tab Panel */}
              <TabsContent value="invite" className="flex-1 px-6 pb-6 overflow-y-auto h-full">
              <div className="space-y-6">
                {/* Student Input Form */}
                <div className="space-y-4">
                  <div className="flex items-center  justify-between">
                    <h3 className="text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">Add Students</h3>
                    <div className="flex items-center gap-2">
                     
                      <span className="text-xs font-manrope_1 text-black/80 dark:text-white/80">
                        {generateUsername ? 'Generate username for login' : 'Use email for login'}
                      </span>
                       <div className="flex flex-col items-center gap-1">
                      

                         {/* Switch positioned under the selected option */}
                         <Switch
                           checked={generateUsername}
                           onCheckedChange={setGenerateUsername}
                           className="w-12 h-6 bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] [&_[data-slot=switch-thumb]]:!bg-zinc-200 dark:[&_[data-slot=switch-thumb]]:!bg-zinc-800 [&_[data-slot=switch-thumb]]:!shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:[&_[data-slot=switch-thumb]]:!shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]"
                           thumbIcon={generateUsername ? <UserCheck className="w-3 h-3 text-black dark:text-white" /> : <AtSign className="w-3 h-3 text-black dark:text-white" />}
                         />
                       </div>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="relative">
                    <InputButtonProvider
                      showInput={showInput}
                      setShowInput={setShowInput}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="!w-full !max-w-[500px] relative group items-center justify-center h-12 select-none rounded-full px-3 text-sm leading-8 transition-all duration-200 overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-800 shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:bg-gradient-to-b dark:from-[#212026] dark:via-[#212026] dark:to-[#29282e] dark:text-zinc-50 dark:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset]"
                      onMouseMove={handleMouseMove}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <InputButton>
                        <AnimatePresence>
                          {!showInput && (
                            <motion.div
                              key="action-text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="w-full h-full"
                            >
                              <InputButtonAction>
                                <div className="flex items-center gap-2">
                                  <UserPlus className="w-4 h-4" />
                                  {currentStep === 'name' ? 'Add Student Name' : 'Add Student Email'}
                                </div>
                              </InputButtonAction>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <InputButtonSubmit
                          onClick={() => {}}
                          type="submit"
                          disabled={isLoading}
                          message={message}
                          messageType={messageType}
                          isSubmitting={false}
                          success={false}
                        >
                          {currentStep === 'name' ? 'Next' : 'Add Student'}
                        </InputButtonSubmit>

                        {showInput && (
                          <div className="flex items-center w-full pl-0">
                            <InputButtonInput
                              type={currentStep === 'name' ? 'text' : 'email'}
                              placeholder={currentStep === 'name' ? 'Enter student name' : 'Enter student email'}
                              value={currentStep === 'name' ? name : email}
                              onChange={(e) => currentStep === 'name' ? setName(e.target.value) : setEmail(e.target.value)}
                              disabled={isLoading}
                              required
                              autoFocus
                            />
                          </div>
                        )}

                        <div
                          ref={inputRef}
                          className="pointer-events-none absolute inset-0 rounded-full border-2 border-orange-500/50 transition-opacity duration-500"
                          style={{
                            opacity: opacity,
                            WebkitMaskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
                            maskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
                          } as React.CSSProperties}
                        />
                      </InputButton>
                    </InputButtonProvider>
                  </form>
                </div>

                {/* Pending Students Accordion */}
                {pendingStudents.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-manrope_1 font-medium text-black/80 dark:text-white/80">
                      Students to Invite <span className="text-black dark:text-white">({pendingStudents.length})</span>
                    </h3>
                    <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden  shadow-sm">
                      <Accordion className="w-full max-h-60 custom-scrollbar overflow-y-auto">
                        {pendingStudents.map((student) => {
                          const assignedClasses = studentClassAssignments[student.id] || [];
                          const classCount = assignedClasses.length;

                          return (
                            <AccordionItem key={student.id} value={student.id} className="border-b border-black/10 dark:border-white/10 last:border-b-0 data-[open]:rounded-xl data-[open]:bg-gradient-to-br data-[open]:from-zinc-100 data-[open]:to-zinc-200 data-[open]:text-zinc-800 data-[open]:shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:data-[open]:bg-gradient-to-b dark:data-[open]:from-[#212026] dark:data-[open]:via-[#212026] dark:data-[open]:to-[#29282e] dark:data-[open]:text-zinc-50 dark:data-[open]:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] data-[open]:border-transparent transition-all duration-200">
                              <AccordionTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-gradient-to-r hover:from-[#f8f8f8] hover:via-[#f0f0f0] hover:to-[#f4f4f4] dark:hover:bg-gradient-to-r dark:hover:from-[#1a1a1c] dark:hover:via-[#1f1f21] dark:hover:to-[#1c1c1e] data-[panel-open]:hover:bg-transparent data-[panel-open]:hover:from-transparent data-[panel-open]:hover:via-transparent data-[panel-open]:hover:to-transparent transition-all duration-200">
                              <div className="flex items-center gap-3 flex-1">
                                {/* Check mark */}
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#45bd73] flex items-center justify-center">
                                  <Check className="w-3 h-3 text-black" />
                                </div>

                                {/* Student info */}
                                <div className="flex-1 min-w-0 font-manrope_1">
                                  <div className="font-medium text-xs text-black/80 dark:text-white/80">{student.name}</div>
                                  <div className="text-[10px] text-black/60 dark:text-white/60 truncate">{student.email}</div>
                                </div>

                                {/* Login type icon */}
                                <div className="flex-shrink-0">
                                  {student.generateUsername ? (
                                    <UserCheck className="w-4 h-4 text-black/90 dark:text-white/90" />
                                  ) : (
                                    <AtSign className="w-4 h-4 text-black/90 dark:text-white/90" />
                                  )}
                                </div>

                                {/* Class count badge - always shown */}
                                <div className="flex-shrink-0 mr-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-manrope_1 border border-black/10 dark:border-white/10  text-black/80 dark:text-white/80 bg-gradient-to-r from-[#e1dfdf] via-[#d8d7d7] to-[#dad8d8] dark:from-[#242427] dark:via-[#232325] dark:to-[#202023] ">
                                    {classCount} {classCount === 1 ? 'class' : 'classes'}
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionPanel className="px-3 pb-3">
                              <div className="space-y-3 pt-2">
                                {/* Class assignments */}
                                {assignedClasses.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Assigned Classes:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {assignedClasses.map(classId => {
                                        const className = teacherClasses.find(c => c.id === classId)?.name;
                                        return (
                                          <span key={classId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {className}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Remove button */}
                                <div className="flex justify-end pt-2">
                                  <button
                                    onClick={() => removeStudent(student.id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </AccordionPanel>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  </div>
                )}
              </div>
              </TabsContent>

              {/* Classes Tab Panel */}
              <TabsContent value="classes" className="flex-1 px-6 pb-6 overflow-y-auto h-full">
              <div className="space-y-6">
                {pendingStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <School className="w-12 h-12 mx-auto text-black/60 dark:text-white/60 mb-4" />
                    <p className="font-manrope_1 text-xs text-black/80 dark:text-white/80">
                      Add students <span className="font-bold text black dark:text-white underline ">first</span> to assign them to classes.
                    </p>
                  </div>
                ) : teacherClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 mx-auto text-black/60 dark:text-white/60 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Classes Yet</h3>
                    <p className="font-manrope_1 text-sm text-black/80 dark:text-white/80 mb-6">
                      You need to create grade levels first before you can assign students to classes.
                    </p>
                    <button
                      onClick={handleGoToClasses}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Create Grade Levels
                    </button>
                  </div>
                ) : selectedClass ? (
                  /* Class Detail View */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedClass(null)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-manrope_1"
                      >
                        ← Back to Classes
                      </button>
                    </div>

                    {(() => {
                      const classInfo = teacherClasses.find(c => c.id === selectedClass);
                      return classInfo ? (
                        <div>
                          <h3 className="text-lg font-manrope_1 font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {classInfo.name}
                          </h3>
                          <p className="text-sm font-manrope_1 text-gray-600 dark:text-gray-400 mb-4">
                            {classInfo.currentEnrollment || 0}/{classInfo.maxCapacity || 0} students
                          </p>

                          <div className="space-y-3">
                            <h4 className="text-sm font-manrope_1 font-medium text-gray-700 dark:text-gray-300">
                              Select students for this class:
                            </h4>
                            {pendingStudents.map((student) => {
                              const isInClass = studentClassAssignments[student.id]?.includes(selectedClass) || false;
                              return (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium font-manrope_1 text-sm">{student.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{student.email}</div>
                                  </div>
                                  <button
                                    onClick={() => toggleStudentInClass(student.id, selectedClass)}
                                    className={cn(
                                      "flex items-center font-manrope_1 justify-center w-6 h-6 rounded border-2 transition-colors",
                                      isInClass
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "border-gray-300 dark:border-gray-600 hover:border-blue-600"
                                    )}
                                  >
                                    {isInClass && <Check className="w-4 h-4" />}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  /* Classes Accordion View */
                  <div className="space-y-4">
                    <h3 className="text-sm font-manrope_1 font-medium text-gray-700 dark:text-gray-300">
                      Assign students to classes:
                    </h3>
                    <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                      <Accordion
                        className="w-full"
                        value={openAccordionId}
                        onValueChange={handleAccordionChange}
                      >
                        {teacherClasses.map((classItem) => {
                          const assignedStudents = pendingStudents.filter(student =>
                            studentClassAssignments[student.id]?.includes(classItem.id)
                          ).length;

                          return (
                            <AccordionItem
                              key={classItem.id}
                              value={classItem.id}
                              className="border-b border-black/10 dark:border-white/10 last:border-b-0 data-[open]:rounded-xl data-[open]:bg-gradient-to-br data-[open]:from-zinc-100 data-[open]:to-zinc-200 data-[open]:text-zinc-800 data-[open]:shadow-[0_-1px_0_1px_rgba(255,255,255,0.8)_inset,0_0_0_1px_rgb(220,220,220)_inset,0_0.5px_0_1.5px_#ccc_inset] dark:data-[open]:bg-gradient-to-b dark:data-[open]:from-[#212026] dark:data-[open]:via-[#212026] dark:data-[open]:to-[#29282e] dark:data-[open]:text-zinc-50 dark:data-[open]:shadow-[0_-1px_0_1px_rgba(0,0,0,0.8)_inset,0_0_0_1px_rgb(9_9_11)_inset,0_0.5px_0_1.5px_#71717a_inset] data-[open]:border-transparent transition-all duration-200"
                            >
                              <AccordionTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-gradient-to-r hover:from-[#f8f8f8] hover:via-[#f0f0f0] hover:to-[#f4f4f4] dark:hover:bg-gradient-to-r dark:hover:from-[#1a1a1c] dark:hover:via-[#1f1f21] dark:hover:to-[#1c1c1e] data-[panel-open]:hover:bg-transparent data-[panel-open]:hover:from-transparent data-[panel-open]:hover:via-transparent data-[panel-open]:hover:to-transparent transition-all duration-200">
                                <div className="flex items-center gap-3 flex-1">
                                  {/* Class icon */}
                                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#45bd73] flex items-center justify-center">
                                    <School className="w-3 h-3 text-black" />
                                  </div>

                                  {/* Class info */}
                                  <div className="flex-1 min-w-0 font-manrope_1">
                                    <div className="font-medium text-xs text-black/80 dark:text-white/80">{classItem.name}</div>
                                    <div className="text-[10px] text-black/60 dark:text-white/60 truncate">
                                      {classItem.currentEnrollment || 0}/{classItem.maxCapacity || 0} current students
                                    </div>
                                  </div>

                                  {/* Assigned students count badge */}
                                  <div className="flex-shrink-0 mr-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-manrope_1 border border-black/10 dark:border-white/10 text-black/80 dark:text-white/80 bg-gradient-to-r from-[#e1dfdf] via-[#d8d7d7] to-[#dad8d8] dark:from-[#242427] dark:via-[#232325] dark:to-[#202023]">
                                      +{assignedStudents} {assignedStudents === 1 ? 'student' : 'students'}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionPanel className="px-3 pb-3">
                                <div className="space-y-3 pt-2">
                                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Select students for {classItem.name}:
                                  </div>
                                  <div className="space-y-2">
                                    {pendingStudents.map((student) => {
                                      const isInClass = studentClassAssignments[student.id]?.includes(classItem.id) || false;

                                      return (
                                        <div
                                          key={student.id}
                                          className={cn(
                                            "flex items-start justify-between py-2 px-2 rounded-lg transition-all duration-200 relative overflow-hidden",
                                            "",
                                            isInClass && "bg-gray-50/50 dark:bg-gray-700/20"
                                          )}
                                        >
                                          {/* Student Info - Not clickable */}
                                          <div
                                            className={cn(
                                              "flex-1 flex flex-col gap-1 transition-all duration-200 font-manrope_1 pointer-events-none",
                                              !isInClass && "opacity-50 text-black/60 dark:text-white/60",
                                              isInClass && "opacity-100 text-black/80 dark:text-white/80"
                                            )}
                                          >
                                            <span
                                              className={cn(
                                                "text-xs font-manrope_1 font-medium relative inline-block w-fit transition-all duration-200",
                                                !isInClass && "before:content-[''] before:absolute before:h-px before:left-0 before:right-0 before:top-1/2 before:-translate-y-1/2 before:bg-current before:origin-left before:scale-x-100 before:transition-transform before:duration-200",
                                                isInClass && "before:content-[''] before:absolute before:h-px before:left-0 before:right-0 before:top-1/2 before:-translate-y-1/2 before:bg-current before:origin-left before:scale-x-0 before:transition-transform before:duration-200"
                                              )}
                                            >
                                              {student.name}
                                            </span>
                                            <span
                                              className={cn(
                                                "text-[10px] font-manrope_1 text-black/80 dark:text-white/80 relative inline-block w-fit transition-all duration-200",
                                                !isInClass && "before:content-[''] before:absolute before:h-px before:left-0 before:right-0 before:top-1/2 before:-translate-y-1/2 before:bg-current before:origin-left before:scale-x-100 before:transition-transform before:duration-200",
                                                isInClass && "before:content-[''] before:absolute before:h-px before:left-0 before:right-0 before:top-1/2 before:-translate-y-1/2 before:bg-current before:origin-left before:scale-x-0 before:transition-transform before:duration-200"
                                              )}
                                            >
                                              {student.email}
                                            </span>
                                          </div>

                                          {/* Custom Checkbox - Only this is clickable */}
                                          <div className="flex-shrink-0 flex items-center sm:items-start justify-center">
                                            <label
                                              className="checkbox-custom block p-3 cursor-pointer relative"
                                              style={{
                                                '--checkbox-active': '#6E7BF2',
                                                '--active-tick': '#ffffff',
                                                '--checkbox-lines-offset': isInClass ? '4.5px' : '13.5px',
                                                '--background': isInClass ? 'var(--checkbox-active)' : 'none',
                                                '--border': isInClass ? 'var(--checkbox-active)' : 'var(--border-default)',
                                                '--checkbox-tick-offset': isInClass ? '0px' : '20px',
                                                '--checkbox-tick-duration': isInClass ? '.2s' : '.15s',
                                                '--checkbox-tick-easing': isInClass ? 'cubic-bezier(0, .45, 1, .5)' : 'ease',
                                              } as React.CSSProperties}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isInClass}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    // Play sound only when checking
                                                    const audio = new Audio('https://assets.codepen.io/165585/check.mp3');
                                                    audio.play().catch(() => {
                                                      // Ignore audio play errors (user interaction required)
                                                    });
                                                  }
                                                  toggleStudentInClass(student.id, classItem.id);
                                                }}
                                                className="block outline-none border-none bg-none p-0 m-0 w-[18px] h-[18px] opacity-0 absolute"
                                                style={{ WebkitAppearance: 'none' } as React.CSSProperties}
                                              />

                                              {/* Main checkbox SVG */}
                                              <svg
                                                viewBox="0 0 21 18"
                                                className="block absolute w-[21px] h-[18px] left-3 top-3 transition-colors duration-200"
                                                style={{
                                                  color: 'var(--checkbox-active)',
                                                } as React.CSSProperties}
                                              >
                                                <symbol id={`tick-path-${student.id}-${classItem.id}`} viewBox="0 0 21 18">
                                                  <path
                                                    d="M5.22003 7.26C5.72003 7.76 7.57 9.7 8.67 11.45C12.2 6.05 15.65 3.5 19.19 1.69"
                                                    fill="none"
                                                    strokeWidth="2.25"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  />
                                                </symbol>
                                                <defs>
                                                  <mask id={`tick-${student.id}-${classItem.id}`}>
                                                    <use
                                                      className="tick mask"
                                                      href={`#tick-path-${student.id}-${classItem.id}`}
                                                      stroke="var(--active-tick)"
                                                    />
                                                  </mask>
                                                </defs>

                                                {/* Checkbox shape */}
                                                <path
                                                  className="shape"
                                                  d="M1.08722 4.13374C1.29101 2.53185 2.53185 1.29101 4.13374 1.08722C5.50224 0.913124 7.25112 0.75 9 0.75C10.7489 0.75 12.4978 0.913124 13.8663 1.08722C15.4681 1.29101 16.709 2.53185 16.9128 4.13374C17.0869 5.50224 17.25 7.25112 17.25 9C17.25 10.7489 17.0869 12.4978 16.9128 13.8663C16.709 15.4681 15.4682 16.709 13.8663 16.9128C12.4978 17.0869 10.7489 17.25 9 17.25C7.25112 17.25 5.50224 17.0869 4.13374 16.9128C2.53185 16.709 1.29101 15.4681 1.08722 13.8663C0.913124 12.4978 0.75 10.7489 0.75 9C0.75 7.25112 0.913124 5.50224 1.08722 4.13374Z"
                                                  strokeWidth="1.5px"
                                                  stroke="var(--border)"
                                                  fill="var(--background)"
                                                  style={{
                                                    transition: 'fill .25s linear, stroke .25s linear'
                                                  } as React.CSSProperties}
                                                />

                                                {/* Tick mark */}
                                                <use
                                                  className="tick"
                                                  href={`#tick-path-${student.id}-${classItem.id}`}
                                                  stroke="currentColor"
                                                  strokeDasharray="20"
                                                  strokeDashoffset="var(--checkbox-tick-offset)"
                                                  style={{
                                                    transition: 'stroke-dashoffset var(--checkbox-tick-duration) var(--checkbox-tick-easing)'
                                                  } as React.CSSProperties}
                                                />

                                                {/* Background fill with mask */}
                                                <path
                                                  fill="#2C2C31"
                                                  mask={`url(#tick-${student.id}-${classItem.id})`}
                                                  d="M4.03909 0.343217C5.42566 0.166822 7.20841 0 9 0C10.7916 0 12.5743 0.166822 13.9609 0.343217C15.902 0.590152 17.4098 2.09804 17.6568 4.03909C17.8332 5.42566 18 7.20841 18 9C18 10.7916 17.8332 12.5743 17.6568 13.9609C17.4098 15.902 15.902 17.4098 13.9609 17.6568C12.5743 17.8332 10.7916 18 9 18C7.20841 18 5.42566 17.8332 4.03909 17.6568C2.09805 17.4098 0.590152 15.902 0.343217 13.9609C0.166822 12.5743 0 10.7916 0 9C0 7.20841 0.166822 5.42566 0.343217 4.03909C0.590151 2.09805 2.09804 0.590152 4.03909 0.343217Z"
                                                />
                                              </svg>

                                              {/* Lines SVG */}
                                              <svg
                                                className="lines block absolute w-[11px] h-[11px] top-[9px] right-[2px] fill-none stroke-current stroke-[1.25] pointer-events-none"
                                                viewBox="0 0 11 11"
                                                style={{
                                                  strokeLinecap: 'round',
                                                  strokeDasharray: '4.5px',
                                                  strokeDashoffset: 'var(--checkbox-lines-offset)',
                                                  color: 'var(--checkbox-active)',
                                                  transition: 'stroke-dashoffset 0.2s ease'
                                                } as React.CSSProperties}
                                              >
                                                <path d="M5.88086 5.89441L9.53504 4.26746" />
                                                <path d="M5.5274 8.78838L9.45391 9.55161" />
                                                <path d="M3.49371 4.22065L5.55387 0.79198" />
                                              </svg>
                                            </label>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </AccordionPanel>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  </div>
                )}
              </div>
              </TabsContent>
            </TabsContents>

            {/* Footer with Invite Button */}
            <div className="px-6 py-4 border-t border-black/10 dark:border-white/10  ">
              <div className="flex justify-between items-center">
                <div className="text-xs font-manrope_1 text-black/80 dark:text-white/80">
                  {showCancelConfirmation ? (
                    'You will lose all added students. Are you sure?'
                  ) : showConfirmation ? (
                    'Are you sure you want to send these student invites?'
                  ) : pendingStudents.length > 0 ? (
                    `${pendingStudents.length} student${pendingStudents.length > 1 ? 's' : ''} ready to invite`
                  ) : (
                    'No students added yet'
                  )}
                </div>
                <div className="flex gap-2">
                  {showCancelConfirmation ? (
                    <>
                      <button
                        onClick={handleCancelDeny}
                        className="flex h-10 cursor-pointer font-manrope_1 items-center justify-center  text-xs font-medium text-black/90 dark:text-white/90 select-none "
                      >
                        No
                      </button>
                      <button
                        onClick={handleCancelConfirm}
                        className="flex h-10 cursor-pointer font-manrope_1 items-center justify-center rounded-full px-3 text-xs font-medium text-white select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white/10 bg-red-400/40 hover:bg-red-400/60 active:bg-red-400/60"
                      >
                        Yes! I´m sure
                      </button>
                    </>
                  ) : showConfirmation ? (
                    <>
                      <button
                        onClick={handleCancelConfirmation}
                        className="flex h-10 cursor-pointer font-manrope_1 items-center justify-center text-xs font-medium text-black/90 dark:text-white/90 select-none"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleInviteStudents}
                        disabled={isLoading}
                        className={cn(
                          "ml-2 h-10 cursor-pointer items-center justify-center text-xs flex-1 text-center rounded-full py-1.5 px-3 font-manrope_1 font-semibold",
                          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_0_rgba(0,0,0,0.4)]",
                          isLoading
                            ? "text-white/80 dark:text-black/80 bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] dark:from-[#c7c7c7] dark:via-[#d9d9d9] dark:to-[#ececec] opacity-40 cursor-not-allowed"
                            : "text-white dark:text-black bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] dark:from-[#c7c7c7] dark:via-[#d9d9d9] dark:to-[#ececec]"
                        )}
                      >
                        {isLoading ? 'Inviting...' : 'Invite'}
                      </button>
                    </>
                  ) : (
                    <>
                      <Dialog.Close className="flex h-10 cursor-pointer text-xs font-manrope_1 items-center justify-center text-black/80 dark:text-white/80 md:text-black/60 md:dark:text-white/60 hover:text-black/80 dark:hover:text-white/80">
                        Cancel
                      </Dialog.Close>
                      <button
                       onClick={handleInviteStudents}
                      disabled={isLoading || pendingStudents.length === 0}
                      className={cn(
                      "ml-2 h-10 cursor-pointer items-center justify-center text-xs flex-1 text-center rounded-full py-1.5 px-3 font-manrope_1 font-semibold ",
                      // Shiny effect - white highlight for dark mode, darker highlight for light mode  
                      "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_0_rgba(0,0,0,0.4)]",
                      isLoading || pendingStudents.length === 0
                      ? "text-white/80 dark:text-black/80 bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] dark:from-[#c7c7c7] dark:via-[#d9d9d9] dark:to-[#ececec] opacity-40 cursor-not-allowed"
                      : "text-white dark:text-black bg-gradient-to-b from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] dark:from-[#c7c7c7] dark:via-[#d9d9d9] dark:to-[#ececec]"
  )}
>
                     
                        {isLoading ? 'Inviting...' : `Invite ${pendingStudents.length > 0 ? pendingStudents.length : ''} Student${pendingStudents.length !== 1 ? 's' : ''}`}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Tabs>

          {/* Close button in top right */}
        
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Dialog Trigger Button Component
interface StudentManagementDialogTriggerProps {
  className?: string;
  variant?: 'icon' | 'text' | 'button';
  children?: React.ReactNode;
  teacherClasses?: ClassItem[];
}

export function StudentManagementDialogTrigger({
  className,
  variant = 'icon',
  children,
  teacherClasses = []
}: StudentManagementDialogTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Default icon variant
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-7 w-7",
            className
          )}
          aria-label="Add new student"
        >
          <UserPlus className="h-4 w-4" />
        </button>

        <StudentManagementDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          teacherClasses={teacherClasses}
        />
      </>
    );
  }

  // Button variant for styled button
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            className
          )}
          aria-label="Add new student"
        >
          {children || (
            <>
              <UserPlus className="h-4 w-4" />
              New Student
            </>
          )}
        </button>

        <StudentManagementDialog
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          teacherClasses={teacherClasses}
        />
      </>
    );
  }

  // Text variant for header button
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        aria-label="Add new student"
      >
        {children || (
          <>
            <UserPlus className="h-5 w-5" />
            Students
          </>
        )}
      </button>

      <StudentManagementDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        teacherClasses={teacherClasses}
      />
    </>
  );
}
