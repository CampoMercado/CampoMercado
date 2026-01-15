'use client';

import { useEffect, useState } from 'react';
import { useRouter }from 'next/navigation';
import { useUser } from '@/firebase';
import { Header } from '@/components/header';
import { LoadingSkeleton } from '@/components/loading-skeleton';

// This is a simplified check. For a real app, you'd use custom claims.
const ADMIN_EMAILS = ['ignacioenriquearra@campo-mercado.com'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear());
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (isUserLoading) return; // Wait until user status is resolved

    if (!user) {
      router.push('/login'); // Not logged in, redirect
    } else {
      const authorized = ADMIN_EMAILS.includes(user.email || '');
      setIsAuthorized(authorized);
    }
  }, [user, isUserLoading, router]);
  
  // Show loading skeleton while checking auth
  if (isUserLoading || !user) {
    return <LoadingSkeleton />;
  }

  // Show unauthorized message if not an admin
  if (!isAuthorized) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container py-8">
                <h1 className="text-4xl font-headline font-bold">Acceso Denegado</h1>
                <p className="text-muted-foreground mt-1">
                    No tienes permisos para acceder a esta sección.
                </p>
            </main>
             <footer className="container py-6 text-center text-muted-foreground text-sm">
                {`© ${year} Campo Mercado.`}
            </footer>
        </div>
    )
  }

  // Render admin content if authorized
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold">
            Panel de Administrador
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestionar productos y precios de Campo Mercado
          </p>
        </div>
        {children}
      </main>
      <footer className="container py-6 text-center text-muted-foreground text-sm">
        {`© ${year} Campo Mercado.`}
      </footer>
    </div>
  );
}
