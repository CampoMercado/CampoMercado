import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Campo Mercado',
  description:
    'Wall Street for fruits and vegetables from Mercado Cooperativo de Guaymallén.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased bg-black')}>
        <FirebaseClientProvider>
            {children}
          <Toaster />
        </FirebaseClientProvider>
        <div className="fixed top-2 right-4 z-[200] text-xs text-muted-foreground font-mono">
          v0.0.0.4
        </div>
      </body>
    </html>
  );
}
