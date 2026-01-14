'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { mockProducts } from '@/lib/data.tsx';
import { Header } from '@/components/header';
import { PriceTicker } from '@/components/price-ticker';
import { ProductTable } from '@/components/product-table';

export default function Home() {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <PriceTicker products={products} />

      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-headline font-bold tracking-widest">
            MERCADO DIARIO
          </h1>
          <p className="text-muted-foreground mt-2 font-mono">
            MERCADO COOPERATIVO DE GUAYMALLÉN
          </p>
        </div>
        <ProductTable products={products} />
      </main>

      <footer className="container py-6 text-center text-muted-foreground text-xs font-mono">
        © {new Date().getFullYear()} CUYOCROPS. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}
