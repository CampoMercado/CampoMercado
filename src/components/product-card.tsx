'use client';

import { useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { PriceChart } from './price-chart';
import type { Product, TickerProduct, PriceHistory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, BarChart2, Minus } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  marketProducts: TickerProduct[];
};

// Helper to find the price closest to N days ago
const findPriceNearDaysAgo = (priceHistory: PriceHistory[], days: number): PriceHistory | undefined => {
  if (priceHistory.length < 2) return undefined;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - days);

  return priceHistory.reduce((prev, curr) => {
    const prevDiff = Math.abs(new Date(prev.date).getTime() - targetDate.getTime());
    const currDiff = Math.abs(new Date(curr.date).getTime() - targetDate.getTime());
    return currDiff < prevDiff ? curr : prev;
  });
};


export function ProductCard({ product, marketProducts }: ProductCardProps) {
  const [isChartOpen, setChartOpen] = useState(false);

  const productAnalysis = useMemo(() => {
    if (product.priceHistory.length === 0) return null;

    const currentPriceData = product.priceHistory.at(-1)!;
    const currentPrice = currentPriceData.price;
    
    // Previous price is the one right before the last one
    const prevPriceData = product.priceHistory.at(-2);
    const prevPrice = prevPriceData?.price ?? currentPrice;

    // Weekly price is the one closest to 7 days ago
    const weeklyPriceData = findPriceNearDaysAgo(product.priceHistory, 7);
    const weeklyPrice = weeklyPriceData?.price ?? product.priceHistory[0].price;

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

    const marketMin = relevantMarketPrices.length > 0 ? Math.min(...relevantMarketPrices) : 0;
    const marketMax = relevantMarketPrices.length > 0 ? Math.max(...relevantMarketPrices) : 0;

    return {
      currentPrice,
      lastUpdate: currentPriceData.date,
      dailyChangePercent,
      weeklyChangePercent,
      volatility,
      movingAverage7d,
      marketMin,
      marketMax,
    };
  }, [product, marketProducts]);

  if (!productAnalysis) return null;

  const { currentPrice, lastUpdate, dailyChangePercent, weeklyChangePercent, volatility, movingAverage7d, marketMin, marketMax } = productAnalysis;

  const ChangeIndicator = ({ value, label }: { value: number, label: string }) => {
    const isUp = value > 0;
    const isDown = value < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    return (
       <div className="font-medium">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className={cn('flex items-center justify-end gap-1 text-xs font-mono', isUp && 'text-success', isDown && 'text-danger')}>
                <Icon size={12} />
                <span>{value.toFixed(1)}%</span>
            </div>
      </div>
    );
  };

  return (
    <>
      <TableRow className="border-green-900/50 hover:bg-green-900/10">
        <TableCell className="py-3 px-2">
          <div className="font-bold text-base text-green-300">{product.name}</div>
          <div className="text-xs text-green-500">{product.variety}</div>
        </TableCell>
        <TableCell className="text-right py-3 px-2">
          <span className="text-2xl font-mono text-green-200">
            ${currentPrice.toLocaleString()}
          </span>
           <div className="text-xs text-muted-foreground mt-1 text-right">
              {format(new Date(lastUpdate), "d MMM, HH:mm", { locale: es })}
            </div>
        </TableCell>
        <TableCell className="text-right py-3 px-2 w-[100px]">
          <ChangeIndicator value={dailyChangePercent} label="vs Ant."/>
        </TableCell>
        <TableCell className="text-right py-3 px-2 w-[100px]">
          <ChangeIndicator value={weeklyChangePercent} label="vs 7d"/>
        </TableCell>
        <TableCell className="py-3 px-2 w-[160px] hidden md:table-cell">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">PPM (7d):</div>
            <div className="text-sm font-mono text-green-400">${movingAverage7d.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</div>
          </div>
           <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Volatilidad:</div>
            <div className="text-sm font-mono text-accent">{volatility.toFixed(1)}%</div>
          </div>
        </TableCell>
         <TableCell className="py-3 px-2 w-[160px] hidden lg:table-cell">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Mín. Mercado:</div>
            <div className="text-sm font-mono text-danger">${marketMin.toLocaleString()}</div>
          </div>
           <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Máx. Mercado:</div>
            <div className="text-sm font-mono text-success">${marketMax.toLocaleString()}</div>
          </div>
        </TableCell>
        <TableCell className="w-[120px] hidden sm:table-cell py-3 px-2">
           <div 
             className="mx-auto cursor-pointer"
             onClick={() => setChartOpen(true)}
             title="Ver gráfico detallado"
           >
            <PriceChart product={product} simple />
          </div>
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
