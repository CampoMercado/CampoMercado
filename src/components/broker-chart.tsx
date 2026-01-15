'use client';
import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
  Legend
} from 'recharts';

import type { Product } from '@/lib/types';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';


const initialVisibleProducts = 2;
const MAX_VISIBLE_PRODUCTS = 5;

const generateColor = (index: number) => {
    const colors = [
        "hsl(140 80% 50%)", // primary
        "hsl(50 100% 60%)", // accent
        "hsl(210 80% 60%)",
        "hsl(0 80% 60%)",
        "hsl(280 80% 60%)",
    ];
    return colors[index % colors.length];
}

export function BrokerChart({ products }: { products: Product[] }) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    products.slice(0, initialVisibleProducts).map(p => p.id)
  );

  const handleProductSelection = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => {
        if (checked) {
            if (prev.length >= MAX_VISIBLE_PRODUCTS) return prev;
            return [...prev, productId];
        } else {
            return prev.filter(id => id !== productId);
        }
    });
  };

  const { chartData, chartConfig, allDates } = useMemo(() => {
    const config: ChartConfig = {};
    const dataByDate: Record<string, Record<string, number | string>> = {};
    const allDates = new Set<string>();

    products.forEach((product, index) => {
        config[product.id] = {
            label: `${product.name} (${product.variety})`,
            color: generateColor(index),
        };
        product.priceHistory.forEach(item => {
            const dateStr = new Date(item.date).toISOString().split('T')[0];
            allDates.add(dateStr);
            if (!dataByDate[dateStr]) {
                dataByDate[dateStr] = { date: dateStr };
            }
            dataByDate[dateStr][product.id] = item.price;
        });
    });

    const sortedDates = Array.from(allDates).sort();

    const finalChartData = sortedDates.map(dateStr => {
        const entry: Record<string, number | Date> = { date: new Date(dateStr) };
        selectedProducts.forEach(productId => {
            const product = products.find(p => p.id === productId);
            if (product) {
                const priceItem = product.priceHistory.find(h => new Date(h.date).toISOString().split('T')[0] === dateStr);
                entry[productId] = priceItem ? priceItem.price : 0;
            }
        });
        return entry;
    });

    return { chartData: finalChartData, chartConfig: config, allDates: sortedDates };
  }, [products, selectedProducts]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-black/80 border border-green-700 rounded-md shadow-lg text-sm">
          <p className="label text-green-300 font-bold">{`${format(new Date(label), "PPP", { locale: es })}`}</p>
          {payload.map((pld: any) => (
            <div key={pld.dataKey} style={{ color: pld.color }}>
              {`${chartConfig[pld.dataKey]?.label}: $${pld.value.toLocaleString()}`}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
            <Card className="bg-black/50 border-green-800/50">
                 <CardHeader>
                    <CardTitle className="text-2xl font-headline text-green-200">Gráfico de Mercado Comparativo</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <ComposedChart data={chartData} margin={{ left: 0, right: 16, top: 10, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(140 20% 20% / 0.8)"/>
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: es })}
                                style={{ fill: 'hsl(140 40% 80%)', fontSize: '0.75rem' }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                                style={{ fill: 'hsl(140 40% 80%)', fontSize: '0.75rem' }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(50 100% 60%)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Legend wrapperStyle={{ color: 'white', paddingTop: '20px' }} formatter={(value) => <span className="text-green-400 text-xs">{chartConfig[value]?.label}</span>} />
                            {selectedProducts.map(productId => (
                                <Line 
                                    key={productId}
                                    dataKey={productId} 
                                    type="monotone" 
                                    stroke={chartConfig[productId]?.color} 
                                    strokeWidth={2} 
                                    dot={false}
                                    name={`${chartConfig[productId]?.label}`}
                                />
                            ))}
                        </ComposedChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card className="bg-black/50 border-green-800/50">
                <CardHeader>
                    <CardTitle className="text-xl text-green-300">Seleccionar Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">Puedes comparar hasta {MAX_VISIBLE_PRODUCTS} productos.</p>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={product.id}
                                    checked={selectedProducts.includes(product.id)}
                                    onCheckedChange={(checked) => handleProductSelection(product.id, !!checked)}
                                    disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= MAX_VISIBLE_PRODUCTS}
                                    style={{borderColor: chartConfig[product.id]?.color}}
                                />
                                <Label htmlFor={product.id} className="text-sm text-green-400 cursor-pointer">
                                    {product.name} ({product.variety})
                                </Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
