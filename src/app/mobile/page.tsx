'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, TriangleAlert, Save, Loader2 } from 'lucide-react';
import { collection, doc, writeBatch, where, query, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { validatePriceAction } from '../admin/actions'; // Reuse admin action
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import type { Produce, Price, AggregatedProduct } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { QuickPriceInput } from '@/components/admin/quick-price-input'; // Reuse component

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  variety: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida.'),
  weightPerCrate: z.coerce.number().positive('El peso por cajón debe ser positivo.'),
  price: z.coerce.number().positive('El precio inicial debe ser positivo.'),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

// Mobile Price Update Card Component
const MobilePriceUpdateCard = ({ product, onUpdate, isUpdating }: { product: AggregatedProduct, onUpdate: (productId: string, newPrice: number) => void, isUpdating: boolean }) => {
  const currentPrice = product.priceHistory.at(0)?.price ?? 0;
  const [newPrice, setNewPrice] = useState(currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate && newPrice !== currentPrice) {
      onUpdate(product.id, newPrice);
    }
  };

  const lastPriceEntry = product.priceHistory.at(0);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>{product.variety}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-baseline">
            <div className="text-sm text-muted-foreground">
                <p>Precio Actual:</p>
                <p className="text-xs">
                    {lastPriceEntry ? format(new Date(lastPriceEntry.date), 'P', { locale: es }) : 'N/A'}
                </p>
            </div>
            <p className="text-xl font-mono">${currentPrice.toLocaleString()}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-2">
            <QuickPriceInput
              initialPrice={currentPrice}
              onChange={setNewPrice}
            />
            <Button
                type="submit"
                disabled={isUpdating || newPrice === currentPrice}
                size="sm"
                className="w-full"
            >
                {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                <>
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar Precio
                </>
                )}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function MobileAdminPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const producesRef = useMemoFirebase(() => user ? collection(firestore, 'produces') : null, [firestore, user]);
  const pricesRef = useMemoFirebase(() => user ? collection(firestore, 'prices') : null, [firestore, user]);
  
  const { data: producesData, isLoading: isLoadingProduces } = useCollection<Produce>(producesRef);
  const { data: pricesData, isLoading: isLoadingPrices } = useCollection<Price>(pricesRef);

  const [validationAlert, setValidationAlert] = useState<{
    open: boolean;
    reason: string;
    onConfirm: () => void;
  } | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const aggregatedProducts = useMemo((): AggregatedProduct[] => {
    if (!producesData || !pricesData) return [];
    const pricesByProduceId = pricesData.reduce((acc, price) => {
      if (!acc[price.produceId]) acc[price.produceId] = [];
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

  const newProductForm = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
    defaultValues: { name: '', variety: '', category: '', weightPerCrate: 0, price: 0 },
  });

  const updateProductPrice = (productId: string, newPrice: number) => {
    if (!pricesRef) return;
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
    if (!product) { setUpdatingProductId(null); return; }
    
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
    if (!producesRef || !pricesRef) return;
    const newProduce = {
        name: data.name, variety: data.variety || '', category: data.category, weightPerCrate: data.weightPerCrate,
    };
    addDocumentNonBlocking(producesRef, newProduce).then(docRef => {
        if(docRef && pricesRef) {
            const newPriceEntry = { produceId: docRef.id, price: data.price, date: new Date().toISOString() };
            addDocumentNonBlocking(pricesRef, newPriceEntry);
        }
    });
    toast({ title: 'Producto Agregado', description: `Se ha agregado "${data.name} (${data.variety})".` });
    newProductForm.reset();
  };
  
  const isLoading = isLoadingProduces || isLoadingPrices;

  return (
    <>
      <Tabs defaultValue="update" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="update">Actualizar Precios</TabsTrigger>
          <TabsTrigger value="add">Agregar Producto</TabsTrigger>
        </TabsList>
        <TabsContent value="update">
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando productos...</p>
            ) : (
              aggregatedProducts.map((product) => (
                <MobilePriceUpdateCard
                  key={product.id}
                  product={product}
                  onUpdate={handlePriceUpdate}
                  isUpdating={updatingProductId === product.id}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Nuevo Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...newProductForm}>
                <form onSubmit={newProductForm.handleSubmit(handleAddNewProduct)} className="space-y-4">
                  <FormField control={newProductForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl><Input placeholder="Ej: Tomate" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={newProductForm.control} name="variety" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variedad (Opcional)</FormLabel>
                        <FormControl><Input placeholder="Ej: Redondo" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={newProductForm.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl><Input placeholder="Ej: Hortalizas de Fruto" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={newProductForm.control} name="weightPerCrate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso por Cajón (kg)</FormLabel>
                        <FormControl><Input type="number" placeholder="Ej: 20" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={newProductForm.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Inicial por Cajón</FormLabel>
                        <FormControl><Input type="number" placeholder="$3000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                  <Button type="submit" className="w-full">
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
        <AlertDialog open={validationAlert.open} onOpenChange={() => { if (validationAlert.open) { setValidationAlert(null); setUpdatingProductId(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><TriangleAlert className="text-accent" />Confirmación de Precio</AlertDialogTitle>
              <AlertDialogDescription>{validationAlert.reason}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setValidationAlert(null); setUpdatingProductId(null); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={validationAlert.onConfirm}>Confirmar de todos modos</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
