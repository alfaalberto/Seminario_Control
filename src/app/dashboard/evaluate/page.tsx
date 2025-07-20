// src/app/dashboard/evaluate/page.tsx
"use client";

import { EvaluationForm } from "@/components/evaluation-form";
import { useAuth } from "@/hooks/use-auth";


export default function EvaluatePage() {
  const { authenticatedUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div>Cargando...</div>; // Or a proper skeleton loader
  }
  
  if (!authenticatedUser) {
    // This should ideally redirect to login, but for now, we'll just show a message.
    return <div>Debes iniciar sesión para evaluar.</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Evaluar Presentación</h1>
        <p className="text-muted-foreground">
          {`Evaluando como ${authenticatedUser.name}. Completa el formulario a continuación.`}
        </p>
      </div>
      
      <EvaluationForm 
        evaluator={authenticatedUser} 
      />
    </div>
  );
}
