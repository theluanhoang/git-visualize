'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import ScenarioCard from './hint/ScenarioCard';
import InstructionsCard from './hint/InstructionsCard';
import ExpectedCommandsCard from './hint/ExpectedCommandsCard';
import HintsCard from './hint/HintsCard';
import SuccessCriteriaCard from './hint/SuccessCriteriaCard';
import { Practice } from '@/services/practices';

interface PracticeHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  practice: Practice | null;
}

export default function PracticeHintModal({ isOpen, onClose, practice }: PracticeHintModalProps) {
  if (!practice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:!max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Practice Guide: {practice.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <ScenarioCard practice={practice} />
            <InstructionsCard practice={practice} />
            <SuccessCriteriaCard practice={practice} />
          </div>

          <div className="space-y-6">
            <ExpectedCommandsCard practice={practice} />
            <HintsCard practice={practice} />
            {practice.tags && practice.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
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

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            💡 You can always click "Need Help?" to reopen this guide
          </div>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            Got it! Let's start practicing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
