
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { AggregatedProduct } from '@/lib/types';

const formSchema = z.object({
  produceId: z.string().min(1, 'Debe seleccionar un producto.'),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a cero.'),
  purchasePrice: z.coerce.number().positive('El precio debe ser mayor a cero.'),
});

type AddInventoryItemFormData = z.infer<typeof formSchema>;

interface AddInventoryItemFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  marketProducts: AggregatedProduct[];
}

export function AddInventoryItemForm({
  isOpen,
  onOpenChange,
  marketProducts,
}: AddInventoryItemFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<AddInventoryItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produceId: '',
      quantity: 1,
      purchasePrice: 0,
    },
  });

  const handleSubmit = async (data: AddInventoryItemFormData) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debe estar autenticado para realizar esta acción.',
      });
      return;
    }

    const inventoryRef = collection(firestore, 'users', user.uid, 'inventory');
    
    // Non-blocking write
    addDocumentNonBlocking(inventoryRef, data);

    toast({
      title: 'Producto Agregado',
      description: 'El producto ha sido añadido a su inventario.',
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Producto al Inventario</DialogTitle>
          <DialogDescription>
            Seleccione un producto del mercado y especifique la cantidad y el precio de compra.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="produceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto del Mercado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un producto..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {marketProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.variety})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de Cajones</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Compra por Cajón</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 2500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Agregar al Inventario
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
