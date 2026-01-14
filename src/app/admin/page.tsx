'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Apple, Grape, PlusCircle, TriangleAlert } from 'lucide-react';

import { mockProducts } from '@/lib/data.tsx';
import type { Product, PriceHistory } from '@/lib/types';
import { validatePriceAction } from './actions';
import { UpdatePriceRow } from '@/components/admin/update-price-row';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

const newProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  category: z.string().min(1, 'La categoría es requerida.'),
  price: z.coerce.number().positive('El precio inicial debe ser positivo.'),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

// Custom icons - repeating from data.ts for use here. A better way would be a shared icon registry.
const TomatoIcon = (props: { className?: string }) => (<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-3.3 2.5A4 4 0 0 0 5.3 8c0 2.2 1.8 4 4 4h5.4a4 4 0 0 0 3.3-6.5A4 4 0 0 0 12 2z"/><path d="M12 14c-2.2 0-4 1.8-4 4v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2c0-2.2-1.8-4-4-4z"/></svg>);
const PotatoIcon = (props: { className?: string }) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.3 10.7a3.5 3.5 0 1 1-5.1-4.8 3.5 3.5 0 0 1 5.1 4.8z"/><path d="m11.4 11.4-.5 2.1-2.1.5-3.3 3.3a2 2 0 0 0 2.8 2.8l3.3-3.3.5-2.1 2.1-.5 2.5-2.5a6.5 6.5 0 1 0-9.2-9.2L2.4 9.1a2 2 0 0 0 2.8 2.8l2.9-2.9"/></svg>);
const LettuceIcon = (props: { className?: string }) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 7.5Z"/><path d="M4 14v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>);
const OnionIcon = (props: { className?: string }) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2a8 8 0 0 0-3 15.2V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5.8A8 8 0 0 0 13 2z"></path><path d="M13 2c0 1.33.67 2 2 2s2-.67 2-2"></path></svg>);

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Tomate: TomatoIcon,
  Papa: PotatoIcon,
  Manzana: Apple,
  Lechuga: LettuceIcon,
  Cebolla: OnionIcon,
  Uva: Grape,
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [validationAlert, setValidationAlert] = useState<{
    open: boolean;
    reason: string;
    onConfirm: () => void;
  } | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  const newProductForm = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
  });

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const newPriceHistory: PriceHistory = {
            date: new Date().toISOString(),
            price: newPrice,
          };
          return { ...p, priceHistory: [...p.priceHistory, newPriceHistory] };
        }
        return p;
      })
    );
    toast({
      title: 'Precio Actualizado',
      description: `El precio se ha actualizado a $${newPrice.toLocaleString()}.`,
    });
    setUpdatingProductId(null);
  };

  const handlePriceUpdate = async (productId: string, newPrice: number) => {
    setUpdatingProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (!product) {
      setUpdatingProductId(null);
      return;
    }

    const currentPrice = product.priceHistory.at(-1)?.price;

    const validationResult = await validatePriceAction({
      produceName: product.name,
      price: newPrice,
      previousPrice: currentPrice,
    });

    if (validationResult.isValid) {
      updateProductPrice(productId, newPrice);
    } else {
      setValidationAlert({
        open: true,
        reason: validationResult.reason || 'El precio parece inusual.',
        onConfirm: () => {
          updateProductPrice(productId, newPrice);
          setValidationAlert(null);
        },
      });
    }
  };

  const handleAddNewProduct = (data: NewProductFormData) => {
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      name: data.name,
      category: data.category,
      icon: iconMap[data.name],
      imageId: data.name.toLowerCase().replace(' ', ''), // simple mapping for mock
      priceHistory: [{ date: new Date().toISOString(), price: data.price }],
    };
    setProducts((prev) => [...prev, newProduct]);
    toast({
      title: 'Producto Agregado',
      description: `Se ha agregado "${data.name}" a la lista.`,
    });
    newProductForm.reset();
  };
  
  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
        title: "Producto Eliminado",
        variant: "destructive"
    });
  }

  return (
    <>
      <Tabs defaultValue="update">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="update">Actualizar Precios</TabsTrigger>
          <TabsTrigger value="add">Agregar Producto</TabsTrigger>
        </TabsList>
        <TabsContent value="update">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <UpdatePriceRow isHeader />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <UpdatePriceRow
                        key={product.id}
                        product={product}
                        onUpdate={handlePriceUpdate}
                        isUpdating={updatingProductId === product.id}
                        onDelete={handleDeleteProduct}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Agregar Nuevo Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...newProductForm}>
                <form
                  onSubmit={newProductForm.handleSubmit(handleAddNewProduct)}
                  className="space-y-6"
                >
                  <FormField
                    control={newProductForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Tomate Redondo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newProductForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Frutas, Verduras" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newProductForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Inicial por Cajón</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="$3000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {validationAlert && (
        <AlertDialog
          open={validationAlert.open}
          onOpenChange={() => {
            if (validationAlert.open) {
              setValidationAlert(null);
              setUpdatingProductId(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <TriangleAlert className="text-accent" />
                Confirmación de Precio
              </AlertDialogTitle>
              <AlertDialogDescription>
                {validationAlert.reason}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setValidationAlert(null);
                  setUpdatingProductId(null);
                }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={validationAlert.onConfirm}>
                Confirmar de todos modos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
