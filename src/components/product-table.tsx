'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { PriceChart } from './price-chart';
import { Dialog, DialogContent } from './ui/dialog';

export function ProductTable({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleOpenChart = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseChart = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      <div className="border border-green-800 rounded-lg bg-black font-mono overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-green-800 hover:bg-gray-900">
              <TableHead className="w-[150px] text-green-300">PRODUCTO</TableHead>
              <TableHead className="text-green-300 hidden md:table-cell">VARIEDAD</TableHead>
              <TableHead className="text-right text-green-300">PRECIO ACTUAL</TableHead>
              <TableHead className="text-right text-green-300">CAMBIO (24H)</TableHead>
              <TableHead className="text-right hidden lg:table-cell text-green-300">GRÁFICO (5D)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const currentPriceData = product.priceHistory.at(-1);
              const prevPriceData = product.priceHistory.at(-2);

              if (!currentPriceData) return null;

              const currentPrice = currentPriceData.price;
              const prevPrice = prevPriceData?.price ?? currentPrice;
              const change = currentPrice - prevPrice;
              const changePercent = prevPrice === 0 ? 0 : (change / prevPrice) * 100;
              const isUp = change > 0;
              const isDown = change < 0;

              return (
                <TableRow
                  key={product.id}
                  className="cursor-pointer border-green-900 hover:bg-green-900/20"
                  onClick={() => handleOpenChart(product)}
                >
                  <TableCell className="font-bold text-green-400">{product.name}</TableCell>
                   <TableCell className="text-green-500 hidden md:table-cell">{product.variety}</TableCell>
                  <TableCell className="text-right font-medium text-green-200 text-lg">
                    ${currentPrice.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium',
                      isUp && 'text-green-500',
                      isDown && 'text-red-500'
                    )}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>{changePercent.toFixed(1)}%</span>
                      {isUp && <ArrowUp size={16} />}
                      {isDown && <ArrowDown size={16} />}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                      <div className="flex justify-end">
                        <PriceChart product={product} simple />
                      </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(isOpen) => !isOpen && handleCloseChart()}
      >
        <DialogContent className="max-w-2xl p-0 border-green-500 bg-black">
          {selectedProduct && <PriceChart product={selectedProduct} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
