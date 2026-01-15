import Link from 'next/link';
import { LineChart, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-800 bg-black/80 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <LineChart className="h-6 w-6 text-green-500" />
            <span className="font-bold font-headline text-xl text-green-300">Campo Mercado</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <Button asChild variant="ghost" className="text-green-400 hover:bg-green-900 hover:text-green-200">
              <Link href="/admin">
                <UserCog className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Admin</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
