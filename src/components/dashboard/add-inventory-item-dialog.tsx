'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import { collection } from 'firebase/firestore';

import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { AggregatedProduct, Cost } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

const inventoryItemSchema = z.object({
  produceId: z.string().min(1, 'Debe seleccionar un producto.'),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a cero.'),
  purchasePrice: z.coerce.number().min(0, 'El precio de compra no puede ser negativo.'),
  costIds: z.array(z.string()).optional(),
});

type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

type AddInventoryItemDialogProps = {
  products: AggregatedProduct[];
  costs: Cost[];
  children?: React.ReactNode;
  buttonVariant?: 'default' | 'outline';
};

export function AddInventoryItemDialog({ products, costs, children, buttonVariant = 'outline' }: AddInventoryItemDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      produceId: '',
      quantity: 1,
      purchasePrice: 0,
      costIds: [],
    },
  });

  const handleAddInventoryItem = (data: InventoryItemFormData) => {
    if (!user) return;
    
    const inventoryRef = collection(firestore, `users/${user.uid}/inventory`);

    const selectedCosts = costs.filter(c => data.costIds?.includes(c.id)).map(c => ({ name: c.name, amount: c.amount }));

    const newItem = {
      produceId: data.produceId,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseDate: new Date().toISOString(),
      status: 'En Reserva',
      associatedCosts: selectedCosts,
      sales: []
    };

    addDocumentNonBlocking(inventoryRef, newItem);

    const selectedProduct = products.find(p => p.id === data.produceId);
    toast({
      title: 'Compra Registrada',
      description: `Se agregaron ${data.quantity} cajones de ${selectedProduct?.name} al inventario.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>
            {children || <><PlusCircle className="mr-2" />Registrar Compra</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Compra</DialogTitle>
          <DialogDescription>
            Agrega un producto a tu inventario para rastrear su rendimiento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="add-inventory-form"
            onSubmit={form.handleSubmit(handleAddInventoryItem)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="produceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un producto..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.variety && `(${p.variety})`}
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
                  <FormLabel>Cantidad (cajones)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                  <FormLabel>Precio de Compra (por cajón)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="$" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {costs.length > 0 && (
              <div>
                <Separator className="my-4" />
                <FormField
                  control={form.control}
                  name="costIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Costos Adicionales</FormLabel>
                         <p className="text-sm text-muted-foreground">
                            Selecciona los costos por cajón a aplicar a este lote.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {costs.map((cost) => (
                          <FormField
                            key={cost.id}
                            control={form.control}
                            name="costIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={cost.id}
                                  className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"
                                >
                                    <div className="space-y-0.5">
                                      <FormLabel>{cost.name}</FormLabel>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="font-mono text-foreground">${cost.amount.toLocaleString()}</span>
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(cost.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), cost.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== cost.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                    </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="add-inventory-form">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar al Inventario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
