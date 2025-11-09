'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

interface FireworksProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#ff6348', '#2ed573', '#1e90ff', '#ff4757', '#ffa502'
];

export default function Fireworks({ isActive, duration = 3000, onComplete }: FireworksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fireworks, setFireworks] = React.useState<Firework[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setFireworks([]);
      return;
    }

    const createFirework = (): Firework => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1000
    });

    const initialFireworks = Array.from({ length: 8 }, createFirework);
    setFireworks(initialFireworks);

    const interval = setInterval(() => {
      setFireworks(prev => [...prev, createFirework()]);
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setFireworks([]);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {fireworks.map((firework) => (
        <motion.div
          key={firework.id}
          className="absolute"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
          }}
          initial={{ 
            scale: 0,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            scale: [0, 1.2, 0.8, 1],
            opacity: [0, 1, 0.8, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            delay: firework.delay / 1000,
            ease: "easeOut"
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute w-4 h-4 rounded-full"
              style={{ backgroundColor: firework.color }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                delay: firework.delay / 1000
              }}
            />
            
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: firework.color,
                  left: '50%',
                  top: '50%'
                }}
                initial={{ 
                  x: 0, 
                  y: 0,
                  scale: 0
                }}
                animate={{
                  x: Math.cos((i * 30) * Math.PI / 180) * 60,
                  y: Math.sin((i * 30) * Math.PI / 180) * 60,
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: firework.delay / 1000,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
