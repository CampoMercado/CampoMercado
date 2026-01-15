'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginClientPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const justSignedUp = searchParams.get('new') === 'true';

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description:
          'Las credenciales son incorrectas. Por favor, intente de nuevo.',
      });
    }
  };

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        Cargando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenido a Campo Mercado</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder a su panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {justSignedUp && (
            <Alert className="mb-4 bg-green-950 border-green-800">
                <AlertDescription className="text-green-300">
                    ¡Registro exitoso! Ya puede iniciar sesión.
                </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="su@email.com" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                <LogIn className="mr-2 h-4 w-4" />
                Ingresar
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿No tiene una cuenta?{' '}
            <Link href="/signup" className="underline text-primary">
              Regístrese aquí
            </Link>
          </div>
        </CardContent>
      </Card>
       <footer className="container py-6 text-center text-muted-foreground text-sm absolute bottom-0">
        {`© ${year} Campo Mercado.`}
      </footer>
    </div>
  );
}
