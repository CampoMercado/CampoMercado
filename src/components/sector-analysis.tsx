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
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type ProductMetric = {
  name: string;
  change: number;
};

type SectorData = {
  name: string;
  productsUp: number;
  productsDown: number;
  productsStable: number;
  topPerformer: ProductMetric | null;
  worstPerformer: ProductMetric | null;
  totalProducts: number;
  totalChanges: number;
};

const calculateMetrics = (product: Product): ProductMetric => {
  if (product.priceHistory.length < 2) {
    return { name: `${product.name} (${product.variety})`, change: 0 };
  }
  const currentPrice = product.priceHistory.at(-1)!.price;
  const prevPrice = product.priceHistory.at(-2)!.price;

  const change =
    prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;

  return {
    name: `${product.name} (${product.variety})`,
    change,
  };
};

const ChangeIndicator = ({
  value,
  label,
}: {
  value: number;
  label: string;
}) => {
  const isUp = value > 0;
  const isDown = value < 0;
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground truncate pr-2">{label}</span>
      <div
        className={cn(
          'flex items-center gap-1 font-mono shrink-0',
          isUp && 'text-success',
          isDown && 'text-danger'
        )}
      >
        <Icon size={14} />
        <span>{value.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export function SectorAnalysis({ stalls }: { stalls: Stall[] }) {
  const sectorAnalysis: SectorData[] = useMemo(() => {
    const allProducts = stalls.flatMap((stall) => stall.products);
    const productsByCategory = allProducts.reduce(
      (acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
      },
      {} as Record<string, Product[]>
    );

    const sectors = Object.entries(productsByCategory).map(
      ([category, products]) => {
        const productMetrics = products.map(calculateMetrics);

        const productsUp = productMetrics.filter((p) => p.change > 0).length;
        const productsDown = productMetrics.filter((p) => p.change < 0).length;
        const productsStable = productMetrics.filter(
          (p) => p.change === 0
        ).length;

        const sortedByChange = [...productMetrics].sort(
          (a, b) => b.change - a.change
        );

        const topPerformer = sortedByChange[0].change > 0 ? sortedByChange[0] : null;
        const worstPerformer = sortedByChange.at(-1)!.change < 0 ? sortedByChange.at(-1) : null;
        
        return {
          name: category,
          productsUp,
          productsDown,
          productsStable,
          topPerformer,
          worstPerformer,
          totalProducts: products.length,
          totalChanges: productsUp + productsDown,
        };
      }
    );
    
    // Sort sectors by total changes, then by name
    return sectors.sort((a, b) => {
        if (b.totalChanges !== a.totalChanges) {
            return b.totalChanges - a.totalChanges;
        }
        return a.name.localeCompare(b.name);
    });

  }, [stalls]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-headline text-green-300 pb-2 mb-6">
        Sectores con Mayor Actividad
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {sectorAnalysis.map((sector) => (
          <Card
            key={sector.name}
            className="bg-gray-900/50 border-green-800/50 text-green-400 flex flex-col"
          >
            <CardHeader>
              <CardTitle className="text-xl text-green-300">
                {sector.name}
              </CardTitle>
              <div className="flex items-center text-sm pt-1 gap-4">
                  <Badge variant="outline" className="border-green-700/50">
                    <Activity className="mr-2 h-3 w-3" /> 
                    {sector.totalProducts} Productos
                  </Badge>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center text-success"><ArrowUp className="h-4 w-4 mr-1"/> {sector.productsUp}</span>
                    <span className="flex items-center text-danger"><ArrowDown className="h-4 w-4 mr-1"/> {sector.productsDown}</span>
                    <span className="flex items-center"><Minus className="h-4 w-4 mr-1"/> {sector.productsStable}</span>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              {sector.totalChanges === 0 ? (
                <div className="border-t border-green-800/50 pt-4 flex items-center text-muted-foreground text-sm gap-2">
                  <Activity size={14} />
                  <span>Sin cambios significativos hoy.</span>
                </div>
              ) : (
                <div className="border-t border-green-800/50 pt-4 space-y-3">
                  {sector.topPerformer && (
                    <div>
                      <CardDescription className="text-xs text-green-500 mb-1 flex items-center gap-2">
                        <TrendingUp size={14} /> Protagonista del Sector
                      </CardDescription>
                      <ChangeIndicator
                        value={sector.topPerformer.change}
                        label={sector.topPerformer.name}
                      />
                    </div>
                  )}
                  {sector.worstPerformer && (
                    <div>
                      <CardDescription className="text-xs text-red-500/80 mb-1 flex items-center gap-2">
                        <TrendingDown size={14} /> Baja Relevante del Sector
                      </CardDescription>
                      <ChangeIndicator
                        value={sector.worstPerformer.change}
                        label={sector.worstPerformer.name}
                      />
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
