'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lessonSchema, LessonFormData, LessonWithPractices } from '@/lib/schemas/lesson';
import { useCreateLesson, useUpdateLesson, useGenerateLesson } from '@/lib/react-query/hooks/use-lessons';
import { useQueryClient } from '@tanstack/react-query';
import { lessonKeys, practiceKeys, quizKeys } from '@/lib/react-query/query-keys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Save, Eye, ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/common/rich-editor/RichTextEditor';
import { PracticeForm } from './PracticeForm';
import { QuizForm } from './QuizForm';
import { GoalModal } from '@/components/common/practice/GoalModal';
import { PracticeFormData } from '@/lib/schemas/practice';
import { QuizFormData } from '@/lib/schemas/quiz';
import { IRepositoryState } from '@/types/git';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { GenerateLessonModal } from '@/components/modals/GenerateLessonModal';
import { gitEngineApi } from '@/lib/react-query/hooks/use-git-engine';
import { useQuizzes } from '@/lib/react-query/hooks/use-quizzes';
import { usePractices } from '@/lib/react-query/hooks/use-practices';
import LessonViewer from '@/components/common/git-theory/LessonViewer';

interface LessonFormProps {
  initialData?: Partial<LessonWithPractices>;
  isEdit?: boolean;
  lessonId?: string;
  redirectPath?: string; // Custom redirect path after save
}

