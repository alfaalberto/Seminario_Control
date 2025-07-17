import { EvaluationForm } from "@/components/evaluation-form";
import { students } from "@/lib/data";

export default function EvaluatePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Evaluar Presentación</h1>
        <p className="text-muted-foreground">
          Completa el formulario a continuación para evaluar la presentación de tesis de un estudiante.
        </p>
      </div>
      <EvaluationForm students={students} />
    </div>
  );
}
