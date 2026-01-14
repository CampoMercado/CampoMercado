'use client';

import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ProductCardProps = {
  product: Product;
  onOpenChart: (product: Product) => void;
};

export function ProductCard({ product, onOpenChart }: ProductCardProps) {
  const currentPriceData = product.priceHistory.at(-1);
  const prevPriceData = product.priceHistory.at(-2);

  if (!currentPriceData) return null;

  const currentPrice = currentPriceData.price;
  const lastUpdate = new Date(currentPriceData.date);
  const prevPrice = prevPriceData?.price ?? currentPrice;
  const change = currentPrice - prevPrice;
  const changePercent = prevPrice === 0 ? 0 : (change / prevPrice) * 100;

  const placeholderImage = PlaceHolderImages.find(
    (img) => img.id === product.imageId
  );

  return (
    <Card
      className="flex flex-col hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
      onClick={() => onOpenChart(product)}
    >
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="font-headline text-2xl">{product.name}</CardTitle>
          <CardDescription>{product.category}</CardDescription>
        </div>
        {product.icon && (
          <product.icon className="w-8 h-8 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {placeholderImage && (
          <div className="relative aspect-[3/2] w-full mb-4 rounded-md overflow-hidden">
            <Image
              src={placeholderImage.imageUrl}
              alt={placeholderImage.description}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={placeholderImage.imageHint}
            />
          </div>
        )}
        <div className="flex justify-between items-baseline">
          <p className="text-4xl font-bold font-mono">
            ${currentPrice.toLocaleString()}
          </p>
          <div
            className={cn(
              'flex items-center gap-1 text-lg font-semibold',
              change > 0 && 'text-success',
              change < 0 && 'text-danger'
            )}
          >
            {change > 0 && <ArrowUpRight className="h-5 w-5" />}
            {change < 0 && <ArrowDownRight className="h-5 w-5" />}
            <span>{changePercent.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1.5" />
          <span title={format(lastUpdate, 'PPPPp', { locale: es })}>
            Actualizado {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
