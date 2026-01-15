'use client';

import type { Product, TickerProduct } from '@/lib/types';
import { ProductCard } from './product-card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function StallsDisplay({ products, allProducts }: { products: Product[], allProducts: TickerProduct[] }) {
  return (
    <div className="border border-green-800/50 rounded-lg bg-black/30 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-green-800/50 hover:bg-gray-900/50 text-xs uppercase">
                <TableHead className="text-green-300 px-2">Producto</TableHead>
                <TableHead className="text-right text-green-300 px-2">Precio y Actualización</TableHead>
                <TableHead className="text-right text-green-300 px-2 w-[100px]">Var. (ant.)</TableHead>
                <TableHead className="text-right text-green-300 px-2 w-[100px]">Var. (7d)</TableHead>
                <TableHead className="text-green-300 px-2 w-[160px] hidden md:table-cell">Análisis</TableHead>
                <TableHead className="text-green-300 px-2 w-[160px] hidden lg:table-cell">Mercado</TableHead>
                <TableHead className="text-center text-green-300 w-[120px] hidden sm:table-cell px-2">Tendencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} marketProducts={allProducts} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
  );
}
