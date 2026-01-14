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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

export function PriceChart({ product }: { product: Product }) {
  const chartData = product.priceHistory.map((item) => ({
    date: new Date(item.date),
    price: item.price,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {product.name} - Historial de Precios
        </CardTitle>
        <CardDescription>Precio por cajón en los últimos días.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            data={chartData}
            margin={{ left: 0, right: 16, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(value, 'dd MMM', { locale: es })}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip
              cursor={false}
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
      </CardContent>
    </Card>
  );
}
