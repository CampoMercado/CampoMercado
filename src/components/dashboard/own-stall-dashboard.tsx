
'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { InventoryItem, AggregatedProduct, Produce, Price } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddInventoryItemForm } from './add-inventory-item-form';

type AggregatedInventoryItem = InventoryItem & {
  produce: AggregatedProduct | undefined;
};

export function OwnStallDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // Global market data
  const producesRef = useMemoFirebase(() => collection(firestore, 'produces'), [firestore]);
  const pricesRef = useMemoFirebase(() => collection(firestore, 'prices'), [firestore]);
  const { data: producesData, isLoading: isLoadingProduces } = useCollection<Produce>(producesRef);
  const { data: pricesData, isLoading: isLoadingPrices } = useCollection<Price>(pricesRef);

  // User's personal inventory data
  const inventoryRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'inventory') : null,
    [user, firestore]
  );
  const { data: inventoryData, isLoading: isLoadingInventory } = useCollection<InventoryItem>(inventoryRef);

  const aggregatedProducts = useMemo((): AggregatedProduct[] => {
    if (!producesData || !pricesData) return [];
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
    }));
  }, [producesData, pricesData]);

  const aggregatedInventory = useMemo((): AggregatedInventoryItem[] => {
    if (!inventoryData || !aggregatedProducts) return [];
    return inventoryData.map(item => ({
      ...item,
      produce: aggregatedProducts.find(p => p.id === item.produceId),
    }));
  }, [inventoryData, aggregatedProducts]);

  const isLoading = isLoadingProduces || isLoadingPrices || isLoadingInventory;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mi Inventario</CardTitle>
            <CardDescription>
              Gestione el stock y los precios de su puesto.
            </CardDescription>
          </div>
          <Button onClick={() => setAddFormOpen(true)}>
            <PlusCircle className="mr-2" />
            Agregar Producto
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Stock (Cajones)</TableHead>
                <TableHead className="text-right">Mi Precio Compra</TableHead>
                <TableHead className="text-right">Precio Mercado Hoy</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : aggregatedInventory.length > 0 ? (
                aggregatedInventory.map(item => {
                  const marketPrice = item.produce?.priceHistory.at(0)?.price ?? 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.produce?.name}</div>
                        <div className="text-sm text-muted-foreground">{item.produce?.variety}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">${item.purchasePrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">${marketPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Gestionar</Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No hay productos en su inventario.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddInventoryItemForm
        isOpen={isAddFormOpen}
        onOpenChange={setAddFormOpen}
        marketProducts={aggregatedProducts}
      />
    </>
  );
}
