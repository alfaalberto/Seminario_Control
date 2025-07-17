import { EvaluationForm } from "@/components/evaluation-form";
import { students } from "@/lib/data";

export default function EvaluatePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Evaluate Presentation</h1>
        <p className="text-muted-foreground">
          Fill out the form below to evaluate a student's thesis presentation.
        </p>
      </div>
      <EvaluationForm students={students} />
    </div>
  );
}
