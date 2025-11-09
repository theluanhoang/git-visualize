'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, GitCommit, Target, Eye } from 'lucide-react';
import CommitGraph from '@/components/common/CommitGraph';
import { IRepositoryState } from '@/types/git';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalRepositoryState: IRepositoryState | null;
  practiceTitle: string;
}

export function GoalModal({ isOpen, onClose, goalRepositoryState, practiceTitle }: GoalModalProps) {
  if (!goalRepositoryState) {
    return null;
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl max-h-[80vh] overflow-y-auto sm:max-w-5xl md:max-w-6xl lg:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Practice Goal: {practiceTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Your Goal</h3>
                <p className="text-blue-800 text-sm">
                  This is the target repository state you need to achieve. Study the visualization below 
                  to understand the final structure with commits, branches, and their relationships.
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Target Repository Structure
            </h3>

            {}
            <div className="mt-4">
              <CommitGraph 
                key={`goal-${JSON.stringify(goalRepositoryState)}`}
                dataSource="goal"
                goalRepositoryState={goalRepositoryState}
                showClearButton={false}
                title="Goal Repository State"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Start Practice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
