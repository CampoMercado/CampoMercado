'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Stall, Product, TickerProduct } from '@/lib/types';
import { mockStalls } from '@/lib/data.tsx';
import { Header } from '@/components/header';
import { PriceTicker, TopMoversTicker } from '@/components/price-ticker';
import { ProductCard } from '@/components/product-card';
import { SeasonalAvailability } from '@/components/seasonal-availability';
import { BrokerChart } from '@/components/broker-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WelcomeTerminal } from '@/components/welcome-terminal';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MarketSummary } from '@/components/market-summary';
import { MarketStatus } from '@/components/market-status';
import { HistoricalView } from '@/components/historical-view';

type View = 'prices' | 'chart' | 'summary' | 'availability' | 'history';

export default function Home() {
  const [stalls] = useState<Stall[]>(mockStalls);
  const [activeView, setActiveView] = useState<View>('prices');
  const [appState, setAppState] = useState('welcome'); // 'welcome', 'loading', 'ready'
  const [marketOpen, setMarketOpen] = useState(true); // Default to open, will be updated
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);


  useEffect(() => {
    const welcomeShown = sessionStorage.getItem('welcomeShown');
    if (welcomeShown) {
      setAppState('loading');
      const loadingTimer = setTimeout(() => {
        setAppState('ready');
      }, 5000); // 5s loading

      return () => {
        clearTimeout(loadingTimer);
      };
    } else {
      const welcomeTimer = setTimeout(() => {
        sessionStorage.setItem('welcomeShown', 'true');
        setAppState('loading');
      }, 2500); // Sync with welcome animation

      const loadingTimer = setTimeout(() => {
        setAppState('ready');
      }, 7500); // 2.5s (welcome) + 5s (loading)

      return () => {
        clearTimeout(welcomeTimer);
        clearTimeout(loadingTimer);
      };
    }
  }, []);

  const { allProducts, aggregatedProducts } = useMemo(() => {
    const allProducts: TickerProduct[] = stalls.flatMap((stall) =>
      stall.products.map((p) => ({
        ...p,
        stallName: stall.name,
        stallNumber: stall.number,
      }))
    );

    const productGroups = allProducts.reduce((acc, product) => {
      const key = `${product.name}-${product.variety}`;
      if (!acc[key]) {
        acc[key] = {
          id: key, // Create a stable ID
          name: product.name,
          variety: product.variety,
          category: product.category,
          priceHistory: [],
          sourceStalls: [],
        };
      }
      acc[key].sourceStalls.push(product);
      return acc;
    }, {} as Record<string, Product & { sourceStalls: TickerProduct[] }>);

    const aggregatedProducts = Object.values(productGroups).map((group) => {
      // A more robust aggregation for history: average prices per day
      const historyByDate: Record<string, number[]> = {};
      group.sourceStalls.forEach((p) => {
        p.priceHistory.forEach((h) => {
          const date = new Date(h.date).toISOString().split('T')[0];
          if (!historyByDate[date]) historyByDate[date] = [];
          historyByDate[date].push(h.price);
        });
      });

      const aggregatedHistory = Object.entries(historyByDate)
        .map(([date, prices]) => ({
          date: new Date(date).toISOString(),
          price: prices.reduce((a, b) => a + b, 0) / prices.length,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        ...group,
        priceHistory: aggregatedHistory,
      };
    });

    return { allProducts, aggregatedProducts };
  }, [stalls]);
  
  useEffect(() => {
    if (appState !== 'ready' || aggregatedProducts.length === 0) {
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      setHighlightedProductId(aggregatedProducts[currentIndex].id);
      currentIndex = (currentIndex + 1) % aggregatedProducts.length;
    }, 1500);

    return () => clearInterval(interval);
  }, [appState, aggregatedProducts]);


  const TabButton = ({
    view,
    children,
  }: {
    view: View;
    children: React.ReactNode;
  }) => (
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

  const StallsDisplay = ({
    products,
    allProducts,
  }: {
    products: Product[];
    allProducts: TickerProduct[];
  }) => (
    <div className="border border-green-800/50 rounded-lg bg-black/30 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-green-800/50 hover:bg-gray-900/50 text-xs uppercase">
              <TableHead className="text-green-300 px-2">Producto</TableHead>
              <TableHead className="text-right text-green-300 px-2">
                Último Precio
              </TableHead>
              <TableHead className="text-right text-green-300 px-2 w-[100px]">
                Var.
              </TableHead>
              <TableHead className="text-green-300 px-2 w-[160px] hidden md:table-cell">
                Análisis
              </TableHead>
              <TableHead className="text-green-300 px-2 w-[160px] hidden lg:table-cell">
                Mercado
              </TableHead>
              <TableHead className="w-[120px] hidden sm:table-cell py-3 px-2 text-center text-green-300">Actividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                marketProducts={allProducts}
                marketOpen={marketOpen}
                isHighlighted={highlightedProductId === product.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (appState === 'welcome') {
    return <WelcomeTerminal />;
  }

  if (appState === 'loading') {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-green-400 animate-fade-in">
      <Header />
      <PriceTicker products={allProducts} />
      <TopMoversTicker products={aggregatedProducts} />

      <main className="flex-grow container py-8 space-y-8">
        <div>
          <div className="mb-6">
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                 <h1 className="text-4xl lg:text-6xl font-headline tracking-widest text-green-300">
                    MERCADO DIARIO
                 </h1>
                 <MarketStatus onStatusChange={setMarketOpen} />
            </div>
            <p className="text-green-500 mt-2 text-sm tracking-wider">
              MERCADO COOPERATIVO DE GUYAMALLÉN
            </p>
          </div>

          <div className="border-b border-green-800/50 mb-6">
            <div className="flex items-center space-x-2 flex-wrap">
              <TabButton view="prices">Precios</TabButton>
              <TabButton view="chart">Gráfico de Mercado</TabButton>
              <TabButton view="summary">Resumen del Mercado</TabButton>
              <TabButton view="availability">Disponibilidad</TabButton>
              <TabButton view="history">Históricos</TabButton>
            </div>
          </div>

          {activeView === 'prices' && (
            <StallsDisplay
              products={aggregatedProducts}
              allProducts={allProducts}
            />
          )}
          {activeView === 'chart' && <BrokerChart products={aggregatedProducts} />}
          {activeView === 'summary' && <MarketSummary stalls={stalls} />}
          {activeView === 'availability' && <SeasonalAvailability />}
          {activeView === 'history' && <HistoricalView products={aggregatedProducts} />}
        </div>
      </main>

      <footer className="container py-6 text-center text-green-600/50 text-xs">
        © {new Date().getFullYear()} CAMPO MERCADO. TODOS LOS DERECHOS
        RESERVADOS.
      </footer>
    </div>
  );
}
