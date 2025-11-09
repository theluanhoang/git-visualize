'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { Practice } from '@/services/practices';

interface ScenarioCardProps {
  practice: Practice;
}

export default function ScenarioCard({ practice }: ScenarioCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Scenario</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground">{practice.scenario}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{practice.estimatedTime} minutes</span>
          </div>
          <Badge variant={practice.difficulty === 1 ? 'default' : practice.difficulty === 2 ? 'secondary' : 'destructive'}>
            {practice.difficulty === 1 ? 'Beginner' : practice.difficulty === 2 ? 'Intermediate' : 'Advanced'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}


