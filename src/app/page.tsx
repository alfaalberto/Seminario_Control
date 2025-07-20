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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserByEmail } from '@/lib/firestore';
import { adminUser } from '@/lib/data';

function LoginPageContent() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProfessorLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await getUserByEmail(email);
      
      if (user && user.password === password && user.role !== 'admin') {
        login(user);
        router.push('/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "El correo electrónico o la contraseña son incorrectos.",
        });
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: "No se pudo conectar con la base de datos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        // In a real app, admin credentials would also be fetched securely.
        // For this prototype, we use a local check but still log in the fetched user.
        const admin = await getUserByEmail(adminUser.email);
        if (admin && adminPassword === admin.password) {
            login(admin);
            router.push('/dashboard');
        } else {
             toast({
                variant: "destructive",
                title: "Error de inicio de sesión",
                description: "La contraseña de administrador es incorrecta.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error de inicio de sesión",
            description: "No se pudo verificar la cuenta de administrador.",
        });
    } finally {
        setIsLoading(false);
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
                  {isLoading ? 'Iniciando...' : 'Iniciar Sesión como Profesor'}
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
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Iniciando...' : 'Iniciar Sesión como Administrador'}
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
