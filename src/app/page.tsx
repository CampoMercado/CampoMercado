'use client';

import { useState } from 'react';
import type { Stall } from '@/lib/types';
import { mockStalls } from '@/lib/data.tsx';
import { Header } from '@/components/header';
import { PriceTicker } from '@/components/price-ticker';
import { StallsDisplay } from '@/components/stalls-display';
import { MarketAnalysis } from '@/components/market-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [stalls, setStalls] = useState<Stall[]>(mockStalls);

  const allProducts = stalls.flatMap(stall => 
    stall.products.map(p => ({...p, stallName: stall.name, stallNumber: stall.number}))
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-green-400 font-mono">
      <Header />
      <PriceTicker products={allProducts} />

      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-headline font-bold tracking-widest text-green-300">
            MERCADO DIARIO
          </h1>
          <p className="text-green-500 mt-2">
            MERCADO COOPERATIVO DE GUAYMALLÉN
          </p>
        </div>
        
        <Tabs defaultValue="stalls" className="text-green-400">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] bg-gray-900 border-green-500 border">
            <TabsTrigger value="stalls" className="data-[state=active]:bg-green-900 data-[state=active]:text-green-100">Puestos</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-green-900 data-[state=active]:text-green-100">Análisis de Mercado</TabsTrigger>
          </TabsList>
          <TabsContent value="stalls">
            <StallsDisplay stalls={stalls} />
          </TabsContent>
          <TabsContent value="analysis">
            <MarketAnalysis stalls={stalls} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container py-6 text-center text-green-600 text-xs">
        © {new Date().getFullYear()} CUYOCROPS. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}
