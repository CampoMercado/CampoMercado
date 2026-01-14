'use client';

import type { Product } from '@/lib/types';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// The ticker now receives products with stall info mixed in.
type TickerProduct = Product & { stallName: string, stallNumber: number };

export function PriceTicker({ products }: { products: TickerProduct[] }) {
  const tickerItems = products.map((product) => {
    const currentPrice = product.priceHistory.at(-1)?.price ?? 0;
    const prevPrice = product.priceHistory.at(-2)?.price ?? currentPrice;
    const change = currentPrice - prevPrice;
    const isUp = change > 0;
    const isDown = change < 0;

    return {
      name: `${product.name} (${product.variety.slice(0,3)})`,
      price: currentPrice,
      isUp,
      isDown,
    };
  });

  const extendedTickerItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative flex overflow-hidden bg-gray-900 text-green-400 border-y border-green-800 py-2">
      <div className="flex animate-marquee whitespace-nowrap">
        {extendedTickerItems.map((item, index) => (
          <div key={`item1-${index}`} className="flex items-center mx-4">
            <span className="font-bold uppercase text-sm text-green-300">{item.name}</span>
            <span className="mx-2 text-base text-green-200">
              ${item.price.toLocaleString()}
            </span>
            <span
              className={cn(
                'flex items-center',
                item.isUp && 'text-green-500',
                item.isDown && 'text-red-500'
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
            <span className="font-bold uppercase text-sm text-green-300">{item.name}</span>
            <span className="mx-2 text-base text-green-200">
              ${item.price.toLocaleString()}
            </span>
             <span
              className={cn(
                'flex items-center',
                item.isUp && 'text-green-500',
                item.isDown && 'text-red-500'
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
