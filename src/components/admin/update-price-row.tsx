'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const priceUpdateSchema = z.object({
  newPrice: z.coerce.number().positive({ message: 'Debe ser > 0' }),
});

type PriceUpdateFormData = z.infer<typeof priceUpdateSchema>;

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
  const form = useForm<PriceUpdateFormData>({
    resolver: zodResolver(priceUpdateSchema),
    defaultValues: {
      newPrice: undefined,
    },
  });

  const onSubmit = (data: PriceUpdateFormData) => {
    if (onUpdate && product) {
      onUpdate(product.id, data.newPrice);
      form.reset();
    }
  };

  if (isHeader) {
    return (
      <>
        <TableHead>Producto</TableHead>
        <TableHead>Variedad</TableHead>
        <TableHead>Categoría</TableHead>
        <TableHead>Precio Actual</TableHead>
        <TableHead>Última Act.</TableHead>
        <TableHead className="w-[150px]">Nuevo Precio</TableHead>
        <TableHead className="w-[130px]"></TableHead>
        <TableHead className="w-[50px]"></TableHead>
      </>
    );
  }
  
  if (!product) return null;
  
  const currentPrice = product.priceHistory.at(-1);

  return (
    <TableRow>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
          <TableCell className="font-medium">{product.name}</TableCell>
          <TableCell>{product.variety}</TableCell>
          <TableCell>{product.category}</TableCell>
          <TableCell>${currentPrice?.price.toLocaleString() ?? 'N/A'}</TableCell>
          <TableCell>
            {currentPrice
              ? format(new Date(currentPrice.date), 'P', { locale: es })
              : 'N/A'}
          </TableCell>
          <TableCell className="w-[150px]">
            <FormField
              control={form.control}
              name="newPrice"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="$0.00"
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </TableCell>
          <TableCell className="w-[130px]">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Actualizar
            </Button>
          </TableCell>
          <TableCell className="w-[50px] text-right">
            <Button variant="ghost" size="icon" onClick={() => onDelete?.(product.id)}>
              <Trash2 className="h-4 w-4 text-danger" />
              <span className="sr-only">Delete</span>
            </Button>
          </TableCell>
        </form>
      </Form>
    </TableRow>
  );
}
