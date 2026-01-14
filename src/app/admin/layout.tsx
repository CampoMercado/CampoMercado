import { Header } from '@/components/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold">
            Panel de Administrador
          </h1>
          <p className="text-muted-foreground">
            Gestionar productos y precios de CuyoCrops
          </p>
        </div>
        {children}
      </main>
      <footer className="container py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} CuyoCrops.
      </footer>
    </div>
  );
}
