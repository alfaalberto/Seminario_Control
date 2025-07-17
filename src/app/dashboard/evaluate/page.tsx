// src/app/dashboard/evaluate/page.tsx
"use client";

import { useState } from "react";
import { EvaluationForm } from "@/components/evaluation-form";
import { ProfessorAuthGate } from "@/components/professor-auth-gate";
import { students, professors, type Professor } from "@/lib/data";

export default function EvaluatePage() {
  const [authenticatedProfessor, setAuthenticatedProfessor] = useState<Professor | null>(null);

  const handleAuthenticationSuccess = (professor: Professor) => {
    setAuthenticatedProfessor(professor);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Evaluar Presentación</h1>
        <p className="text-muted-foreground">
          {authenticatedProfessor 
            ? `Evaluando como ${authenticatedProfessor.name}. Completa el formulario a continuación.`
            : "Selecciona tu perfil de profesor para comenzar a evaluar."}
        </p>
      </div>
      
      {authenticatedProfessor ? (
        <EvaluationForm 
          students={students} 
          evaluator={authenticatedProfessor} 
        />
      ) : (
        <ProfessorAuthGate 
          professors={professors} 
          onAuthenticationSuccess={handleAuthenticationSuccess} 
        />
      )}
    </div>
  );
}
