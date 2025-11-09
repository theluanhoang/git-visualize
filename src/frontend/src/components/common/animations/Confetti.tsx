'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  size: number;
  rotation: number;
  velocity: {
    x: number;
    y: number;
    rotation: number;
  };
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#ff6348', '#2ed573', '#1e90ff', '#ff4757', '#ffa502',
  '#ff3838', '#ff9f1a', '#32ff7e', '#7bed9f', '#70a1ff'
];

const shapes: ConfettiPiece['shape'][] = ['circle', 'square', 'triangle'];

export default function Confetti({ isActive, duration = 4000, onComplete }: ConfettiProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!isActive) {
      setConfetti([]);
      return;
    }

    const createConfettiPiece = (): ConfettiPiece => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: -50,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 3 + 2,
        rotation: (Math.random() - 0.5) * 10
      }
    });

    const initialConfetti = Array.from({ length: 50 }, createConfettiPiece);
    setConfetti(initialConfetti);

    const interval = setInterval(() => {
      setConfetti(prev => [...prev, createConfettiPiece()]);
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setConfetti([]);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'triangle' ? '0' : '2px',
            clipPath: piece.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
            transform: `rotate(${piece.rotation}deg)`
          }}
          animate={{
            x: piece.velocity.x * 100,
            y: piece.velocity.y * 100 + window.innerHeight,
            rotate: piece.rotation + piece.velocity.rotation * 100,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 3,
            ease: "easeIn"
          }}
        />
      ))}
    </div>
  );
}
