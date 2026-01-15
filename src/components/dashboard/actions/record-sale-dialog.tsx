'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InventoryItemWithProduct, Sale } from '@/lib/types';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type RecordSaleDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, salePrice: number, saleStatus: Sale['status']) => void;
  item: InventoryItemWithProduct;
};

export function RecordSaleDialog({ isOpen, onClose, onConfirm, item }: RecordSaleDialogProps) {
  const saleSchema = z.object({
    quantity: z.coerce.number().positive('La cantidad debe ser positiva.').max(item.quantity, `No puedes vender más de ${item.quantity} cajones.`),
    salePrice: z.coerce.number().positive('El precio de venta debe ser positivo.'),
    saleStatus: z.enum(['Pagado', 'Pendiente']),
  });
  
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
      salePrice: item.produce?.priceHistory[0]?.price || item.purchasePrice,
      saleStatus: 'Pagado',
    },
  });

  useEffect(() => {
    // Reset form with default values when dialog opens or item changes
    if (isOpen) {
        form.reset({
            quantity: 1,
            salePrice: item.produce?.priceHistory[0]?.price || item.purchasePrice,
            saleStatus: 'Pagado',
        });
    }
  }, [isOpen, item, form]);

  const handleSubmit = (values: z.infer<typeof saleSchema>) => {
    onConfirm(values.quantity, values.salePrice, values.saleStatus as Sale['status']);
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
             <FormField
              control={form.control}
              name="saleStatus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Estado de la Venta</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Pagado" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Pagado (Dinero recibido)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Pendiente" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Pendiente (A consignación / Cta. Cte.)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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
