'use client';

import { useMemo } from 'react';
import type { Stall, Product } from '@/lib/types';
import { marketCommentary } from '@/lib/market-commentary';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  ArrowUp,
  ArrowDown,
  Package,
  PackageOpen,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductMetric = {
  name: string;
  dailyChange: number;
  volatility: number;
};

const calculateMetrics = (product: Product): ProductMetric => {
  if (product.priceHistory.length < 2) {
    return { name: `${product.name} (${product.variety})`, dailyChange: 0, volatility: 0 };
  }
  const currentPrice = product.priceHistory.at(-1)!.price;
  const prevPrice = product.priceHistory.at(-2)!.price;
  const dailyChange = ((currentPrice - prevPrice) / prevPrice) * 100;

  const prices = product.priceHistory.map((h) => h.price);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(
    prices.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
      prices.length
  );
  const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

  return {
    name: `${product.name} (${product.variety})`,
    dailyChange,
    volatility,
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

export function MarketSummary({ stalls }: { stalls: Stall[] }) {
  const marketMetrics = useMemo(() => {
    const allProducts = stalls.flatMap((stall) => stall.products);
    if (allProducts.length === 0) return null;

    const metrics = allProducts.map(calculateMetrics);
    
    const marketTrend = metrics.reduce((sum, p) => sum + p.dailyChange, 0) / metrics.length;
    
    const sortedByChange = [...metrics].sort((a, b) => b.dailyChange - a.dailyChange);
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    const sortedByVolatility = [...metrics].sort((a, b) => b.volatility - a.volatility);
    const mostVolatile = sortedByVolatility[0];
    const mostStable = sortedByVolatility[sortedByVolatility.length - 1];

    return {
        marketTrend,
        topGainer,
        topLoser,
        mostVolatile,
        mostStable,
    }
  }, [stalls]);

  if (!marketMetrics) {
    return <p className="text-muted-foreground">No hay datos de mercado para analizar.</p>;
  }

  const { marketTrend, topGainer, topLoser, mostVolatile, mostStable } = marketMetrics;

  const isMarketUp = marketTrend > 0;
  const TrendIcon = isMarketUp ? ArrowUp : ArrowDown;
  const trendColor = isMarketUp ? 'text-success' : 'text-danger';

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-headline text-green-300 pb-2 mb-6">
        Resumen del Mercado
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
            icon={<LineChart className="h-4 w-4 text-green-500"/>}
            title="Tendencia General"
            value={`${marketTrend.toFixed(2)}%`}
            description="Cambio promedio de todos los productos"
            valueClass={trendColor}
        />
        <MetricCard 
            icon={<TrendingUp className="h-4 w-4 text-success"/>}
            title="Mejor Rendimiento (24h)"
            value={`${topGainer.dailyChange.toFixed(2)}%`}
            description={topGainer.name}
            valueClass="text-success"
        />
        <MetricCard 
            icon={<TrendingDown className="h-4 w-4 text-danger"/>}
            title="Peor Rendimiento (24h)"
            value={`${topLoser.dailyChange.toFixed(2)}%`}
            description={topLoser.name}
            valueClass="text-danger"
        />
        <MetricCard 
            icon={<Activity className="h-4 w-4 text-accent"/>}
            title="Más Volátil"
            value={`${mostVolatile.volatility.toFixed(2)}%`}
            description={mostVolatile.name}
            valueClass="text-accent"
        />
         <MetricCard 
            icon={<Shield className="h-4 w-4 text-blue-400"/>}
            title="Más Estable"
            value={`${mostStable.volatility.toFixed(2)}%`}
            description={mostStable.name}
            valueClass="text-blue-400"
        />
        <MetricCard 
            icon={<Package className="h-4 w-4 text-gray-400"/>}
            title="Más Vendidos (Semanal)"
            value={marketCommentary.mostSold[0]}
            description={marketCommentary.mostSold.slice(1).join(', ')}
            valueClass="text-base"
        />
         <MetricCard 
            icon={<PackageOpen className="h-4 w-4 text-gray-500"/>}
            title="Menos Vendidos (Semanal)"
            value={marketCommentary.leastSold[0]}
            description={marketCommentary.leastSold.slice(1).join(', ')}
            valueClass="text-base"
        />
      </div>
    </div>
  );
}
