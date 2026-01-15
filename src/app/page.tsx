'use client';

import { useState } from 'react';
import type { Stall } from '@/lib/types';
import { mockStalls } from '@/lib/data.tsx';
import { Header } from '@/components/header';
import { PriceTicker } from '@/components/price-ticker';
import { StallsDisplay } from '@/components/stalls-display';
import { MarketAnalysis } from '@/components/market-analysis';
import { SectorAnalysis } from '@/components/sector-analysis';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [stalls, setStalls] = useState<Stall[]>(mockStalls);

  const allProducts = stalls.flatMap(stall =>
    stall.products.map(p => ({
      ...p,
      stallName: stall.name,
      stallNumber: stall.number,
    }))
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-green-400">
      <Header />
      <PriceTicker products={allProducts} />

      <main className="flex-grow container py-8 space-y-12">
        <div>
          <div className="mb-8">
            <h1 className="text-4xl lg:text-6xl font-headline tracking-widest text-green-300">
              MERCADO DIARIO
            </h1>
            <p className="text-green-500 mt-2 text-sm tracking-wider">
              MERCADO COOPERATIVO DE GUAYMALLÉN
            </p>
          </div>
          <StallsDisplay stalls={stalls} allProducts={allProducts} />
        </div>

        <Separator className="bg-green-800/50" />

        <MarketAnalysis stalls={stalls} />

        <Separator className="bg-green-800/50" />

        <SectorAnalysis stalls={stalls} />
      </main>

      <footer className="container py-6 text-center text-green-600/50 text-xs">
        © {new Date().getFullYear()} CUYOCROPS. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}
