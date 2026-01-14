'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { PriceChart } from './price-chart';
import type { Product, TickerProduct } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, BarChart2, Minus } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  marketProducts: TickerProduct[];
};

export function ProductCard({ product, marketProducts }: ProductCardProps) {
  const [isChartOpen, setChartOpen] = useState(false);

  const productAnalysis = useMemo(() => {
    const currentPriceData = product.priceHistory.at(-1);
    if (!currentPriceData) return null;

    const currentPrice = currentPriceData.price;
    const prevPrice = product.priceHistory.at(-2)?.price ?? currentPrice;
    const weeklyPrice = product.priceHistory.at(-8) ?? product.priceHistory[0]?.price ?? currentPrice;

    const dailyChange = currentPrice - prevPrice;
    const dailyChangePercent = prevPrice === 0 ? 0 : (dailyChange / prevPrice) * 100;
    
    const weeklyChange = currentPrice - weeklyPrice;
    const weeklyChangePercent = weeklyPrice === 0 ? 0 : (weeklyChange / weeklyPrice) * 100;

    const allHistoricalPrices = product.priceHistory.map(h => h.price);
    const mean = allHistoricalPrices.reduce((a, b) => a + b, 0) / allHistoricalPrices.length;
    const stdDev = Math.sqrt(allHistoricalPrices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / allHistoricalPrices.length);
    const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;
    
    const movingAverage7d = product.priceHistory.slice(-7).reduce((acc, val) => acc + val.price, 0) / Math.min(product.priceHistory.length, 7);

    const relevantMarketPrices = marketProducts
      .filter(p => p.name === product.name && p.variety === product.variety)
      .map(p => p.priceHistory.at(-1)?.price ?? 0)
      .filter(price => price > 0);

    const marketMin = Math.min(...relevantMarketPrices);
    const marketMax = Math.max(...relevantMarketPrices);

    return {
      currentPrice,
      dailyChangePercent,
      weeklyChangePercent,
      volatility,
      movingAverage7d,
      marketMin,
      marketMax,
    };
  }, [product, marketProducts]);

  if (!productAnalysis) return null;

  const { currentPrice, dailyChangePercent, weeklyChangePercent, volatility, movingAverage7d, marketMin, marketMax } = productAnalysis;
  const isUp = dailyChangePercent > 0;
  const isDown = dailyChangePercent < 0;

  const ChangeIndicator = ({ value }: { value: number }) => {
    const isUp = value > 0;
    const isDown = value < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    return (
      <div className={cn('flex items-center justify-end gap-1 text-xs', isUp && 'text-success', isDown && 'text-danger')}>
        <Icon size={12} />
        <span>{value.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <>
      <TableRow className="border-green-900 font-mono">
        <TableCell className="py-2 px-2">
          <div className="font-bold text-base text-green-300">{product.name}</div>
          <div className="text-xs text-green-500">{product.variety}</div>
        </TableCell>
        <TableCell className="text-right py-2 px-2">
          <span className="text-2xl font-bold text-green-200">
            ${currentPrice.toLocaleString()}
          </span>
        </TableCell>
        <TableCell className="text-right py-2 px-2 w-[100px]">
          <div className="font-medium">
            <div className="text-sm">Diario</div>
            <ChangeIndicator value={dailyChangePercent} />
          </div>
        </TableCell>
        <TableCell className="text-right py-2 px-2 w-[100px]">
          <div className="font-medium">
            <div className="text-sm">Semanal</div>
            <ChangeIndicator value={weeklyChangePercent} />
          </div>
        </TableCell>
        <TableCell className="py-2 px-2 w-[160px] hidden md:table-cell">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">PPM (7d):</div>
            <div className="text-sm font-bold text-green-400">${movingAverage7d.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</div>
          </div>
           <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Volatilidad:</div>
            <div className="text-sm font-bold text-accent">{volatility.toFixed(1)}%</div>
          </div>
        </TableCell>
         <TableCell className="py-2 px-2 w-[160px] hidden lg:table-cell">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Mín. Mercado:</div>
            <div className="text-sm font-bold text-danger">${marketMin.toLocaleString()}</div>
          </div>
           <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Máx. Mercado:</div>
            <div className="text-sm font-bold text-success">${marketMax.toLocaleString()}</div>
          </div>
        </TableCell>
        <TableCell className="w-[120px] hidden sm:table-cell py-2 px-2">
          <div className="mx-auto">
            <PriceChart product={product} simple />
          </div>
        </TableCell>
        <TableCell className="text-right py-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartOpen(true)}
            className="text-green-400 hover:bg-green-900 hover:text-green-200"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            <span className="hidden xl:inline">Gráfico</span>
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
