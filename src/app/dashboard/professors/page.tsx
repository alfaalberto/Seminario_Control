// src/app/dashboard/professors/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/combined";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/combined";
import { Button } from "@/components/ui/combined";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/combined";
import { Input } from "@/components/ui/combined";
import { Label } from "@/components/ui/combined";
import { type Professor } from "@/lib/data";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfessors } from "@/hooks/use-professors";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/combined";

function ProfessorsPageContent() {
  const { toast } = useToast();
  const { professors, adminUser, isLoading, addProfessor, updateProfessor, deleteProfessor } = useProfessors();
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState<Omit<Professor, 'id' | 'role'>>({ name: '', department: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allUsers = adminUser ? [adminUser, ...professors] : professors;

  const handleAddClick = () => {
    setEditingProfessor(null);
    setFormData({ name: '', department: '', email: '', password: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({ ...professor, password: ''}); // Clear password for security
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = async (professorId: string) => {
    if (professorId === adminUser?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede eliminar al administrador.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
        await deleteProfessor(professorId);
        toast({
            title: "Profesor Eliminado",
            description: "El profesor ha sido eliminado de la lista.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al Eliminar",
            description: "No se pudo eliminar al profesor. Inténtalo de nuevo.",
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
    if (!formData.name || !formData.department || !formData.email) {
      toast({
        variant: "destructive",
        title: "Campos Requeridos",
        description: "Por favor, completa los campos de nombre, departamento y email.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingProfessor) {
        // Edit existing professor or admin
         const updatedProfessor: Professor = { 
          ...formData, 
          id: editingProfessor.id,
          role: editingProfessor.role,
          // Keep old password if new one is not provided
          password: formData.password || editingProfessor.password
        };
        await updateProfessor(updatedProfessor);
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
          setIsSubmitting(false);
          return;
        }
        const newProfessor: Omit<Professor, 'id'> = { ...formData, role: 'professor' };
        await addProfessor(newProfessor);
         toast({
          title: "Profesor Agregado",
          description: "El nuevo profesor ha sido agregado a la lista.",
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
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Administrar y ver la información de profesores y administradores.</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick} disabled={isLoading}>
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
                  <Input id="name" value={formData.name} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Dr. Alan Smith" disabled={editingProfessor?.id === 'admin' || isSubmitting}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleFormChange} className="col-span-3" placeholder="Ej: alan.smith@universidad.edu" disabled={isSubmitting} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">Departamento</Label>
                  <Input id="department" value={formData.department} onChange={handleFormChange} className="col-span-3" placeholder="Ej: Ciencias de la Computación" disabled={isSubmitting} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Contraseña</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleFormChange} className="col-span-3" placeholder={editingProfessor ? "Dejar en blanco para no cambiar" : "Contraseña segura"} disabled={isSubmitting} />
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
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Una lista de todos los usuarios del sistema. (Datos de demostración)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Departamento</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    {isAdmin && <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : allUsers.length > 0 ? (
                allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)} disabled={isSubmitting}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        {user.id !== 'admin' && (
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user.id)} disabled={isSubmitting}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Eliminar</span>
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={isAdmin ? 4 : 3} className="text-center text-muted-foreground">
                        No se encontraron usuarios.
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

export default function ProfessorsPage() {
  return <ProfessorsPageContent />;
}
