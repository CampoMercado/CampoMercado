'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { mockProducts } from '@/lib/data.tsx';
import { Header } from '@/components/header';
import { PriceTicker } from '@/components/price-ticker';
import { ProductCard } from '@/components/product-card';
import { PriceChart } from '@/components/price-chart';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Home() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleOpenChart = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseChart = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <PriceTicker products={products} />

      <main className="flex-grow container py-8">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl lg:text-5xl font-headline font-bold">
            Precios del Día
          </h1>
          <p className="text-muted-foreground mt-2">
            Mercado Cooperativo de Guaymallén
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenChart={handleOpenChart}
            />
          ))}
        </div>
      </main>

      <footer className="container py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} CuyoCrops. Todos los derechos reservados.
      </footer>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={(isOpen) => !isOpen && handleCloseChart()}
      >
        <DialogContent className="max-w-2xl p-4 sm:p-6">
          {selectedProduct && <PriceChart product={selectedProduct} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
