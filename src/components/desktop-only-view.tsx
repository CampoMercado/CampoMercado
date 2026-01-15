'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { Laptop } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function DesktopOnlyView({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatch
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="text-center">
          <Laptop className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-6 text-2xl font-bold font-headline">
            Experiencia Optimizada para Escritorio
          </h1>
          <p className="mt-2 text-muted-foreground">
            Por el momento, la experiencia completa de Campo Mercado está diseñada para computadoras de escritorio.
          </p>
          <p className="mt-2 text-muted-foreground">
            Por favor, visita nuestro sitio desde una computadora para acceder a todas las funcionalidades.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
