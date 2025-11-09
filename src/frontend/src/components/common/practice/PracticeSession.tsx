'use client';

import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Practice } from '@/services/practices';
import PracticeSidebar from './PracticeSidebar';
import FeedbackSystem from './FeedbackSystem';
import PracticeHintModal from './PracticeHintModal';
import Terminal from '@/components/common/terminal/Terminal';
import CommitGraph from '@/components/common/CommitGraph';
import { useGitEngine } from '@/lib/react-query/hooks/use-git-engine';
import { useRepositoryState } from '@/lib/react-query/hooks/use-git-engine';
import { useValidatePractice } from '@/lib/react-query/hooks/use-practices';
import { IRepositoryState } from '@/types/git';
import { useFeedback } from '@/hooks/use-feedback';
import { useValidationCelebration } from '@/hooks/use-validation-celebration';
import { useErrorFeedback } from '@/hooks/use-error-feedback';
import ErrorFeedbackModal from '@/components/common/animations/ErrorFeedbackModal';
import InitialGuidanceModal from '@/components/common/animations/InitialGuidanceModal';
import { useInitialGuidance } from '@/hooks/use-initial-guidance';
import { useVersionCheck } from '@/hooks/use-version-check';
import VersionResetDialog from '@/components/common/VersionResetDialog';
import { useQueryClient } from '@tanstack/react-query';
import { terminalKeys, practiceKeys } from '@/lib/react-query/query-keys';
import { localStorageHelpers, LOCALSTORAGE_KEYS } from '@/constants/localStorage';
import { toast } from 'sonner';

interface PracticeSessionProps {
  practice: Practice;
  onComplete: () => void;
  onExit: () => void;
}

