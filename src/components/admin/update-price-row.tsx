'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { AggregatedProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import { QuickPriceInput } from './quick-price-input';

type UpdatePriceRowProps = {
  product?: AggregatedProduct;
  isUpdating?: boolean;
  onUpdate?: (productId: string, newPrice: number) => void;
  onDelete?: (productId: string) => void;
  isHeader?: boolean;
};

export function UpdatePriceRow({
  product,
  isUpdating,
  onUpdate,
  onDelete,
  isHeader,
}: UpdatePriceRowProps) {
  const currentPrice = product?.priceHistory.at(0)?.price ?? 0;
  const [newPrice, setNewPrice] = useState(currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate && product && newPrice !== currentPrice) {
      onUpdate(product.id, newPrice);
    }
  };

  if (isHeader) {
    return (
      <>
        <TableHead>Producto</TableHead>
        <TableHead className="hidden sm:table-cell">Precio Actual</TableHead>
        <TableHead className="hidden md:table-cell">Última Act.</TableHead>
        <TableHead>Nuevo Precio</TableHead>
        <TableHead className="w-auto text-right pr-2">Acciones</TableHead>
      </>
    );
  }

  if (!product) return null;

  const lastPriceEntry = product.priceHistory.at(0);

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>{product.name}</div>
        <div className="text-xs text-muted-foreground">{product.variety}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell font-mono">${lastPriceEntry?.price.toLocaleString() ?? 'N/A'}</TableCell>
      <TableCell className='hidden md:table-cell'>
        {lastPriceEntry
          ? format(new Date(lastPriceEntry.date), 'P', { locale: es })
          : 'N/A'}
      </TableCell>
      <TableCell>
        <QuickPriceInput
          initialPrice={currentPrice}
          onChange={setNewPrice}
        />
      </TableCell>
      <TableCell className="text-right pr-2">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating || newPrice === currentPrice}
            size="sm"
            className="w-24"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Actualizar</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(product.id)}
            className="h-9 w-9"
          >
            <Trash2 className="h-4 w-4 text-danger" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
