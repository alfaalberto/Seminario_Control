"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import type { Student, Semester, Professor } from "@/lib/data";
import { evaluationCriteria, semesters, criteriaStrings } from "@/lib/data";
import { Sparkles, Loader2 } from "lucide-react";
import { getAIComments } from "@/app/dashboard/evaluate/actions";
import { useToast } from "@/hooks/use-toast";

interface EvaluationFormProps {
  students: Student[];
  evaluator: Professor;
}

export function EvaluationForm({ students, evaluator }: EvaluationFormProps) {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
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

  const handleSave = () => {
    if (!selectedStudent) {
         toast({
            variant: "destructive",
            title: "Información Faltante",
            description: "Por favor, selecciona un estudiante.",
        });
        return;
    }
    console.log({
        evaluator: evaluator.name,
        student: selectedStudent,
        semester: selectedSemester,
        scores,
        aiComments,
    });
    toast({
        title: "Evaluación Guardada",
        description: "La evaluación del estudiante ha sido registrada exitosamente.",
        className: "bg-accent text-accent-foreground"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Evaluación</CardTitle>
        <CardDescription>Selecciona un estudiante y un semestre para comenzar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="student">Estudiante</Label>
            <Select onValueChange={setSelectedStudent} value={selectedStudent}>
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

        <div>
          <h3 className="text-lg font-medium mb-4">Criterios de Evaluación</h3>
          <div className="space-y-6">
            {currentCriteria.map((criterion) => (
              <div key={criterion} className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label htmlFor={criterion}>{criterion}</Label>
                    <span className="text-sm font-medium text-primary w-10 text-center">{scores[criterion] || 0}</span>
                </div>
                <Slider
                  id={criterion}
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={[0]}
                  onValueChange={(value) => handleScoreChange(criterion, value[0])}
                />
              </div>
            ))}
          </div>
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
