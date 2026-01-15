'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InventoryItemWithProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type RecordSaleDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, salePrice: number) => void;
  item: InventoryItemWithProduct;
};

export function RecordSaleDialog({ isOpen, onClose, onConfirm, item }: RecordSaleDialogProps) {
  const saleSchema = z.object({
    quantity: z.coerce.number().positive('La cantidad debe ser positiva.').max(item.quantity, `No puedes vender más de ${item.quantity} cajones.`),
    salePrice: z.coerce.number().positive('El precio de venta debe ser positivo.'),
  });
  
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
      salePrice: item.produce?.priceHistory[0]?.price || item.purchasePrice,
    },
  });

  useEffect(() => {
    // Reset form with default values when dialog opens or item changes
    if (isOpen) {
        form.reset({
            quantity: 1,
            salePrice: item.produce?.priceHistory[0]?.price || item.purchasePrice,
        });
    }
  }, [isOpen, item, form]);

  const handleSubmit = (values: z.infer<typeof saleSchema>) => {
    onConfirm(values.quantity, values.salePrice);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Venta: {item.produce?.name}</DialogTitle>
          <DialogDescription>
            Tienes {item.quantity} cajones disponibles para vender de este lote.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="sale-form" className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Vendida (cajones)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta (por cajón)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="sale-form">Registrar Venta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
