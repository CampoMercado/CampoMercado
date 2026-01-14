'use client';

import type { Stall, TickerProduct } from '@/lib/types';
import { ProductCard } from './product-card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function StallsDisplay({ stalls, allProducts }: { stalls: Stall[], allProducts: TickerProduct[] }) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-headline text-green-300 border-b border-green-800 pb-2">
        Puestos de Venta
      </h2>
      {stalls.map((stall) => (
        <div
          key={stall.id}
          className="border border-green-800 rounded-lg bg-black overflow-hidden"
        >
          <div className="p-4 bg-gray-900/50 border-b border-green-800">
            <h3 className="text-2xl font-headline text-green-300">
              Puesto {stall.number}
            </h3>
            <p className="text-green-500">{stall.name}</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-green-800 hover:bg-gray-900 text-xs uppercase">
                  <TableHead className="text-green-300 px-2">Producto</TableHead>
                  <TableHead className="text-right text-green-300 px-2">Precio</TableHead>
                  <TableHead className="text-right text-green-300 px-2 w-[100px]">Var. (24h)</TableHead>
                  <TableHead className="text-right text-green-300 px-2 w-[100px]">Var. (7d)</TableHead>
                  <TableHead className="text-green-300 px-2 w-[160px] hidden md:table-cell">Análisis</TableHead>
                  <TableHead className="text-green-300 px-2 w-[160px] hidden lg:table-cell">Mercado</TableHead>
                  <TableHead className="text-center text-green-300 w-[120px] hidden sm:table-cell px-2">Tendencia</TableHead>
                  <TableHead className="text-right text-green-300 px-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stall.products.map((product) => (
                  <ProductCard key={product.id} product={product} marketProducts={allProducts} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
