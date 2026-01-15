'use client';

import { useEffect } from 'react';
import { useRouter }from 'next/navigation';
import { useUser } from '@/firebase';
import { Header } from '@/components/header';
import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading || !user) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold">
            Panel de Administrador
          </h1>
          <p className="text-muted-foreground">
            Gestionar productos y precios de Campo Mercado
          </p>
        </div>
        {children}
      </main>
      <footer className="container py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Campo Mercado.
      </footer>
    </div>
  );
}
