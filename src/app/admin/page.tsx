'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, TriangleAlert } from 'lucide-react';

import { mockStalls, mockNews } from '@/lib/data.tsx';
import type { Stall, Product, PriceHistory, NewsArticle } from '@/lib/types';
import { validatePriceAction } from './actions';
import { UpdatePriceRow } from '@/components/admin/update-price-row';
import { ManageNews } from '@/components/admin/manage-news';

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
  stallId: z.string().min(1, 'Debe seleccionar un puesto.'),
  name: z.string().min(1, 'El nombre es requerido.'),
  variety: z.string().min(1, 'La variedad es requerida.'),
  price: z.coerce.number().positive('El precio inicial debe ser positivo.'),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

export default function AdminPage() {
  const [stalls, setStalls] = useState<Stall[]>(mockStalls);
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
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

  const handlePriceUpdate = async (stallId: string, productId: string, newPrice: number) => {
    setUpdatingProductId(productId);
    const stall = stalls.find((s) => s.id === stallId);
    const product = stall?.products.find((p) => p.id === productId);

    if (!product || !stall) {
      setUpdatingProductId(null);
      return;
    }

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
    const newProduct: Product = {
      id: `${data.stallId}-${data.name}-${Math.random()}`,
      name: data.name,
      variety: data.variety,
      priceHistory: [{ date: new Date().toISOString(), price: data.price }],
    };

    setStalls((prev) =>
      prev.map((stall) => {
        if (stall.id === data.stallId) {
          return { ...stall, products: [...stall.products, newProduct] };
        }
        return stall;
      })
    );

    toast({
      title: 'Producto Agregado',
      description: `Se ha agregado "${data.name} (${data.variety})" al puesto.`,
    });
    newProductForm.reset();
  };
  
  const handleDeleteProduct = (stallId: string, productId: string) => {
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

  const handleAddNews = (article: Omit<NewsArticle, 'id' | 'date'>) => {
    const newArticle: NewsArticle = {
      id: `news-${Date.now()}`,
      date: new Date().toISOString(),
      ...article,
    };
    setNews(prev => [newArticle, ...prev]);
    toast({
      title: 'Noticia Agregada',
      description: `Se ha publicado "${article.title}".`,
    });
  };

  const handleDeleteNews = (articleId: string) => {
    setNews(prev => prev.filter(a => a.id !== articleId));
    toast({
      title: 'Noticia Eliminada',
      variant: 'destructive',
    });
  };

  return (
    <>
      <Tabs defaultValue="update">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="update">Actualizar Precios</TabsTrigger>
          <TabsTrigger value="add">Agregar Producto</TabsTrigger>
          <TabsTrigger value="news">Gestionar Noticias</TabsTrigger>
        </TabsList>
        <TabsContent value="update">
          <div className="space-y-8">
            {stalls.map(stall => (
              <Card key={stall.id}>
                <CardHeader>
                  <CardTitle>Puesto {stall.number} - {stall.name}</CardTitle>
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
                        {stall.products.map((product) => (
                          <UpdatePriceRow
                            key={product.id}
                            product={product}
                            onUpdate={(productId, newPrice) => handlePriceUpdate(stall.id, productId, newPrice)}
                            isUpdating={updatingProductId === product.id}
                            onDelete={(productId) => handleDeleteProduct(stall.id, productId)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="add">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Agregar Nuevo Producto a un Puesto</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...newProductForm}>
                <form
                  onSubmit={newProductForm.handleSubmit(handleAddNewProduct)}
                  className="space-y-6"
                >
                  <FormField
                    control={newProductForm.control}
                    name="stallId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puesto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un puesto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stalls.map(stall => (
                              <SelectItem key={stall.id} value={stall.id}>
                                Puesto {stall.number} - {stall.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
        <TabsContent value="news">
          <ManageNews 
            news={news}
            onAddNews={handleAddNews}
            onDeleteNews={handleDeleteNews}
          />
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
