import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePracticeFormSubmission, usePractices, useDeletePractice } from '@/lib/react-query/hooks/use-practice';
import { PracticeFormData } from '@/lib/schemas/practice';
import { Practice } from '@/services/practices';

/**
 * Example component demonstrating how to use the practice save functionality
 */
export function PracticeSaveExample() {
  const [lessonId] = useState('your-lesson-id-here');
  
  // Get all practices for this lesson
  const { data: practices, isLoading: isLoadingPractices } = usePractices({ 
    lessonId 
  });
  
  // Practice form submission hook
  const { handleSave, isSaving, error, isSuccess } = usePracticeFormSubmission();
  
  // Delete practice hook
  const deleteMutation = useDeletePractice();

  const handleCreatePractice = async () => {
    const samplePracticeData: PracticeFormData = {
      title: 'Sample Git Practice',
      scenario: 'Learn basic git commands',
      difficulty: 2,
      estimatedTime: 15,
      isActive: true,
      order: 1,
      instructions: [
        { content: 'Initialize a new git repository', order: 1 },
        { content: 'Add files to staging area', order: 2 },
        { content: 'Make your first commit', order: 3 }
      ],
      hints: [
        { content: 'Use git init to initialize repository', order: 1 },
        { content: 'Use git add . to add all files', order: 2 },
        { content: 'Use git commit -m "message" to commit', order: 3 }
      ],
      expectedCommands: [
        { command: 'git init', order: 1, isRequired: true },
        { command: 'git add .', order: 2, isRequired: true },
        { command: 'git commit -m "Initial commit"', order: 3, isRequired: true }
      ],
      tags: [
        { name: 'beginner', color: '#4CAF50' },
        { name: 'git-basics', color: '#2196F3' }
      ]
    };

    try {
      const result = await handleSave(samplePracticeData, lessonId);
      console.log('Practice created successfully:', result);
    } catch (error) {
      console.error('Failed to create practice:', error);
    }
  };

  const handleUpdatePractice = async (practiceId: string) => {
    const updateData: PracticeFormData = {
      title: 'Updated Git Practice',
      scenario: 'Updated scenario description',
      difficulty: 3,
      estimatedTime: 20,
      isActive: true,
      order: 1,
      instructions: [
        { content: 'Updated instruction 1', order: 1 },
        { content: 'Updated instruction 2', order: 2 }
      ],
      hints: [
        { content: 'Updated hint 1', order: 1 }
      ],
      expectedCommands: [
        { command: 'git init', order: 1, isRequired: true },
        { command: 'git status', order: 2, isRequired: true }
      ],
      tags: [
        { name: 'intermediate', color: '#FF9800' }
      ]
    };

    try {
      const result = await handleSave(updateData, lessonId, practiceId);
      console.log('Practice updated successfully:', result);
    } catch (error) {
      console.error('Failed to update practice:', error);
    }
  };

  const handleDeletePractice = async (practiceId: string) => {
    try {
      await deleteMutation.mutateAsync(practiceId);
      console.log('Practice deleted successfully');
    } catch (error) {
      console.error('Failed to delete practice:', error);
    }
  };

  if (isLoadingPractices) {
    return <div>Loading practices...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Practice Save Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleCreatePractice} 
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Sample Practice'}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600">{error.message}</p>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-600">Practice saved successfully.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {practices?.data && practices.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {practices.data.map((practice: Practice) => (
                <div key={practice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{practice.title}</h4>
                    <p className="text-sm text-muted-foreground">{practice.scenario}</p>
                    <p className="text-xs text-muted-foreground">
                      Difficulty: {practice.difficulty} | Time: {practice.estimatedTime}min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdatePractice(practice.id)}
                      disabled={isSaving}
                    >
                      Update
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeletePractice(practice.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PracticeSaveExample;
