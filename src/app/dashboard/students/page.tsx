// src/app/dashboard/students/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Student } from "@/lib/data";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useEvaluations } from "@/hooks/use-evaluations";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { Skeleton } from "@/components/ui/skeleton";


function StudentsPageContent() {
  const { toast } = useToast();
  const { students, isLoading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { evaluations } = useEvaluations();
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({ name: '', studentId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentAverages = useMemo(() => {
    const averages: Record<string, { totalScore: number; count: number; average: number }> = {};
    evaluations.forEach(evaluation => {
      // We find the student by name. A more robust solution would use IDs.
      const student = students.find(s => s.name === evaluation.studentName);
      if (student) {
        if (!averages[student.id]) {
          averages[student.id] = { totalScore: 0, count: 0, average: 0 };
        }
        averages[student.id].totalScore += evaluation.overallScore;
        averages[student.id].count++;
      }
    });

    for (const studentId in averages) {
      averages[studentId].average = averages[studentId].totalScore / averages[studentId].count;
    }
    return averages;
  }, [evaluations, students]);

  const handleAddClick = () => {
    setEditingStudent(null);
    setFormData({ name: '', studentId: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = async (studentId: string) => {
    setIsSubmitting(true);
    try {
      await deleteStudent(studentId);
      toast({
          title: "Estudiante Eliminado",
          description: "El estudiante ha sido eliminado de la lista.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: "No se pudo eliminar al estudiante.",
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    if (!formData.name || !formData.studentId) {
      toast({
        variant: "destructive",
        title: "Campos Requeridos",
        description: "Por favor, completa todos los campos.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        // Edit existing student
        await updateStudent({ ...formData, id: editingStudent.id });
        toast({
          title: "Estudiante Actualizado",
          description: "La información del estudiante ha sido actualizada.",
          className: "bg-accent text-accent-foreground"
        });
      } else {
        // Add new student
        await addStudent(formData);
         toast({
          title: "Estudiante Agregado",
          description: "El nuevo estudiante ha sido agregado a la lista.",
          className: "bg-accent text-accent-foreground"
        });
      }
      setIsDialogOpen(false);
    } catch(error) {
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
          <p className="text-muted-foreground">Administrar y ver la información de los estudiantes.</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick} disabled={isLoading}>
                <PlusCircle className="mr-2" />
                Agregar Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}</DialogTitle>
                <DialogDescription>
                  {editingStudent ? 'Actualiza la información del estudiante.' : 'Completa los detalles para agregar un nuevo estudiante.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input id="name" value={formData.name} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Ana García" disabled={isSubmitting}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentId" className="text-right">ID de Estudiante</Label>
                  <Input id="studentId" value={formData.studentId} onChange={handleFormChange} className="col-span-3" placeholder="Ej: A01234567" disabled={isSubmitting} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSaveChanges} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>Una lista de todos los estudiantes en el programa. (Datos de demostración)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>ID de Estudiante</TableHead>
                <TableHead>Promedio General</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    {isAdmin && <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : students.length > 0 ? (
                students.map((student) => {
                  const averageData = studentAverages[student.id];
                  const average = averageData ? averageData.average.toFixed(2) : 'N/A';
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        {average !== 'N/A' ? (
                          <Badge variant="secondary">{average}</Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(student)} disabled={isSubmitting}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(student.id)} disabled={isSubmitting}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                 <TableRow>
                    <TableCell colSpan={isAdmin ? 4 : 3} className="text-center text-muted-foreground">
                        No se encontraron estudiantes.
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


export default function StudentsPage() {
  return (
      <StudentsPageContent />
  );
}
