'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TableRow, TableCell } from '@/components/ui/table';
import { PriceChart } from './price-chart';
import type { AggregatedProduct } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

type ProductCardProps = {
  product: AggregatedProduct;
  marketProducts: AggregatedProduct[];
  marketOpen: boolean;
  isHighlighted?: boolean;
};

export function ProductCard({ product, marketProducts, marketOpen, isHighlighted }: ProductCardProps) {
  const [isChartOpen, setChartOpen] = useState(false);

  const productAnalysis = useMemo(() => {
    if (product.priceHistory.length === 0) return null;

    const currentPriceData = product.priceHistory.at(0)!;
    const currentPrice = currentPriceData.price;
    
    const prevPriceData = product.priceHistory.at(1);
    const prevPrice = prevPriceData?.price ?? currentPrice;

    const change = currentPrice - prevPrice;
    const changePercent = prevPrice === 0 ? 0 : (change / prevPrice) * 100;
    
    const volatility = Math.abs(changePercent);

    const relevantMarketPrices = marketProducts
      .filter(p => p.name === product.name && p.variety === product.variety)
      .map(p => p.priceHistory.at(0)?.price ?? 0)
      .filter(price => price > 0);

    const marketMin = relevantMarketPrices.length > 0 ? Math.min(...relevantMarketPrices) : 0;
    const marketMax = relevantMarketPrices.length > 0 ? Math.max(...relevantMarketPrices) : 0;

    return {
      currentPrice,
      lastUpdate: currentPriceData.date,
      prevPriceData,
      prevPrice,
      changePercent,
      volatility,
      marketMin,
      marketMax,
    };
  }, [product, marketProducts]);

  if (!productAnalysis) return null;

  const { currentPrice, lastUpdate, changePercent, volatility, prevPriceData, prevPrice, marketMin, marketMax } = productAnalysis;

  const ChangeIndicator = ({ value, label }: { value: number, label: string }) => {
    const isUp = value > 0;
    const isDown = value < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    return (
       <div className="font-medium">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={cn('flex items-center justify-end gap-1 text-xs font-mono', isUp && 'text-success', isDown && 'text-danger')}>
                <Icon size={12} />
                <span>{value.toFixed(1)}%</span>
            </div>
      </div>
    );
  };
  
  const lastUpdateLabel = marketOpen 
    ? format(new Date(lastUpdate), "d MMM, HH:mm", { locale: es })
    : 'Precio de Cierre';

  return (
    <>
      <TableRow 
        className="border-green-900/50 hover:bg-green-900/10 cursor-pointer"
        onClick={() => setChartOpen(true)}
        title="Ver gráfico detallado"
      >
        <TableCell className="py-3 px-4">
          <div className="font-bold text-sm text-green-300">{product.name}</div>
          <div className="text-xs text-green-500">{product.variety}</div>
        </TableCell>
        <TableCell className={cn(
            "text-right py-3 px-4 transition-all duration-500",
             isHighlighted && "border-y-2 border-accent/80 bg-accent/10"
            )}>
          <span className="text-xl font-mono text-green-200">
            ${currentPrice.toLocaleString()}
          </span>
           <div className="text-xs text-muted-foreground mt-1 text-right">
              {lastUpdateLabel}
            </div>
        </TableCell>
        <TableCell className="text-right py-3 px-4 w-[100px]">
          <ChangeIndicator value={changePercent} label="Var."/>
        </TableCell>
        <TableCell className="py-3 px-4 w-[160px]">
           <div className="flex items-center justify-between">
             <div className="text-xs text-muted-foreground">
                {prevPriceData ? format(new Date(prevPriceData.date), "d MMM", { locale: es }) : 'Precio Ant.'}:
            </div>
            <div className="text-sm font-mono text-green-400">${prevPrice.toLocaleString()}</div>
          </div>
           <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Volatilidad:</div>
            <div className="text-sm font-mono text-accent">{volatility.toFixed(1)}%</div>
          </div>
        </TableCell>
         <TableCell className="py-3 px-4 w-[160px]">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Mín. Mercado:</div>
            <div className="text-sm font-mono text-danger">${marketMin.toLocaleString()}</div>
          </div>
           <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Máx. Mercado:</div>
            <div className="text-sm font-mono text-success">${marketMax.toLocaleString()}</div>
          </div>
        </TableCell>
        <TableCell className="py-3 px-4 w-[160px]">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full bg-success',
                marketOpen && 'animate-pulse'
              )}
            />
            <div className="text-xs text-muted-foreground">
              {format(new Date(lastUpdate), 'Pp', { locale: es })}
            </div>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={isChartOpen} onOpenChange={setChartOpen}>
        <DialogContent className="max-w-2xl w-[95%] p-0 border-green-500 bg-black rounded-lg">
          <PriceChart product={product} />
        </DialogContent>
      </Dialog>
    </>
  );
}
