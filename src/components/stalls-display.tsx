'use client';

import type { Stall } from '@/lib/types';
import { ProductTable } from './product-table';

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
            <ProductTable products={stall.products} />
          </div>
        </div>
      ))}
    </div>
  );
}
