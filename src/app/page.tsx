'use client';

import { useState, useMemo } from 'react';
import type { Stall, Product } from '@/lib/types';
import { mockStalls } from '@/lib/data.tsx';
import { Header } from '@/components/header';
import { PriceTicker, TopMoversTicker } from '@/components/price-ticker';
import { StallsDisplay } from '@/components/stalls-display';
import { MarketAnalysis } from '@/components/market-analysis';
import { SectorAnalysis } from '@/components/sector-analysis';
import { BrokerChart } from '@/components/broker-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type View = 'prices' | 'summary' | 'sector' | 'chart';

export default function Home() {
  const [stalls] = useState<Stall[]>(mockStalls);
  const [activeView, setActiveView] = useState<View>('prices');

  const { allProducts, aggregatedProducts } = useMemo(() => {
    const allProducts = stalls.flatMap(stall =>
      stall.products.map(p => ({
        ...p,
        stallName: stall.name,
        stallNumber: stall.number,
      }))
    );

    const productGroups = allProducts.reduce((acc, product) => {
      const key = `${product.name}-${product.variety}`;
      if (!acc[key]) {
        acc[key] = {
          ...product,
          priceHistory: [], // Will be aggregated
          sourceStalls: [],
        };
      }
      acc[key].sourceStalls.push(product);
      return acc;
    }, {} as Record<string, Product & { sourceStalls: Product[] }>);
    
    const aggregatedProducts = Object.values(productGroups).map(group => {
      const latestPrices = group.sourceStalls.map(p => p.priceHistory.at(-1)?.price ?? 0).filter(p => p > 0);
      const latestPrice = latestPrices.reduce((a, b) => a + b, 0) / (latestPrices.length || 1);

      // A simple aggregation for history: average prices per day
      const historyByDate: Record<string, number[]> = {};
      group.sourceStalls.forEach(p => {
        p.priceHistory.forEach(h => {
          const date = new Date(h.date).toISOString().split('T')[0];
          if (!historyByDate[date]) historyByDate[date] = [];
          historyByDate[date].push(h.price);
        });
      });

      const aggregatedHistory = Object.entries(historyByDate).map(([date, prices]) => ({
        date: new Date(date).toISOString(),
        price: prices.reduce((a, b) => a + b, 0) / prices.length,
      })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return {
        ...group,
        priceHistory: aggregatedHistory,
      };
    });

    return { allProducts, aggregatedProducts };
  }, [stalls]);

  const TabButton = ({ view, children }: { view: View; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => setActiveView(view)}
      className={cn(
        'text-green-400 hover:bg-green-900 hover:text-green-200 text-sm md:text-base px-2 md:px-4',
        activeView === view && 'bg-green-800/80 text-green-100'
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-green-400">
      <Header />
      <PriceTicker products={allProducts} />
      <TopMoversTicker products={allProducts} />

      <main className="flex-grow container py-8 space-y-8">
        <div>
          <div className="mb-6">
            <h1 className="text-4xl lg:text-6xl font-headline tracking-widest text-green-300">
              MERCADO DIARIO
            </h1>
            <p className="text-green-500 mt-2 text-sm tracking-wider">
              MERCADO COOPERATIVO DE GUAYMALLÉN
            </p>
          </div>
          
          <div className="border-b border-green-800/50 mb-6">
             <div className="flex items-center space-x-2">
                <TabButton view="prices">Precios</TabButton>
                <TabButton view="chart">Gráfico de Mercado</TabButton>
                <TabButton view="summary">Resumen del Mercado</TabButton>
                <TabButton view="sector">Análisis por Sector</TabButton>
             </div>
          </div>
          
          {activeView === 'prices' && <StallsDisplay products={aggregatedProducts} allProducts={allProducts} />}
          {activeView === 'chart' && <BrokerChart products={aggregatedProducts} />}
          {activeView === 'summary' && <MarketAnalysis stalls={stalls} />}
          {activeView === 'sector' && <SectorAnalysis stalls={stalls} />}
        </div>
      </main>

      <footer className="container py-6 text-center text-green-600/50 text-xs">
        © {new Date().getFullYear()} CUYOCROPS. TODOS LOS DERECHOS RESERVADOS.
      </footer>
    </div>
  );
}
