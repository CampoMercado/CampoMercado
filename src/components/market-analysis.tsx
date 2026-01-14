'use client';

import { useMemo } from 'react';
import type { Stall, Product } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, Shield, Zap, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { marketCommentary } from '@/lib/market-commentary';

type ProductAnalysis = {
  productName: string;
  variety: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceSpread: number;
  volatility: number;
  dailyChange: number;
  weeklyChange: number;
  movingAverage7d: number;
  stalls: { name: string; number: number; price: number }[];
};

export function MarketAnalysis({ stalls }: { stalls: Stall[] }) {
  const allProducts: (Product & { stallName: string; number: number })[] = useMemo(() => 
    stalls.flatMap(stall => 
      stall.products.map(p => ({...p, stallName: stall.name, number: stall.number}))
    ), [stalls]);

  const analysis: ProductAnalysis[] = useMemo(() => {
    const productMap = new Map<
      string,
      {
        prices: number[];
        priceHistories: number[][];
        stalls: { name: string; number: number; price: number }[];
      }
    >();

    allProducts.forEach((product) => {
        const key = `${product.name} - ${product.variety}`;
        const currentPrice = product.priceHistory.at(-1)?.price;
        if (currentPrice === undefined) return;

        if (!productMap.has(key)) {
          productMap.set(key, { prices: [], stalls: [], priceHistories: [] });
        }
        const entry = productMap.get(key)!;
        entry.prices.push(currentPrice);
        entry.stalls.push({
          name: product.stallName,
          number: product.number,
          price: currentPrice,
        });
        entry.priceHistories.push(product.priceHistory.map(h => h.price));
      });

    const result: ProductAnalysis[] = [];
    for (const [key, data] of productMap.entries()) {
      const [productName, variety] = key.split(' - ');
      const sum = data.prices.reduce((a, b) => a + b, 0);
      const avgPrice = sum / data.prices.length;
      const minPrice = Math.min(...data.prices);
      const maxPrice = Math.max(...data.prices);
      
      const allHistoricalPrices = data.priceHistories.flat();
      const mean = allHistoricalPrices.reduce((a, b) => a + b, 0) / allHistoricalPrices.length;
      const stdDev = Math.sqrt(allHistoricalPrices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / allHistoricalPrices.length);
      const volatility = mean > 0 ? (stdDev / mean) * 100 : 0; // as percentage

      // Take the longest price history for calculations
      const representativeHistory = data.priceHistories.reduce((a,b) => a.length > b.length ? a : b, []);
      const currentPrice = representativeHistory.at(-1) ?? 0;
      const prevPrice = representativeHistory.at(-2) ?? currentPrice;
      const weeklyPrice = representativeHistory.at(-8) ?? representativeHistory.at(0) ?? currentPrice;

      const dailyChange = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
      const weeklyChange = weeklyPrice > 0 ? ((currentPrice - weeklyPrice) / weeklyPrice) * 100 : 0;

      const movingAverage7d = representativeHistory.slice(-7).reduce((acc, val) => acc + val, 0) / Math.min(representativeHistory.length, 7);

      result.push({
        productName,
        variety,
        avgPrice,
        minPrice,
        maxPrice,
        priceSpread: maxPrice - minPrice,
        volatility,
        dailyChange,
        weeklyChange,
        movingAverage7d,
        stalls: data.stalls.sort((a, b) => a.price - b.price),
      });
    }

    return result.sort((a,b) => a.productName.localeCompare(b.productName));
  }, [allProducts]);

  const marketSummary = useMemo(() => {
      const allPrices = allProducts.map(p => p.priceHistory.at(-1)?.price ?? 0).filter(p => p > 0);
      const totalProducts = allPrices.length;
      const marketAvg = allPrices.reduce((a, b) => a + b, 0) / totalProducts;

      const topMovers = allProducts.map(p => {
          const current = p.priceHistory.at(-1)?.price ?? 0;
          const prev = p.priceHistory.at(-2)?.price ?? current;
          const change = current - prev;
          const changePercent = prev === 0 ? 0 : (change / prev) * 100;
          return { name: `${p.name} (${p.variety})`, changePercent };
      }).sort((a,b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 3);
      
      const volatilityRanking = [...analysis].sort((a,b) => b.volatility - a.volatility);

      return { 
          marketAvg, 
          totalProducts, 
          topMovers,
          mostVolatile: volatilityRanking.slice(0, 3),
          mostStable: volatilityRanking.slice(-3).reverse()
        };

  }, [allProducts, analysis]);


  const ChangeIndicator = ({ value }: { value: number }) => {
    const isUp = value > 0;
    const isDown = value < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    return (
      <div className={cn('flex items-center justify-end gap-1', isUp && 'text-green-500', isDown && 'text-red-500')}>
        <span>{value.toFixed(1)}%</span>
        <Icon size={14} />
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      <Card className="bg-gray-900/50 border-green-800 text-green-400">
        <CardHeader>
          <CardTitle className="text-green-300">Análisis de Precios por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-green-800 hover:bg-gray-900 text-xs uppercase">
                  <TableHead className="text-green-300">Producto</TableHead>
                  <TableHead className="text-right text-green-300">P. Promedio</TableHead>
                  <TableHead className="text-right text-green-300">Var. Diaria</TableHead>
                  <TableHead className="text-right text-green-300">Var. Semanal</TableHead>
                  <TableHead className="text-right text-green-300">PPM (7d)</TableHead>
                  <TableHead className="text-right text-green-300">Volatilidad</TableHead>
                  <TableHead className="text-center text-green-300 hidden md:table-cell">Puestos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.map((item) => (
                  <TableRow key={`${item.productName}-${item.variety}`} className="border-green-900">
                    <TableCell className="font-bold text-green-400">
                      <div>{item.productName}</div>
                      <div className="text-xs text-green-600">{item.variety}</div>
                    </TableCell>
                    <TableCell className="text-right text-green-200 font-medium">${item.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</TableCell>
                    <TableCell className="text-right"><ChangeIndicator value={item.dailyChange} /></TableCell>
                    <TableCell className="text-right"><ChangeIndicator value={item.weeklyChange} /></TableCell>
                    <TableCell className="text-right text-green-400">${item.movingAverage7d.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</TableCell>
                    <TableCell className="text-right text-accent">{item.volatility.toFixed(1)}%</TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                        <div className="flex gap-1 justify-center items-center">
                            {item.stalls.map(s => (
                                <div key={s.number} className="text-xs border border-green-800 bg-black rounded-sm px-1.5 py-0.5" title={`${s.name} - $${s.price.toLocaleString()}`}>
                                    #{s.number}
                                </div>
                            ))}
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900/50 border-green-800 text-green-400">
            <CardHeader>
                <CardTitle className="text-green-300">Resumen del Mercado</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-black rounded-md border border-green-900 space-y-1">
                    <p className="text-sm text-green-500 font-bold mb-2">Lo más vendido (semanal)</p>
                    {marketCommentary.mostSold.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-green-300">
                            <TrendingUp size={16} className="text-success flex-shrink-0"/>
                            <span className="truncate">{item}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-black rounded-md border border-green-900 space-y-1">
                    <p className="text-sm text-green-500 font-bold mb-2">Lo menos vendido (semanal)</p>
                    {marketCommentary.leastSold.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-green-300">
                           <TrendingDown size={16} className="text-danger flex-shrink-0"/>
                            <span className="truncate">{item}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-black rounded-md border border-green-900 space-y-1">
                    <p className="text-sm text-green-500 font-bold mb-2">Mayor Volatilidad</p>
                    {marketSummary.mostVolatile.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-green-300">
                           <div className="flex items-center gap-2 truncate">
                             <Zap size={16} className="text-accent flex-shrink-0"/>
                             <span className="truncate">{item.productName} ({item.variety})</span>
                           </div>
                           <span className="text-xs text-muted-foreground ml-auto">{item.volatility.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-black rounded-md border border-green-900 space-y-1">
                    <p className="text-sm text-green-500 font-bold mb-2">Mayor Estabilidad</p>
                    {marketSummary.mostStable.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-green-300">
                          <div className="flex items-center gap-2 truncate">
                            <Shield size={16} className="text-primary flex-shrink-0"/>
                            <span className="truncate">{item.productName} ({item.variety})</span>
                          </div>
                           <span className="text-xs text-muted-foreground ml-auto">{item.volatility.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
