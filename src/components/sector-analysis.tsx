'use client';

import { useMemo } from 'react';
import type { Stall, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { TrendingUp, TrendingDown, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductMetric = {
  name: string;
  weeklyChange: number;
};

type SectorData = {
  name: string;
  avgWeeklyChange: number;
  topPerformer: ProductMetric | null;
  worstPerformer: ProductMetric | null;
};

const calculateMetrics = (product: Product): ProductMetric => {
  if (product.priceHistory.length < 2) {
    return { name: `${product.name} (${product.variety})`, weeklyChange: 0 };
  }
  const currentPrice = product.priceHistory.at(-1)!.price;
  const weeklyPriceData = product.priceHistory.find(
    (p) => new Date(p.date) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const weeklyPrice = weeklyPriceData?.price ?? product.priceHistory[0].price;

  const weeklyChange = weeklyPrice > 0 ? ((currentPrice - weeklyPrice) / weeklyPrice) * 100 : 0;
  
  return {
    name: `${product.name} (${product.variety})`,
    weeklyChange,
  };
};

const ChangeIndicator = ({ value, label }: { value: number, label: string }) => {
  const isUp = value > 0;
  const isDown = value < 0;
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground truncate pr-2">{label}</span>
      <div className={cn('flex items-center gap-1 font-mono shrink-0', isUp && 'text-success', isDown && 'text-danger')}>
        <Icon size={14} />
        <span>{value.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export function SectorAnalysis({ stalls }: { stalls: Stall[] }) {
  const sectorAnalysis = useMemo(() => {
    const allProducts = stalls.flatMap(stall => stall.products);
    const productsByCategory = allProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    return Object.entries(productsByCategory).map(([category, products]) => {
      const productMetrics = products.map(calculateMetrics);
      
      const avgWeeklyChange = productMetrics.reduce((sum, p) => sum + p.weeklyChange, 0) / productMetrics.length;

      const sortedByChange = [...productMetrics].sort((a, b) => b.weeklyChange - a.weeklyChange);

      return {
        name: category,
        avgWeeklyChange,
        topPerformer: sortedByChange[0] ?? null,
        worstPerformer: sortedByChange[sortedByChange.length - 1] ?? null,
      };
    });
  }, [stalls]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-headline text-green-300 pb-2 mb-6">
        Análisis por Sector
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectorAnalysis.map(sector => (
          <Card key={sector.name} className="bg-gray-900/50 border-green-800/50 text-green-400 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl text-green-300">{sector.name}</CardTitle>
               <div className="flex items-center text-sm pt-1">
                <span className="text-muted-foreground">Rendimiento Semanal:</span>
                <span className={cn(
                    "font-bold font-mono flex items-center ml-2",
                    sector.avgWeeklyChange > 0 && 'text-success',
                    sector.avgWeeklyChange < 0 && 'text-danger'
                )}>
                    {sector.avgWeeklyChange > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {sector.avgWeeklyChange.toFixed(2)}%
                </span>
               </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <div className="border-t border-green-800/50 pt-4 space-y-3">
                {sector.topPerformer && (
                   <div>
                     <CardDescription className="text-xs text-green-500 mb-1 flex items-center gap-2"><TrendingUp size={14}/> Mejor Rendimiento</CardDescription>
                     <ChangeIndicator value={sector.topPerformer.weeklyChange} label={sector.topPerformer.name} />
                   </div>
                )}
                {sector.worstPerformer && sector.topPerformer?.name !== sector.worstPerformer.name && (
                  <div>
                    <CardDescription className="text-xs text-red-500/80 mb-1 flex items-center gap-2"><TrendingDown size={14}/> Peor Rendimiento</CardDescription>
                    <ChangeIndicator value={sector.worstPerformer.weeklyChange} label={sector.worstPerformer.name} />
                  </div>
                )}
                 {sector.topPerformer?.name === sector.worstPerformer?.name && sector.topPerformer && (
                    <div>
                        <CardDescription className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><Activity size={14}/> Sin Cambios</CardDescription>
                        <p className="text-sm text-muted-foreground">No hubo cambios significativos en este sector.</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
