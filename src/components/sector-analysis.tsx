'use client';

import { useMemo } from 'react';
import type { Stall, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { TrendingUp, TrendingDown, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductMetric = {
  name: string;
  weeklyChange: number;
  volatility: number;
};

type SectorData = {
  name: string;
  avgWeeklyChange: number;
  avgVolatility: number;
  topPerformer: ProductMetric | null;
  worstPerformer: ProductMetric | null;
};

const calculateMetrics = (product: Product): ProductMetric => {
  const currentPrice = product.priceHistory.at(-1)?.price ?? 0;
  const weeklyPrice = product.priceHistory.at(-8)?.price ?? product.priceHistory[0]?.price ?? currentPrice;
  const weeklyChange = weeklyPrice > 0 ? ((currentPrice - weeklyPrice) / weeklyPrice) * 100 : 0;
  
  const prices = product.priceHistory.map(h => h.price);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = prices.length > 1 ? Math.sqrt(prices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / prices.length) : 0;
  const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;
  
  return {
    name: `${product.name} (${product.variety})`,
    weeklyChange,
    volatility
  };
};

const ChangeIndicator = ({ value, label, isPercent = true }: { value: number, label: string, isPercent?: boolean }) => {
  const isUp = value > 0;
  const isDown = value < 0;
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className={cn('flex items-center gap-1 font-mono', isUp && 'text-success', isDown && 'text-danger')}>
        <Icon size={14} />
        <span>{value.toFixed(1)}{isPercent ? '%' : ''}</span>
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
      const avgVolatility = productMetrics.reduce((sum, p) => sum + p.volatility, 0) / productMetrics.length;

      const sortedByChange = [...productMetrics].sort((a, b) => b.weeklyChange - a.weeklyChange);

      return {
        name: category,
        avgWeeklyChange,
        avgVolatility,
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
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <div className='space-y-2'>
                <ChangeIndicator value={sector.avgWeeklyChange} label="Rendimiento (7d)" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Volatilidad Media</span>
                  <div className='flex items-center gap-1 font-mono text-accent'>
                    <Activity size={14} />
                    <span>{sector.avgVolatility.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-green-800/50 pt-4 mt-4 space-y-3">
                {sector.topPerformer && (
                   <div>
                     <CardDescription className="text-xs text-green-500 mb-1 flex items-center gap-2"><TrendingUp size={14}/> Mejor Rendimiento</CardDescription>
                     <ChangeIndicator value={sector.topPerformer.weeklyChange} label={sector.topPerformer.name} />
                   </div>
                )}
                {sector.worstPerformer && sector.topPerformer?.name !== sector.worstPerformer.name && (
                  <div>
                    <CardDescription className="text-xs text-green-500 mb-1 flex items-center gap-2"><TrendingDown size={14}/> Peor Rendimiento</CardDescription>
                    <ChangeIndicator value={sector.worstPerformer.weeklyChange} label={sector.worstPerformer.name} />
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
