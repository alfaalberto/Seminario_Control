"use client";

import { useState, useTransition, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { Student, Semester, Professor, Evaluation } from "@/lib/data";
import { evaluationCriteria, semesters, criteriaStrings } from "@/lib/data";
import { Sparkles, Loader2, Info } from "lucide-react";
import { getAIComments } from "@/app/dashboard/evaluate/actions";
import { useToast } from "@/hooks/use-toast";
import { useEvaluations } from "@/hooks/use-evaluations";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EvaluationFormProps {
  students: Student[];
  evaluator: Professor;
}

export function EvaluationForm({ students, evaluator }: EvaluationFormProps) {
  const { toast } = useToast();
  const { addEvaluation } = useEvaluations();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<Semester>("Primero");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [professorPrompt, setProfessorPrompt] = useState("");
  const [aiComments, setAiComments] = useState("");
  
  const [isPending, startTransition] = useTransition();

  const handleScoreChange = (criterion: string, value: number) => {
    setScores((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleGenerateComments = () => {
    if (!professorPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, introduce una indicación para la IA.",
      });
      return;
    }

    const formData = new FormData();
    formData.append('prompt', professorPrompt);
    formData.append('semester', selectedSemester);
    formData.append('criteria', criteriaStrings[selectedSemester]);
    
    startTransition(async () => {
        const result = await getAIComments(formData);
        if(result.error) {
            toast({
                variant: "destructive",
                title: "Error de IA",
                description: result.error,
            });
            setAiComments("");
        } else {
            setAiComments(result.comments || "");
        }
    });
  };

  const currentCriteria = evaluationCriteria[selectedSemester];

  const overallScore = useMemo(() => {
    const reportScore = (scores['Reporte Final (40%)'] || 0) * 0.4;
    const presentationScore = (scores['Presentación en Seminario (40%)'] || 0) * 0.4;
    const attendanceScore = (scores['Asistencia (20%)'] || 0) * 0.2;
    const finalScore = reportScore + presentationScore + attendanceScore;
    return parseFloat(finalScore.toFixed(2));
  }, [scores]);


  const handleSave = () => {
    const selectedStudent = students.find(s => s.id === selectedStudentId);
    if (!selectedStudent) {
         toast({
            variant: "destructive",
            title: "Información Faltante",
            description: "Por favor, selecciona un estudiante.",
        });
        return;
    }
    
    if (Object.keys(scores).length !== currentCriteria.length) {
       toast({
            variant: "destructive",
            title: "Criterios Incompletos",
            description: "Por favor, asigna una calificación a todos los criterios.",
        });
        return;
    }

    const newEvaluation: Evaluation = {
        id: `eval-${Date.now()}`,
        studentName: selectedStudent.name,
        semester: selectedSemester,
        date: format(new Date(), 'yyyy-MM-dd'),
        evaluator: evaluator.name,
        overallScore: overallScore,
    };

    addEvaluation(newEvaluation);
    
    toast({
        title: "Evaluación Guardada",
        description: "La evaluación del estudiante ha sido registrada exitosamente.",
        className: "bg-accent text-accent-foreground"
    });
    
    // Reset form
    setSelectedStudentId("");
    setSelectedSemester("Primero");
    setScores({});
    setProfessorPrompt("");
    setAiComments("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Evaluación del Seminario</CardTitle>
        <CardDescription>Selecciona un estudiante y un semestre para comenzar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="student">Estudiante</Label>
            <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
              <SelectTrigger id="student">
                <SelectValue placeholder="Selecciona un estudiante..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semestre</Label>
            <Select onValueChange={(val) => setSelectedSemester(val as Semester)} value={selectedSemester}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Selecciona un semestre..." />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester} Semestre
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Puntos Clave del Reglamento</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1">
              <li>Duración de la presentación: 20 minutos máximo.</li>
              <li>Sesión de preguntas y respuestas: 20 minutos máximo.</li>
              <li>Un estudiante reprueba con más del 20% de inasistencias.</li>
               <li>La nota de presentación es el promedio de las notas de cada profesor.</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="text-lg font-medium mb-4">Criterios de Evaluación (0-10)</h3>
          <div className="space-y-6">
            {currentCriteria.map((criterion) => (
              <div key={criterion} className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label htmlFor={criterion}>{criterion}</Label>
                    <span className="text-sm font-medium text-primary w-12 text-center rounded-md bg-muted px-2 py-1">{scores[criterion] || 0}</span>
                </div>
                <Slider
                  id={criterion}
                  min={0}
                  max={10}
                  step={0.1}
                  value={[scores[criterion] || 0]}
                  onValueChange={(value) => handleScoreChange(criterion, value[0])}
                />
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between rounded-lg border p-4">
            <h3 className="text-lg font-bold">Calificación Final Ponderada:</h3>
            <span className="text-2xl font-bold text-primary">{overallScore.toFixed(2)}</span>
        </div>


        <Separator />

        <div>
            <h3 className="text-lg font-medium mb-4">Asistente de Evaluación IA</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="professor-prompt">Indicación del Profesor</Label>
                    <Textarea 
                        id="professor-prompt" 
                        placeholder="Ej: El estudiante mostró gran claridad en el planteamiento del problema, pero la metodología parece débil..." 
                        value={professorPrompt}
                        onChange={(e) => setProfessorPrompt(e.target.value)}
                        rows={3}
                    />
                </div>
                <Button onClick={handleGenerateComments} disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generar Comentarios
                </Button>
                 <div className="space-y-2">
                    <Label htmlFor="ai-comments">Comentarios y Percepciones Generados</Label>
                    <Textarea 
                        id="ai-comments"
                        placeholder="Los comentarios generados por IA aparecerán aquí..."
                        value={aiComments}
                        readOnly
                        rows={5}
                        className="bg-muted"
                    />
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} size="lg">Guardar Evaluación</Button>
      </CardFooter>
    </Card>
  );
}