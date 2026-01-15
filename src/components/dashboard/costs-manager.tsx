'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { collection, doc, deleteDoc } from 'firebase/firestore';

import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Cost } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const newCostSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  amount: z.coerce.number().min(0, 'El monto no puede ser negativo.'),
});

type NewCostFormData = z.infer<typeof newCostSchema>;

type CostsManagerProps = {
  costs: Cost[];
};

export function CostsManager({ costs }: CostsManagerProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const newCostForm = useForm<NewCostFormData>({
    resolver: zodResolver(newCostSchema),
    defaultValues: {
      name: '',
      amount: 0,
    },
  });

  const handleAddNewCost = (data: NewCostFormData) => {
    if (!user) return;

    const costsRef = collection(firestore, `users/${user.uid}/costs`);
    addDocumentNonBlocking(costsRef, data);

    toast({
      title: 'Costo Agregado',
      description: `Se ha agregado el costo "${data.name}".`,
    });
    newCostForm.reset();
  };
  
  const handleDeleteCost = (costId: string) => {
    if (!user) return;
    const costRef = doc(firestore, `users/${user.uid}/costs`, costId);
    deleteDoc(costRef);
    toast({
        title: 'Costo Eliminado',
        variant: 'destructive'
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Costo</CardTitle>
            <CardDescription>
                Define un costo recurrente por cajón (ej: Flete, Descarga).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...newCostForm}>
              <form
                onSubmit={newCostForm.handleSubmit(handleAddNewCost)}
                className="space-y-6"
              >
                <FormField
                  control={newCostForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Costo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Flete" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newCostForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto por Cajón</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej: 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={newCostForm.formState.isSubmitting}>
                   {newCostForm.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   ) : (
                        <PlusCircle className="mr-2 h-4 w-4" />
                   )}
                  Agregar Costo
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
         <Card>
            <CardHeader>
              <CardTitle>Costos Definidos</CardTitle>
              <CardDescription>
                Estos son los costos que puedes asociar a tus lotes de inventario.
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Monto por Cajón</TableHead>
                      <TableHead className="w-[80px] text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costs.length > 0 ? (
                        costs.map((cost) => (
                            <TableRow key={cost.id}>
                                <TableCell className="font-medium">{cost.name}</TableCell>
                                <TableCell className="text-right font-mono">${cost.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                     <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCost(cost.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                No has definido costos adicionales.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
