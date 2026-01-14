'use client';

import type { Stall } from '@/lib/types';
import { ProductCard } from './product-card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-green-800 hover:bg-gray-900 text-xs uppercase">
                  <TableHead className="text-green-300 w-[200px]">Producto</TableHead>
                  <TableHead className="text-right text-green-300">Precio</TableHead>
                  <TableHead className="text-right text-green-300">Cambio (24h)</TableHead>
                  <TableHead className="text-center text-green-300 w-[150px]">Tendencia (7d)</TableHead>
                  <TableHead className="text-right text-green-300"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stall.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
