'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, CheckCircle, Play, Info, HelpCircle } from 'lucide-react';
import { Quiz } from '@/services/quizzes';

interface QuizListProps {
  quizzes: Quiz[];
  onSelectQuiz?: (quiz: Quiz) => void;
  onStartQuiz?: (quiz: Quiz) => void;
  selectedQuizId?: string;
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

export default function QuizList({ 
  quizzes, 
  onSelectQuiz, 
  onStartQuiz,
  selectedQuizId 
}: QuizListProps) {
  return (
    <div className="space-y-4">
      {quizzes.map((quiz, index) => (
        <motion.div
          key={quiz.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card 
            className={`transition-all duration-200 hover:shadow-md ${
              selectedQuizId === quiz.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {quiz.title}
                  </CardTitle>
                  {quiz.description && (
                    <CardDescription className="mt-2 text-sm text-muted-foreground">
                      {quiz.description}
                    </CardDescription>
                  )}
                </div>
                <Badge 
                  className={`ml-3 ${getDifficultyColor(quiz.difficulty)}`}
                  variant="secondary"
                >
                  {getDifficultyLabel(quiz.difficulty)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>{quiz.questions?.length || 0} câu hỏi</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.estimatedTime} phút</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{quiz.views} lượt xem</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{quiz.completions} hoàn thành</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-auto">
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectQuiz?.(quiz);
                    }}
                  >
                    <Info className="w-4 h-4 mr-1" />
                    Chi tiết
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartQuiz?.(quiz);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Bắt đầu
                  </Button>
                </div>
              </div>
              
              {quiz.tags && quiz.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}




