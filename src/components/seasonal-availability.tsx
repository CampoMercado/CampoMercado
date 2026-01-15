'use client';

import { seasonalData } from '@/lib/seasonal-data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { Leaf, Wheat, Globe } from 'lucide-react';
import { Badge } from './ui/badge';

export function SeasonalAvailability() {
  const { abundant, scarce, imported } = seasonalData;

  const AvailabilityCard = ({
    title,
    description,
    products,
    icon: Icon,
    colorClass,
  }: {
    title: string;
    description: string;
    products: string[];
    icon: React.ElementType;
    colorClass: string;
  }) => (
    <Card className={`bg-gray-900/50 border-t-4 ${colorClass} text-green-400`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl text-green-300">
          <Icon className="h-6 w-6" />
          {title}
        </CardTitle>
        <CardDescription className="text-green-500/80 pt-1">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {products.map((product) => (
            <Badge
              key={product}
              variant="secondary"
              className="bg-green-900/60 text-green-300 border border-green-700/50"
            >
              {product}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline text-green-300">
          Disponibilidad de Temporada
        </h2>
        <p className="text-muted-foreground mt-2">
          Guía de cosecha y disponibilidad de productos en la feria, basado en
          la temporada agrícola de Mendoza.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AvailabilityCard
          {...abundant}
          icon={Leaf}
          colorClass="border-success"
        />
        <AvailabilityCard
          {...scarce}
          icon={Wheat}
          colorClass="border-accent"
        />
        <AvailabilityCard
          {...imported}
          icon={Globe}
          colorClass="border-primary"
        />
      </div>
    </div>
  );
}
