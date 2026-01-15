'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { InventoryItem, InventoryItemWithProduct, Sale } from '@/lib/types';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import {
  ArrowDown,
  ArrowUp,
  Minus,
  Package,
  MoreVertical,
  Trash2,
  Move,
  DollarSign,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

import { DeleteInventoryDialog } from './actions/delete-inventory-dialog';
import { MoveStockDialog } from './actions/move-stock-dialog';
import { RecordSaleDialog } from './actions/record-sale-dialog';
import { PriceChart } from '../price-chart';


type InventoryCardProps = {
  item: InventoryItemWithProduct;
  onDeleteItem: (itemId: string) => void;
  onSplitStock: (originalItem: InventoryItem, quantityToMove: number, newStatus: string) => void;
  onRecordSale: (itemId: string, quantity: number, salePrice: number, saleStatus: Sale['status'], remainingQuantity: number) => void;
};


const FinancialStat = ({ label, value, className }: { label: string; value: string; className?: string }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono font-medium", className)}>{value}</span>
    </div>
);


export function InventoryCard({ item, onDeleteItem, onSplitStock, onRecordSale }: InventoryCardProps) {
  const { produce, quantity, purchasePrice, purchaseDate, status } = item;
  
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isMoveOpen, setMoveOpen] = useState(false);
  const [isSaleOpen, setSaleOpen] = useState(false);

  const valuation = useMemo(() => {
    if (!produce || produce.priceHistory.length === 0) {
      return {
        marketPrice: 0,
        pnlPerUnit: 0,
        pnlTotal: 0,
        pnlPercent: 0,
      };
    }
    const marketPrice = produce.priceHistory[0].price;
    const pnlPerUnit = marketPrice - purchasePrice;
    const pnlTotal = pnlPerUnit * quantity;
    const pnlPercent = purchasePrice > 0 ? (pnlPerUnit / purchasePrice) * 100 : 0;

    return {
      marketPrice,
      pnlPerUnit,
      pnlTotal,
      pnlPercent,
    };
  }, [produce, quantity, purchasePrice]);

  const { marketPrice, pnlPerUnit, pnlTotal, pnlPercent } = valuation;

  if (!produce) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-destructive">
            Producto no encontrado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No se pudo encontrar la información para el producto con ID:{' '}
            {item.produceId}. Es posible que haya sido eliminado del mercado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isUp = pnlPerUnit > 0;
  const isDown = pnlPerUnit < 0;
  const pnlColor = isUp ? 'text-success' : isDown ? 'text-danger' : 'text-muted-foreground';
  const PnlIcon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <>
      <Card className="flex flex-col bg-card/80 hover:bg-card/100 hover:border-primary/50 transition-all duration-300 border overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-start pb-2">
            <div>
              <CardTitle className="text-base">{produce.name}</CardTitle>
              <CardDescription className='text-xs'>{produce.variety}</CardDescription>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSaleOpen(true)}>
                  <DollarSign className="mr-2" />
                  Registrar Venta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMoveOpen(true)}>
                  <Move className="mr-2" />
                  Mover / Dividir Stock
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2" />
                  Eliminar Lote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>
        
        <CardContent className="grid grid-cols-5 gap-x-4 pt-2 pb-4">
            <div className="col-span-2 space-y-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{quantity}</span>
                    <span className="text-xs text-muted-foreground">cajones</span>
                </div>
                <Badge variant="outline" className="w-fit text-xs">{status}</Badge>
                <p className='text-xs text-muted-foreground pt-1'>
                    Comprado: {format(new Date(purchaseDate), 'P', { locale: es })}
                </p>
            </div>
            <div className="col-span-3 space-y-1.5">
                <FinancialStat 
                    label="Tu Precio Compra" 
                    value={`$${purchasePrice.toLocaleString()}`}
                />
                <FinancialStat 
                    label="Precio Mercado" 
                    value={`$${marketPrice.toLocaleString()}`}
                />
                <Separator className="my-1.5"/>
                <FinancialStat 
                    label="G/P Unitario" 
                    value={`$${pnlPerUnit.toLocaleString()}`}
                    className={pnlColor}
                />
                 <FinancialStat 
                    label="G/P Total" 
                    value={`$${pnlTotal.toLocaleString()}`}
                    className={cn("font-bold", pnlColor)}
                />
            </div>
        </CardContent>

        <CardFooter className="p-0 mt-auto">
            <div className="relative w-full h-[60px]">
                 <div className="absolute top-2 right-2 z-10 font-mono text-lg font-bold flex items-center gap-1" style={{ textShadow: '1px 1px 3px black' }}>
                    <PnlIcon size={16} className={pnlColor} />
                    <span className={pnlColor}>{pnlPercent.toFixed(1)}%</span>
                </div>
                {produce.priceHistory.length > 1 && (
                    <PriceChart product={produce} simple />
                )}
            </div>
        </CardFooter>
      </Card>
      
      <DeleteInventoryDialog
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => onDeleteItem(item.id)}
        productName={`${produce.name} (${produce.variety})`}
      />

      <MoveStockDialog
        isOpen={isMoveOpen}
        onClose={() => setMoveOpen(false)}
        onConfirm={(quantityToMove, newStatus) => onSplitStock(item, quantityToMove, newStatus)}
        productName={`${produce.name} (${produce.variety})`}
        maxQuantity={item.quantity}
      />

       <RecordSaleDialog
        isOpen={isSaleOpen}
        onClose={() => setSaleOpen(false)}
        onConfirm={(quantity, salePrice, saleStatus) => onRecordSale(item.id, quantity, salePrice, saleStatus, item.quantity - quantity)}
        item={item}
      />
    </>
  );
}
