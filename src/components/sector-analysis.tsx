'use client';

import { useMemo } from 'react';
import type { TickerProduct } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDown, ArrowUp, Minus, TrendingUp, TrendingDown, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Sector = {
  name: string;
  productCount: number;
  avgChange: number;
  avgVolatility: number;
  topPerformer: { name: string; change: number };
  worstPerformer: { name: string; change: number };
};

export function SectorAnalysis({ products }: { products: TickerProduct[] }) {
  const sectors = useMemo(() => {
    const sectorsMap = new Map<string, TickerProduct[]>();
    products.forEach((p) => {
      if (!sectorsMap.has(p.category)) {
        sectorsMap.set(p.category, []);
      }
      sectorsMap.get(p.category)!.push(p);
    });

    const result: Sector[] = [];

    for (const [category, productsInCategory] of sectorsMap.entries()) {
      let totalChange = 0;
      let totalVolatility = 0;
      let topPerformer = { name: '', change: -Infinity };
      let worstPerformer = { name: '', change: Infinity };

      productsInCategory.forEach((p) => {
        const currentPrice = p.priceHistory.at(-1)?.price ?? 0;
        const prevPrice = p.priceHistory.at(-2)?.price ?? currentPrice;
        const change = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
        totalChange += change;

        const allHistoricalPrices = p.priceHistory.map(h => h.price);
        const mean = allHistoricalPrices.reduce((a, b) => a + b, 0) / allHistoricalPrices.length;
        const stdDev = Math.sqrt(allHistoricalPrices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / allHistoricalPrices.length);
        const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;
        totalVolatility += volatility;

        const productName = `${p.name} (${p.variety})`;
        if (change > topPerformer.change) {
          topPerformer = { name: productName, change };
        }
        if (change < worstPerformer.change) {
          worstPerformer = { name: productName, change };
        }
      });

      result.push({
        name: category,
        productCount: productsInCategory.length,
        avgChange: totalChange / productsInCategory.length,
        avgVolatility: totalVolatility / productsInCategory.length,
        topPerformer,
        worstPerformer,
      });
    }
    return result.sort((a,b) => a.name.localeCompare(b.name));
  }, [products]);

  const ChangeIndicator = ({ value }: { value: number }) => {
    const isUp = value > 0;
    const isDown = value < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    return (
      <div className={cn('flex items-center justify-end gap-1 font-mono', isUp && 'text-success', isDown && 'text-danger')}>
        <span>{value.toFixed(2)}%</span>
        <Icon size={14} />
      </div>
    );
  };
  
  const Heatmap = () => (
     <Card className="bg-gray-900/50 border-green-800 text-green-400">
        <CardHeader>
            <CardTitle className="text-green-300">Mapa de Calor Sectorial (Cambio Diario)</CardTitle>
        </CardHeader>
        <CardContent>
            <TooltipProvider>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sectors.map(sector => {
                        const intensity = Math.min(Math.abs(sector.avgChange) * 20, 100);
                        const color = sector.avgChange > 0 ? 'bg-green-500' : 'bg-red-500';

                        return (
                             <Tooltip key={sector.name}>
                                <TooltipTrigger asChild>
                                    <div className={cn(color, "rounded p-3 text-white shadow-md transition-all hover:scale-105")}
                                     style={{ opacity: intensity / 100 + 0.1 }}>
                                        <div className="font-bold truncate">{sector.name}</div>
                                        <div className="text-2xl font-mono">
                                            {sector.avgChange.toFixed(2)}%
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-green-700">
                                    <p>{sector.productCount} producto(s)</p>
                                    <p>Volatilidad: {sector.avgVolatility.toFixed(2)}%</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
            </TooltipProvider>
        </CardContent>
     </Card>
  )

  return (
    <div className="space-y-8">
        <Heatmap />
        <Card className="bg-gray-900/50 border-green-800 text-green-400">
            <CardHeader>
                <CardTitle className="text-green-300">Rendimiento por Sector</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-green-800 hover:bg-gray-900 text-xs uppercase">
                                <TableHead className="text-green-300">Sector</TableHead>
                                <TableHead className="text-right text-green-300">Cambio Promedio (24h)</TableHead>
                                <TableHead className="text-right text-green-300">Volatilidad Promedio</TableHead>
                                <TableHead className="text-green-300">Líder del Sector</TableHead>
                                <TableHead className="text-green-300">Rezagado del Sector</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectors.map(sector => (
                                <TableRow key={sector.name} className="border-green-900">
                                    <TableCell>
                                        <div className="font-bold text-green-400">{sector.name}</div>
                                        <div className="text-xs text-green-600">{sector.productCount} productos</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ChangeIndicator value={sector.avgChange} />
                                    </TableCell>
                                    <TableCell className="text-right text-accent font-mono">
                                        {sector.avgVolatility.toFixed(2)}%
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <TrendingUp size={16} className="text-success" />
                                            <div className="flex flex-col">
                                                <span className="text-green-300 truncate">{sector.topPerformer.name}</span>
                                                <span className="text-success font-mono text-xs">{sector.topPerformer.change.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <TrendingDown size={16} className="text-danger" />
                                            <div className="flex flex-col">
                                                <span className="text-green-300 truncate">{sector.worstPerformer.name}</span>
                                                <span className="text-danger font-mono text-xs">{sector.worstPerformer.change.toFixed(2)}%</span>
                                            </div>
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
