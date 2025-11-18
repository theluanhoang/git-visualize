'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { practiceSchema, PracticeFormData, PracticeTagData } from '@/lib/schemas/practice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Lightbulb, Target, Terminal as TerminalIcon, Tag, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommitGraph from '@/components/common/CommitGraph';
import Terminal from '@/components/common/terminal/Terminal';
import { useTerminalResponses, useGitEngine } from '@/lib/react-query/hooks/use-git-engine';
import { useQueryClient } from '@tanstack/react-query';
import { usePracticeFormSubmission } from '@/lib/react-query/hooks/use-practice';
import { terminalKeys } from '@/lib/react-query/query-keys';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { GitCommandResponse } from '@/types/git';
import { usePracticeFormState } from '@/hooks/use-practice-form-state';
import {
  buildGoalStateFromResponses,
  buildGoalStateFromCommands,
  extractGitCommandsFromResponses,
} from '@/lib/utils/goal-state-builder';
import { rebuildRepositoryStateFromCommands } from '@/lib/utils/repository-state-builder';


interface PracticeFormProps {
  onSave: (practice: PracticeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<PracticeFormData>;
  lessonId: string;
  practiceId?: string;
  practiceIndex?: number;
}

export function PracticeForm({ onSave, onCancel, initialData, lessonId, practiceId, practiceIndex }: PracticeFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'instructions' | 'commands' | 'hints' | 'validation' | 'tags'>('basic');
  const queryClient = useQueryClient();
  const t = useTranslations('practice.form');
  
  const { handleSave, isSaving } = usePracticeFormSubmission();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(practiceSchema),
    defaultValues: {
      id: initialData?.id || practiceId || undefined,
      title: initialData?.title || '',
      scenario: initialData?.scenario || '',
      difficulty: initialData?.difficulty ?? 1,
      estimatedTime: initialData?.estimatedTime ?? 0,
      isActive: initialData?.isActive ?? true,
      order: initialData?.order ?? 0,
      instructions: initialData?.instructions || [],
      hints: initialData?.hints || [],
      expectedCommands: initialData?.expectedCommands || [],
      tags: (initialData?.tags || []).map((tag) => ({
        name: tag.name,
        color: tag.color ?? '#3B82F6'
      }))
    }
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions'
  });

  const { fields: hintFields, append: appendHint, remove: removeHint } = useFieldArray({
    control,
    name: 'hints'
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  });

  const uniqueId = useMemo(() => Date.now(), []);
  const goalBuilderId = useMemo(() => {
    if (practiceId) {
      return practiceIndex !== undefined 
        ? `goal-builder-${practiceId}-${practiceIndex}` 
        : `goal-builder-${practiceId}`;
    }
    return practiceIndex !== undefined 
      ? `goal-builder-new-${lessonId}-${practiceIndex}-${uniqueId}` 
      : `goal-builder-new-${lessonId}-${uniqueId}`;
  }, [practiceId, practiceIndex, lessonId, uniqueId]);
  
  const { data: goalResponses = [] } = useTerminalResponses(goalBuilderId);
  const { clearAllData } = useGitEngine(goalBuilderId);

  const { goalPreviewState, resetKey, isResetting, resetGoalBuilder } = usePracticeFormState({
    goalBuilderId,
    practiceId,
    initialData,
    goalResponses,
  });
  

  const onSubmit = useCallback(async (data: PracticeFormData) => {
    const cacheKey = terminalKeys.practice(goalBuilderId);
    const localStorageKey = goalBuilderId 
      ? LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(goalBuilderId)
      : LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES('global');
    
    const cachedResponses = queryClient.getQueryData<GitCommandResponse[]>(cacheKey) || [];
    const storedResponses = localStorageHelpers.getJSON<GitCommandResponse[]>(localStorageKey, []);
    const latestResponses = cachedResponses.length > 0 ? cachedResponses : storedResponses;
    
    try {
      const responsesToUse = latestResponses.length > 0 ? latestResponses : goalResponses;
      const mapped = extractGitCommandsFromResponses(responsesToUse);

      let goalState = await buildGoalStateFromResponses(responsesToUse, goalPreviewState);
      
      if (!goalState && mapped.length > 0) {
        goalState = await buildGoalStateFromCommands(mapped);
      }

      const formDataWithGoal: PracticeFormData = { 
        ...data,
        id: data.id || practiceId || initialData?.id,
        expectedCommands: mapped, 
        goalRepositoryState: goalState 
      };

      if (lessonId && practiceId) {
        const result = await handleSave(formDataWithGoal, lessonId, practiceId);
        
        if (result) {
          if (goalResponses.length > 0) {
            queryClient.setQueryData(cacheKey, goalResponses);
            try {
              localStorageHelpers.setJSON(localStorageKey, goalResponses);
            } catch (error) {}
          } else if (result.expectedCommands && result.expectedCommands.length > 0) {
            try {
              const { responses } = await rebuildRepositoryStateFromCommands(result.expectedCommands);
              queryClient.setQueryData(cacheKey, responses);
              localStorageHelpers.setJSON(localStorageKey, responses);
            } catch (error) {}
          }
          
          if (result.goalRepositoryState) {
            queryClient.setQueryData(['git', 'state', goalBuilderId], result.goalRepositoryState);
          }
        }
        
        const syncedPractice = result ?? formDataWithGoal;
        onSave?.(syncedPractice);
        toast.success('Practice updated successfully!');
      } else {
        onSave(formDataWithGoal);
      }
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          toast.error('Bạn cần quyền admin để tạo/sửa practice. Vui lòng đăng nhập với tài khoản admin.');
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error('Bạn cần đăng nhập để thực hiện thao tác này.');
        } else {
          toast.error(`Lỗi khi lưu practice: ${error.message}`);
        }
      } else {
        toast.error('Có lỗi xảy ra khi lưu practice. Vui lòng thử lại.');
      }
    }
  }, [lessonId, practiceId, goalBuilderId, goalResponses, goalPreviewState, handleSave, onSave, queryClient]);

  const addInstruction = useCallback(() => {
    appendInstruction({ content: '', order: instructionFields.length + 1 });
  }, [appendInstruction, instructionFields.length]);

  const addHint = useCallback(() => {
    appendHint({ content: '', order: hintFields.length + 1 });
  }, [appendHint, hintFields.length]);

  const addTag = useCallback(() => {
    appendTag({ name: '', color: '#3B82F6' });
  }, [appendTag]);

  const handleResetGoalBuilder = useCallback(async () => {
    await resetGoalBuilder(clearAllData);
  }, [resetGoalBuilder, clearAllData]);

  type TabId = 'basic' | 'instructions' | 'commands' | 'hints' | 'tags';
  
  const tabs = useMemo<{ id: TabId; label: string; icon: typeof Target }[]>(() => [
    { id: 'basic', label: t('basic'), icon: Target },
    { id: 'instructions', label: t('instructions'), icon: Target },
    { id: 'commands', label: t('commands'), icon: TerminalIcon },
    { id: 'hints', label: t('hints'), icon: Lightbulb },
    { id: 'tags', label: t('tags'), icon: Tag }
  ], [t]);

  const handleFormSubmit = useCallback(
    handleSubmit(
      async (data: PracticeFormData) => {
        await onSubmit(data);
      },
      () => {}
    ),
    [handleSubmit, onSubmit]
  );

  return (
    <form 
      onSubmit={handleFormSubmit}
      className="space-y-6 w-full p-6 rounded-full max-w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('scenario')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || isSaving}
          >
            {isSubmitting || isSaving ? 'Saving...' : t('save')}
          </Button>
        </div>
      </div>
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Practice Title *</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="e.g., Git Basics Practice"
                      className="mt-1"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="scenario">Scenario Description *</Label>
                    <Textarea
                      id="scenario"
                      {...register('scenario')}
                      placeholder="Describe what the user needs to accomplish..."
                      className="mt-1"
                      rows={3}
                    />
                    {errors.scenario && (
                      <p className="text-sm text-red-500 mt-1">{errors.scenario.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={watch('difficulty')?.toString()}
                        onValueChange={(value) => setValue('difficulty', parseInt(value))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Beginner</SelectItem>
                          <SelectItem value="2">Intermediate</SelectItem>
                          <SelectItem value="3">Advanced</SelectItem>
                          <SelectItem value="4">Expert</SelectItem>
                          <SelectItem value="5">Master</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                      <Input
                        id="estimatedTime"
                        type="number"
                        step="1"
                        {...register('estimatedTime', { 
                          valueAsNumber: true,
                          setValueAs: (value) => Math.round(Number(value) || 0)
                        })}
                        placeholder="15"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Active Practice</Label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Step-by-Step Instructions</CardTitle>
                  <Button type="button" onClick={addInstruction} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Instruction
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {instructionFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Input
                          {...register(`instructions.${index}.content`)}
                          placeholder="Enter instruction step..."
                          className="mb-2"
                        />
                        {errors.instructions?.[index]?.content && (
                          <p className="text-sm text-red-500">
                            {errors.instructions[index]?.content?.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {instructionFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No instructions added yet</p>
                      <p className="text-sm">Click "Add Instruction" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'commands' && (
            <motion.div
              key="commands"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Goal Builder</CardTitle>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetGoalBuilder}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Graph
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 min-w-0">
                    <div className="min-w-0 overflow-hidden" key={`commit-graph-${resetKey}`}>
                      <CommitGraph 
                        dataSource="goal" 
                        goalRepositoryState={goalPreviewState || undefined} 
                        showClearButton={false} 
                        title="Goal Preview"
                        practiceId={goalBuilderId}
                        isResetting={isResetting}
                      />
                    </div>
                    <div className="min-w-0 overflow-hidden" key={resetKey}>
                      <Terminal practiceId={goalBuilderId} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'hints' && (
            <motion.div
              key="hints"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Helpful Hints</CardTitle>
                  <Button type="button" onClick={addHint} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hint
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hintFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Textarea
                          {...register(`hints.${index}.content`)}
                          placeholder="Enter helpful hint..."
                          rows={2}
                        />
                        {errors.hints?.[index]?.content && (
                          <p className="text-sm text-red-500">
                            {errors.hints[index]?.content?.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHint(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {hintFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hints added yet</p>
                      <p className="text-sm">Click "Add Hint" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'tags' && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tags</CardTitle>
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tagFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            {...register(`tags.${index}.name`)}
                            placeholder="e.g., beginner"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={watch(`tags.${index}.color`) || '#3B82F6'}
                              onChange={(e) => setValue(`tags.${index}.color`, e.target.value)}
                              className="h-10 w-12 p-1 rounded border cursor-pointer bg-transparent"
                            />
                            <Input
                              {...register(`tags.${index}.color`)}
                              placeholder="#3B82F6"
                              className="font-mono"
                            />
                          </div>
                        </div>
                        {watch(`tags.${index}.name`) && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Preview:</span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: watch(`tags.${index}.color`) || '#3B82F6',
                                color: watch(`tags.${index}.color`) || '#3B82F6'
                              }}
                            >
                              {watch(`tags.${index}.name`) || 'Tag name'}
                            </Badge>
                          </div>
                        )}
                        {errors.tags?.[index]?.name && (
                          <p className="text-sm text-red-500">
                            {errors.tags[index]?.name?.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {tagFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tags added yet</p>
                      <p className="text-sm">Click "Add Tag" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
