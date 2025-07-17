// src/app/dashboard/students/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { students as initialStudents, type Student, mockEvaluations } from "@/lib/data";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', studentId: '' });

  const studentAverages = useMemo(() => {
    const averages: Record<string, { totalScore: number; count: number; average: number }> = {};
    mockEvaluations.forEach(evaluation => {
      const student = initialStudents.find(s => s.name === evaluation.studentName);
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
  }, []);

  const handleAddClick = () => {
    setEditingStudent(null);
    setFormData({ id: '', name: '', studentId: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
     toast({
        title: "Estudiante Eliminado",
        description: "El estudiante ha sido eliminado de la lista.",
     });
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = () => {
    if (!formData.name || !formData.studentId) {
      toast({
        variant: "destructive",
        title: "Campos Requeridos",
        description: "Por favor, completa todos los campos.",
      });
      return;
    }

    if (editingStudent) {
      // Edit existing student
      setStudents(students.map(s => s.id === editingStudent.id ? formData : s));
      toast({
        title: "Estudiante Actualizado",
        description: "La información del estudiante ha sido actualizada.",
        className: "bg-accent text-accent-foreground"
      });
    } else {
      // Add new student
      const newStudent = { ...formData, id: Date.now().toString() };
      setStudents([...students, newStudent]);
       toast({
        title: "Estudiante Agregado",
        description: "El nuevo estudiante ha sido agregado a la lista.",
        className: "bg-accent text-accent-foreground"
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Estudiantes</h1>
          <p className="text-muted-foreground">Administrar y ver la información de los estudiantes.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
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
                <Input id="name" value={formData.name} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Ana García"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentId" className="text-right">ID de Estudiante</Label>
                <Input id="studentId" value={formData.studentId} onChange={handleFormChange} className="col-span-3" placeholder="Ej: A01234567" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveChanges}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>Una lista de todos los estudiantes en el programa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>ID de Estudiante</TableHead>
                <TableHead>Promedio General</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
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
                    <TableCell className="text-right space-x-2">
                       <Button variant="ghost" size="icon" onClick={() => handleEditClick(student)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(student.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                       </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
