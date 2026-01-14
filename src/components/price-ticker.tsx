'use client';

import type { Product } from '@/lib/types';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PriceTicker({ products }: { products: Product[] }) {
  const tickerItems = products.map((product) => {
    const currentPrice = product.priceHistory.at(-1)?.price ?? 0;
    const prevPrice = product.priceHistory.at(-2)?.price ?? currentPrice;
    const change = currentPrice - prevPrice;
    const isUp = change > 0;
    const isDown = change < 0;

    return {
      name: product.name,
      price: currentPrice,
      isUp,
      isDown,
    };
  });

  const extendedTickerItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative flex overflow-hidden bg-muted text-foreground border-y border-border py-2 font-mono">
      <div className="flex animate-marquee whitespace-nowrap">
        {extendedTickerItems.map((item, index) => (
          <div key={`item1-${index}`} className="flex items-center mx-4">
            <span className="font-bold uppercase text-sm">{item.name}</span>
            <span className="mx-2 text-base">
              ${item.price.toLocaleString()}
            </span>
            <span
              className={cn(
                'flex items-center',
                item.isUp && 'text-success',
                item.isDown && 'text-danger'
              )}
            >
              {item.isUp && <ArrowUp className="h-4 w-4" />}
              {item.isDown && <ArrowDown className="h-4 w-4" />}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-2">
        {extendedTickerItems.map((item, index) => (
          <div key={`item2-${index}`} className="flex items-center mx-4">
            <span className="font-bold uppercase text-sm">{item.name}</span>
            <span className="mx-2 text-base">
              ${item.price.toLocaleString()}
            </span>
             <span
              className={cn(
                'flex items-center',
                item.isUp && 'text-success',
                item.isDown && 'text-danger'
              )}
            >
              {item.isUp && <ArrowUp className="h-4 w-4" />}
              {item.isDown && <ArrowDown className="h-4 w-4" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
