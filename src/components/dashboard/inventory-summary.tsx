'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  InventoryItemWithProduct,
  InventorySummaryData,
  Sale,
} from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDown, ArrowUp, Minus, TrendingUp, Banknote, Package, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const SummaryStat = ({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  className?: string;
}) => {
  const Icon = icon;
  return (
    <div className="flex items-start gap-4">
      <div className="bg-muted p-3 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={cn('text-2xl font-bold font-mono', className)}>
          {value}
        </p>
      </div>
    </div>
  );
};

export function InventorySummary({
  inventory,
}: {
  inventory: InventoryItemWithProduct[];
}) {
  const summary = useMemo((): InventorySummaryData | null => {
    if (!inventory || inventory.length === 0) {
      return null;
    }

    let totalInvested = 0;
    let totalMarketValue = 0;
    const stockByLocation: { [key: string]: { quantity: number; value: number } } = {};
    const recentSales: (Sale & { productName: string })[] = [];

    inventory.forEach((item) => {
      if (!item.produce) return;

      const purchaseValue = item.purchasePrice * item.quantity;
      const marketPrice = item.produce.priceHistory[0]?.price || 0;
      const marketValue = marketPrice * item.quantity;

      totalInvested += purchaseValue;
      totalMarketValue += marketValue;
      
      if (!stockByLocation[item.status]) {
        stockByLocation[item.status] = { quantity: 0, value: 0 };
      }
      stockByLocation[item.status].quantity += item.quantity;
      stockByLocation[item.status].value += purchaseValue;

      if (item.sales) {
        item.sales.forEach(sale => {
            recentSales.push({
                ...sale,
                productName: `${item.produce?.name} (${item.produce?.variety})`,
            });
        });
      }
    });

    const totalPnl = totalMarketValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    
    recentSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      totalInvested,
      totalMarketValue,
      totalPnl,
      totalPnlPercent,
      stockByLocation: Object.entries(stockByLocation).map(([name, data]) => ({name, ...data})),
      recentSales: recentSales.slice(0, 5),
    };
  }, [inventory]);

  if (!summary) {
    return null;
  }

  const {
    totalInvested,
    totalMarketValue,
    totalPnl,
    totalPnlPercent,
    stockByLocation,
    recentSales
  } = summary;

  const isUp = totalPnl > 0;
  const isDown = totalPnl < 0;
  const pnlColor = isUp ? 'text-success' : isDown ? 'text-danger' : 'text-muted-foreground';
  const PnlIcon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Análisis General del Inventario</CardTitle>
        <CardDescription>
          Un resumen consolidado de tu posición actual en el mercado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-foreground">
          <SummaryStat 
            icon={Banknote}
            title="Capital Invertido"
            value={`$${totalInvested.toLocaleString()}`}
          />
           <SummaryStat 
            icon={Landmark}
            title="Valor de Mercado"
            value={`$${totalMarketValue.toLocaleString()}`}
          />
           <SummaryStat 
            icon={TrendingUp}
            title="G/P Potencial Total"
            value={`$${totalPnl.toLocaleString()}`}
            className={pnlColor}
          />
          <div className="flex items-start gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <PnlIcon className={cn("h-6 w-6", pnlColor)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retorno Potencial</p>
                <p className={cn('text-2xl font-bold font-mono', pnlColor)}>
                    {totalPnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
        </div>

        <Separator />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="text-muted-foreground" />
                    Stock por Ubicación
                 </h3>
                 <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ubicación / Estado</TableHead>
                                <TableHead className="text-right">Cajones</TableHead>
                                <TableHead className="text-right">Capital Invertido</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockByLocation.map(loc => (
                                <TableRow key={loc.name}>
                                    <TableCell className="font-medium">{loc.name}</TableCell>
                                    <TableCell className="text-right font-mono">{loc.quantity}</TableCell>
                                    <TableCell className="text-right font-mono">${loc.value.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </div>
             <div>
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Banknote className="text-muted-foreground" />
                    Ventas Recientes
                 </h3>
                 {recentSales.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSales.map(sale => (
                                    <TableRow key={sale.date}>
                                        <TableCell>
                                            <div className="font-medium">{sale.productName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {sale.quantity} cajones a ${sale.salePrice.toLocaleString()} c/u
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            +${(sale.quantity * sale.salePrice).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No se han registrado ventas.</p>
                 )}
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
