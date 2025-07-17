import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockEvaluations } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reportes de Evaluación</h1>
        <p className="text-muted-foreground">Ver y analizar registros de evaluaciones pasadas.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todas las Evaluaciones</CardTitle>
          <CardDescription>Un historial completo de todas las evaluaciones registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Evaluador</TableHead>
                <TableHead className="text-right">Puntaje General</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">{evaluation.studentName}</TableCell>
                  <TableCell>{evaluation.semester}</TableCell>
                  <TableCell>{evaluation.date}</TableCell>
                  <TableCell>{evaluation.evaluator}</TableCell>
                  <TableCell className="text-right">
                     <Badge variant={evaluation.overallScore > 90 ? "default" : "secondary"} className={evaluation.overallScore > 90 ? "bg-accent text-accent-foreground" : ""}>
                        {evaluation.overallScore}
                     </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
