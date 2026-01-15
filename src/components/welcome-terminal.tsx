'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function WelcomeTerminal() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // Should be slightly less than the animation total time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-black text-primary font-mono transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="w-full max-w-md p-4 text-center">
        <p className="overflow-hidden whitespace-nowrap border-r-4 border-r-primary text-2xl lg:text-3xl animate-typing">
          CONNECTING TO CUYOCROPS TERMINAL...
        </p>
      </div>
    </div>
  );
}
