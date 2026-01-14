'use client';

import { useState } from 'react';
import type { Stall, NewsArticle } from '@/lib/types';
import { mockStalls, mockNews } from '@/lib/data.tsx';
import { Header } from '@/components/header';
import { PriceTicker } from '@/components/price-ticker';
import { StallsDisplay } from '@/components/stalls-display';
import { MarketAnalysis } from '@/components/market-analysis';
import { MarketNews } from '@/components/market-news';
import { SectorAnalysis } from '@/components/sector-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [stalls, setStalls] = useState<Stall[]>(mockStalls);
  const [news, setNews] = useState<NewsArticle[]>(mockNews);

  const allProducts = stalls.flatMap(stall =>
    stall.products.map(p => ({
      ...p,
      stallName: stall.name,
      stallNumber: stall.number,
    }))
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

        <Tabs defaultValue="market">
          <TabsList className="mb-4">
            <TabsTrigger value="market">Mercado Diario</TabsTrigger>
            <TabsTrigger value="analysis">Análisis de Mercado</TabsTrigger>
            <TabsTrigger value="sectors">Análisis Sectorial</TabsTrigger>
            <TabsTrigger value="news">Noticias del Mercado</TabsTrigger>
          </TabsList>
          <TabsContent value="market">
            <StallsDisplay stalls={stalls} allProducts={allProducts} />
          </TabsContent>
          <TabsContent value="analysis">
            <MarketAnalysis stalls={stalls} />
          </TabsContent>
          <TabsContent value="sectors">
            <SectorAnalysis products={allProducts} />
          </TabsContent>
          <TabsContent value="news">
            <MarketNews news={news} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container py-6 text-center text-green-600 text-xs">
        © {new Date().getFullYear()} CUYOCROPS. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}
