'use client';

import type { Stall } from '@/lib/types';
import { ProductCard } from './product-card';

export function StallsDisplay({ stalls }: { stalls: Stall[] }) {
  return (
    <div className="space-y-8">
      {stalls.map((stall) => (
        <div
          key={stall.id}
          className="border border-green-800 rounded-lg bg-black overflow-hidden"
        >
          <div className="p-4 bg-gray-900/50 border-b border-green-800">
            <h2 className="text-2xl font-headline text-green-300">
              Puesto {stall.number}
            </h2>
            <p className="text-green-500">{stall.name}</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stall.products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
