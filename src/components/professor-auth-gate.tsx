// src/components/professor-auth-gate.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Professor } from "@/lib/data";
import { BookUser } from "lucide-react";

interface ProfessorAuthGateProps {
  professors: Professor[];
  onAuthenticationSuccess: (professor: Professor) => void;
}

export function ProfessorAuthGate({ professors, onAuthenticationSuccess }: ProfessorAuthGateProps) {
  const { toast } = useToast();
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProfessorSelect = (professor: Professor) => {
    setSelectedProfessor(professor);
    setPassword("");
    setIsDialogOpen(true);
  };

  const handleVerifyPassword = () => {
    if (!selectedProfessor) return;

    // In a real app, this would be a secure check against a hashed password.
    // For this prototype, we use the password from data.ts.
    if (password === selectedProfessor.password) {
      toast({
        title: "Autenticación Exitosa",
        description: `Bienvenido, ${selectedProfessor.name}.`,
        className: "bg-accent text-accent-foreground"
      });
      setIsDialogOpen(false);
      onAuthenticationSuccess(selectedProfessor);
    } else {
      toast({
        variant: "destructive",
        title: "Contraseña Incorrecta",
        description: "La contraseña que ingresaste no es correcta. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Verificación de Profesor</CardTitle>
          <CardDescription>Por favor, selecciona tu nombre de la lista para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professors.map((prof) => (
            <Button
              key={prof.id}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleProfessorSelect(prof)}
            >
              <BookUser className="h-6 w-6" />
              <span className="text-base">{prof.name}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verificar Identidad</DialogTitle>
            <DialogDescription>
              Hola, {selectedProfessor?.name}. Por favor, ingresa tu contraseña para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleVerifyPassword}>Ingresar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
