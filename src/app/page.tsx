// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/combined';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/combined';
import { Input } from '@/components/ui/combined';
import { Label } from '@/components/ui/combined';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoginPageContent: React.FC = () => {
  const router = useRouter();
  const { login, isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        toast({
          title: "Inicio de Sesión Exitoso",
          description: `Bienvenido de nuevo, ${user.name}.`,
          className: "bg-accent text-accent-foreground"
        });
        router.push('/dashboard');
      } 
      // The useAuth hook now handles specific error toasts
    } catch (error: any) {
        console.error("Login page error:", error);
        toast({
            variant: "destructive",
            title: "Error Inesperado",
            description: "Ocurrió un error que no pudimos prever. Por favor, intenta de nuevo.",
        });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || isAuthLoading;
  const buttonText = isAuthLoading ? 'Cargando...' : (isLoading ? 'Iniciando...' : 'Iniciar Sesión');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
               <Logo />
            </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Seminario SEPI</CardTitle>
          <CardDescription>
            Plataforma de Evaluación del Seminario Departamental
            <br />
            <span className="font-semibold">Maestría en Ciencias en Ingeniería Electrónica</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="usuario@sepi.esime" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFormDisabled}>
              {(isLoading || isAuthLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline text-primary">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


const LoginPage: React.FC = () => {
  return <LoginPageContent />;
}

export default LoginPage;
