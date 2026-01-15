'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { UserProfile, InventoryItem, Produce, Price } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { PlusCircle } from 'lucide-react';

import { AddInventoryItemDialog } from '@/components/dashboard/add-inventory-item-dialog';
import { InventoryCard } from '@/components/dashboard/inventory-card';
import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

  const inventoryRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/inventory`) : null),
    [firestore, user]
  );
  const { data: inventory, isLoading: isLoadingInventory } = useCollection<InventoryItem>(inventoryRef);

  const producesRef = useMemoFirebase(() => user ? collection(firestore, 'produces') : null, [firestore, user]);
  const { data: produces, isLoading: isLoadingProduces } = useCollection<Produce>(producesRef);
  
  const pricesRef = useMemoFirebase(() => user ? collection(firestore, 'prices') : null, [firestore, user]);
  const { data: prices, isLoading: isLoadingPrices } = useCollection<Price>(pricesRef);

  const aggregatedProducts = useMemo(() => {
    if (!produces || !prices) return [];
    
    const pricesByProduceId = prices.reduce((acc, price) => {
      if (!acc[price.produceId]) {
        acc[price.produceId] = [];
      }
      acc[price.produceId].push({ date: price.date, price: price.price });
      return acc;
    }, {} as Record<string, { date: string; price: number }[]>);

    return produces.map((produce) => ({
      ...produce,
      priceHistory: (pricesByProduceId[produce.id] || []).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
  }, [produces, prices]);
  

  const inventoryWithData = useMemo(() => {
    if (!inventory || !aggregatedProducts) return [];
    return inventory.map(item => {
      const produceInfo = aggregatedProducts.find(p => p.id === item.produceId);
      return {
        ...item,
        produce: produceInfo,
      };
    }).sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [inventory, aggregatedProducts]);

  const isLoading = isUserLoading || isLoadingProfile || isLoadingInventory || isLoadingProduces || isLoadingPrices;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-4xl font-headline font-bold">
            Mi Inventario
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus compras, ventas y stock en tiempo real.
          </p>
        </div>
        <AddInventoryItemDialog products={aggregatedProducts} />
      </div>

      {inventoryWithData && inventoryWithData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {inventoryWithData.map(item => (
             <InventoryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
            <h3 className="text-xl font-semibold">Tu inventario está vacío</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                Comienza por registrar tu primera compra de mercadería.
            </p>
            <AddInventoryItemDialog products={aggregatedProducts} buttonVariant='default'>
                <PlusCircle className="mr-2" />
                Registrar Primera Compra
            </AddInventoryItemDialog>
        </div>
      )}
    </div>
  );
}
