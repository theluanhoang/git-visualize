'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IRepositoryState } from '@/types/git';
import PracticesService from '@/services/practice';
import { toast } from 'sonner';
import { localStorageHelpers, LOCALSTORAGE_KEYS } from '@/constants/localStorage';

interface AiAssistantResponse {
  situationAnalysis: string;
  problem: string;
  gitKnowledge: string;
  solution: string;
  suggestedCommand?: string;
  warning?: string;
}

interface AiAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  practiceId: string;
  repoState: IRepositoryState | null;
  lastCommand?: string;
  lastError?: string;
  version?: number;
  onReset?: () => void; // Callback khi cần reset chat history
}

export default function AiAssistantDialog({
  isOpen,
  onClose,
  practiceId,
  repoState,
  lastCommand,
  lastError,
  version,
  onReset,
}: AiAssistantDialogProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AiAssistantResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    response?: AiAssistantResponse;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Key để lưu chat history
  const chatHistoryKey = LOCALSTORAGE_KEYS.GIT_ENGINE.AI_ASSISTANT_CHAT(practiceId, version);

  // Load chat history từ localStorage khi mở dialog
  useEffect(() => {
    if (isOpen && practiceId) {
      const savedHistory = localStorageHelpers.getJSON<Array<{
        role: 'user' | 'assistant';
        content: string;
        response?: AiAssistantResponse;
      }>>(chatHistoryKey, []);
      if (savedHistory.length > 0) {
        setChatHistory(savedHistory);
      } else {
        setChatHistory([]);
      }
    }
  }, [isOpen, practiceId, chatHistoryKey]);

  // Xóa chat history khi reset (từ parent component)
  useEffect(() => {
    if (onReset) {
      const resetHandler = () => {
        setChatHistory([]);
        localStorageHelpers.removeItem(chatHistoryKey);
      };
      // Expose reset function to parent
      (window as any)[`resetAiAssistantChat_${practiceId}`] = resetHandler;
      return () => {
        delete (window as any)[`resetAiAssistantChat_${practiceId}`];
      };
    }
  }, [onReset, practiceId, chatHistoryKey]);

  // Lưu chat history vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (practiceId && chatHistory.length > 0) {
      localStorageHelpers.setJSON(chatHistoryKey, chatHistory);
    }
  }, [chatHistory, practiceId, chatHistoryKey]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!chatMessage.trim() || isLoading) return;
    if (!repoState) {
      toast.error('Chưa có trạng thái repository. Hãy chạy lệnh Git đầu tiên!');
      return;
    }

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setIsLoading(true);

    // Thêm tin nhắn người dùng vào lịch sử
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
    };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      const aiResponse = await PracticesService.getAiAssistantResponse(practiceId, {
        userCommand: lastCommand,
        repoState: repoState as any,
        errorMessage: lastError,
        chatMessage: userMessage,
      });

      setResponse(aiResponse);
      
      // Thêm phản hồi AI vào lịch sử
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: aiResponse.solution,
        response: aiResponse,
      }]);
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      
      // Lấy error message chi tiết
      let errorMessage = 'Không thể kết nối với AI Assistant. Vui lòng thử lại.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Thêm lỗi vào lịch sử với message chi tiết
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `Xin lỗi, đã xảy ra lỗi: ${errorMessage}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setChatMessage(question);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Format text với markdown cơ bản
  const formatText = (text: string) => {
    if (!text) return '';
    
    // Replace HTML entities và tags
    let cleanedText = text
      .replace(/<br\s*\/?>/gi, '\n')  // Replace <br> với line break
      .replace(/&nbsp;/g, ' ')        // Replace &nbsp; với space
      .replace(/&lt;/g, '<')          // Replace &lt; với <
      .replace(/&gt;/g, '>')          // Replace &gt; với >
      .replace(/&amp;/g, '&');        // Replace &amp; với &
    
    // Split by code blocks first
    const parts = cleanedText.split(/(```[\s\S]*?```|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      // Code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3).trim();
        const lines = codeContent.split('\n');
        const language = lines[0].match(/^\w+$/) ? lines[0] : '';
        const code = language ? lines.slice(1).join('\n') : codeContent;
        
        return (
          <pre key={index} className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg overflow-x-auto my-3 border border-slate-700 dark:border-slate-800 shadow-lg">
            {language && (
              <div className="text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">
                {language}
              </div>
            )}
            <code className="text-sm font-mono whitespace-pre text-slate-100">
              {code.split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className="hover:bg-slate-800/50 px-1 rounded">
                  {line || '\u00A0'}
                </div>
              ))}
            </code>
          </pre>
        );
      }
      
      // Inline code
      if (part.startsWith('`') && part.endsWith('`') && !part.includes('\n')) {
        const code = part.slice(1, -1);
        return (
          <code key={index} className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-mono border border-blue-200 dark:border-blue-800">
            {code}
          </code>
        );
      }
      
      // Regular text - parse markdown
      let formatted = part;
      const elements: React.ReactNode[] = [];
      let keyCounter = 0;
      
      // Split by bold (**text**)
      const boldParts = formatted.split(/(\*\*[^*]+\*\*)/g);
      boldParts.forEach((boldPart, boldIndex) => {
        if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
          const text = boldPart.slice(2, -2);
          elements.push(<strong key={`bold-${keyCounter++}`} className="font-semibold">{text}</strong>);
        } else {
          // Split by line breaks
          const lines = boldPart.split(/\n/g);
          lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
              elements.push(<br key={`br-${keyCounter++}`} />);
            }
            // Split by inline code in line
            const codeParts = line.split(/(`[^`]+`)/g);
            codeParts.forEach((codePart, codeIndex) => {
              if (codePart.startsWith('`') && codePart.endsWith('`')) {
                const code = codePart.slice(1, -1);
                elements.push(
                  <code key={`code-${keyCounter++}`} className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm font-mono border border-blue-200 dark:border-blue-800">
                    {code}
                  </code>
                );
              } else if (codePart.trim()) {
                elements.push(<span key={`text-${keyCounter++}`}>{codePart}</span>);
              }
            });
          });
        }
      });
      
      return <span key={index}>{elements.length > 0 ? elements : part}</span>;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="!max-w-5xl !w-[95vw] !h-[90vh] flex flex-col"
        style={{ width: '95vw', maxWidth: '80rem', height: '90vh' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            🤖 Trợ lý AI – Hỗ trợ Thực hành Git
          </DialogTitle>
          <DialogDescription>
            AI đang phân tích trạng thái Git hiện tại của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0 h-full">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg" style={{ minHeight: '500px', maxHeight: 'calc(90vh - 250px)' }}>
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm mb-2">Chào bạn! Tôi là trợ lý AI hỗ trợ thực hành Git.</p>
                <p className="text-xs">Hãy hỏi tôi về lỗi Git bạn đang gặp hoặc cách làm bài tập.</p>
                
                <div className="mt-6 space-y-2 w-full max-w-md">
                  <p className="text-xs font-semibold text-foreground mb-2">Câu hỏi nhanh:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleQuickQuestion('Tại sao tôi không thể commit được?')}
                  >
                    Tại sao tôi không thể commit được?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleQuickQuestion('Làm thế nào để tạo branch mới?')}
                  >
                    Làm thế nào để tạo branch mới?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleQuickQuestion('Tôi đã làm sai, làm sao để sửa?')}
                  >
                    Tôi đã làm sai, làm sao để sửa?
                  </Button>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {chatHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="space-y-4">
                          {message.response && (
                            <>
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border">
                                  1. Phân tích tình huống
                                </p>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap mt-2">
                                  {formatText(message.response.situationAnalysis)}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border">
                                  2. Vấn đề
                                </p>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap mt-2">
                                  {formatText(message.response.problem)}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border">
                                  3. Kiến thức Git liên quan
                                </p>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap mt-2">
                                  {formatText(message.response.gitKnowledge)}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2 pb-1 border-b border-border">
                                  4. Hướng giải quyết
                                </p>
                                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap mt-2">
                                  {formatText(message.response.solution)}
                                </div>
                              </div>
                              {message.response.suggestedCommand && (() => {
                                // Parse suggestedCommand: tách comment và lệnh
                                const lines = message.response.suggestedCommand.split('\n').filter(line => line.trim());
                                const commentLines: string[] = [];
                                const commandLines: string[] = [];
                                let foundCommand = false;
                                
                                lines.forEach(line => {
                                  const trimmed = line.trim();
                                  if (trimmed.startsWith('#') || (!foundCommand && !trimmed.startsWith('git'))) {
                                    // Comment hoặc text giải thích
                                    const comment = trimmed.startsWith('#') 
                                      ? trimmed.substring(1).trim() 
                                      : trimmed;
                                    if (comment && !foundCommand) {
                                      commentLines.push(comment);
                                    }
                                  } else if (trimmed.startsWith('git') || foundCommand) {
                                    // Lệnh Git
                                    foundCommand = true;
                                    // Bỏ comment trong lệnh (nếu có)
                                    const cleanCommand = trimmed.split('#')[0].trim();
                                    if (cleanCommand) {
                                      commandLines.push(cleanCommand);
                                    }
                                  }
                                });
                                
                                const comment = commentLines.length > 0 ? commentLines.join(' ') : null;
                                const command = commandLines.length > 0 ? commandLines.join('\n') : message.response.suggestedCommand;
                                
                                return (
                                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border-l-4 border-blue-500 dark:border-blue-400">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                                      Lệnh gợi ý:
                                    </p>
                                    {comment && (
                                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 italic">
                                        {comment}
                                      </p>
                                    )}
                                    <pre className="bg-slate-900 dark:bg-slate-950 p-3 rounded overflow-x-auto border border-slate-700 dark:border-slate-800">
                                      <code className="text-sm font-mono text-green-400 dark:text-green-300">
                                        {command}
                                      </code>
                                    </pre>
                                  </div>
                                );
                              })()}
                              {message.response.warning && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border-l-4 border-yellow-500">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed whitespace-pre-wrap">
                                      {formatText(message.response.warning)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {!message.response && (
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {formatText(message.content)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI đang suy nghĩ...</span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi AI về lỗi Git bạn đang gặp..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!chatMessage.trim() || isLoading || !repoState}
              size="icon"
              className="h-auto"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

