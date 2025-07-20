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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function LoginPageContent() {
  const router = useRouter();
  const { login } = useAuth();
  const { adminUser, professors } = useProfessors();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleProfessorLogin = (e: FormEvent) => {
    e.preventDefault();
    const user = professors.find(u => u.email === email);

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

  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    if (adminUser.password === adminPassword) {
      login(adminUser);
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: "La contraseña de administrador es incorrecta.",
      });
    }
  }

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
          <Tabs defaultValue="professor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="professor">Profesor</TabsTrigger>
              <TabsTrigger value="admin">Administrador</TabsTrigger>
            </TabsList>
            <TabsContent value="professor">
              <form onSubmit={handleProfessorLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="profesor@sepi.esime" 
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
                  Iniciar Sesión como Profesor
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Contraseña de Administrador</Label>
                    <Input 
                      id="admin-password" 
                      type="password" 
                      required 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Iniciar Sesión como Administrador
                  </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


export default function LoginPage() {
  return <LoginPageContent />;
}
