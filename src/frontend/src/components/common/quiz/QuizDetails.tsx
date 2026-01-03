'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, CheckCircle, Play, HelpCircle, Target } from 'lucide-react';
import { Quiz } from '@/services/quizzes';

interface QuizDetailsProps {
  quiz: Quiz;
  onStartQuiz?: () => void;
}

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'bg-green-100 text-green-800 border-green-300';
    case 2:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 3:
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 4:
    case 5:
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Intermediate';
    case 3:
      return 'Advanced';
    case 4:
    case 5:
      return 'Expert';
    default:
      return 'Unknown';
  }
};

export default function QuizDetails({ quiz, onStartQuiz }: QuizDetailsProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{quiz.title}</CardTitle>
        {quiz.description && (
          <CardDescription className="mt-2">{quiz.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(quiz.difficulty)} variant="secondary">
            {getDifficultyLabel(quiz.difficulty)}
          </Badge>
          <Badge variant="outline">
            Điểm đạt: {quiz.passingScore}%
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <HelpCircle className="w-4 h-4" />
              <span>Số câu hỏi:</span>
            </div>
            <span className="font-medium">{quiz.questions?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Thời gian:</span>
            </div>
            <span className="font-medium">{quiz.estimatedTime} phút</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>Lượt xem:</span>
            </div>
            <span className="font-medium">{quiz.views}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>Hoàn thành:</span>
            </div>
            <span className="font-medium">{quiz.completions}</span>
          </div>
        </div>

        {quiz.tags && quiz.tags.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: tag.color || '#3B82F6', color: tag.color || '#3B82F6' }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          size="lg"
          onClick={onStartQuiz}
        >
          <Play className="w-4 h-4 mr-2" />
          Bắt đầu Quiz
        </Button>
      </CardContent>
    </Card>
  );
}
















