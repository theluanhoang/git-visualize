'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCelebrationContext } from './CelebrationProvider';
import { Trophy, Star, Zap, Sparkles } from 'lucide-react';

export default function CelebrationDemo() {
  const celebration = useCelebrationContext();

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">🎉 Celebration System Demo</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => celebration.triggerQuickCelebration('🎉 Tuyệt vời!', 'Quick celebration!')}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          <Zap className="h-4 w-4 mr-2" />
          Quick
        </Button>
        
        <Button 
          onClick={() => celebration.triggerSuccessCelebration('🏆 Chúc mừng!', 'Success celebration!')}
          className="bg-green-500 hover:bg-green-600"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Success
        </Button>
        
        <Button 
          onClick={() => celebration.triggerEpicCelebration('🌟 HOÀN HẢO!', 'Epic celebration!')}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Star className="h-4 w-4 mr-2" />
          Epic
        </Button>
        
        <Button 
          onClick={() => celebration.triggerCelebration({
            title: '🎯 Custom!',
            message: 'Custom celebration!',
            showFireworks: true,
            showConfetti: true,
            showSparkles: true,
            playSound: true,
            duration: 3000
          })}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Custom
        </Button>
      </div>
    </div>
  );
}
