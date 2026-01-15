
'use client';

import { doc, setDoc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building, Handshake, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OwnStallDashboard } from '@/components/dashboard/own-stall-dashboard';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const {
    data: userProfile,
    isLoading: isProfileLoading,
  } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
        router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSelectDashboardType = async (type: 'own_stall' | 'third_party') => {
    if (!userProfileRef) return;
    try {
      await setDoc(userProfileRef, { dashboardType: type }, { merge: true });
    } catch (error) {
      console.error('Error updating dashboard type: ', error);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If profile exists and has a dashboard type, show the dashboard.
  if (userProfile?.dashboardType) {
    if (userProfile.dashboardType === 'own_stall') {
      return <OwnStallDashboard />;
    }
    if (userProfile.dashboardType === 'third_party') {
      return (
        <div>
          <p>Dashboard: Comprar y Vender (Tercerizado)</p>
          {/* Third party components will go here */}
        </div>
      );
    }
  }

  // If no dashboard type is set, show the selection UI.
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">¡Bienvenido a su Dashboard!</CardTitle>
          <CardDescription>
            Para comenzar, por favor elija cómo va a operar en el mercado. Esta
            opción configurará su panel de gestión.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div
            className="p-6 border rounded-lg hover:bg-muted/50 cursor-pointer flex flex-col items-center"
            onClick={() => handleSelectDashboardType('own_stall')}
          >
            <Building className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Gestionar mi Propio Puesto
            </h3>
            <p className="text-sm text-muted-foreground">
              Ideal si tiene un puesto físico en el mercado y quiere gestionar su
              propio inventario, ventas y precios.
            </p>
          </div>
          <div
            className="p-6 border rounded-lg hover:bg-muted/50 cursor-pointer flex flex-col items-center"
            onClick={() => handleSelectDashboardType('third_party')}
          >
            <Handshake className="h-12 w-12 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Comprar y Vender (Tercerizado)
            </h3>
            <p className="text-sm text-muted-foreground">
              Perfecto si opera comprando productos de diferentes puestos para
              revender, gestionando stock distribuido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
