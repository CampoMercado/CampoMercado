
import { Header } from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold">Mi Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Gestión personal de su actividad en Campo Mercado.
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
