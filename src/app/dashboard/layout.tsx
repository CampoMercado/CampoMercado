'use client';

import { useEffect, useState }from 'react';
import { Header } from '@/components/header';
import { PriceTicker, TopMoversTicker, PricePerKgTicker } from '@/components/price-ticker';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="container py-6 text-center text-muted-foreground text-sm">
        {`© ${year} Campo Mercado.`}
      </footer>
    </div>
  );
}
