'use client';

import type { Product } from '@/lib/types';
import { ArrowDown, ArrowUp } from 'lucide-react';

export function PriceTicker({ products }: { products: Product[] }) {
  const tickerItems = products.map((product) => {
    const currentPrice = product.priceHistory.at(-1)?.price ?? 0;
    const prevPrice = product.priceHistory.at(-2)?.price ?? currentPrice;
    const change = currentPrice - prevPrice;
    const isUp = change >= 0;

    return {
      name: product.name,
      price: currentPrice,
      isUp,
    };
  });

  const extendedTickerItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative flex overflow-hidden bg-primary text-primary-foreground py-2 shadow-inner-lg">
      <div className="flex animate-marquee whitespace-nowrap">
        {extendedTickerItems.map((item, index) => (
          <div key={`item1-${index}`} className="flex items-center mx-6">
            <span className="font-bold uppercase text-sm">{item.name}</span>
            <span className="mx-2 font-mono text-base">
              ${item.price.toLocaleString()}
            </span>
            {item.isUp ? (
              <ArrowUp className="h-4 w-4 text-green-300" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-300" />
            )}
          </div>
        ))}
      </div>
      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap">
        {extendedTickerItems.map((item, index) => (
          <div key={`item2-${index}`} className="flex items-center mx-6">
            <span className="font-bold uppercase text-sm">{item.name}</span>
            <span className="mx-2 font-mono text-base">
              ${item.price.toLocaleString()}
            </span>
            {item.isUp ? (
              <ArrowUp className="h-4 w-4 text-green-300" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
