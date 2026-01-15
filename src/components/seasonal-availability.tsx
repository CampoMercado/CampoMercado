'use client';

import { seasonalData } from '@/lib/seasonal-data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export function SeasonalAvailability() {
  const getStatusClass = (status: 'Alta' | 'Media' | 'Baja' | 'Importado') => {
    switch (status) {
      case 'Alta':
        return 'bg-success/20 text-success-foreground border-success/50';
      case 'Media':
        return 'bg-accent/20 text-accent-foreground border-accent/50';
      case 'Baja':
        return 'bg-destructive/20 text-destructive-foreground border-destructive/50';
      case 'Importado':
        return 'bg-primary/20 text-primary-foreground border-primary/50';
    }
  };

  return (
    <Card className="bg-black/30 border-green-800/50">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-green-200">
          Inteligencia de Mercado: Temporada y Disponibilidad
        </CardTitle>
        <CardDescription className="text-green-500/80">
          Análisis de la temporada de cosecha y disponibilidad actual en el
          mercado de Mendoza.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden border-green-800/50">
          <Table>
            <TableHeader>
              <TableRow className="border-green-800/50 hover:bg-gray-900/50">
                <TableHead className="text-green-300">Producto</TableHead>
                <TableHead className="text-center text-green-300">
                  Disponibilidad
                </TableHead>
                <TableHead className="text-green-300">
                  Temporada de Cosecha
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasonalData.map((item) => (
                <TableRow
                  key={item.product}
                  className="border-green-900/50"
                >
                  <TableCell className="font-medium text-green-400">
                    {item.product}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        'text-xs font-bold',
                        getStatusClass(item.availability)
                      )}
                    >
                      {item.availability}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.season}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
