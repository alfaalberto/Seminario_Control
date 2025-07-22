// src/app/register/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/combined';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/combined';
import { Input } from '@/components/ui/combined';
import { Label } from '@/components/ui/combined';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase'; // Import auth and db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', department: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.department || !formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Campos Incompletos",
        description: "Por favor, completa todos los campos para registrarte.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: formData.email,
        name: formData.name,
        department: formData.department,
        role: 'professor', // Assign default role as professor for registration page
        createdAt: new Date(),
      });

      toast({
        title: "Registro Exitoso",
        description: "¡Bienvenido! Ahora puedes iniciar sesión con tus credenciales.",
        className: "bg-accent text-accent-foreground"
      });
      router.push('/');
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Ocurrió un error desconocido al registrarse.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está registrado.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del correo electrónico es inválido.";
      }
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
               <Logo />
            </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Crear Cuenta de Profesor</CardTitle>
          <CardDescription>
            Únete a la plataforma de evaluación del Seminario SEPI.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" value={formData.name} onChange={handleFormChange} placeholder="Ej: Dra. Ada Lovelace" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input id="department" value={formData.department} onChange={handleFormChange} placeholder="Ej: Ingeniería de Software" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="usuario@sepi.esime" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={formData.password} required placeholder="••••••••" disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrarse
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" className="underline text-primary">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;
