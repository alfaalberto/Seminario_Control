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
        router.push('/dashboard');
      } else {
        // The hook now handles specific error toasts, but we can have a generic fallback.
         toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "El correo electrónico o la contraseña son incorrectos.",
        });
      }
    } catch (error: any) {
        // Error handling is improved in the hook, but we keep a catch-all here.
        toast({
            variant: "destructive",
            title: "Error de inicio de sesión",
            description: error.message || "Ocurrió un error inesperado.",
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
