'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, TriangleAlert } from 'lucide-react';

import { mockStalls } from '@/lib/data.tsx';
import type { Stall, Product, PriceHistory } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const newProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  variety: z.string().min(1, 'La variedad es requerida.'),
  category: z.string().min(1, 'La categoría es requerida.'),
  price: z.coerce.number().positive('El precio inicial debe ser positivo.'),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

export default function AdminPage() {
  const [stalls, setStalls] = useState<Stall[]>(mockStalls);
  const [validationAlert, setValidationAlert] = useState<{
    open: boolean;
    reason: string;
    onConfirm: () => void;
  } | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  const allProducts = useMemo(() => {
      return stalls.flatMap(stall => 
          stall.products.map(product => ({...product, stallId: stall.id}))
      );
  }, [stalls]);

  const newProductForm = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
      name: '',
      variety: '',
      category: '',
      price: undefined,
    }
  });

  const updateProductPrice = (stallId: string, productId: string, newPrice: number) => {
    setStalls((prevStalls) =>
      prevStalls.map((stall) => {
        if (stall.id === stallId) {
          return {
            ...stall,
            products: stall.products.map((p) => {
              if (p.id === productId) {
                const newPriceHistory: PriceHistory = {
                  date: new Date().toISOString(),
                  price: newPrice,
                };
                return {
                  ...p,
                  priceHistory: [...p.priceHistory, newPriceHistory],
                };
              }
              return p;
            }),
          };
        }
        return stall;
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
    const productWithStall = allProducts.find(p => p.id === productId);

    if (!productWithStall) {
      setUpdatingProductId(null);
      return;
    }
    const { stallId, ...product } = productWithStall;
    const currentPrice = product.priceHistory.at(-1)?.price;

    const validationResult = await validatePriceAction({
      produceName: `${product.name} ${product.variety}`,
      price: newPrice,
      previousPrice: currentPrice,
    });

    if (validationResult.isValid) {
      updateProductPrice(stallId, productId, newPrice);
    } else {
      setValidationAlert({
        open: true,
        reason: validationResult.reason || 'El precio parece inusual.',
        onConfirm: () => {
          updateProductPrice(stallId, productId, newPrice);
          setValidationAlert(null);
        },
      });
    }
  };

  const handleAddNewProduct = (data: NewProductFormData) => {
     // For this mock, we'll add the new product to the first stall.
     // In a real app, you might have a different logic.
    const targetStallId = stalls[0]?.id;
    if (!targetStallId) {
        toast({ title: 'Error', description: 'No hay puestos para agregar productos.', variant: 'destructive'});
        return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name,
      variety: data.variety,
      category: data.category,
      priceHistory: [{ date: new Date().toISOString(), price: data.price }],
    };

    setStalls((prev) =>
      prev.map((stall) => {
        if (stall.id === targetStallId) {
          return { ...stall, products: [...stall.products, newProduct] };
        }
        return stall;
      })
    );

    toast({
      title: 'Producto Agregado',
      description: `Se ha agregado "${data.name} (${data.variety})".`,
    });
    newProductForm.reset();
  };
  
  const handleDeleteProduct = (productId: string) => {
    const productWithStall = allProducts.find(p => p.id === productId);
    if (!productWithStall) return;
    const { stallId } = productWithStall;

     setStalls((prev) =>
      prev.map((stall) => {
        if (stall.id === stallId) {
          return { ...stall, products: stall.products.filter(p => p.id !== productId) };
        }
        return stall;
      })
    );
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
                  <CardTitle>Todos los Productos</CardTitle>
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
                        {allProducts.map((product) => (
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
              <CardTitle>Agregar Nuevo Producto al Mercado</CardTitle>
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
                          <Input placeholder="Ej: Tomate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={newProductForm.control}
                    name="variety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variedad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Redondo" {...field} />
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
                          <Input placeholder="Ej: Hortalizas de Fruto" {...field} />
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
