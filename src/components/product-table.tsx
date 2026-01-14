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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
      <div className="border border-border rounded-lg bg-card font-mono overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-card">
              <TableHead className="w-[150px]">PRODUCTO</TableHead>
              <TableHead>CATEGORÍA</TableHead>
              <TableHead className="text-right">PRECIO ACTUAL</TableHead>
              <TableHead className="text-right">CAMBIO (24H)</TableHead>
              <TableHead className="text-right hidden md:table-cell">
                HISTORIAL RECIENTE
              </TableHead>
              <TableHead className="text-right hidden lg:table-cell">GRÁFICO (5D)</TableHead>
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

              const recentHistory = product.priceHistory.slice(-5).reverse();

              return (
                <TableRow
                  key={product.id}
                  className="cursor-pointer border-border hover:bg-muted/50"
                  onClick={() => handleOpenChart(product)}
                >
                  <TableCell className="font-bold text-foreground">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-right font-medium text-foreground text-lg">
                    ${currentPrice.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium',
                      isUp && 'text-success',
                      isDown && 'text-danger'
                    )}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>{changePercent.toFixed(1)}%</span>
                      {isUp && <ArrowUp size={16} />}
                      {isDown && <ArrowDown size={16} />}
                    </div>
                  </TableCell>
                  <TableHead className="text-right hidden md:table-cell">
                    <div className="flex justify-end gap-2 items-center">
                      {recentHistory.map((p, i) => (
                        <span key={i} className={cn("text-xs", i === 0 ? "text-foreground" : "text-muted-foreground")}>
                            ${p.price.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </TableHead>
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
        <DialogContent className="max-w-2xl p-0 border-accent bg-background">
          {selectedProduct && <PriceChart product={selectedProduct} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
