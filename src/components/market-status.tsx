'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const OPEN_HOUR = 4;
const CLOSE_HOUR = 13;

const pad = (num: number) => num.toString().padStart(2, '0');

type MarketStatusProps = {
  onStatusChange: (isOpen: boolean) => void;
};

export function MarketStatus({ onStatusChange }: MarketStatusProps) {
  const [status, setStatus] = useState<{
    isOpen: boolean;
    label: string;
    countdown: string;
  } | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();

      const isOpen = currentHour >= OPEN_HOUR && currentHour < CLOSE_HOUR;
      
      onStatusChange(isOpen);

      let targetTime = new Date(now);
      let label = '';

      if (isOpen) {
        // Market is open, countdown to close
        targetTime.setHours(CLOSE_HOUR, 0, 0, 0);
        label = 'Cierra en';
      } else {
        // Market is closed, countdown to open
        targetTime.setHours(OPEN_HOUR, 0, 0, 0);
        if (currentHour >= CLOSE_HOUR) {
          // If past close time, target is next day
          targetTime.setDate(targetTime.getDate() + 1);
        }
        label = 'Abre en';
      }

      const diff = targetTime.getTime() - now.getTime();

      if (diff < 0) {
        // Should not happen with the logic above but as a fallback
        setStatus({
            isOpen,
            label: isOpen ? 'CERRANDO' : 'ABRIENDO',
            countdown: '00:00:00'
        });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const countdown = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

      setStatus({
        isOpen,
        label,
        countdown,
      });
    };
    
    // Run once on client mount to avoid hydration mismatch
    updateStatus();

    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [onStatusChange]);

  if (!status) {
    return (
       <div className="flex items-center gap-4 font-mono text-sm h-[20px] w-[275px]">
         {/* Skeleton or placeholder to prevent layout shift */}
       </div>
    );
  }

  const { isOpen, label, countdown } = status;

  return (
    <div className="flex items-center gap-4 font-mono text-sm">
      <div className="flex items-center gap-2">
        <span
          className={cn('h-2 w-2 rounded-full', {
            'bg-success animate-pulse': isOpen,
            'bg-danger': !isOpen,
          })}
        ></span>
        <span className={cn({ 'text-success': isOpen, 'text-danger': !isOpen })}>
          {isOpen ? 'MERCADO ABIERTO' : 'MERCADO CERRADO'}
        </span>
      </div>
      <div className="text-muted-foreground">
        <span>{label}</span>
        <span className="ml-2 font-bold text-foreground">{countdown}</span>
      </div>
    </div>
  );
}
