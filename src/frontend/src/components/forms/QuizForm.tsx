'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quizSchema, QuizFormData, QuizQuestionData, QuizOptionData, QuizTagData } from '@/lib/schemas/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCreateQuiz, useUpdateQuiz } from '@/lib/react-query/hooks/use-quizzes';
import { quizKeys, lessonKeys } from '@/lib/react-query/query-keys';
import { useQueryClient } from '@tanstack/react-query';

interface QuizFormProps {
  onSave: (quiz: QuizFormData) => void;
  onCancel: () => void;
  initialData?: Partial<QuizFormData>;
  lessonId: string;
  quizId?: string;
}

export function QuizForm({ onSave, onCancel, initialData, lessonId, quizId }: QuizFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'tags'>('basic');
  const queryClient = useQueryClient();
  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      id: initialData?.id || quizId || undefined,
      title: initialData?.title || '',
      description: initialData?.description || '',
      difficulty: initialData?.difficulty ?? 1,
      estimatedTime: initialData?.estimatedTime ?? 0,
      isActive: initialData?.isActive ?? true,
      order: initialData?.order ?? 0,
      passingScore: initialData?.passingScore ?? 70,
      questions: initialData?.questions || [],
      tags: initialData?.tags || [],
    }
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions'
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  });

  const onSubmit = async (data: QuizFormData) => {
    try {
      // If lessonId is not available (lesson not created yet), just save to state
      if (!lessonId || lessonId === '') {
        onSave(data);
        toast.success('Quiz đã được lưu (sẽ được tạo khi bạn lưu bài học)');
        return;
      }

      const quizData = {
        ...data,
        lessonId,
      };

      if (quizId) {
        await updateQuizMutation.mutateAsync({ id: quizId, data: quizData });
        toast.success('Quiz đã được cập nhật thành công!');
      } else {
        const createdQuiz = await createQuizMutation.mutateAsync(quizData);
        // Update the quiz data with the ID from server
        onSave({ ...data, id: createdQuiz.id });
        toast.success('Quiz đã được tạo thành công!');
        return;
      }

      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      onSave(data);
    } catch (error) {
      console.error('Error saving quiz:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as Error)?.message || 'Không thể lưu quiz. Vui lòng thử lại.';
      toast.error(errorMessage);
    }
  };

  const addQuestion = () => {
    appendQuestion({
      question: '',
      type: 'single_choice',
      points: 1,
      order: questionFields.length,
      explanation: '',
      options: [
        { text: '', isCorrect: false, order: 0 },
        { text: '', isCorrect: false, order: 1 },
      ],
    });
  };

  const addOption = (questionIndex: number) => {
    const questions = watch('questions');
    const currentQuestion = questions[questionIndex];
    const newOptions = [
      ...(currentQuestion?.options || []),
      { text: '', isCorrect: false, order: currentQuestion?.options?.length || 0 },
    ];
    setValue(`questions.${questionIndex}.options`, newOptions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const questions = watch('questions');
    const currentQuestion = questions[questionIndex];
    const newOptions = currentQuestion?.options?.filter((_, i) => i !== optionIndex) || [];
    setValue(`questions.${questionIndex}.options`, newOptions);
  };

  const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
    const questions = watch('questions');
    const currentQuestion = questions[questionIndex];
    const questionType = currentQuestion?.type || 'single_choice';
    const options = currentQuestion?.options || [];

    if (questionType === 'single_choice' || questionType === 'true_false') {
      // Only one correct answer allowed
      const newOptions = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === optionIndex,
      }));
      setValue(`questions.${questionIndex}.options`, newOptions);
    } else {
      // Multiple choice - toggle
      const newOptions = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === optionIndex ? !opt.isCorrect : opt.isCorrect,
      }));
      setValue(`questions.${questionIndex}.options`, newOptions);
    }
  };

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {quizId ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || createQuizMutation.isPending || updateQuizMutation.isPending}
          >
            {isSubmitting || createQuizMutation.isPending || updateQuizMutation.isPending
              ? 'Đang lưu...'
              : 'Lưu Quiz'
            }
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'basic' ? 'default' : 'outline'}
          onClick={() => setActiveTab('basic')}
        >
          Thông tin cơ bản
        </Button>
        <Button
          variant={activeTab === 'questions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('questions')}
        >
          Câu hỏi ({questionFields.length})
        </Button>
        <Button
          variant={activeTab === 'tags' ? 'default' : 'outline'}
          onClick={() => setActiveTab('tags')}
        >
          Tags ({tagFields.length})
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {activeTab === 'basic' && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề Quiz *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Nhập tiêu đề quiz..."
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Mô tả về quiz..."
                  className="mt-1"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Độ khó (1-5) *</Label>
                  <Input
                    id="difficulty"
                    type="number"
                    min={1}
                    max={5}
                    {...register('difficulty', { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errors.difficulty && (
                    <p className="text-sm text-red-500 mt-1">{errors.difficulty.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedTime">Thời gian ước tính (phút) *</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min={0}
                    {...register('estimatedTime', { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errors.estimatedTime && (
                    <p className="text-sm text-red-500 mt-1">{errors.estimatedTime.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passingScore">Điểm đạt (0-100%) *</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min={0}
                    max={100}
                    {...register('passingScore', { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errors.passingScore && (
                    <p className="text-sm text-red-500 mt-1">{errors.passingScore.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="order">Thứ tự hiển thị *</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    {...register('order', { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errors.order && (
                    <p className="text-sm text-red-500 mt-1">{errors.order.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="rounded"
                />
                <Label htmlFor="isActive">Kích hoạt quiz</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'questions' && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Câu hỏi</CardTitle>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm câu hỏi
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence>
                {questionFields.map((question, questionIndex) => {
                  const questionData = watch(`questions.${questionIndex}`);
                  const options = questionData?.options || [];

                  return (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div>
                            <Label>Câu hỏi {questionIndex + 1} *</Label>
                            <Textarea
                              {...register(`questions.${questionIndex}.question`)}
                              placeholder="Nhập câu hỏi..."
                              className="mt-1"
                              rows={2}
                            />
                            {errors.questions?.[questionIndex]?.question && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.questions[questionIndex]?.question?.message}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Loại câu hỏi</Label>
                              <Select
                                value={questionData?.type || 'single_choice'}
                                onValueChange={(value) => {
                                  setValue(`questions.${questionIndex}.type`, value as any);
                                  // Reset correct answers when changing type
                                  const currentOptions = questionData?.options || [];
                                  if (value === 'single_choice' || value === 'true_false') {
                                    const newOptions = currentOptions.map((opt, i) => ({
                                      ...opt,
                                      isCorrect: i === 0,
                                    }));
                                    setValue(`questions.${questionIndex}.options`, newOptions);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single_choice">Chọn một đáp án</SelectItem>
                                  <SelectItem value="multiple_choice">Chọn nhiều đáp án</SelectItem>
                                  <SelectItem value="true_false">Đúng/Sai</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Điểm số</Label>
                              <Input
                                type="number"
                                min={1}
                                {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label>Thứ tự</Label>
                              <Input
                                type="number"
                                min={0}
                                {...register(`questions.${questionIndex}.order`, { valueAsNumber: true })}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Giải thích (tùy chọn)</Label>
                            <Textarea
                              {...register(`questions.${questionIndex}.explanation`)}
                              placeholder="Giải thích đáp án đúng..."
                              className="mt-1"
                              rows={2}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label>Đáp án *</Label>
                              <Button
                                type="button"
                                onClick={() => addOption(questionIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm đáp án
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleCorrectOption(questionIndex, optionIndex)}
                                    className="p-1 hover:bg-muted rounded"
                                  >
                                    {option.isCorrect ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>
                                  <Input
                                    {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
                                    placeholder={`Đáp án ${optionIndex + 1}...`}
                                    className="flex-1"
                                  />
                                  {options.length > 2 && (
                                    <Button
                                      type="button"
                                      onClick={() => removeOption(questionIndex, optionIndex)}
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {errors.questions?.[questionIndex]?.options && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.questions[questionIndex]?.options?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          variant="ghost"
                          size="sm"
                          className="ml-4"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {questionFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
                </div>
              )}

              {errors.questions && (
                <p className="text-sm text-red-500">{errors.questions.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'tags' && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Tags</CardTitle>
              <Button
                type="button"
                onClick={() => appendTag({ name: '', color: '#3B82F6' })}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm tag
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {tagFields.map((tag, index) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      {...register(`tags.${index}.name`)}
                      placeholder="Tên tag..."
                      className="flex-1"
                    />
                    <Input
                      type="color"
                      {...register(`tags.${index}.color`)}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      onClick={() => removeTag(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
