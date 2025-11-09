'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface SparklesProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

const sparkleColors = [
  '#ffd700', '#ffed4e', '#fff700', '#ffeb3b', '#ffc107',
  '#ff9800', '#ff5722', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688'
];

export default function Sparkles({ isActive, duration = 2000, onComplete }: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setSparkles([]);
      return;
    }

    const createSparkle = (): Sparkle => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
      delay: Math.random() * 1000
    });

    const initialSparkles = Array.from({ length: 20 }, createSparkle);
    setSparkles(initialSparkles);

    const interval = setInterval(() => {
      setSparkles(prev => [...prev, createSparkle()]);
    }, 150);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setSparkles([]);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ 
            scale: 0,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 1.5,
            delay: sparkle.delay / 1000,
            ease: "easeOut",
            repeat: 1,
            repeatType: "reverse"
          }}
        >
          {/* Sparkle shape */}
          <div 
            className="relative w-full h-full"
            style={{ color: sparkle.color }}
          >
            {/* Central dot */}
            <div 
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: sparkle.color }}
            />
            
            {/* Cross sparkle */}
            <div 
              className="absolute w-full h-0.5 rounded-full"
              style={{ backgroundColor: sparkle.color }}
            />
            <div 
              className="absolute w-0.5 h-full rounded-full"
              style={{ backgroundColor: sparkle.color }}
            />
            
            {/* Diagonal sparkle */}
            <motion.div 
              className="absolute w-full h-0.5 rounded-full"
              style={{ backgroundColor: sparkle.color }}
              animate={{ rotate: 45 }}
            />
            <motion.div 
              className="absolute w-full h-0.5 rounded-full"
              style={{ backgroundColor: sparkle.color }}
              animate={{ rotate: -45 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
