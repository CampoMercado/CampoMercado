'use client';

import Link from 'next/link';
import { ArrowRight, UserCog, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const isAdminPage = pathname.startsWith('/admin');

  const handleSignOut = async () => {
    if(!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-800 bg-black/80 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold font-headline text-xl text-green-300 flex items-center gap-2">
                <span>Campo</span>
                <ArrowRight className="h-5 w-5 text-primary" />
                <span>Mercado</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            {user && (
                 <Button
                    asChild
                    variant="ghost"
                    className={cn(
                    'text-green-400 hover:bg-green-900 hover:text-green-200',
                    isAdminPage && 'bg-green-800/80 text-green-100'
                    )}
                >
                    <Link href="/admin">
                    <UserCog className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">Admin</span>
                    </Link>
                </Button>
            )}
            {user && (
              <Button
                variant="ghost"
                className="text-red-400 hover:bg-red-900 hover:text-red-200"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Cerrar Sesión</span>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
