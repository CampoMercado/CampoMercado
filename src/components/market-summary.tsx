'use client';

import { useMemo } from 'react';
import type { Stall, Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductMetric = {
  name: string;
  change: number;
  currentPrice: number;
};

const calculateMetrics = (product: Product): ProductMetric => {
  if (product.priceHistory.length < 2) {
    return { name: `${product.name} (${product.variety})`, change: 0, currentPrice: product.priceHistory.at(-1)?.price ?? 0 };
  }
  const currentPrice = product.priceHistory.at(-1)!.price;
  const prevPrice = product.priceHistory.at(-2)!.price;
  const change = ((currentPrice - prevPrice) / prevPrice) * 100;

  return {
    name: `${product.name} (${product.variety})`,
    change,
    currentPrice,
  };
};

const MoverItem = ({ name, change, currentPrice }: ProductMetric) => {
    const isUp = change > 0;
    const isDown = change < 0;
    const color = isUp ? 'text-success' : isDown ? 'text-danger' : 'text-muted-foreground';
    const Icon = isUp ? ArrowUp : ArrowDown;

    return (
        <div className="flex justify-between items-center py-2">
            <div>
                <p className="font-medium text-green-300">{name}</p>
                <p className={cn("flex items-center text-sm font-mono", color)}>
                    <Icon className="h-4 w-4 mr-1" />
                    {change.toFixed(2)}%
                </p>
            </div>
            <p className="text-lg font-mono text-green-200">${currentPrice.toLocaleString()}</p>
        </div>
    );
};


export function MarketSummary({ stalls }: { stalls: Stall[] }) {
  const marketMetrics = useMemo(() => {
    const allProducts = stalls.flatMap((stall) => stall.products).filter(p => p.priceHistory.length > 1);
    if (allProducts.length === 0) return null;

    const metrics = allProducts.map(calculateMetrics);
    
    const marketTrend = metrics.reduce((sum, p) => sum + p.change, 0) / metrics.length;
    
    const sortedByChange = [...metrics].sort((a, b) => b.change - a.change);
    const topGainers = sortedByChange.filter(p => p.change > 0).slice(0, 3);
    const topLosers = sortedByChange.filter(p => p.change < 0).slice(-3).reverse();

    return {
        marketTrend,
        topGainers,
        topLosers,
    }
  }, [stalls]);

  if (!marketMetrics) {
    return <p className="text-muted-foreground">No hay datos de mercado para analizar.</p>;
  }

  const { marketTrend, topGainers, topLosers } = marketMetrics;

  const isMarketUp = marketTrend > 0;
  const trendColor = isMarketUp ? 'text-success' : 'text-danger';

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-3xl font-headline text-green-300">
                Resumen del Mercado
            </h2>
             <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tendencia General:</span>
                <span className={cn("font-bold font-mono flex items-center", trendColor)}>
                    {isMarketUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {marketTrend.toFixed(2)}%
                </span>
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-black/30 border-green-800/50">
            <CardHeader>
                <CardTitle className="text-xl font-headline text-success flex items-center gap-2">
                    <ArrowUp />
                    Protagonistas del Día
                </CardTitle>
                 <CardDescription className="text-green-500/80">Productos con mayor alza.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-green-900/50">
                    {topGainers.length > 0 ? topGainers.map(p => <MoverItem key={p.name} {...p}/>)
                     : <p className="text-muted-foreground text-sm py-4">No se registraron alzas significativas.</p>}
                </div>
            </CardContent>
        </Card>
        <Card className="bg-black/30 border-red-800/50">
            <CardHeader>
                <CardTitle className="text-xl font-headline text-danger flex items-center gap-2">
                    <ArrowDown />
                    Bajas Relevantes
                </CardTitle>
                <CardDescription className="text-red-500/80">Productos con mayor baja.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-red-900/50">
                    {topLosers.length > 0 ? topLosers.map(p => <MoverItem key={p.name} {...p}/>)
                     : <p className="text-muted-foreground text-sm py-4">No se registraron bajas significativas.</p>}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
