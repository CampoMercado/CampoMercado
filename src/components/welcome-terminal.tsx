'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export function WelcomeTerminal() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // Should be slightly less than the animation total time

     const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-black text-primary font-mono transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="w-full max-w-md p-4 text-center">
        <Progress value={progress} className="h-1 bg-primary/20 [&>div]:bg-primary" />
      </div>
    </div>
  );
}
