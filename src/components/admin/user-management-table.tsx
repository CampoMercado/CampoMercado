'use client';

import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type UserManagementTableProps = {
  users: UserProfile[];
  isLoading: boolean;
};

// This is a simplified check. For a real app, you'd use custom claims.
const ADMIN_EMAILS = ['ignacioenriquearra@campo-mercado.com'];

export function UserManagementTable({ users, isLoading }: UserManagementTableProps) {
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="hidden md:table-cell">User ID</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isAdmin = ADMIN_EMAILS.includes(user.email);
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Badge variant="default" className="bg-accent text-accent-foreground">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Usuario</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono text-xs">{user.id}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(user.id);
                          toast({ title: 'Copiado', description: 'User ID copiado al portapapeles.' });
                        }}
                      >
                        Copiar User ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>Editar Usuario</DropdownMenuItem>
                      <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
                        Eliminar Usuario
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
