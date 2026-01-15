'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type MoveStockDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantityToMove: number, newStatus: string) => void;
  productName: string;
  maxQuantity: number;
};

export function MoveStockDialog({
  isOpen,
  onClose,
  onConfirm,
  productName,
  maxQuantity,
}: MoveStockDialogProps) {
  const moveStockSchema = z.object({
    quantityToMove: z.coerce
      .number()
      .positive('La cantidad debe ser positiva.')
      .max(maxQuantity, `No puedes mover más de ${maxQuantity} cajones.`),
    newStatus: z.string().min(1, 'La nueva ubicación es requerida.'),
  });

  const form = useForm<z.infer<typeof moveStockSchema>>({
    resolver: zodResolver(moveStockSchema),
    defaultValues: {
      quantityToMove: maxQuantity,
      newStatus: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof moveStockSchema>) => {
    onConfirm(values.quantityToMove, values.newStatus);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover Stock: {productName}</DialogTitle>
          <DialogDescription>
            Indica cuántos cajones de un total de {maxQuantity} quieres mover y a qué nueva ubicación o estado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="move-stock-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="quantityToMove"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad a Mover (cajones)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Ubicación / Estado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Puesto 5, En Tránsito, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="move-stock-form">
            Mover Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
