"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEvaluations } from "@/hooks/use-evaluations";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const { evaluations } = useEvaluations();

  const getBadgeVariant = (score: number) => {
    if (score >= 9) return "default";
    if (score >= 7) return "secondary";
    return "destructive";
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reportes de Evaluación</h1>
        <p className="text-muted-foreground">Ver y analizar registros de evaluaciones pasadas.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todas las Evaluaciones</CardTitle>
          <CardDescription>Un historial completo de todas las evaluaciones registradas en el seminario.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Evaluador</TableHead>
                <TableHead className="text-right">Calificación Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length > 0 ? (
                evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">{evaluation.studentName}</TableCell>
                    <TableCell>{evaluation.semester}</TableCell>
                    <TableCell>{evaluation.date}</TableCell>
                    <TableCell>{evaluation.evaluator}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={getBadgeVariant(evaluation.overallScore)} className={evaluation.overallScore >= 9 ? "bg-accent text-accent-foreground" : ""}>
                          {evaluation.overallScore.toFixed(2)}
                       </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay evaluaciones para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}