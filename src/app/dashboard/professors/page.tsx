// src/app/dashboard/professors/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Professor } from "@/lib/data";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfessors } from "@/hooks/use-professors";
import { useAuth } from "@/hooks/use-auth";

function ProfessorsPageContent() {
  const { toast } = useToast();
  const { professors, adminUser, addProfessor, updateProfessor, deleteProfessor } = useProfessors();
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', department: '', password: '' });

  const allUsers = [adminUser, ...professors];

  const handleAddClick = () => {
    setEditingProfessor(null);
    setFormData({ id: '', name: '', department: '', password: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({ ...professor, password: ''}); // Clear password for security
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (professorId: string) => {
    if (professorId === adminUser.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede eliminar al administrador.",
      });
      return;
    }
    deleteProfessor(professorId);
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
    if (!formData.name || !formData.department) {
      toast({
        variant: "destructive",
        title: "Campos Requeridos",
        description: "Por favor, completa los campos de nombre y departamento.",
      });
      return;
    }
    
    if (editingProfessor) {
      // Edit existing professor or admin
       const updatedProfessor = { 
        ...formData, 
        id: editingProfessor.id,
        // Keep old password if new one is not provided
        password: formData.password || editingProfessor.password
      };
      updateProfessor(updatedProfessor);
      toast({
        title: "Usuario Actualizado",
        description: "La información del usuario ha sido actualizada.",
        className: "bg-accent text-accent-foreground"
      });
    } else {
      // Add new professor
      if (!formData.password) {
         toast({
          variant: "destructive",
          title: "Campos Requeridos",
          description: "La contraseña es requerida para nuevos profesores.",
        });
        return;
      }
      const newProfessor = { ...formData, id: Date.now().toString() };
      addProfessor(newProfessor);
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
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Administrar y ver la información de profesores y administradores.</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick}>
                <PlusCircle className="mr-2" />
                Agregar Profesor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProfessor ? 'Editar Usuario' : 'Agregar Profesor'}</DialogTitle>
                <DialogDescription>
                  {editingProfessor ? 'Actualiza la información del usuario.' : 'Completa los detalles para agregar un nuevo profesor.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input id="name" value={formData.name} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Dr. Alan Smith" disabled={editingProfessor?.id === 'admin'}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">Departamento</Label>
                  <Input id="department" value={formData.department} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Ciencias de la Computación" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Contraseña</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleFormChange} className="col-span-3" placeholder={editingProfessor ? "Dejar en blanco para no cambiar" : "Contraseña segura"} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSaveChanges}>Guardar Cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Una lista de todos los usuarios del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        {user.id !== 'admin' && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Eliminar</span>
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ProfessorsPage() {
  return (
      <ProfessorsPageContent />
  );
}
