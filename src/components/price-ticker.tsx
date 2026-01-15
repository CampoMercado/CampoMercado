'use client';

import type { AggregatedProduct } from '@/lib/types';
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, Weight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function PriceTicker({ products }: { products: AggregatedProduct[] }) {
  const tickerItems = products.map((product) => {
    const currentPrice = product.priceHistory.at(0)?.price ?? 0;
    const prevPrice = product.priceHistory.at(1)?.price ?? currentPrice;
    const change = currentPrice - prevPrice;
    const isUp = change > 0;
    const isDown = change < 0;

    return {
      name: `${product.name} (${product.variety ? product.variety.slice(0,3) : ''})`,
      price: currentPrice,
      isUp,
      isDown,
    };
  });

  const extendedTickerItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative flex overflow-hidden bg-gray-900/80 text-green-400 border-y border-green-800 py-2">
      <div className="flex animate-marquee whitespace-nowrap">
        {extendedTickerItems.map((item, index) => (
          <div key={`item1-${index}`} className="flex items-center mx-4 text-xs">
            <span className="font-bold uppercase text-green-300">{item.name}</span>
            <span className="mx-2 text-base font-mono text-green-200">
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
          <div key={`item2-${index}`} className="flex items-center mx-4 text-xs">
            <span className="font-bold uppercase text-green-300">{item.name}</span>
            <span className="mx-2 text-base font-mono text-green-200">
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

export function TopMoversTicker({ products }: { products: AggregatedProduct[] }) {
    const topMovers = useMemo(() => {
        const movers = products.map(product => {
            const currentPrice = product.priceHistory.at(0)?.price ?? 0;
            const prevPrice = product.priceHistory.at(1)?.price ?? currentPrice;
            const change = currentPrice - prevPrice;
            const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
            return {
                name: `${product.name} ${product.variety ? `(${product.variety})` : ''}`,
                changePercent,
            };
        }).filter(p => p.changePercent !== 0);

        movers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        const top5 = movers.slice(0, 5);

        const gainers = top5.filter(p => p.changePercent > 0).sort((a,b) => b.changePercent - a.changePercent);
        const losers = top5.filter(p => p.changePercent < 0).sort((a,b) => a.changePercent - b.changePercent);

        return {gainers, losers};

    }, [products]);

  const extendedTopMovers = [...topMovers.gainers, ...topMovers.losers, ...topMovers.gainers, ...topMovers.losers];

  if (extendedTopMovers.length === 0) return null;

  return (
    <div className="relative flex overflow-hidden bg-black text-green-500 border-b border-green-800 py-1 text-xs">
      <div className="flex animate-marquee-slow whitespace-nowrap">
        {extendedTopMovers.map((item, index) => (
          <div key={`mover1-${index}`} className="flex items-center mx-4">
            <span className="font-bold uppercase text-green-400/90">{item.name}</span>
            <span
              className={cn(
                'flex items-center ml-2 font-mono',
                item.changePercent > 0 && 'text-success',
                item.changePercent < 0 && 'text-danger'
              )}
            >
              {item.changePercent > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
       <div className="absolute top-0 flex animate-marquee2-slow whitespace-nowrap py-1">
        {extendedTopMovers.map((item, index) => (
          <div key={`mover2-${index}`} className="flex items-center mx-4">
            <span className="font-bold uppercase text-green-400/90">{item.name}</span>
            <span
              className={cn(
                'flex items-center ml-2 font-mono',
                item.changePercent > 0 && 'text-success',
                item.changePercent < 0 && 'text-danger'
              )}
            >
              {item.changePercent > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricePerKgTicker({ products }: { products: AggregatedProduct[] }) {
  const tickerItems = products.filter(p => p.weightPerCrate > 0 && p.priceHistory.length > 0).map((product) => {
    const currentPrice = product.priceHistory.at(0)!.price;
    const pricePerKg = currentPrice / product.weightPerCrate;
    
    return {
      name: `${product.name} ${product.variety ? `(${product.variety.slice(0,3)})` : ''}`,
      pricePerKg: pricePerKg,
    };
  });

  if (tickerItems.length === 0) return null;

  const extendedTickerItems = [...tickerItems, ...tickerItems];

  return (
    <div className="relative flex overflow-hidden bg-gray-950 text-accent border-b border-green-800 py-2">
      <div className="flex animate-marquee whitespace-nowrap">
        {extendedTickerItems.map((item, index) => (
          <div key={`item-kg1-${index}`} className="flex items-center mx-4 text-xs">
            <Weight className="h-4 w-4 mr-2 text-accent/70" />
            <span className="font-bold uppercase text-accent/80">{item.name}</span>
            <span className="mx-2 text-base font-mono text-accent">
              ${item.pricePerKg.toFixed(2)}/kg
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-2">
        {extendedTickerItems.map((item, index) => (
          <div key={`item-kg2-${index}`} className="flex items-center mx-4 text-xs">
            <Weight className="h-4 w-4 mr-2 text-accent/70" />
            <span className="font-bold uppercase text-accent/80">{item.name}</span>
            <span className="mx-2 text-base font-mono text-accent">
              ${item.pricePerKg.toFixed(2)}/kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
