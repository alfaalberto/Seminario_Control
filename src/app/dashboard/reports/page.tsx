// src/app/dashboard/reports/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEvaluations } from "@/hooks/use-evaluations";
import { Badge } from "@/components/ui/badge";
import { type Evaluation, type Semester, evaluationCriteria } from "@/lib/data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { evaluations, isLoading } = useEvaluations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  const getBadgeVariant = (score: number) => {
    if (score >= 9) return "default";
    if (score >= 7) return "secondary";
    return "destructive";
  }

  const handleRowClick = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsDialogOpen(true);
  }

  const exportToExcel = () => {
    if (!evaluations || evaluations.length === 0) {
      alert("No hay evaluaciones para exportar.");
      return;
    }

    const allCriterionNames = new Set<string>();
    for (const semester in evaluationCriteria) {
      evaluationCriteria[semester as Semester].forEach(criterion => {
        allCriterionNames.add(criterion.name);
      });
    }
    const sortedCriterionNames = Array.from(allCriterionNames).sort();

    const header = [
      "ID Evaluación",
      "Nombre Estudiante",
      "Semestre",
      "Fecha",
      "Evaluador",
      "Calificación Final",
      ...sortedCriterionNames,
      "Comentarios Profesor",
      "Comentarios IA",
    ];

    const data = evaluations.map(evalItem => {
      const row: (string | number)[] = [
        evalItem.id,
        evalItem.studentName,
        evalItem.semester,
        evalItem.date,
        evalItem.evaluator,
        evalItem.overallScore,
      ];

      sortedCriterionNames.forEach(criterionName => {
        row.push(evalItem.scores[criterionName] || 0);
      });

      row.push(evalItem.professorPrompt);
      row.push(evalItem.aiComments);
      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluaciones");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "reporte_evaluaciones.xlsx");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Evaluación</h1>
          <p className="text-muted-foreground">Ver y analizar registros de evaluaciones pasadas.</p>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Todas las Evaluaciones</CardTitle>
              <CardDescription>Un historial completo de todas las evaluaciones registradas. (Datos de demostración)</CardDescription>
            </div>
            <Button onClick={exportToExcel} disabled={isLoading || evaluations.length === 0}>Exportar a Excel</Button>
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : evaluations.length > 0 ? (
                  evaluations.map((evaluation) => (
                    <TableRow key={evaluation.id} onClick={() => handleRowClick(evaluation)} className="cursor-pointer">
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Evaluación</DialogTitle>
            <DialogDescription>
              {`Evaluación de ${selectedEvaluation?.studentName} para el ${selectedEvaluation?.semester} semestre, realizada el ${selectedEvaluation?.date}.`}
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && (
            <ScrollArea className="max-h-[70vh] pr-6">
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-semibold mb-2">Calificaciones por Criterio</h4>
                  <div className="space-y-2 rounded-md border p-4">
                    {Object.entries(selectedEvaluation.scores).map(([criterion, score]) => (
                       <div key={criterion} className="flex justify-between items-center text-sm">
                         <span>{criterion}</span>
                         <span className="font-mono font-semibold text-primary">{score.toFixed(1)}</span>
                       </div>
                    ))}
                     <Separator className="my-2"/>
                      <div className="flex justify-between items-center font-bold">
                         <span>Calificación Final Ponderada</span>
                         <span className="font-mono text-primary">{selectedEvaluation.overallScore.toFixed(2)}</span>
                       </div>
                  </div>
                </div>

                {selectedEvaluation.professorPrompt && (
                   <div>
                      <Label htmlFor="prof-prompt-detail" className="font-semibold">Indicación del Profesor</Label>
                      <p id="prof-prompt-detail" className="mt-1 text-sm text-muted-foreground p-3 bg-muted rounded-md">{selectedEvaluation.professorPrompt}</p>
                   </div>
                )}
                
                {selectedEvaluation.aiComments && (
                   <div>
                      <Label htmlFor="ai-comments-detail" className="font-semibold">Comentarios de la IA</Label>
                       <p id="ai-comments-detail" className="mt-1 text-sm text-muted-foreground p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedEvaluation.aiComments}</p>
                   </div>
                )}
                
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
