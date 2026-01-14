'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PriceChart } from './price-chart';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const [isChartOpen, setChartOpen] = useState(false);

  const currentPriceData = product.priceHistory.at(-1);
  const prevPriceData = product.priceHistory.at(-2);

  if (!currentPriceData) return null;

  const currentPrice = currentPriceData.price;
  const prevPrice = prevPriceData?.price ?? currentPrice;
  const change = currentPrice - prevPrice;
  const changePercent = prevPrice === 0 ? 0 : (change / prevPrice) * 100;
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <>
      <div
        className="bg-gray-900/50 border border-green-900 rounded-md p-4 flex flex-col justify-between hover:bg-green-900/20 hover:border-green-700 cursor-pointer transition-colors"
        onClick={() => setChartOpen(true)}
      >
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-green-300">{product.name}</h3>
              <p className="text-sm text-green-500">{product.variety}</p>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                isUp && 'text-success',
                isDown && 'text-danger'
              )}
            >
              {isUp && <ArrowUp size={14} />}
              {isDown && <ArrowDown size={14} />}
              <span>{changePercent.toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-200">${currentPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-4 h-[50px]">
          <PriceChart product={product} simple />
        </div>
      </div>
      <Dialog open={isChartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-2xl p-0 border-green-500 bg-black">
          <PriceChart product={product} />
        </DialogContent>
      </Dialog>
    </>
  );
}
