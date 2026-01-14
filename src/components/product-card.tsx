'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { PriceChart } from './price-chart';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, BarChart2 } from 'lucide-react';

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
      <TableRow 
        className="border-green-900 font-mono"
      >
        <TableCell className="w-[200px]">
          <div className="font-bold text-base text-green-300">{product.name}</div>
          <div className="text-xs text-green-500">{product.variety}</div>
        </TableCell>
        <TableCell className="text-right">
          <span className="text-2xl font-bold text-green-200">
            ${currentPrice.toLocaleString()}
          </span>
        </TableCell>
        <TableCell className="text-right w-[150px]">
          <div
            className={cn(
              'flex items-center justify-end gap-2 text-base font-medium',
              isUp && 'text-success',
              isDown && 'text-danger'
            )}
          >
            {isUp ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <div>
                <div>{changePercent.toFixed(2)}%</div>
                <div className='text-xs'>${change.toLocaleString()}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="w-[150px]">
          <div className="mx-auto">
            <PriceChart product={product} simple />
          </div>
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartOpen(true)}
            className="text-green-400 hover:bg-green-900 hover:text-green-200"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Gráfico
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={isChartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-2xl p-0 border-green-500 bg-black">
          <PriceChart product={product} />
        </DialogContent>
      </Dialog>
    </>
  );
}
