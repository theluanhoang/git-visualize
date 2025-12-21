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

interface LessonFormProps {
  initialData?: Partial<LessonWithPractices>;
  isEdit?: boolean;
  lessonId?: string;
}

export function LessonForm({ initialData, isEdit = false, lessonId }: LessonFormProps) {
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
  
  const [serverPractices] = useState<PracticeFormData[]>(initialData?.practices || []);
  const [serverQuizzes, setServerQuizzes] = useState<QuizFormData[]>((initialData as any)?.quizzes || []);
  const [deletedQuizIds, setDeletedQuizIds] = useState<string[]>([]);
  const [deletedPracticeIds, setDeletedPracticeIds] = useState<string[]>([]);

  // Load quizzes when editing
  const { data: quizzesData } = useQuizzes({
    lessonSlug: initialData?.slug || undefined,
    includeRelations: true,
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
      status: initialData?.status || 'published'
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
      
      if (isEdit && lessonId) {
        savedLesson = await updateLessonMutation.mutateAsync({ id: lessonId, data: formData });
      } else {
        savedLesson = await createLessonMutation.mutateAsync(formData);
      }
      
      const lessonIdToUse = savedLesson?.id || lessonId;
      if (!lessonIdToUse) {
        toast.error('Không tìm thấy ID bài học');
        return;
      }

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
              lessonId: lessonIdToUse
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
              lessonId: lessonIdToUse
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
                  lessonId: lessonIdToUse
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
                  lessonId: lessonIdToUse
                })
              );
            }
          }
        }
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      
      queryClient.invalidateQueries({ queryKey: practiceKeys.all });
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      
      const totalOperations = deletedPracticeIds.length + deletedQuizIds.length + practicesToCreate.length + quizzesToCreate.length;
      if (totalOperations > 0) {
        toast.success(`Bài học và ${totalOperations} thao tác đã được lưu thành công!`);
      } else {
        toast.success('Bài học đã được lưu thành công!');
      }
      
      setPractices([]);
      setQuizzes([]);
      setDeletedPracticeIds([]);
      setDeletedQuizIds([]);
      
      router.push(`/${locale}/admin/lessons`);
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/lessons`}>
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
          <Button variant="outline">
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
                    value={watch('status') as 'draft' | 'published'}
                    onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
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

      <GenerateLessonModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateLesson}
        isGenerating={generateLessonMutation.isPending}
      />
    </div>
  );
}
