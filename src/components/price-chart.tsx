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

import type { Product } from '@/lib/types';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  price: {
    label: 'Precio',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function PriceChart({ product, simple = false }: { product: Product, simple?: boolean }) {
  const chartData = product.priceHistory.map((item) => ({
    date: new Date(item.date),
    price: item.price,
  }));

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
    <div className="p-4 bg-card rounded-lg">
      <div className="mb-4">
        <h3 className="font-headline text-2xl">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart
          data={chartData}
          margin={{ left: 0, right: 16, top: 10, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)"/>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => format(value, 'dd MMM', { locale: es })}
            style={{ fill: 'hsl(var(--foreground))', fontSize: '0.75rem' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            domain={['dataMin - 100', 'dataMax + 100']}
            style={{ fill: 'hsl(var(--foreground))', fontSize: '0.75rem' }}

          />
          <Tooltip
            cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={<ChartTooltipContent indicator="dot" />}
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
