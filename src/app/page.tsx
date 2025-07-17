// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { useProfessors } from '@/hooks/use-professors';
import { useToast } from '@/hooks/use-toast';
import { FormEvent, useState } from 'react';

function LoginPageContent() {
  const router = useRouter();
  const { login } = useAuth();
  const { adminUser, professors } = useProfessors();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const allUsers = [adminUser, ...professors];

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    
    // Simple email validation for prototype
    const user = allUsers.find(u => u.name.toLowerCase().replace(/ /g, '.') + "@universidad.edu" === email);

    if (user && user.password === password) {
      login(user);
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: "El correo electrónico o la contraseña son incorrectos.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
               <Logo />
            </div>
          <CardTitle className="text-2xl font-bold tracking-tight">ThesisEval</CardTitle>
          <CardDescription>
            Inicia sesión para evaluar presentaciones de tesis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="usuario@universidad.edu" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
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