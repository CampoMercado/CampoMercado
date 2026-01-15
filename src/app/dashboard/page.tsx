'use client';

import { useMemo } from 'react';
import { collection, doc, deleteDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { UserProfile, InventoryItem, Produce, Price } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { AddInventoryItemDialog } from '@/components/dashboard/add-inventory-item-dialog';
import { InventoryCard } from '@/components/dashboard/inventory-card';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isLoadingProfile } =
    useDoc<UserProfile>(userProfileRef);

  const inventoryRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/inventory`) : null),
    [firestore, user]
  );
  const { data: inventory, isLoading: isLoadingInventory } =
    useCollection<InventoryItem>(inventoryRef);

  const producesRef = useMemoFirebase(
    () => (user ? collection(firestore, 'produces') : null),
    [firestore, user]
  );
  const { data: produces, isLoading: isLoadingProduces } =
    useCollection<Produce>(producesRef);

  const pricesRef = useMemoFirebase(
    () => (user ? collection(firestore, 'prices') : null),
    [firestore, user]
  );
  const { data: prices, isLoading: isLoadingPrices } =
    useCollection<Price>(pricesRef);

  const aggregatedProducts = useMemo(() => {
    if (!produces || !prices) return [];

    const pricesByProduceId = prices.reduce(
      (acc, price) => {
        if (!acc[price.produceId]) {
          acc[price.produceId] = [];
        }
        acc[price.produceId].push({ date: price.date, price: price.price });
        return acc;
      },
      {} as Record<string, { date: string; price: number }[]>
    );

    return produces.map((produce) => ({
      ...produce,
      priceHistory: (pricesByProduceId[produce.id] || []).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
  }, [produces, prices]);

  const inventoryWithData = useMemo(() => {
    if (!inventory || !aggregatedProducts) return [];
    return inventory
      .map((item) => {
        const produceInfo = aggregatedProducts.find(
          (p) => p.id === item.produceId
        );
        return {
          ...item,
          produce: produceInfo,
        };
      })
      .sort((a, b) => (a.produce?.name || '').localeCompare(b.produce?.name || ''));
  }, [inventory, aggregatedProducts]);

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    const itemRef = doc(firestore, `users/${user.uid}/inventory`, itemId);
    await deleteDoc(itemRef);
    toast({
      title: 'Lote Eliminado',
      description: 'El lote de inventario ha sido eliminado correctamente.',
      variant: 'destructive',
    });
  };

  const handleSplitStock = async (
    originalItem: InventoryItem,
    quantityToMove: number,
    newStatus: string
  ) => {
    if (!user || !inventoryRef) return;
  
    const remainingQuantity = originalItem.quantity - quantityToMove;
  
    // If moving the full quantity, just update the status
    if (remainingQuantity <= 0) {
      const itemRef = doc(firestore, `users/${user.uid}/inventory`, originalItem.id);
      await updateDoc(itemRef, { status: newStatus });
      toast({
        title: 'Stock Movido',
        description: `Todo el lote ha sido movido a "${newStatus}".`,
      });
      return;
    }
  
    // If splitting the stock, update original and create a new one
    const batch = writeBatch(firestore);
  
    // 1. Update the original item
    const originalItemRef = doc(firestore, `users/${user.uid}/inventory`, originalItem.id);
    batch.update(originalItemRef, { quantity: remainingQuantity });
  
    // 2. Create the new item
    const newItemRef = doc(inventoryRef); // Auto-generates a new ID
    const newItemData = {
      ...originalItem,
      id: newItemRef.id, // we will lose this ref but it's ok for now
      quantity: quantityToMove,
      status: newStatus,
      sales: [], // New item has no sales history
    };
    batch.set(newItemRef, newItemData);
  
    try {
      await batch.commit();
      toast({
        title: 'Stock Dividido',
        description: `${quantityToMove} cajones movidos a "${newStatus}". Quedan ${remainingQuantity} en "${originalItem.status}".`,
      });
    } catch (error) {
      console.error("Error splitting stock: ", error);
      toast({
        title: 'Error al dividir',
        description: 'No se pudo completar la operación. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    }
  };
  

  const handleRecordSale = async (itemId: string, quantity: number, salePrice: number, remainingQuantity: number) => {
     if (!user) return;
    const itemRef = doc(firestore, `users/${user.uid}/inventory`, itemId);
    const saleRecord = {
        quantity,
        salePrice,
        date: new Date().toISOString(),
    };
    await updateDoc(itemRef, {
        quantity: remainingQuantity,
        sales: arrayUnion(saleRecord),
    });
    toast({
        title: 'Venta Registrada',
        description: `Se vendieron ${quantity} cajones a $${salePrice.toLocaleString()} cada uno.`,
    });
  }

  const isLoading =
    isUserLoading ||
    isLoadingProfile ||
    isLoadingInventory ||
    isLoadingProduces ||
    isLoadingPrices;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando perfil de usuario...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold">Mi Inventario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus compras, ventas y stock en tiempo real.
          </p>
        </div>
        <AddInventoryItemDialog products={aggregatedProducts} />
      </div>

      {inventoryWithData && inventoryWithData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {inventoryWithData.map((item) => (
            <InventoryCard 
                key={item.id} 
                item={item} 
                onDeleteItem={handleDeleteItem}
                onSplitStock={handleSplitStock}
                onRecordSale={handleRecordSale}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
          <h3 className="text-xl font-semibold">Tu inventario está vacío</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Comienza por registrar tu primera compra de mercadería.
          </p>
          <AddInventoryItemDialog
            products={aggregatedProducts}
            buttonVariant="default"
          >
            <PlusCircle className="mr-2" />
            Registrar Primera Compra
          </AddInventoryItemDialog>
        </div>
      )}
    </div>
  );
}
