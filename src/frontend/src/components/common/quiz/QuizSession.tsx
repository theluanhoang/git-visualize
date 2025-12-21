'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Clock, Trophy, RotateCcw, AlertTriangle } from 'lucide-react';
import { Quiz, QuizQuestion, QuizOption } from '@/services/quizzes';
import { useIncrementQuizViews, useIncrementQuizCompletions } from '@/lib/react-query/hooks/use-quizzes';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QuizSessionProps {
  quiz: Quiz;
  onComplete?: (score: number, passed: boolean) => void;
  onExit?: () => void;
}

interface AnswerState {
  [questionId: string]: string[]; // Array of option IDs for selected answers
}

export default function QuizSession({ quiz, onComplete, onExit }: QuizSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [results, setResults] = useState<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    questionResults: { questionId: string; isCorrect: boolean; points: number }[];
  } | null>(null);

  const incrementViews = useIncrementQuizViews();
  const incrementCompletions = useIncrementQuizCompletions();

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const isSubmittedRef = useRef(isSubmitted);
  useEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  const submitQuiz = useCallback(() => {
    if (isSubmittedRef.current) return;

    // Calculate score inline to avoid stale closure
    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults: { questionId: string; isCorrect: boolean; points: number }[] = [];

    questions.forEach((question) => {
      const questionPoints = question.points || 1;
      totalPoints += questionPoints;

      const selectedOptionIds = answers[question.id] || [];
      const correctOptionIds = (question.options || [])
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id);

      // Check if answer is correct
      const isCorrect =
        selectedOptionIds.length === correctOptionIds.length &&
        selectedOptionIds.every((id) => correctOptionIds.includes(id)) &&
        correctOptionIds.every((id) => selectedOptionIds.includes(id));

      if (isCorrect) {
        earnedPoints += questionPoints;
      }

      questionResults.push({
        questionId: question.id,
        isCorrect,
        points: isCorrect ? questionPoints : 0,
      });
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    const calculatedResults = {
      score: earnedPoints,
      totalPoints,
      percentage,
      passed,
      questionResults,
    };
    setResults(calculatedResults);
    setIsSubmitted(true);
    isSubmittedRef.current = true;

    // Track completion
    if (quiz.id) {
      incrementCompletions.mutate(quiz.id);
    }

    // Call onComplete callback
    if (onComplete) {
      onComplete(calculatedResults.percentage, calculatedResults.passed);
    }

    if (calculatedResults.passed) {
      toast.success(`Chúc mừng! Bạn đã đạt ${calculatedResults.percentage.toFixed(1)}%`);
    } else {
      toast.error(`Bạn đạt ${calculatedResults.percentage.toFixed(1)}%. Cần ${quiz.passingScore}% để đạt.`);
    }
  }, [questions, answers, quiz.id, quiz.passingScore, incrementCompletions, onComplete]);

  const handleSubmit = useCallback(() => {
    if (isSubmittedRef.current) return;

    // Check if all questions are answered
    const unansweredQuestions = questions.filter(
      (q) => !answers[q.id] || answers[q.id].length === 0
    );

    if (unansweredQuestions.length > 0) {
      setUnansweredCount(unansweredQuestions.length);
      setShowConfirmDialog(true);
      return;
    }

    submitQuiz();
  }, [questions, answers, submitQuiz]);

  useEffect(() => {
    // Track view - only once when component mounts
    if (quiz.id) {
      incrementViews.mutate(quiz.id);
    }

    // Set timer if estimatedTime is provided
    if (quiz.estimatedTime > 0) {
      setTimeRemaining(quiz.estimatedTime * 60); // Convert to seconds
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmittedRef.current) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Use setTimeout to avoid calling submitQuiz during render
          setTimeout(() => {
            if (!isSubmittedRef.current) {
              submitQuiz(); // Auto-submit when time runs out, no confirmation needed
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitQuiz]); // Use submitQuiz from useCallback

  const handleAnswerChange = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      
      if (isMultiple) {
        // Toggle for multiple choice
        const newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter((id) => id !== optionId)
          : [...currentAnswers, optionId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        // Single choice - replace
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitted && results) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Kết quả Quiz</CardTitle>
              <Button variant="outline" onClick={onExit}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mb-4"
              >
                {results.passed ? (
                  <Trophy className="h-24 w-24 text-yellow-500 mx-auto" />
                ) : (
                  <XCircle className="h-24 w-24 text-red-500 mx-auto" />
                )}
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">
                {results.passed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
              </h2>
              <p className="text-xl text-muted-foreground mb-4">
                Điểm: {results.score}/{results.totalPoints} ({results.percentage.toFixed(1)}%)
              </p>
              <Badge
                variant={results.passed ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {results.passed ? 'Đạt' : `Cần ${quiz.passingScore}% để đạt`}
              </Badge>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chi tiết câu trả lời:</h3>
              {questions.map((question, index) => {
                const questionResult = results.questionResults.find(
                  (r) => r.questionId === question.id
                );
                const selectedOptionIds = answers[question.id] || [];
                const correctOptionIds = (question.options || [])
                  .filter((opt) => opt.isCorrect)
                  .map((opt) => opt.id);

                return (
                  <Card
                    key={question.id}
                    className={questionResult?.isCorrect ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400'}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          Câu {index + 1}: {question.question}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {questionResult?.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                          )}
                          <Badge variant="outline" className="bg-background text-foreground border-border">
                            {questionResult?.points || 0}/{question.points || 1} điểm
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(question.options || []).map((option) => {
                          const isSelected = selectedOptionIds.includes(option.id);
                          const isCorrect = option.isCorrect;
                          const showCorrect = isSubmitted;

                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded border ${
                                showCorrect && isCorrect
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 text-green-900 dark:text-green-100'
                                  : showCorrect && isSelected && !isCorrect
                                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400 text-red-900 dark:text-red-100'
                                  : isSelected
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-100'
                                  : 'border-gray-200 dark:border-gray-700 bg-background text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {showCorrect && isCorrect && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                                )}
                                {showCorrect && isSelected && !isCorrect && (
                                  <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                                )}
                                <span>{option.text}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-900 dark:text-blue-100">
                          <strong>Giải thích:</strong> {question.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={onExit} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
              <Button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  setIsSubmitted(false);
                  setResults(null);
                  setTimeRemaining(quiz.estimatedTime > 0 ? quiz.estimatedTime * 60 : null);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Làm lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <DialogTitle className="text-xl">Xác nhận nộp bài</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-base">
              Bạn còn <span className="font-semibold text-foreground">{unansweredCount}</span> câu hỏi chưa trả lời.
              <br />
              Bạn có chắc chắn muốn nộp bài ngay bây giờ không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full sm:w-auto"
            >
              Quay lại
            </Button>
            <Button
              onClick={() => {
                setShowConfirmDialog(false);
                submitQuiz();
              }}
              className="w-full sm:w-auto"
            >
              Nộp bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
              {quiz.description && (
                <p className="text-muted-foreground mt-1">{quiz.description}</p>
              )}
            </div>
            <Button variant="outline" onClick={onExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Thoát
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Câu {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} />
          </div>

          {/* Question */}
          {currentQuestion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Câu {currentQuestionIndex + 1}: {currentQuestion.question}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {currentQuestion.type === 'single_choice'
                          ? 'Chọn một đáp án'
                          : currentQuestion.type === 'multiple_choice'
                          ? 'Chọn nhiều đáp án'
                          : 'Đúng/Sai'}
                      </Badge>
                      <Badge variant="secondary">
                        {currentQuestion.points || 1} điểm
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(currentQuestion.options || []).map((option) => {
                        const selectedOptionIds = answers[currentQuestion.id] || [];
                        const isSelected = selectedOptionIds.includes(option.id);
                        const isMultiple =
                          currentQuestion.type === 'multiple_choice';

                        return (
                          <button
                            key={option.id}
                            onClick={() =>
                              handleAnswerChange(
                                currentQuestion.id,
                                option.id,
                                isMultiple
                              )
                            }
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'border-primary bg-primary dark:bg-primary'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white dark:bg-white" />
                                )}
                              </div>
                              <span className="flex-1 leading-relaxed">{option.text}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Câu trước
            </Button>

            <div className="flex gap-2">
              {questions.map((_, index) => {
                const hasAnswer = answers[questions[index].id]?.length > 0;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded ${
                      index === currentQuestionIndex
                        ? 'bg-primary text-primary-foreground'
                        : hasAnswer
                        ? 'bg-green-500 dark:bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button onClick={handleSubmit}>
                Nộp bài
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Câu sau
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}



