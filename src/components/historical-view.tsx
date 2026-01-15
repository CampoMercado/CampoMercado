'use client';
import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

import type { Product, PriceHistory } from '@/lib/types';
import { specialDates } from '@/lib/special-dates';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, History } from 'lucide-react';

export function HistoricalView({ products }: { products: Product[] }) {
  const specialDatesPrices = useMemo(() => {
    return specialDates.map((specialDate) => {
      const targetDate = new Date(specialDate.date);
      const prices = products
        .map((product) => {
          // Find the price entry for that specific day
          const priceEntry = product.priceHistory.find((h) =>
            isSameDay(new Date(h.date), targetDate)
          );
          return priceEntry
            ? {
                name: `${product.name} (${product.variety})`,
                price: priceEntry.price,
              }
            : null;
        })
        .filter(Boolean) as { name: string; price: number }[];

      return {
        ...specialDate,
        prices,
      };
    });
  }, [products]);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-headline text-green-300 flex items-center gap-3">
            <History className="h-8 w-8" />
            Historial de Precios
        </h2>
        <p className="text-muted-foreground mt-2">
          Consulta el historial de precios completo para cada producto del mercado.
        </p>
        <Accordion type="single" collapsible className="w-full mt-6">
          {products.map((product) => (
            <AccordionItem key={product.id} value={product.id} className="border-b-green-900/50">
              <AccordionTrigger className="hover:no-underline text-green-300">
                <div className="flex flex-col text-left">
                  <span className='text-base'>{product.name}</span>
                  <span className='text-xs text-muted-foreground'>{product.variety}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Table className="bg-black/20 rounded-md">
                  <TableHeader>
                    <TableRow className="border-green-800/50">
                      <TableHead className="text-green-300">Fecha</TableHead>
                      <TableHead className="text-right text-green-300">Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...product.priceHistory].reverse().map((entry) => (
                      <TableRow key={entry.date} className="border-green-900/30">
                        <TableCell>
                          {format(new Date(entry.date), 'Pp', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${entry.price.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div>
        <h2 className="text-3xl font-headline text-green-300 flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Análisis de Fechas Especiales
        </h2>
        <p className="text-muted-foreground mt-2">
          Comportamiento de los precios durante eventos y fechas clave del año.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {specialDatesPrices.map((event) => (
            <Card key={event.name} className="bg-gray-900/50 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{event.name}</CardTitle>
                <CardDescription className="text-primary/70">
                  {format(new Date(event.date), 'PPP', { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.prices.length > 0 ? (
                    <Table>
                        <TableHeader>
                           <TableRow className="border-primary/20">
                             <TableHead className="text-primary/80">Producto</TableHead>
                             <TableHead className="text-right text-primary/80">Precio</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                            {event.prices.map(item => (
                                <TableRow key={item.name} className="border-primary/10">
                                    <TableCell className="text-sm text-green-400">{item.name}</TableCell>
                                    <TableCell className="text-right font-mono">${item.price.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No se encontraron datos de precios para esta fecha.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
