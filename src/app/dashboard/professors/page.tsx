// src/app/dashboard/professors/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { professors as initialProfessors, type Professor } from "@/lib/data";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfessorsPage() {
  const { toast } = useToast();
  const [professors, setProfessors] = useState<Professor[]>(initialProfessors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', department: '', password: '' });

  const handleAddClick = () => {
    setEditingProfessor(null);
    setFormData({ id: '', name: '', department: '', password: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({ ...professor, password: professor.password || ''});
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (professorId: string) => {
    setProfessors(professors.filter(p => p.id !== professorId));
     toast({
        title: "Profesor Eliminado",
        description: "El profesor ha sido eliminado de la lista.",
     });
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = () => {
    if (!formData.name || !formData.department || !formData.password) {
      toast({
        variant: "destructive",
        title: "Campos Requeridos",
        description: "Por favor, completa todos los campos, incluyendo la contraseña.",
      });
      return;
    }

    if (editingProfessor) {
      // Edit existing professor
      setProfessors(professors.map(p => p.id === editingProfessor.id ? { ...formData, id: p.id } : p));
      toast({
        title: "Profesor Actualizado",
        description: "La información del profesor ha sido actualizada.",
        className: "bg-accent text-accent-foreground"
      });
    } else {
      // Add new professor
      const newProfessor = { ...formData, id: Date.now().toString() };
      setProfessors([...professors, newProfessor]);
       toast({
        title: "Profesor Agregado",
        description: "El nuevo profesor ha sido agregado a la lista.",
        className: "bg-accent text-accent-foreground"
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profesores</h1>
          <p className="text-muted-foreground">Administrar y ver la información de los profesores.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2" />
              Agregar Profesor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProfessor ? 'Editar Profesor' : 'Agregar Profesor'}</DialogTitle>
              <DialogDescription>
                {editingProfessor ? 'Actualiza la información del profesor.' : 'Completa los detalles para agregar un nuevo profesor.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input id="name" value={formData.name} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Dr. Alan Smith"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Departamento</Label>
                <Input id="department" value={formData.department} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Ciencias de la Computación" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Contraseña</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleFormChange} className="col-span-3" placeholder="Contraseña segura" />
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
          <CardTitle>Lista de Profesores</CardTitle>
          <CardDescription>Una lista de todos los profesores en el programa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map((professor) => (
                  <TableRow key={professor.id}>
                    <TableCell className="font-medium">{professor.name}</TableCell>
                    <TableCell>{professor.department}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="ghost" size="icon" onClick={() => handleEditClick(professor)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(professor.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                       </Button>
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
