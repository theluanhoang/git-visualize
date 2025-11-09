'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles as SparklesIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Fireworks from './Fireworks';
import Confetti from './Confetti';
import Sparkles from './Sparkles';
import { useCelebrationSound } from '@/hooks/use-celebration-sound';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showFireworks?: boolean;
  showConfetti?: boolean;
  showSparkles?: boolean;
  playSound?: boolean;
  duration?: number;
}

const encouragingMessages = [
  "Chúc Mừng! Tuyệt Vời! 🎉",
  "Bạn đã hoàn thành hoàn hảo! Tiếp tục phát huy nhé! ⭐",
  "Xuất sắc! Bạn đang tiến bộ rất tốt! 🚀",
  "Tuyệt vời! Hãy tiếp tục chinh phục! 💪",
  "Hoàn hảo! Bạn đang trở thành chuyên gia! 🎯",
  "Tuyệt vời! Không gì có thể ngăn cản bạn! ⚡",
  "Chúc mừng! Bạn đã vượt qua thử thách! 🏆",
  "Xuất sắc! Hãy tiếp tục hành trình học tập! 🌟"
];

export default function CelebrationModal({
  isOpen,
  onClose,
  title,
  message,
  actionLabel = "Tiếp tục",
  onAction,
  showFireworks = true,
  showConfetti = true,
  showSparkles = true,
  playSound = true,
  duration = 5000
}: CelebrationModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const { playVictoryJingle, playFireworkSound, playConfettiSound, playSuccessChime } = useCelebrationSound();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      
      if (playSound) {
        playVictoryJingle({ volume: 0.4 });
        setTimeout(() => playFireworkSound({ volume: 0.3 }), 500);
        setTimeout(() => playConfettiSound({ volume: 0.2 }), 1000);
        setTimeout(() => playSuccessChime({ volume: 0.3 }), 1500);
      }

      const messageInterval = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % encouragingMessages.length);
      }, 2000);

      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 500);
      }, duration);

      return () => {
        clearInterval(messageInterval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, duration, onClose, playSound, playVictoryJingle, playFireworkSound, playConfettiSound, playSuccessChime]);

  const handleAction = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onAction?.();
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showFireworks && <Fireworks isActive={isAnimating} duration={duration} />}
          {showConfetti && <Confetti isActive={isAnimating} duration={duration} />}
          {showSparkles && <Sparkles isActive={isAnimating} duration={duration} />}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 dark:from-yellow-600/30 dark:via-pink-600/30 dark:to-purple-600/30 backdrop-blur-sm" 
              onClick={onClose} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative w-full max-w-md"
            >
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-600 shadow-2xl">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="mb-6"
                  >
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                  </motion.div>

                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{
                          y: [-10, 10, -10],
                          rotate: [0, 180, 360],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      >
                        <Star className="h-4 w-4 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.h2
                    key={currentMessage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4"
                  >
                    {title || encouragingMessages[currentMessage]}
                  </motion.h2>

                  {message && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-lg text-gray-700 dark:text-gray-300 mb-6"
                    >
                      {message}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Button
                      onClick={handleAction}
                      size="lg"
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      {actionLabel}
                    </Button>
                  </motion.div>

                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: Math.random() * 2
                        }}
                      >
                        <SparklesIcon className="h-3 w-3 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
