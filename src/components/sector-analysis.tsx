'use client';

import { useMemo } from 'react';
import type { Stall, Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { TrendingUp, TrendingDown, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductMetric = {
  name: string;
  change: number;
};

type SectorData = {
  name: string;
  productsUp: number;
  productsDown: number;
  topPerformer: ProductMetric | null;
  worstPerformer: ProductMetric | null;
  totalProducts: number;
};

const calculateMetrics = (product: Product): ProductMetric => {
  if (product.priceHistory.length < 2) {
    return { name: `${product.name} (${product.variety})`, change: 0 };
  }
  const currentPrice = product.priceHistory.at(-1)!.price;
  const prevPrice = product.priceHistory.at(-2)!.price;

  const change = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
  
  return {
    name: `${product.name} (${product.variety})`,
    change,
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
  const sectorAnalysis: SectorData[] = useMemo(() => {
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
      
      const productsUp = productMetrics.filter(p => p.change > 0).length;
      const productsDown = productMetrics.filter(p => p.change < 0).length;

      const sortedByChange = [...productMetrics].sort((a, b) => b.change - a.change);

      const topPerformer = sortedByChange.find(p => p.change > 0) ?? null;
      const worstPerformer = sortedByChange.find(p => p.change < 0) ?? null;

      return {
        name: category,
        productsUp,
        productsDown,
        topPerformer,
        worstPerformer,
        totalProducts: products.length,
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
                <span className="text-muted-foreground">Rendimiento:</span>
                <span className="font-bold font-mono flex items-center ml-2 gap-3">
                    <span className="flex items-center text-success"><ArrowUp className="h-4 w-4 mr-1"/> {sector.productsUp}</span>
                    <span className="flex items-center text-danger"><ArrowDown className="h-4 w-4 mr-1"/> {sector.productsDown}</span>
                </span>
               </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                {sector.productsUp === 0 && sector.productsDown === 0 ? (
                     <div className="border-t border-green-800/50 pt-4 flex items-center text-muted-foreground text-sm gap-2">
                        <Activity size={14}/>
                        <span>No hubo cambios significativos hoy.</span>
                    </div>
                ) : (
                    <div className="border-t border-green-800/50 pt-4 space-y-3">
                        {sector.topPerformer && (
                        <div>
                            <CardDescription className="text-xs text-green-500 mb-1 flex items-center gap-2"><TrendingUp size={14}/> Mejor Rendimiento</CardDescription>
                            <ChangeIndicator value={sector.topPerformer.change} label={sector.topPerformer.name} />
                        </div>
                        )}
                        {sector.worstPerformer && (
                        <div>
                            <CardDescription className="text-xs text-red-500/80 mb-1 flex items-center gap-2"><TrendingDown size={14}/> Peor Rendimiento</CardDescription>
                            <ChangeIndicator value={sector.worstPerformer.change} label={sector.worstPerformer.name} />
                        </div>
                        )}
                    </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
