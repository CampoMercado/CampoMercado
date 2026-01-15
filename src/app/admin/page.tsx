'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, TriangleAlert } from 'lucide-react';
import { collection, doc, writeBatch, where, query, getDocs } from 'firebase/firestore';

import { validatePriceAction } from './actions';
import { UpdatePriceRow } from '@/components/admin/update-price-row';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import type { Produce, Price, AggregatedProduct } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow, TableCell } from '@/components/ui/table';
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

const newProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  variety: z.string().min(1, 'La variedad es requerida.'),
  category: z.string().min(1, 'La categoría es requerida.'),
  price: z.coerce.number().positive('El precio inicial debe ser positivo.'),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AdminPage() {
  const firestore = useFirestore();
  const producesRef = useMemoFirebase(() => collection(firestore, 'produces'), [firestore]);
  const pricesRef = useMemoFirebase(() => collection(firestore, 'prices'), [firestore]);
  
  const { data: producesData, isLoading: isLoadingProduces } = useCollection<Produce>(producesRef);
  const { data: pricesData, isLoading: isLoadingPrices } = useCollection<Price>(pricesRef);

  const [validationAlert, setValidationAlert] = useState<{
    open: boolean;
    reason: string;
    onConfirm: () => void;
  } | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const aggregatedProducts = useMemo((): AggregatedProduct[] => {
    if (!producesData || !pricesData) {
      return [];
    }

    const pricesByProduceId = pricesData.reduce((acc, price) => {
      if (!acc[price.produceId]) {
        acc[price.produceId] = [];
      }
      acc[price.produceId].push({ date: price.date, price: price.price });
      return acc;
    }, {} as Record<string, { date: string; price: number }[]>);

    return producesData.map((produce) => ({
      ...produce,
      priceHistory: (pricesByProduceId[produce.id] || []).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [producesData, pricesData]);

  const filteredProducts = useMemo(() => {
    if (!activeLetter) {
      return aggregatedProducts;
    }
    return aggregatedProducts.filter((p) =>
      p.name.toUpperCase().startsWith(activeLetter)
    );
  }, [aggregatedProducts, activeLetter]);

  const newProductForm = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
      name: '',
      variety: '',
      category: '',
      price: 0,
    },
  });

  const updateProductPrice = (productId: string, newPrice: number) => {
    const newPriceEntry = {
      produceId: productId,
      price: newPrice,
      date: new Date().toISOString(),
    };
    addDocumentNonBlocking(pricesRef, newPriceEntry);
    
    toast({
      title: 'Precio Actualizado',
      description: `El precio se ha actualizado a $${newPrice.toLocaleString()}.`,
    });
    setUpdatingProductId(null);
  };

  const handlePriceUpdate = async (productId: string, newPrice: number) => {
    setUpdatingProductId(productId);
    const product = aggregatedProducts.find((p) => p.id === productId);

    if (!product) {
      setUpdatingProductId(null);
      return;
    }
    
    const currentPrice = product.priceHistory.at(0)?.price;

    const validationResult = await validatePriceAction({
      produceName: `${product.name} ${product.variety}`,
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
    const newProduce = {
        name: data.name,
        variety: data.variety,
        category: data.category
    };

    addDocumentNonBlocking(producesRef, newProduce).then(docRef => {
        if(docRef) {
            const newPriceEntry = {
                produceId: docRef.id,
                price: data.price,
                date: new Date().toISOString(),
            };
            addDocumentNonBlocking(pricesRef, newPriceEntry);
        }
    });

    toast({
      title: 'Producto Agregado',
      description: `Se ha agregado "${data.name} (${data.variety})".`,
    });
    newProductForm.reset();
  };

  const handleDeleteProduct = async (productId: string) => {
    
    // 1. Delete the product document
    const produceDocRef = doc(firestore, 'produces', productId);
    deleteDocumentNonBlocking(produceDocRef);
    
    // 2. Query and delete all associated prices
    const pricesToDeleteQuery = query(pricesRef, where('produceId', '==', productId));
    
    const pricesSnapshot = await getDocs(pricesToDeleteQuery);
    const batch = writeBatch(firestore);
    pricesSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    toast({
      title: 'Producto Eliminado',
      description: 'El producto y su historial de precios han sido eliminados.',
      variant: 'destructive',
    });
  };
  
  const isLoading = isLoadingProduces || isLoadingPrices;

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
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant={activeLetter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveLetter(null)}
                >
                  Todos
                </Button>
                {alphabet.map((letter) => (
                  <Button
                    key={letter}
                    variant={activeLetter === letter ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setActiveLetter(letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <UpdatePriceRow isHeader />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Cargando productos...
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <UpdatePriceRow
                          key={product.id}
                          product={product}
                          onUpdate={handlePriceUpdate}
                          isUpdating={updatingProductId === product.id}
                          onDelete={handleDeleteProduct}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add">
          <Card className="max-w-lg">
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
                          <Input
                            placeholder="Ej: Hortalizas de Fruto"
                            {...field}
                          />
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
