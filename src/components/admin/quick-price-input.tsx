'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuickPriceInputProps = {
  initialPrice: number;
  onChange: (newPrice: number) => void;
  className?: string;
};

const adjustments = [100, 500, 1000];

export function QuickPriceInput({
  initialPrice,
  onChange,
  className,
}: QuickPriceInputProps) {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);

  useEffect(() => {
    onChange(currentPrice);
  }, [currentPrice, onChange]);

  useEffect(() => {
    // Sync if the initial price changes from parent (e.g., after update)
    setCurrentPrice(initialPrice);
  }, [initialPrice]);

  const handleAdjust = (amount: number) => {
    setCurrentPrice((prev) => Math.max(0, prev + amount));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow clearing the input or typing a new number
    if (value === '') {
      setCurrentPrice(0);
    } else {
      setCurrentPrice(parseInt(value, 10));
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-1">
        {[...adjustments].reverse().map((amount) => (
          <Button
            key={`minus-${amount}`}
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 text-danger"
            onClick={() => handleAdjust(-amount)}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">-{amount}</span>
          </Button>
        ))}
      </div>

      <div className="relative w-28">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          $
        </span>
        <Input
          type="number"
          value={currentPrice}
          onChange={handleInputChange}
          className="h-10 pl-6 text-center text-lg font-mono"
        />
      </div>

      <div className="flex items-center gap-1">
        {adjustments.map((amount) => (
          <Button
            key={`plus-${amount}`}
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 text-success"
            onClick={() => handleAdjust(amount)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">+{amount}</span>
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={() => setCurrentPrice(initialPrice)}
        title="Resetear al precio original"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="sr-only">Reset</span>
      </Button>
    </div>
  );
}
