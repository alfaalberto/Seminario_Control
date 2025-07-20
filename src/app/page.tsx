// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const { login } = useAuth();
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
      // The useAuth hook now handles specific error toasts, so we don't need a generic else here.
    } catch (error: any) {
        // This catch is a fallback for unexpected errors during the login process itself.
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


  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
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
           <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="usuario@sepi.esime" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function LoginPage() {
  return <LoginPageContent />;
}
