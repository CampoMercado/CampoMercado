'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { UserProfile, InventoryItem, Produce, AggregatedProduct } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const inventoryRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/inventory`) : null),
    [firestore, user]
  );
  const { data: inventory, isLoading: isLoadingInventory } = useCollection<InventoryItem>(inventoryRef);

  const producesRef = useMemoFirebase(() => user ? collection(firestore, 'produces') : null, [firestore, user]);
  const { data: produces, isLoading: isLoadingProduces } = useCollection<Produce>(producesRef);


  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  // Once we implement adding items, we will build this table out.
  const inventoryWithData = inventory?.map(item => {
    const produceInfo = produces?.find(p => p.id === item.produceId);
    return {
      ...item,
      name: produceInfo?.name || 'Desconocido',
      variety: produceInfo?.variety || '',
    }
  });

  const isLoading = isLoadingInventory || isLoadingProduces;

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mi Inventario</CardTitle>
          <Button>
            <PlusCircle className="mr-2" />
            Registrar Compra
          </Button>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Stock (Cajones)</TableHead>
                  <TableHead>Precio de Compra</TableHead>
                  <TableHead>Valor de Stock</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando inventario...
                    </TableCell>
                  </TableRow>
                ) : inventoryWithData && inventoryWithData.length > 0 ? (
                  inventoryWithData.map(item => (
                     <TableRow key={item.id}>
                        <TableCell>{item.name} ({item.variety})</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell>${(item.quantity * item.purchasePrice).toLocaleString()}</TableCell>
                        <TableCell>{/* Actions here */}</TableCell>
                     </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Aún no tienes items en tu inventario. ¡Registra tu primera compra!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
