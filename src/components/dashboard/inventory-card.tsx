'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { InventoryItemWithProduct } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowDown, ArrowUp, Minus, Package, Tag, TrendingUp, Wallet } from 'lucide-react';
import { Separator } from '../ui/separator';

type InventoryCardProps = {
  item: InventoryItemWithProduct;
};

const Stat = ({
  icon: Icon,
  label,
  value,
  className,
  tooltip,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
  tooltip?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={cn('text-sm font-semibold', className)}>{value}</div>
          </div>
        </div>
      </TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

export function InventoryCard({ item }: InventoryCardProps) {
  const { produce, quantity, purchasePrice, purchaseDate, status } = item;

  const valuation = useMemo(() => {
    if (!produce || produce.priceHistory.length === 0) {
      return {
        marketPrice: 0,
        purchaseValue: 0,
        marketValue: 0,
        potentialPnl: 0,
        potentialPnlPercent: 0,
      };
    }
    const marketPrice = produce.priceHistory[0].price;
    const purchaseValue = purchasePrice * quantity;
    const marketValue = marketPrice * quantity;
    const potentialPnl = marketValue - purchaseValue;
    const potentialPnlPercent = purchaseValue > 0 ? (potentialPnl / purchaseValue) * 100 : 0;
    
    return { marketPrice, purchaseValue, marketValue, potentialPnl, potentialPnlPercent };
  }, [produce, quantity, purchasePrice]);
  
  const { marketValue, purchaseValue, potentialPnl, potentialPnlPercent } = valuation;

  if (!produce) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-destructive">Producto no encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No se pudo encontrar la información para el producto con ID: {item.produceId}. Es posible que haya sido eliminado del mercado.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const isUp = potentialPnl > 0;
  const isDown = potentialPnl < 0;
  const pnlColor = isUp ? 'text-success' : isDown ? 'text-danger' : 'text-muted-foreground';
  const PnlIcon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <Card className="flex flex-col bg-card/80 hover:bg-card/100 hover:border-primary/50 transition-all duration-300 border">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-lg">{produce.name}</CardTitle>
                <CardDescription>{produce.variety}</CardDescription>
            </div>
            <Badge variant="outline">{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <Stat
          icon={Package}
          label="Stock"
          value={`${quantity} cajones`}
          tooltip={`Comprado el ${format(new Date(purchaseDate), 'PPP', { locale: es })}`}
        />
        <Stat
          icon={Tag}
          label="Valor de Compra"
          value={`$${purchaseValue.toLocaleString()}`}
          tooltip={`$${purchasePrice.toLocaleString()} por cajón`}
        />
        <Stat
          icon={Wallet}
          label="Valor de Mercado"
          value={`$${marketValue.toLocaleString()}`}
           tooltip={`$${(produce.priceHistory[0]?.price ?? 0).toLocaleString()} precio de mercado actual por cajón`}
        />
      </CardContent>
      <CardFooter className="flex-col items-start pt-4 border-t mt-auto bg-muted/30">
        <div className="flex justify-between items-center w-full">
            <div className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                G/P Potencial
            </div>
             <div className={cn("text-right font-mono", pnlColor)}>
                <div className="font-bold text-lg flex items-center justify-end gap-1">
                    <PnlIcon size={16} />
                    {potentialPnlPercent.toFixed(1)}%
                </div>
                <div className="text-xs">
                    ${potentialPnl.toLocaleString()}
                </div>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