export default function PracticeSession({ practice, onComplete, onExit }: PracticeSessionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [hasShownInitialGuidance, setHasShownInitialGuidance] = useState(false);
  const queryClient = useQueryClient();

  const { clearAllData, syncFromServer } = useGitEngine(practice.id, practice.version);
  const { data: repoState } = useRepositoryState(practice.id);
  const { mutate: validatePractice, isPending: isValidating } = useValidatePractice();

  const {
    showResetDialog,
    savedVersion,
    isResetting,
    handleConfirmReset,
    handleCancelReset,
  } = useVersionCheck({
    practiceId: practice.id,
    practiceTitle: practice.title,
    currentVersion: practice.version || 1,
    onVersionMismatch: () => {
      window.location.reload();
    },
  });

  React.useEffect(() => {
    if (practice.goalRepositoryState) {
      queryClient.invalidateQueries({ queryKey: terminalKeys.goal });
      queryClient.invalidateQueries({ queryKey: practiceKeys.detail(practice.id) });
    }
  }, [practice.goalRepositoryState, queryClient, practice.id]);

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: practiceKeys.detail(practice.id) });
  }, [queryClient, practice.id]);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: practiceKeys.detail(practice.id) });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient, practice.id]);


  const {
    feedback,
    showSuccess,
    showHint: showHintFeedback,
    showCongratulations,
    showEpicSuccess,
    hideFeedback
  } = useFeedback();

  const { triggerValidationCelebration } = useValidationCelebration();
  const { errorFeedback, showErrorFeedback, closeErrorFeedback, resetErrorFeedback } = useErrorFeedback();
  const { guidanceState, showInitialGuidance, closeInitialGuidance } = useInitialGuidance();

  const checkForPracticeUpdates = async () => {
    try {
      const hasTerminalData = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practice.id)) !== null;
      const hasCommitGraphData = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(practice.id)) !== null;
      const hasAnyPracticeData = hasTerminalData || hasCommitGraphData;
      
      if (!hasAnyPracticeData) {
        return false;
      }
      
      await queryClient.refetchQueries({ queryKey: practiceKeys.detail(practice.id) });
      
      const freshPractice = queryClient.getQueryData(practiceKeys.detail(practice.id)) as Practice | undefined;
      const currentVersion = freshPractice?.version || practice.version || 1;
      const savedVersion = localStorageHelpers.version.getVersion(practice.id);
      
      if (savedVersion !== null && savedVersion !== currentVersion) {
        toast.info('Practice has been updated! Please refresh to get the latest version.');
        return true;
      }
    } catch (error) {
      console.warn('Failed to check for updates:', error);
    }
    return false;
  };

  const checkStepCompletion = () => {
    return completedSteps.has(currentStep);
  };

  const handleNextStep = async () => {
    await checkForPracticeUpdates();
    if (currentStep < (practice.instructions?.length || 0)) {
      setCurrentStep(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrevStep = async () => {
    await checkForPracticeUpdates();
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setShowHint(false);
    }
  };

  const handleComplete = async () => {
    await checkForPracticeUpdates();
    if (!isCompleted) {
      setIsCompleted(true);
      showEpicSuccess(
        '🎉 Chúc Mừng! Tuyệt Vời!',
        `Bạn đã hoàn thành hoàn hảo "${practice.title}". Tiếp tục phát huy nhé!`,
        {
          label: 'Tiếp tục học tập',
          onClick: onComplete
        }
      );
    }
  };

  const handleReset = async () => {
    setCurrentStep(1);
    setIsCompleted(false);
    setCompletedSteps(new Set());
    setShowHint(false);
    setHasShownInitialGuidance(false);
    resetErrorFeedback();
    await clearAllData();
  };

  const handleViewGoal = async () => {
    await checkForPracticeUpdates();
    setIsGoalModalOpen(true);
  };

  const handleValidate = async () => {
    await checkForPracticeUpdates();
    
    if (!repoState) {
      const guidanceMessage = !hasShownInitialGuidance 
        ? 'Hãy gõ câu lệnh đầu tiên của bạn vào terminal để bắt đầu bài học!'
        : 'Bạn cần bắt đầu với câu lệnh đầu tiên! Hãy gõ "git init" vào terminal.';
      
      showInitialGuidance({
        practiceTitle: practice.title,
        firstCommand: 'git init',
        guidanceMessage
      });
      
      if (!hasShownInitialGuidance) {
        setHasShownInitialGuidance(true);
      }
      return;
    }
    
    if (!practice.goalRepositoryState) {
      showErrorFeedback([{
        type: 'error',
        field: 'practice',
        expected: 'Goal repository state',
        actual: 'Not defined'
      }]);
      return;
    }
    
    const actualRepoState = (repoState as any).state || repoState;
    
    validatePractice(
      { practiceId: practice.id, userRepositoryState: actualRepoState as IRepositoryState },
      {
        onSuccess: (res) => {
          if (res.isCorrect) {
            triggerValidationCelebration({
              isCorrect: res.isCorrect,
              score: res.score,
              message: res.message,
              feedback: res.feedback
            });
          } else {
            const errorItems = res.differences.map(d => ({
              type: d.type,
              field: d.field,
              expected: String(d.expected),
              actual: String(d.actual)
            }));
            showErrorFeedback(errorItems);
          }
        },
        onError: (error: any) => {
          let errorMessage = 'Validation failed';
          if (error.response?.status === 400) {
            errorMessage = `Bad Request: ${error.response?.data?.message || 'Invalid request data'}`;
          } else if (error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
            errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
          } else if (error.message?.includes('404')) {
            errorMessage = 'API endpoint not found. Please check the server configuration.';
          } else if (error.message?.includes('500')) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          showErrorFeedback([{
            type: 'error',
            field: 'server',
            expected: 'Valid Request',
            actual: errorMessage
          }]);
        }
      }
    );
  };

  const handleToggleHint = async () => {
    await checkForPracticeUpdates();
    setShowHint(!showHint);
  };

  return (
    <div className="flex h-screen bg-background">
      {}
      <div className="flex-1 flex flex-col">
        {}
        <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">{practice.title}</h1>
                <p className="text-sm text-muted-foreground">{practice.scenario}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onExit}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  Exit Practice
                </button>
              </div>
            </div>
        </div>

        {}
        <div className="flex-1 flex flex-col gap-4 p-4">
          <div className="flex-1">
            <CommitGraph practiceId={practice.id} practiceVersion={practice.version} title="Practice Graph" />
          </div>
          <div className="flex-1">
            <Terminal practiceId={practice.id} />
          </div>
        </div>
      </div>

      {}
      <PracticeSidebar
        practice={practice}
        currentStep={currentStep}
        onNextStep={handleNextStep}
        onPrevStep={handlePrevStep}
        onComplete={handleComplete}
        onReset={handleReset}
        isCompleted={isCompleted}
        showHint={showHint}
        onToggleHint={handleToggleHint}
        onShowHintModal={() => setShowHintModal(true)}
        onViewGoal={handleViewGoal}
        onValidate={handleValidate}
        isValidating={isValidating}
      />

      {}
      <FeedbackSystem feedback={feedback} onClose={hideFeedback} />
      
      {}
      <PracticeHintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        practice={practice}
      />

      {isGoalModalOpen && practice.goalRepositoryState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsGoalModalOpen(false)} />
          <div className="relative w-full max-w-5xl bg-background border border-[var(--border)] rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold">Goal Graph</h2>
              <button onClick={() => setIsGoalModalOpen(false)} className="px-2 py-1 text-sm border rounded hover:bg-muted">Close</button>
            </div>
            <div className="p-4" style={{ height: '70vh' }}>
              <div className="h-full">
                <CommitGraph 
                  key={`goal-${JSON.stringify(practice.goalRepositoryState)}`}
                  dataSource="goal" 
                  goalRepositoryState={practice.goalRepositoryState as IRepositoryState} 
                  showClearButton={false} 
                  title="Goal Graph" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ErrorFeedbackModal
        isOpen={errorFeedback.isOpen}
        onClose={closeErrorFeedback}
        errorCount={errorFeedback.errorCount}
        errors={errorFeedback.errors}
        onRetry={() => {
          closeErrorFeedback();
        }}
        onViewHint={() => {
          closeErrorFeedback();
          setShowHintModal(true);
        }}
      />

      <InitialGuidanceModal
        isOpen={guidanceState.isOpen}
        onClose={closeInitialGuidance}
        onStart={() => {
          closeInitialGuidance();
        }}
        practiceTitle={guidanceState.practiceTitle}
        firstCommand={guidanceState.firstCommand}
        guidanceMessage={guidanceState.guidanceMessage}
      />

      {/* Version Reset Dialog */}
      <VersionResetDialog
        open={showResetDialog}
        practiceTitle={practice.title}
        currentVersion={practice.version || 1}
        savedVersion={savedVersion || 1}
        onConfirm={handleConfirmReset}
        loading={isResetting}
      />
    </div>
  );
}
