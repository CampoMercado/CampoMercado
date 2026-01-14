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
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, Shield, Zap } from 'lucide-react';
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
      
      // Calculate volatility (coefficient of variation)
      const allHistoricalPrices = data.priceHistories.flat();
      const mean = allHistoricalPrices.reduce((a, b) => a + b, 0) / allHistoricalPrices.length;
      const stdDev = Math.sqrt(allHistoricalPrices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / allHistoricalPrices.length);
      const volatility = mean > 0 ? (stdDev / mean) * 100 : 0; // as percentage

      result.push({
        productName,
        variety,
        avgPrice,
        minPrice,
        maxPrice,
        priceSpread: maxPrice - minPrice,
        volatility,
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


  return (
    <div className="space-y-8">
        <Card className="bg-gray-900/50 border-green-800 text-green-400">
            <CardHeader>
                <CardTitle className="text-green-300">Resumen del Mercado</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="p-4 bg-black rounded-md border border-green-900">
                    <p className="text-sm text-green-500">Lo más vendido (semanal)</p>
                    <ul className="space-y-1 mt-2">
                        {marketCommentary.mostSold.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-green-300">
                                <TrendingUp size={16} className="text-success"/>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 bg-black rounded-md border border-green-900">
                    <p className="text-sm text-green-500">Lo menos vendido (semanal)</p>
                    <ul className="space-y-1 mt-2">
                        {marketCommentary.leastSold.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-green-300">
                               <TrendingDown size={16} className="text-danger"/>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 bg-black rounded-md border border-green-900">
                    <p className="text-sm text-green-500">Mayor Volatilidad</p>
                    <ul className="space-y-1 mt-2">
                        {marketSummary.mostVolatile.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-green-300">
                               <Zap size={16} className="text-accent"/>
                               <span>{item.productName} ({item.variety})</span>
                               <span className="text-xs text-muted-foreground ml-auto">{item.volatility.toFixed(1)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 bg-black rounded-md border border-green-900">
                    <p className="text-sm text-green-500">Mayor Estabilidad</p>
                    <ul className="space-y-1 mt-2">
                        {marketSummary.mostStable.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-green-300">
                               <Shield size={16} className="text-primary"/>
                               <span>{item.productName} ({item.variety})</span>
                               <span className="text-xs text-muted-foreground ml-auto">{item.volatility.toFixed(1)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
      <Card className="bg-gray-900/50 border-green-800 text-green-400">
        <CardHeader>
          <CardTitle className="text-green-300">Análisis de Precios por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-green-800 hover:bg-gray-900">
                  <TableHead className="text-green-300">Producto</TableHead>
                  <TableHead className="text-green-300">Variedad</TableHead>
                  <TableHead className="text-right text-green-300">Precio Promedio</TableHead>
                  <TableHead className="text-right text-green-300">Precio Mínimo</TableHead>
                  <TableHead className="text-right text-green-300">Precio Máximo</TableHead>
                  <TableHead className="text-right text-green-300">Diferencia</TableHead>
                  <TableHead className="text-right text-green-300">Volatilidad</TableHead>
                  <TableHead className="text-center text-green-300 hidden xl:table-cell">Puestos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.map((item) => (
                  <TableRow key={`${item.productName}-${item.variety}`} className="border-green-900">
                    <TableCell className="font-bold text-green-400">{item.productName}</TableCell>
                    <TableCell className="text-green-500">{item.variety}</TableCell>
                    <TableCell className="text-right text-green-200 font-medium">${item.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</TableCell>
                    <TableCell className="text-right text-green-500">${item.minPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-500">${item.maxPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-400">${item.priceSpread.toLocaleString()}</TableCell>
                     <TableCell className="text-right text-accent">{item.volatility.toFixed(1)}%</TableCell>
                    <TableCell className="text-center hidden xl:table-cell">
                        <div className="flex gap-2 justify-center items-center">
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
    </div>
  );
}
