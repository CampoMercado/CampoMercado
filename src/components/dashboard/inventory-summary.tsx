'use client';

import { useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, TrendingUp, Banknote, Package, Landmark, Scale, FileClock, HandCoins, PiggyBank, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const SummaryStat = ({
  title,
  value,
  icon,
  className,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  className?: string;
  description?: string;
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
         {description && <p className="text-xs text-muted-foreground">{description}</p>}
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

    let currentInvestedCapital = 0;
    let currentStockValue = 0;
    let totalRevenue = 0;
    let accountsReceivable = 0;
    let costOfGoodsSold = 0;
    
    const stockByLocation: { [key: string]: { quantity: number; value: number } } = {};
    const recentSales: (Sale & { productName: string })[] = [];

    inventory.forEach((item) => {
      if (!item.produce) return;
      
      const totalAssociatedCostsPerUnit = (item.associatedCosts || []).reduce((acc, cost) => acc + cost.amount, 0);
      const totalPurchaseCostPerUnit = item.purchasePrice + totalAssociatedCostsPerUnit;

      // Metrics for current, unsold inventory
      const investedValueForLot = totalPurchaseCostPerUnit * item.quantity;
      const marketPrice = item.produce.priceHistory[0]?.price || 0;
      const marketValue = marketPrice * item.quantity;
      currentInvestedCapital += investedValueForLot;
      currentStockValue += marketValue;
      
      // Group stock by location/status
      if (!stockByLocation[item.status]) {
        stockByLocation[item.status] = { quantity: 0, value: 0 };
      }
      stockByLocation[item.status].quantity += item.quantity;
      stockByLocation[item.status].value += investedValueForLot;

      // Metrics for sold inventory
      if (item.sales) {
        item.sales.forEach(sale => {
            const saleTotal = sale.quantity * sale.salePrice;
            costOfGoodsSold += sale.quantity * totalPurchaseCostPerUnit;

            if (sale.status === 'Pagado') {
                totalRevenue += saleTotal;
            } else {
                accountsReceivable += saleTotal;
            }
            
            recentSales.push({
                ...sale,
                productName: `${item.produce?.name} (${item.produce?.variety})`,
            });
        });
      }
    });

    const unrealizedPnl = currentStockValue - currentInvestedCapital;
    const unrealizedPnlPercent = currentInvestedCapital > 0 ? (unrealizedPnl / currentInvestedCapital) * 100 : 0;
    
    const grossProfit = totalRevenue - costOfGoodsSold;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    recentSales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      currentInvestedCapital,
      currentStockValue,
      unrealizedPnl,
      unrealizedPnlPercent,
      totalRevenue,
      accountsReceivable,
      costOfGoodsSold,
      grossProfit,
      grossProfitMargin,
      stockByLocation: Object.entries(stockByLocation).map(([name, data]) => ({name, ...data})),
      recentSales: recentSales.slice(0, 5),
    };
  }, [inventory]);

  if (!summary) {
    return null;
  }

  const {
    currentInvestedCapital,
    currentStockValue,
    unrealizedPnl,
    unrealizedPnlPercent,
    totalRevenue,
    accountsReceivable,
    costOfGoodsSold,
    grossProfit,
    grossProfitMargin,
    stockByLocation,
    recentSales
  } = summary;

  const isUnrealizedUp = unrealizedPnl > 0;
  const unrealizedPnlColor = isUnrealizedUp ? 'text-success' : 'text-danger';
  
  const isGrossProfitUp = grossProfit > 0;
  const grossProfitColor = isGrossProfitUp ? 'text-success' : 'text-danger';

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Análisis General del Inventario</CardTitle>
        <CardDescription>
          Un resumen consolidado de tu posición actual en el mercado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-12">
        
        <div>
            <h3 className="text-lg font-semibold mb-6 text-primary flex items-center gap-2">
                <PiggyBank />
                Análisis de Rentabilidad (Ventas Realizadas)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 text-foreground">
                <SummaryStat 
                    icon={CircleDollarSign}
                    title="Ingresos Totales"
                    value={`$${totalRevenue.toLocaleString()}`}
                    description="Dinero recibido de ventas pagadas."
                />
                <SummaryStat 
                    icon={FileClock}
                    title="Cuentas por Cobrar"
                    value={`$${accountsReceivable.toLocaleString()}`}
                    description="Dinero pendiente de ventas a consignación."
                />
                <SummaryStat 
                    icon={Scale}
                    title="Costo de Ventas (CMV)"
                    value={`$${costOfGoodsSold.toLocaleString()}`}
                    description="Costo de la mercadería vendida."
                />
                <SummaryStat 
                    icon={HandCoins}
                    title="Ganancia Bruta"
                    value={`$${grossProfit.toLocaleString()}`}
                    description={`${grossProfitMargin.toFixed(1)}% Margen`}
                    className={grossProfitColor}
                />
            </div>
        </div>

        <Separator />

        <div>
            <h3 className="text-lg font-semibold mb-6 text-primary flex items-center gap-2">
                <Landmark />
                Posición Actual del Inventario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 text-foreground">
                <SummaryStat 
                    icon={Banknote}
                    title="Capital Invertido"
                    value={`$${currentInvestedCapital.toLocaleString()}`}
                    description="Costo del stock sin vender."
                />
                <SummaryStat 
                    icon={TrendingUp}
                    title="Valor de Mercado"
                    value={`$${currentStockValue.toLocaleString()}`}
                    description="Valor del stock a precio de hoy."
                />
                <SummaryStat 
                    icon={isUnrealizedUp ? ArrowUp : ArrowDown}
                    title="G/P Potencial"
                    value={`$${unrealizedPnl.toLocaleString()}`}
                    description={`${unrealizedPnlPercent.toFixed(1)}% Retorno Potencial`}
                    className={unrealizedPnlColor}
                />
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
                                    <TableHead className="text-right">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSales.map((sale, index) => (
                                    <TableRow key={`${sale.date}-${index}`}>
                                        <TableCell>
                                            <div className="font-medium">{sale.productName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {sale.quantity} cajones a ${sale.salePrice.toLocaleString()} c/u
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            +${(sale.quantity * sale.salePrice).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={sale.status === 'Pagado' ? 'default' : 'secondary'}
                                                className={cn(sale.status === 'Pagado' && 'bg-success/80 text-success-foreground', sale.status === 'Pendiente' && 'bg-amber-600/80 text-amber-50')}>
                                                {sale.status}
                                            </Badge>
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
