'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type MoveStockDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: string) => void;
  currentStatus: string;
  productName: string;
};

export function MoveStockDialog({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  productName
}: MoveStockDialogProps) {
  const [newStatus, setNewStatus] = useState(currentStatus);

  const handleConfirm = () => {
    onConfirm(newStatus);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover Stock: {productName}</DialogTitle>
          <DialogDescription>
            Actualiza la ubicación o estado de este lote de inventario.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="status">Nueva Ubicación / Estado</Label>
          <Input
            id="status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="Ej: Puesto 5, En Tránsito, etc."
            className="mt-2"
          />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>Mover Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
