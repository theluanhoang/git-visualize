'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, CheckCircle, Play, Lightbulb, List, Terminal, Shield } from 'lucide-react';
import { Practice } from '@/services/practices';
import { getDifficultyColor, getDifficultyText } from '@/utils/practice';

interface PracticeDetailsProps {
  practice: Practice;
  onStartPractice?: () => void;
}

export default function PracticeDetails({ practice, onStartPractice }: PracticeDetailsProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-foreground">
                {practice.title}
              </CardTitle>
              <CardDescription className="mt-2 text-base text-muted-foreground">
                {practice.scenario}
              </CardDescription>
            </div>
            <Badge 
              className={`ml-4 ${getDifficultyColor(practice.difficulty)}`}
              variant="secondary"
            >
              {getDifficultyText(practice.difficulty)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{practice.estimatedTime} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{practice.views} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>{practice.completions} completions</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={onStartPractice}
              className="ml-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Practice
            </Button>
          </div>
          
          {practice.tags && practice.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {practice.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="text-sm"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {}
      {practice.instructions && practice.instructions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <List className="w-5 h-5" />
              <span>Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {practice.instructions
                .sort((a, b) => a.order - b.order)
                .map((instruction, index) => (
                  <div key={instruction.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <p className="text-sm text-foreground">{instruction.content}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {}
      {practice.hints && practice.hints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" />
              <span>Hints</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {practice.hints
                .sort((a, b) => a.order - b.order)
                .map((hint, index) => (
                  <div key={hint.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      💡
                    </div>
                    <p className="text-sm text-foreground">{hint.content}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {}
      {practice.expectedCommands && practice.expectedCommands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>Expected Commands</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {practice.expectedCommands
                .sort((a, b) => a.order - b.order)
                .map((command, index) => (
                  <div key={command.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-800 dark:text-blue-200">
                      {index + 1}
                    </div>
                    <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono">
                      {command.command}
                    </code>
                    {command.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {}
      {practice.validationRules && practice.validationRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Validation Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {practice.validationRules
                .sort((a, b) => a.order - b.order)
                .map((rule) => (
                  <div key={rule.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {rule.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground mb-1">{rule.message}</p>
                    <code className="text-xs text-muted-foreground font-mono">
                      {rule.value}
                    </code>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