export function LessonForm({ initialData, isEdit = false, lessonId, redirectPath }: LessonFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const queryClient = useQueryClient();
  const [content, setContent] = useState(initialData?.content || '');
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [practices, setPractices] = useState<PracticeFormData[]>(initialData?.practices || []);
  const [quizzes, setQuizzes] = useState<QuizFormData[]>((initialData as any)?.quizzes || []);
  const [editPracticeIndex, setEditPracticeIndex] = useState<number | null>(null);
  const [editQuizIndex, setEditQuizIndex] = useState<number | null>(null);
  const [previewGoal, setPreviewGoal] = useState<IRepositoryState | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [serverPractices, setServerPractices] = useState<PracticeFormData[]>(initialData?.practices || []);
  const [serverQuizzes, setServerQuizzes] = useState<QuizFormData[]>((initialData as any)?.quizzes || []);
  const [deletedQuizIds, setDeletedQuizIds] = useState<string[]>([]);
  const [deletedPracticeIds, setDeletedPracticeIds] = useState<string[]>([]);

  // Load quizzes when editing (same pattern as practices)
  const { data: quizzesData } = useQuizzes({
    lessonSlug: initialData?.slug || undefined,
    includeRelations: true,
  });

  // Load practices when editing
  // If initialData already has practices (from getBySlugWithPractices), use them directly
  // Otherwise, query from API (for draft lessons, publishedOnly: false)
  const hasPracticesInInitialData = initialData?.practices && Array.isArray(initialData.practices) && initialData.practices.length > 0;
  const { data: practicesData } = usePractices({
    lessonSlug: initialData?.slug || undefined,
    includeRelations: true,
    publishedOnly: false, // Allow viewing practices for draft lessons when editing
    enabled: !hasPracticesInInitialData && isEdit && !!initialData?.slug, // Only query if not already in initialData
  });

  useEffect(() => {
    if (isEdit && quizzesData) {
      // Handle both array and object with data property
      const quizzesArray = Array.isArray(quizzesData) 
        ? quizzesData 
        : (quizzesData as any)?.data || [];
      
      if (quizzesArray.length > 0) {
        const formattedQuizzes: QuizFormData[] = quizzesArray.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          difficulty: quiz.difficulty || 1,
          estimatedTime: quiz.estimatedTime || 0,
          isActive: quiz.isActive ?? true,
          order: quiz.order || 0,
          passingScore: quiz.passingScore || 70,
          questions: (quiz.questions || []).map((q: any) => ({
            question: q.question,
            type: q.type || 'single_choice',
            points: q.points || 1,
            order: q.order || 0,
            explanation: q.explanation || '',
            options: (q.options || []).map((opt: any) => ({
              text: opt.text,
              isCorrect: opt.isCorrect || false,
              order: opt.order || 0,
            })),
          })),
          tags: (quiz.tags || []).map((tag: any) => ({
            name: tag.name || tag,
          })),
        }));
        setQuizzes(formattedQuizzes);
        setServerQuizzes(formattedQuizzes);
      }
    }
  }, [isEdit, quizzesData]);

  // Load practices: Priority 1 = initialData.practices (fastest), Priority 2 = API query
  useEffect(() => {
    if (!isEdit) return;

    // Priority 1: Use practices from initialData if available (fastest - already loaded from getBySlugWithPractices)
    // This works for both published and draft lessons when they're loaded via getBySlugWithPractices
    if (hasPracticesInInitialData) {
      setPractices(initialData.practices!);
      setServerPractices(initialData.practices!);
      return;
    }

    // Priority 2: Use practices from API query (for draft lessons that weren't loaded with practices)
    if (practicesData) {
      // Handle both array and object with data property
      const practicesArray = Array.isArray(practicesData) 
        ? practicesData 
        : (practicesData as any)?.data || [];
      
      if (practicesArray.length > 0) {
        const formattedPractices: PracticeFormData[] = practicesArray.map((practice: any) => ({
          id: practice.id,
          title: practice.title,
          scenario: practice.scenario || '',
          difficulty: practice.difficulty || 1,
          estimatedTime: practice.estimatedTime || 0,
          isActive: practice.isActive ?? true,
          order: practice.order || 0,
          instructions: (practice.instructions || []).map((inst: any) => ({
            content: inst.content,
            order: inst.order || 0,
          })),
          hints: (practice.hints || []).map((hint: any) => ({
            content: hint.content,
            order: hint.order || 0,
          })),
          expectedCommands: (practice.expectedCommands || []).map((cmd: any) => ({
            command: cmd.command,
            order: cmd.order || 0,
            isRequired: cmd.isRequired ?? false,
          })),
          validationRules: (practice.validationRules || []).map((rule: any) => ({
            type: rule.type,
            value: rule.value,
            message: rule.message,
            order: rule.order || 0,
          })),
          tags: (practice.tags || []).map((tag: any) => ({
            name: tag.name || tag,
            color: tag.color || '#3B82F6',
          })),
          goalRepositoryState: practice.goalRepositoryState,
        }));
        setPractices(formattedPractices);
        setServerPractices(formattedPractices);
      } else {
        // If no practices found, set to empty array
        setPractices([]);
        setServerPractices([]);
      }
    } else if (!hasPracticesInInitialData) {
      // No practices available from either source
      setPractices([]);
      setServerPractices([]);
    }
  }, [isEdit, hasPracticesInInitialData, initialData?.practices, practicesData]);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      // Default to 'draft' for new lessons only (pro users should start with draft)
      // When editing, preserve the existing status from initialData
      status: isEdit 
        ? (initialData?.status || 'published') // When editing, default to 'published' if not provided (shouldn't happen)
        : (initialData?.status || 'draft') // When creating new, default to 'draft'
    }
  });

  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const generateLessonMutation = useGenerateLesson();

  useEffect(() => {
    const handler = (e: CustomEvent<{ goal: IRepositoryState }>) => {
      const goal = e.detail?.goal;
      if (!goal) return;
      setPreviewGoal(goal);
      setShowGoalModal(true);
    };
    window.addEventListener('practice-goal-preview', handler as EventListener);
    return () => window.removeEventListener('practice-goal-preview', handler as EventListener);
  }, []);

  useEffect(() => {
    setValue('content', content);
  }, [content, setValue]);

  // Update form values when initialData changes (important for edit mode)
  useEffect(() => {
    if (initialData) {
      if (initialData.title) setValue('title', initialData.title);
      if (initialData.slug) setValue('slug', initialData.slug);
      if (initialData.description !== undefined) setValue('description', initialData.description);
      if (initialData.content) {
        setContent(initialData.content);
        setValue('content', initialData.content);
      }
      // Important: preserve the existing status when editing
      // Map status from backend format if needed
      if (initialData.status !== undefined) {
        const statusValue = initialData.status === 'PUBLISHED' || initialData.status === 'published' 
          ? 'published' 
          : initialData.status === 'DRAFT' || initialData.status === 'draft'
          ? 'draft'
          : 'draft';
        setValue('status', statusValue as 'draft' | 'published', { shouldDirty: false, shouldValidate: true });
      }
    }
  }, [initialData, setValue]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const simulateCommands = async (commands: string[], practiceId: string) => {
    let currentState: IRepositoryState | null = null;
    const responses: any[] = [];
    
    for (const command of commands) {
      try {
        const response = await gitEngineApi.executeGitCommand(command, currentState);
        if (response.repositoryState) {
          currentState = response.repositoryState;
        }
        responses.push({ ...response, command });
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.warn(`Failed to simulate command "${command}":`, error);
        responses.push({ 
          success: false, 
          output: error instanceof Error ? error.message : 'Unknown error',
          command,
          repositoryState: currentState
        });
      }
    }

    if (responses.length > 0) {
      const key = ['terminal-responses', practiceId];
      queryClient.setQueryData(key, responses);

      if (practiceId === 'goal-builder') {
        queryClient.setQueryData(['terminal-responses', 'goal'], responses);
      }

      if (currentState) {
        queryClient.setQueryData(['git', 'state', practiceId], currentState);
        if (practiceId === 'goal-builder') {
          queryClient.setQueryData(['git', 'state', 'goal'], currentState);
        }
      }
    }

    return currentState;
  };

  const handleGenerateLesson = async (params: {
    sourceType: 'url' | 'file';
    url?: string;
    language?: 'vi' | 'en';
    model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
    outlineStyle?: 'concise' | 'detailed';
    additionalInstructions?: string;
  }) => {
    try {   
      const result = await generateLessonMutation.mutateAsync(params);

      setContent(result.html);

      if (result.title) {
        setValue('title', result.title, { shouldDirty: true, shouldValidate: true });
      }

      const slugSource = result.slug || result.title;
      if (slugSource) {
        const generatedSlugValue = generateSlug(slugSource);
        if (generatedSlugValue) {
          setValue('slug', generatedSlugValue, { shouldDirty: true, shouldValidate: true });
        }
      }

      if (result.description) {
        setValue('description', result.description, { shouldDirty: true, shouldValidate: true });
      }

      if (result.meta) {
        toast.success('Bài học đã được tạo thành công!');
      }

      if (result.practices && result.practices.length > 0) {
        toast.info('Đang xử lý practice sessions...');
        
        const processedPractices: PracticeFormData[] = [];
        
        for (let i = 0; i < result.practices.length; i++) {
          const practice = result.practices[i];
          
          let finalGoalState = practice.goalRepositoryState;
          if (!practice.goalRepositoryState && practice.expectedCommands && practice.expectedCommands.length > 0) {
            const commands: string[] = (practice.expectedCommands || [])
              .map((cmd: { command: string }) => cmd.command)
              .filter((cmd: string | undefined): cmd is string => Boolean(cmd));
            
            if (commands.length > 0) {
              const goalBuilderId = `goal-builder-${i}`;
              finalGoalState = await simulateCommands(commands, goalBuilderId);
            }
          }
          
          processedPractices.push({
            title: practice.title,
            scenario: practice.scenario,
            difficulty: practice.difficulty || 1,
            estimatedTime: practice.estimatedTime || 0,
            isActive: practice.isActive ?? true,
            order: practice.order || i,
            instructions: practice.instructions || [],
            hints: practice.hints || [],
            expectedCommands: practice.expectedCommands || [],
            validationRules: practice.validationRules || [],
            tags: practice.tags || [],
            goalRepositoryState: finalGoalState || null,
          });
        }

        setPractices(prev => [...prev, ...processedPractices]);
        toast.success(`${processedPractices.length} practice sessions đã được tạo!`);
      }

      // Process quizzes if available
      if (result.quizzes && result.quizzes.length > 0) {
        toast.info('Đang xử lý quiz sessions...');
        
        const processedQuizzes: QuizFormData[] = [];
        
        for (let i = 0; i < result.quizzes.length; i++) {
          const quiz = result.quizzes[i];
          
          processedQuizzes.push({
            title: quiz.title,
            description: quiz.description || '',
            difficulty: quiz.difficulty || 1,
            estimatedTime: quiz.estimatedTime || 0,
            isActive: quiz.isActive ?? true,
            order: quiz.order || i,
            passingScore: quiz.passingScore || 70,
            questions: (quiz.questions || []).map((q: any, qIndex: number) => ({
              question: q.question,
              type: q.type || 'single_choice',
              points: q.points || 1,
              order: q.order !== undefined ? q.order : qIndex,
              explanation: q.explanation || '',
              options: (q.options || []).map((opt: any, optIndex: number) => ({
                text: opt.text,
                isCorrect: opt.isCorrect || false,
                order: opt.order !== undefined ? opt.order : optIndex,
              })),
            })),
            tags: quiz.tags || [],
          });
        }

        setQuizzes(prev => [...prev, ...processedQuizzes]);
        toast.success(`${processedQuizzes.length} quiz sessions đã được tạo!`);
      }
      
      setShowGenerateModal(false);
    } catch (error) {
    console.error('Failed to generate lesson:', error);
    const message = (error as any)?.response?.data?.message || (error as Error)?.message || 'Không thể tạo bài học. Vui lòng thử lại.';
    toast.error(message);
  }
};

  const handleSavePractice = (practice: PracticeFormData) => {
    if (editPracticeIndex != null) {
      setPractices(prev => {
        const next = prev.slice();
        next[editPracticeIndex] = practice;
        return next;
      });
      setShowPracticeForm(false);
      setEditPracticeIndex(null);
      toast.success('Practice updated successfully!');
    } else {
      setPractices(prev => [...prev, practice]);
      setShowPracticeForm(false);
      setEditPracticeIndex(null);
      toast.success('Practice added to lesson (will be saved when you save the lesson)');
    }
  };

  const handleCancelPractice = () => {
    setShowPracticeForm(false);
  };

  const handleSaveQuiz = (quiz: QuizFormData) => {
    if (editQuizIndex != null) {
      setQuizzes(prev => {
        const next = prev.slice();
        next[editQuizIndex] = quiz;
        return next;
      });
      setShowQuizForm(false);
      setEditQuizIndex(null);
      toast.success('Quiz đã được cập nhật!');
    } else {
      setQuizzes(prev => [...prev, quiz]);
      setShowQuizForm(false);
      setEditQuizIndex(null);
      toast.success('Quiz đã được thêm vào bài học (sẽ được lưu khi bạn lưu bài học)');
    }
  };

  const handleCancelQuiz = () => {
    setShowQuizForm(false);
  };

  const onSubmit = async (data: LessonFormData) => {
    try {
      const formData = { ...data, content };
      let savedLesson;
      
      // Determine if we're editing: check isEdit flag, lessonId, or initialData.id
      const shouldUpdate = isEdit && (lessonId || initialData?.id);
      
      if (shouldUpdate) {
        const idToUse = lessonId || initialData?.id;
        console.log('Updating lesson:', { id: idToUse, slug: formData.slug });
        savedLesson = await updateLessonMutation.mutateAsync({ id: idToUse!, data: formData });
      } else {
        console.log('Creating new lesson:', { slug: formData.slug });
        savedLesson = await createLessonMutation.mutateAsync(formData);
      }
      
      console.log('Saved lesson response:', savedLesson);
      
      // Handle different response formats from API
      // Try multiple ways to extract the ID
      let lessonIdToUse: string | null = null;
      
      if (savedLesson) {
        // Direct ID
        if (savedLesson.id) {
          lessonIdToUse = String(savedLesson.id);
        }
        // String ID
        else if (typeof savedLesson === 'string') {
          lessonIdToUse = savedLesson;
        }
        // Nested data.id
        else if ((savedLesson as any)?.data?.id) {
          lessonIdToUse = String((savedLesson as any).data.id);
        }
        // Direct id property (number)
        else if ((savedLesson as any)?.id) {
          lessonIdToUse = String((savedLesson as any).id);
        }
        // Fallback to lessonId if editing
        else if (shouldUpdate && (lessonId || initialData?.id)) {
          lessonIdToUse = String(lessonId || initialData?.id!);
        }
      }
      
      if (!lessonIdToUse) {
        console.error('Cannot find lesson ID. Full response:', JSON.stringify(savedLesson, null, 2));
        toast.error('Không tìm thấy ID bài học sau khi lưu. Vui lòng thử lại.');
        return;
      }
      
      console.log('Using lesson ID:', lessonIdToUse);
      const lessonIdString = lessonIdToUse;

      const promises: Promise<any>[] = [];
      
      // Delete practices that were marked for deletion
      if (deletedPracticeIds.length > 0) {
        const { PracticesService } = await import('@/services/practice');
        for (const practiceId of deletedPracticeIds) {
          promises.push(PracticesService.delete(practiceId));
        }
      }

      // Delete quizzes that were marked for deletion
      if (deletedQuizIds.length > 0) {
        const { QuizzesService } = await import('@/services/quizzes');
        for (const quizId of deletedQuizIds) {
          promises.push(QuizzesService.delete(quizId));
        }
      }

      // Create new practices
      const practicesToCreate = practices.filter((practice) => !practice.id);
      if (practicesToCreate.length > 0) {
        const { PracticesService } = await import('@/services/practice');
        for (const practice of practicesToCreate) {
          promises.push(
            PracticesService.create({
              ...practice,
              lessonId: lessonIdString
            })
          );
        }
      }
      
      // Create new quizzes
      const quizzesToCreate = quizzes.filter((quiz) => !quiz.id);
      if (quizzesToCreate.length > 0) {
        const { QuizzesService } = await import('@/services/quizzes');
        for (const quiz of quizzesToCreate) {
          promises.push(
            QuizzesService.create({
              ...quiz,
              lessonId: lessonIdString
            })
          );
        }
      }

      // Update existing practices that were modified
      if (isEdit) {
        const { PracticesService } = await import('@/services/practice');
        for (const practice of practices) {
          if (practice.id) {
            // Check if practice was modified by comparing with serverPractices
            const serverPractice = serverPractices.find(sp => sp.id === practice.id);
            if (serverPractice && JSON.stringify(serverPractice) !== JSON.stringify(practice)) {
              promises.push(
                PracticesService.update(practice.id, {
                  ...practice,
                  lessonId: lessonIdString
                })
              );
            }
          }
        }
      }

      // Update existing quizzes that were modified
      if (isEdit) {
        const { QuizzesService } = await import('@/services/quizzes');
        for (const quiz of quizzes) {
          if (quiz.id) {
            // Check if quiz was modified by comparing with serverQuizzes
            const serverQuiz = serverQuizzes.find(sq => sq.id === quiz.id);
            if (serverQuiz && JSON.stringify(serverQuiz) !== JSON.stringify(quiz)) {
              promises.push(
                QuizzesService.update(quiz.id, {
                  ...quiz,
                  lessonId: lessonIdString
                })
              );
            }
          }
        }
      }
      
      // Lesson has been saved successfully at this point
      // Now handle practices/quizzes separately so errors don't prevent success message
      let practicesQuizzesError: Error | null = null;
      
      if (promises.length > 0) {
        try {
          await Promise.all(promises);
        } catch (error) {
          // Log error but don't fail the entire operation
          console.error('Error saving practices/quizzes:', error);
          practicesQuizzesError = error as Error;
        }
      }
      
      // Invalidate queries regardless of practices/quizzes errors
      queryClient.invalidateQueries({ queryKey: practiceKeys.all });
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      
      // Show success message for lesson
      const totalOperations = deletedPracticeIds.length + deletedQuizIds.length + practicesToCreate.length + quizzesToCreate.length;
      if (practicesQuizzesError) {
        // Lesson saved but practices/quizzes failed
        toast.success('Bài học đã được lưu thành công!', {
          description: 'Tuy nhiên, có lỗi xảy ra khi lưu practices/quizzes. Bạn có thể chỉnh sửa lại sau.',
        });
        console.error('Practices/Quizzes error details:', practicesQuizzesError);
      } else if (totalOperations > 0) {
        toast.success(`Bài học và ${totalOperations} thao tác đã được lưu thành công!`);
      } else {
        toast.success('Bài học đã được lưu thành công!');
      }
      
      setPractices([]);
      setQuizzes([]);
      setDeletedPracticeIds([]);
      setDeletedQuizIds([]);
      
      // Redirect to custom path or default to admin
      const finalRedirectPath = redirectPath || `/${locale}/admin/lessons`;
      router.push(finalRedirectPath);
    } catch (error) {
      console.error('Error saving lesson:', error);
      const axiosError = error as any;
      let errorMessage = 'Không thể lưu bài học. Vui lòng thử lại.';
      
      if (axiosError?.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message || axiosError.message;
        
        if (status === 409) {
          // Conflict - slug already exists
          errorMessage = `Slug "${formData.slug}" đã tồn tại. Vui lòng chọn slug khác.`;
        } else if (status === 400) {
          errorMessage = message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (status === 404) {
          errorMessage = 'Không tìm thấy bài học. Vui lòng thử lại.';
        } else {
          errorMessage = message || errorMessage;
        }
      } else if (axiosError?.message) {
        errorMessage = axiosError.message;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={redirectPath || `/${locale}/admin/lessons`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Cập nhật thông tin bài học' : 'Tạo bài học mới cho hệ thống'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowGenerateModal(true)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Tạo bằng AI
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              // Show preview modal with current content
              setShowPreviewModal(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem trước
          </Button>
          <Button 
            onClick={() => {
              handleSubmit(onSubmit)();
            }}
            disabled={isSubmitting || createLessonMutation.isPending || updateLessonMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || createLessonMutation.isPending || updateLessonMutation.isPending 
              ? 'Đang lưu...' 
              : 'Lưu bài học'
            }
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-8rem)] gap-4 xl:gap-6">
        {}
        <div className="flex-1 px-2 sm:px-4 py-4 sm:py-6 min-w-0">
          <div className="space-y-6">
            {}
            <div>
              <div className="mt-1">
                <RichTextEditor 
                  value={content}
                  onChange={setContent}
                />
              </div>
              {errors.content && (
                <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="w-full xl:w-80 bg-muted/30 border-t xl:border-t-0 xl:border-l border-border px-2 sm:px-4 py-4 sm:py-6 shrink-0">
          <div className="space-y-6">
            {}
            <Card className="p-4">
              <h3 className="font-bold text-foreground">Chi tiết bài học</h3>
              <div className="space-y-3">
                {}
                <div>
                  <Label htmlFor="title">Tiêu đề bài học *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Nhập tiêu đề bài học..."
                    className="mt-1 text-sm"
                    onChange={(e) => {
                      register('title').onChange(e);
                      const slug = generateSlug(e.target.value);
                      setValue('slug', slug);
                    }}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                {}
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="slug-bai-hoc"
                    className="mt-1 font-mono text-sm"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
                  )}
                </div>

                {}
                <div>
                  <Label htmlFor="description">Mô tả *</Label>
                  <Input
                    id="description"
                    {...register('description')}
                    placeholder="Mô tả ngắn gọn về bài học..."
                    className="mt-1 text-sm"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </Card>

            {}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Practice Sessions</h3>
                <Button 
                  onClick={() => setShowPracticeForm(true)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Practice
                </Button>
              </div>
              <div className="space-y-2">
                {practices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No practices added yet
                  </p>
                ) : (
                  practices.map((practice, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{practice.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {practice.difficulty === 1 ? 'Beginner' : 
                           practice.difficulty === 2 ? 'Intermediate' : 'Advanced'} • 
                          {practice.estimatedTime} min
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditPracticeIndex(index); setShowPracticeForm(true); }}
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const practiceToDelete = practices[index];
                            // If practice has an id, mark it for deletion (will be deleted when saving lesson)
                            if (practiceToDelete?.id) {
                              setDeletedPracticeIds(prev => [...prev, practiceToDelete.id]);
                            }
                            // Remove from local state
                            setPractices(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Quiz Sessions</h3>
                <Button 
                  onClick={() => setShowQuizForm(true)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quiz
                </Button>
              </div>
              <div className="space-y-2">
                {quizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No quizzes added yet
                  </p>
                ) : (
                  quizzes.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.difficulty === 1 ? 'Beginner' : 
                           quiz.difficulty === 2 ? 'Intermediate' : 'Advanced'} • 
                          {quiz.estimatedTime} min • {quiz.questions?.length || 0} questions
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditQuizIndex(index); setShowQuizForm(true); }}
                        >
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const quizToDelete = quizzes[index];
                            // If quiz has an id, mark it for deletion (will be deleted when saving lesson)
                            if (quizToDelete?.id) {
                              setDeletedQuizIds(prev => [...prev, quizToDelete.id]);
                            }
                            // Remove from local state
                            setQuizzes(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {}
            <Card className="p-4">
              <h3 className="font-bold text-foreground">Xuất bản</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status" className="text-sm">Trạng thái</Label>
                  <Tabs
                    value={watch('status') || 'draft'}
                    onValueChange={(value) => {
                      setValue('status', value as 'draft' | 'published', { shouldValidate: true });
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="draft" className="flex-1">Bản nháp</TabsTrigger>
                      <TabsTrigger value="published" className="flex-1">Xuất bản</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {errors.status && (
                    <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>

      {}
      {showPracticeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PracticeForm
              onSave={handleSavePractice}
              onCancel={handleCancelPractice}
              initialData={editPracticeIndex != null ? practices[editPracticeIndex] : undefined}
              lessonId={initialData?.id || lessonId || ''}
              practiceId={editPracticeIndex != null ? (isEdit ? serverPractices[editPracticeIndex]?.id : practices[editPracticeIndex]?.id) : undefined}
              practiceIndex={editPracticeIndex !== null ? editPracticeIndex : undefined}
            />
          </div>
        </div>
      )}

      {}
      {showQuizForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <QuizForm
              onSave={handleSaveQuiz}
              onCancel={handleCancelQuiz}
              initialData={editQuizIndex != null ? quizzes[editQuizIndex] : undefined}
              lessonId={initialData?.id || lessonId || ''}
              quizId={editQuizIndex != null ? (isEdit ? serverQuizzes[editQuizIndex]?.id : quizzes[editQuizIndex]?.id) : undefined}
            />
          </div>
        </div>
      )}

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        goalRepositoryState={previewGoal}
        practiceTitle={initialData?.title || 'Preview Goal'}
      />

      {/* Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[80vh] rounded-xl shadow-xl border overflow-hidden bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] modal-surface">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-[color:var(--muted)] border-[var(--border)]">
                <div>
                  <h3 className="text-sm font-semibold">Xem trước bài học</h3>
                  {watch('title') && (
                    <p className="text-xs text-muted-foreground mt-1">{watch('title')}</p>
                  )}
                </div>
                <Button
                  onClick={() => setShowPreviewModal(false)}
                  variant="ghost"
                  size="sm"
                >
                  Đóng
                </Button>
              </div>
              <div className="overflow-auto max-h-[calc(80vh-48px)]">
                {content ? (
                  <LessonViewer content={content} />
                ) : (
                  <div className="p-6 opacity-70 text-center">Chưa có nội dung để xem trước</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <GenerateLessonModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateLesson}
        isGenerating={generateLessonMutation.isPending}
      />
    </div>
  );
}
