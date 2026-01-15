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
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

type ProductMetric = {
  name: string;
  dailyChange: number;
  currentPrice: number;
};

const calculateMetrics = (product: Product): ProductMetric => {
  if (product.priceHistory.length < 2) {
    return { name: `${product.name} (${product.variety})`, dailyChange: 0, currentPrice: product.priceHistory.at(-1)?.price ?? 0 };
  }
  const currentPrice = product.priceHistory.at(-1)!.price;
  const prevPrice = product.priceHistory.at(-2)!.price;
  const dailyChange = ((currentPrice - prevPrice) / prevPrice) * 100;

  return {
    name: `${product.name} (${product.variety})`,
    dailyChange,
    currentPrice,
  };
};

const MetricCard = ({
  icon,
  title,
  value,
  description,
  valueClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
  valueClass?: string;
}) => (
  <Card className="bg-gray-900/50 border-green-800/50 text-green-400">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-green-300">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={cn('text-2xl font-bold', valueClass)}>{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const MoverItem = ({ name, dailyChange, currentPrice }: ProductMetric) => {
    const isUp = dailyChange > 0;
    const isDown = dailyChange < 0;
    const color = isUp ? 'text-success' : isDown ? 'text-danger' : 'text-muted-foreground';
    const Icon = isUp ? ArrowUp : ArrowDown;

    return (
        <div className="flex justify-between items-center py-2">
            <div>
                <p className="font-medium text-green-300">{name}</p>
                <p className={cn("flex items-center text-sm font-mono", color)}>
                    <Icon className="h-4 w-4 mr-1" />
                    {dailyChange.toFixed(2)}%
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
    
    const marketTrend = metrics.reduce((sum, p) => sum + p.dailyChange, 0) / metrics.length;
    
    const sortedByChange = [...metrics].sort((a, b) => b.dailyChange - a.dailyChange);
    const topGainers = sortedByChange.filter(p => p.dailyChange > 0).slice(0, 3);
    const topLosers = sortedByChange.filter(p => p.dailyChange < 0).slice(-3).reverse();

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
                 <CardDescription className="text-green-500/80">Productos con mayor alza en 24h.</CardDescription>
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
                <CardDescription className="text-red-500/80">Productos con mayor baja en 24h.</CardDescription>
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
