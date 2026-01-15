'use client';
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
} from 'recharts';

import type { AggregatedProduct } from '@/lib/types';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  price: {
    label: 'Precio',
    color: 'hsl(140 80% 50%)',
  },
} satisfies ChartConfig;

export function PriceChart({ product, simple = false }: { product: AggregatedProduct, simple?: boolean }) {
  const chartData = [...product.priceHistory].reverse().map((item) => ({
    date: new Date(item.date),
    price: item.price,
  }));
  
  const title = `${product.name} (${product.variety})`

  if (simple) {
     return (
        <ChartContainer config={chartConfig} className="h-[40px] w-[120px]">
          <AreaChart
            data={chartData}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillPriceSimple" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-price)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-price)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="price"
              type="monotone"
              fill="url(#fillPriceSimple)"
              stroke="var(--color-price)"
              stackId="a"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
     )
  }

  return (
    <div className="p-4 bg-black rounded-lg text-green-400">
      <div className="mb-4">
        <h3 className="font-headline text-2xl text-green-200">{title}</h3>
      </div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart
          data={chartData}
          margin={{ left: 0, right: 16, top: 10, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(140 80% 50% / 0.2)"/>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => format(value, 'dd MMM', { locale: es })}
            style={{ fill: 'hsl(140 40% 80%)', fontSize: '0.75rem' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            domain={['dataMin - 100', 'dataMax + 100']}
            style={{ fill: 'hsl(140 40% 80%)', fontSize: '0.75rem' }}

          />
          <Tooltip
            cursor={{ stroke: 'hsl(50 100% 60%)', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={<ChartTooltipContent indicator="dot" contentStyle={{backgroundColor: 'black', border: '1px solid hsl(140 80% 50%)'}}/>}
          />
          <defs>
            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-price)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-price)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="price"
            type="monotone"
            fill="url(#fillPrice)"
            stroke="var(--color-price)"
            stackId="a"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
