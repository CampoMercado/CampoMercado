'use client';

import { useMemo } from 'react';
import type { Stall } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductAnalysis = {
  productName: string;
  variety: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceSpread: number;
  stalls: { name: string; number: number; price: number }[];
};

export function MarketAnalysis({ stalls }: { stalls: Stall[] }) {
  const analysis: ProductAnalysis[] = useMemo(() => {
    const productMap = new Map<
      string,
      {
        prices: number[];
        stalls: { name: string; number: number; price: number }[];
      }
    >();

    // Aggregate all product prices and stall info
    stalls.forEach((stall) => {
      stall.products.forEach((product) => {
        const key = `${product.name} - ${product.variety}`;
        const currentPrice = product.priceHistory.at(-1)?.price;
        if (currentPrice === undefined) return;

        if (!productMap.has(key)) {
          productMap.set(key, { prices: [], stalls: [] });
        }
        const entry = productMap.get(key)!;
        entry.prices.push(currentPrice);
        entry.stalls.push({
          name: stall.name,
          number: stall.number,
          price: currentPrice,
        });
      });
    });

    const result: ProductAnalysis[] = [];
    for (const [key, data] of productMap.entries()) {
      const [productName, variety] = key.split(' - ');
      const sum = data.prices.reduce((a, b) => a + b, 0);
      const avgPrice = sum / data.prices.length;
      const minPrice = Math.min(...data.prices);
      const maxPrice = Math.max(...data.prices);

      result.push({
        productName,
        variety,
        avgPrice,
        minPrice,
        maxPrice,
        priceSpread: maxPrice - minPrice,
        stalls: data.stalls.sort((a, b) => a.price - b.price),
      });
    }

    return result.sort((a,b) => a.productName.localeCompare(b.productName));
  }, [stalls]);

  const marketSummary = useMemo(() => {
      const allPrices = stalls.flatMap(s => s.products.map(p => p.priceHistory.at(-1)?.price ?? 0)).filter(p => p > 0);
      const totalProducts = allPrices.length;
      const marketAvg = allPrices.reduce((a, b) => a + b, 0) / totalProducts;

      const topMovers = stalls.flatMap(s => s.products).map(p => {
          const current = p.priceHistory.at(-1)?.price ?? 0;
          const prev = p.priceHistory.at(-2)?.price ?? current;
          const change = current - prev;
          const changePercent = prev === 0 ? 0 : (change / prev) * 100;
          return { name: `${p.name} (${p.variety})`, changePercent };
      }).sort((a,b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 3);
      
      return { marketAvg, totalProducts, topMovers };

  }, [stalls]);


  return (
    <div className="space-y-8">
        <Card className="bg-gray-900/50 border-green-800 text-green-400">
            <CardHeader>
                <CardTitle className="text-green-300">Resumen del Mercado</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-black rounded-md border border-green-900">
                    <p className="text-sm text-green-500">Precio Promedio General</p>
                    <p className="text-2xl font-bold text-green-200">${marketSummary.marketAvg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div className="p-4 bg-black rounded-md border border-green-900">
                    <p className="text-sm text-green-500">Productos Analizados</p>
                    <p className="text-2xl font-bold text-green-200">{marketSummary.totalProducts}</p>
                </div>
                 <div className="p-4 bg-black rounded-md border border-green-900">
                    <p className="text-sm text-green-500">Mayores Movimientos (24h)</p>
                    <div className="space-y-1 mt-1">
                        {marketSummary.topMovers.map(mover => (
                            <div key={mover.name} className="flex justify-between text-sm">
                                <span className="text-green-400">{mover.name}</span>
                                <span className={cn('font-bold flex items-center gap-1', mover.changePercent > 0 ? 'text-green-500' : 'text-red-500')}>
                                    {mover.changePercent > 0 && <ArrowUp size={14}/>}
                                    {mover.changePercent < 0 && <ArrowDown size={14}/>}
                                    {mover.changePercent.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
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
