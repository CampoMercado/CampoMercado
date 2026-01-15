'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import { QuickPriceInput } from './quick-price-input';

type UpdatePriceRowProps = {
  product?: Product;
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
  const currentPrice = product?.priceHistory.at(-1)?.price ?? 0;
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
        <TableHead>Precio Actual</TableHead>
        <TableHead>Última Act.</TableHead>
        <TableHead className="w-[500px]">Nuevo Precio</TableHead>
        <TableHead className="w-[130px]"></TableHead>
        <TableHead className="w-[50px]"></TableHead>
      </>
    );
  }

  if (!product) return null;

  const lastPriceEntry = product.priceHistory.at(-1);

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>{product.name}</div>
        <div className="text-xs text-muted-foreground">{product.variety}</div>
      </TableCell>
      <TableCell>${lastPriceEntry?.price.toLocaleString() ?? 'N/A'}</TableCell>
      <TableCell>
        {lastPriceEntry
          ? format(new Date(lastPriceEntry.date), 'P', { locale: es })
          : 'N/A'}
      </TableCell>
      <TableCell className="w-[500px]">
        <QuickPriceInput
          initialPrice={currentPrice}
          onChange={setNewPrice}
        />
      </TableCell>
      <TableCell className="w-[130px]">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isUpdating || newPrice === currentPrice}
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Actualizar
        </Button>
      </TableCell>
      <TableCell className="w-[50px] text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete?.(product.id)}
        >
          <Trash2 className="h-4 w-4 text-danger" />
          <span className="sr-only">Delete</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
