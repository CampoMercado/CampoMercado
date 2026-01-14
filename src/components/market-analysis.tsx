'use client';

import { useMemo } from 'react';
import type { Stall } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { marketCommentary } from '@/lib/market-commentary';
import { TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';

export function MarketAnalysis({ stalls }: { stalls: Stall[] }) {
  const productAnalysis = useMemo(() => {
    const allProducts = stalls.flatMap(stall =>
      stall.products.map(p => ({ ...p, stallName: stall.name, stallNumber: stall.number }))
    );

    const volatilityMetrics = allProducts.map(product => {
      const prices = product.priceHistory.map(h => h.price);
      if (prices.length < 2) return { name: `${product.name} (${product.variety})`, volatility: 0 };
      
      const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
      const stdDev = Math.sqrt(prices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / prices.length);
      const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

      return {
        name: `${product.name} (${product.variety})`,
        volatility,
      };
    }).filter(p => p.volatility > 0);

    volatilityMetrics.sort((a, b) => b.volatility - a.volatility);

    const mostVolatile = volatilityMetrics.slice(0, 3);
    const leastVolatile = volatilityMetrics.slice(-3).reverse();

    return { mostVolatile, leastVolatile };
  }, [stalls]);

  const SummaryCard = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: { name: string, value: string }[] }) => (
    <Card className="bg-gray-900/50 border-green-800 text-green-400">
      <CardHeader>
        <CardTitle className="text-green-300 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span className="text-green-400">{item.name}</span>
              <span className="font-mono text-accent">{item.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline text-green-300 border-b border-green-800 pb-2 mb-6">
          Resumen del Mercado
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title="Lo más vendido (semanal)"
            icon={<TrendingUp className="text-success" />}
            items={marketCommentary.mostSold.map(name => ({ name, value: '' }))}
          />
          <SummaryCard 
            title="Lo menos vendido (semanal)"
            icon={<TrendingDown className="text-danger" />}
            items={marketCommentary.leastSold.map(name => ({ name, value: '' }))}
          />
          <SummaryCard 
            title="Mayor Volatilidad"
            icon={<Zap className="text-accent" />}
            items={productAnalysis.mostVolatile.map(p => ({ name: p.name, value: `${p.volatility.toFixed(1)}%`}))}
          />
          <SummaryCard 
            title="Mayor Estabilidad"
            icon={<Shield className="text-primary" />}
            items={productAnalysis.leastVolatile.map(p => ({ name: p.name, value: `${p.volatility.toFixed(1)}%`}))}
          />
        </div>
      </div>
    </div>
  );
}
