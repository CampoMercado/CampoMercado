'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Produce, Price, AggregatedProduct } from '@/lib/types';
import { collection } from 'firebase/firestore';

import { Header } from '@/components/header';
import { PriceTicker, TopMoversTicker } from '@/components/price-ticker';
import { ProductCard } from '@/components/product-card';
import { SeasonalAvailability } from '@/components/seasonal-availability';
import { BrokerChart } from '@/components/broker-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  const firestore = useFirestore();
  const producesRef = useMemoFirebase(() => collection(firestore, 'produces'), [firestore]);
  const pricesRef = useMemoFirebase(() => collection(firestore, 'prices'), [firestore]);

  const { data: producesData, isLoading: isLoadingProduces } = useCollection<Produce>(producesRef);
  const { data: pricesData, isLoading: isLoadingPrices } = useCollection<Price>(pricesRef);

  const [activeView, setActiveView] = useState<View>('prices');
  const [appState, setAppState] = useState('loading'); // 'welcome', 'loading', 'ready'
  const [marketOpen, setMarketOpen] = useState(true); // Default to open, will be updated
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Simplified loading state management
    const loadingTimer = setTimeout(() => {
      setAppState('ready');
    }, 1500);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);
  
  const aggregatedProducts = useMemo((): AggregatedProduct[] => {
    if (!producesData || !pricesData) {
      return [];
    }

    const pricesByProduceId = pricesData.reduce((acc, price) => {
      if (!acc[price.produceId]) {
        acc[price.produceId] = [];
      }
      acc[price.produceId].push({ date: price.date, price: price.price });
      return acc;
    }, {} as Record<string, { date: string; price: number }[]>);

    return producesData.map((produce) => ({
      ...produce,
      priceHistory: (pricesByProduceId[produce.id] || []).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
  }, [producesData, pricesData]);


  useEffect(() => {
    if (appState !== 'ready' || aggregatedProducts.length === 0) {
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if(aggregatedProducts[currentIndex]) {
        setHighlightedProductId(aggregatedProducts[currentIndex].id);
        currentIndex = (currentIndex + 1) % aggregatedProducts.length;
      }
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
  }: {
    products: AggregatedProduct[];
  }) => (
    <div className="border border-green-800/50 rounded-lg bg-black/30 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-green-800/50 hover:bg-gray-900/50 text-xs uppercase">
              <TableHead className="text-green-300 px-4">Producto</TableHead>
              <TableHead className="text-right text-green-300 px-4">
                Último Precio
              </TableHead>
              <TableHead className="text-right text-green-300 px-4 w-[100px]">
                Var.
              </TableHead>
              <TableHead className="text-green-300 px-4 w-[160px] hidden md:table-cell">
                Análisis
              </TableHead>
              <TableHead className="text-green-300 px-4 w-[160px] hidden lg:table-cell">
                Mercado
              </TableHead>
              <TableHead className="w-[120px] hidden sm:table-cell py-3 px-4 text-center text-green-300">
                Actividad
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                marketProducts={products}
                marketOpen={marketOpen}
                isHighlighted={highlightedProductId === product.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  const isLoading = isLoadingProduces || isLoadingPrices;

  if (appState !== 'ready' || isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-green-400 animate-fade-in">
      <Header />
      <PriceTicker products={aggregatedProducts} />
      <TopMoversTicker products={aggregatedProducts} />

      <main className="flex-grow container py-6 md:py-8 space-y-8">
        <div>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-headline tracking-widest text-green-300">
                MERCADO DIARIO
              </h1>
              <MarketStatus onStatusChange={setMarketOpen} />
            </div>
            <p className="text-green-500 mt-2 text-sm tracking-wider">
              MERCADO COOPERATIVO DE GUYAMALLÉN
            </p>
          </div>

          <div className="border-b border-green-800/50 mb-6">
            <div className="flex items-center space-x-0 md:space-x-2 flex-wrap">
              <TabButton view="prices">Precios</TabButton>
              <TabButton view="chart">Gráfico</TabButton>
              <TabButton view="summary">Resumen</TabButton>
              <TabButton view="availability">Disponibilidad</TabButton>
              <TabButton view="history">Históricos</TabButton>
            </div>
          </div>

          {activeView === 'prices' && (
            <StallsDisplay products={aggregatedProducts} />
          )}
          {activeView === 'chart' && <BrokerChart products={aggregatedProducts} />}
          {activeView === 'summary' && <MarketSummary products={aggregatedProducts} />}
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
