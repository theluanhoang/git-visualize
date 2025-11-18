'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Circle, Clock, Lightbulb, AlertCircle, RefreshCw, RotateCcw, Eye, Copy, Check } from 'lucide-react';
import { Practice } from '@/services/practices';
import { toast } from 'sonner';

interface PracticeSidebarProps {
  practice: Practice;
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onComplete: () => void;
  onReset: () => void;
  isCompleted: boolean;
  showHint: boolean;
  onToggleHint: () => void;
  onShowHintModal: () => void;
  onSync?: () => void;
  onViewGoal?: () => void;
  isViewingGoal?: boolean;
  onValidate?: () => void;
  isValidating?: boolean;
}

export default function PracticeSidebar({
  practice,
  currentStep,
  onNextStep,
  onPrevStep,
  onComplete,
  onReset,
  isCompleted,
  showHint,
  onToggleHint,
  onShowHintModal,
  onSync,
  onViewGoal,
  isViewingGoal,
  onValidate,
  isValidating
}: PracticeSidebarProps) {
  const [showExpectedCommands, setShowExpectedCommands] = useState(false);
  const [copiedCommandId, setCopiedCommandId] = useState<string | null>(null);

  const expectedCommands = practice.expectedCommands || [];

  return (
    <div className="w-full lg:w-80 bg-background border-t lg:border-t-0 lg:border-l border-border lg:self-stretch max-h-[60vh] lg:max-h-none overflow-y-auto">
      <div className="p-4 space-y-4">
        {}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{practice.title}</CardTitle>
              <Badge variant={practice.difficulty === 1 ? 'default' : practice.difficulty === 2 ? 'secondary' : 'destructive'}>
                {practice.difficulty === 1 ? 'Beginner' : practice.difficulty === 2 ? 'Intermediate' : 'Advanced'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{practice.scenario}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{practice.estimatedTime} minutes</span>
            </div>
          </CardContent>
        </Card>
        {practice.hints && practice.hints.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Hints
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleHint}
                  className="ml-auto h-6 px-2"
                >
                  {showHint ? 'Hide' : 'Show'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showHint && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {practice.hints.map((hint, index) => (
                    <div key={hint.id} className="flex items-start gap-2 text-sm">
                      <Circle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 wrap-break-word leading-relaxed min-w-0">{hint.content}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {}
        {expectedCommands.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Expected Commands
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExpectedCommands(!showExpectedCommands)}
                  className="ml-auto h-6 px-2"
                >
                  {showExpectedCommands ? 'Hide' : 'Show'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showExpectedCommands && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {expectedCommands
                    .sort((a, b) => {
                      const orderA = typeof a.order === 'number' ? a.order : parseInt(String(a.order || 0));
                      const orderB = typeof b.order === 'number' ? b.order : parseInt(String(b.order || 0));
                      return orderA - orderB;
                    })
                    .map((cmd) => (
                    <div key={cmd.id} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground shrink-0 w-5 text-right">{cmd.order}.</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all flex-1">
                        {cmd.command}
                      </code>
                      <button
                        type="button"
                        onClick={async () => {
                          const t = toast.loading('Đang sao chép…', { position: 'top-right' });
                          try {
                            await navigator.clipboard.writeText(cmd.command);
                            toast.success('Đã sao chép lệnh', { id: t, position: 'top-right' });
                            setCopiedCommandId(cmd.id);
                            setTimeout(() => setCopiedCommandId(null), 1500);
                          } catch (e) {
                            toast.error('Sao chép thất bại', { id: t, position: 'top-right' });
                          }
                        }}
                        className="inline-flex items-center justify-center rounded border border-border bg-background hover:bg-muted p-1 text-muted-foreground"
                        title="Copy command"
                        aria-label={copiedCommandId === cmd.id ? `Copied command ${cmd.order}` : `Copy command ${cmd.order}`}
                      >
                        {copiedCommandId === cmd.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {}
        <div className="space-y-2">
          <Button
            size="sm"
            onClick={async () => {
              const t = toast.loading('Đang xóa dữ liệu…', { position: 'top-right' });
              try {
                await onReset();
                toast.success('Đã xóa toàn bộ dữ liệu practice hiện tại', { id: t, position: 'top-right' });
              } catch (e) {
                toast.error('Xóa dữ liệu thất bại', { id: t, position: 'top-right' });
              }
            }}
            className="w-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Graph
          </Button>

          {onSync && (
            <Button
              size="sm"
              onClick={async () => {
                const t = toast.loading('Đang đồng bộ dữ liệu…', { position: 'top-right' });
                try {
                  await onSync();
                  toast.success('Đồng bộ thành công từ backend', { id: t, position: 'top-right' });
                } catch (e) {
                  toast.error('Đồng bộ thất bại', { id: t, position: 'top-right' });
                }
              }}
              className="w-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          )}

          {onViewGoal && practice.goalRepositoryState && (
            <Button
              size="sm"
              onClick={onViewGoal}
              className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isViewingGoal ? 'Hide Goal' : 'View Goal'}
            </Button>
          )}

          {onValidate && (
            <Button
              size="sm"
              onClick={onValidate}
              disabled={!!isValidating}
              className="w-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-60"
            >
              {isValidating ? 'Validating…' : 'Validate Result'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onShowHintModal}
            className="w-full border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Need Help? View Full Guide
          </Button>
        </div>

        {}
        {practice.tags && practice.tags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {practice.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: (tag.color || '#3B82F6') + '20', color: tag.color || '#3B82F6' }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
