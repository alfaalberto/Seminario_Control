// src/components/user-nav.tsx
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";

export function UserNav() {
  const { authenticatedUser, logout, isAuthLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  const getFallback = (name: string) => {
    // Ensure name exists before trying to access it.
    return name ? name.substring(0, 1).toUpperCase() : '';
  }

  if (isAuthLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!authenticatedUser) {
    return null;
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${getFallback(authenticatedUser.name)}`} alt={authenticatedUser.name} data-ai-hint="person" />
            <AvatarFallback>{getFallback(authenticatedUser.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{authenticatedUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {authenticatedUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
            Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
