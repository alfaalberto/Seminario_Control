// src/app/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BarChart, ClipboardEdit, Users } from "lucide-react";
import { useEvaluations } from "@/hooks/use-evaluations";
import { useStudents } from "@/hooks/use-students";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { evaluations, isLoading: isLoadingEvaluations } = useEvaluations();
  const { students, isLoading: isLoadingStudents } = useStudents();
  
  const isLoading = isLoadingEvaluations || isLoadingStudents;

  // Calculate total evaluations
  const totalEvaluations = evaluations.length;

  // Calculate total students
  const totalStudents = students.length;

  // For "Evaluaciones Pendientes", we'll use a static value 
  // as there's no 'status' field in the Evaluation type to derive this.
  const pendingEvaluations = 5; // Placeholder

  const recentEvaluations = [...evaluations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  const getBadgeVariant = (score: number) => {
    if (score >= 9) return "default";
    if (score >= 7) return "secondary";
    return "destructive";
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

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
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{totalEvaluations}</div>}
            <p className="text-xs text-muted-foreground">{`+${totalEvaluations - 0} desde el último semestre`}</p> {/* Placeholder for dynamic change */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{totalStudents}</div>}
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
            <CardDescription>Las últimas 5 evaluaciones realizadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentEvaluations.length > 0 ? (
            <div className="space-y-6">
              {recentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(evaluation.studentName)}`} alt={evaluation.studentName} data-ai-hint="person student" />
                    <AvatarFallback>{getInitials(evaluation.studentName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{evaluation.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      Evaluado por <span className="font-medium">{evaluation.evaluator}</span> el {evaluation.date}
                    </p>
                  </div>
                  <Badge variant={getBadgeVariant(evaluation.overallScore)} className={evaluation.overallScore >= 9 ? "bg-accent text-accent-foreground" : ""}>
                    {evaluation.overallScore.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay actividad reciente para mostrar.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
