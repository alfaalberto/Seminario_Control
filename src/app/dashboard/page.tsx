"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ClipboardEdit, Users } from "lucide-react";
import { useEvaluations } from "@/hooks/use-evaluations"; // Import useEvaluations
import { useStudents } from "@/hooks/use-students";     // Import useStudents

export default function DashboardPage() {
  const { evaluations } = useEvaluations();
  const { students } = useStudents();

  // Calculate total evaluations
  const totalEvaluations = evaluations.length;

  // Calculate total students
  const totalStudents = students.length;

  // For "Evaluaciones Pendientes", we'll use a static value 
  // as there's no 'status' field in the Evaluation type to derive this.
  const pendingEvaluations = 5; // Placeholder

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-muted-foreground">¡Bienvenido de nuevo, Profesor!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones Totales</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">{`+${totalEvaluations - 0} desde el último semestre`}</p> {/* Placeholder for dynamic change */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Activos este semestre</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones Pendientes</CardTitle>
            <ClipboardEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvaluations}</div>
            <p className="text-xs text-muted-foreground">Para revisión final</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">No hay actividad reciente para mostrar.</p>
        </CardContent>
      </Card>

    </div>
  );
}
