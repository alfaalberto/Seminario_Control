// src/app/dashboard/layout.tsx
"use client";

import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Users,
  BarChart,
  ClipboardEdit,
  BookUser,
  Loader2,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/combined';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { authenticatedUser, isAuthLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthLoading && !authenticatedUser) {
      router.push('/');
    }
  }, [isAuthLoading, authenticatedUser, router]);
  
  if (isAuthLoading || !authenticatedUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2 flex items-center gap-2">
            <Logo />
            <span className="font-bold text-lg">Seminario SEPI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Panel de control">
                <Link href="/dashboard">
                  <Home />
                  <span>Panel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Evaluar">
                <Link href="/dashboard/evaluate">
                  <ClipboardEdit />
                   <span>Evaluar</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reportes">
                <Link href="/dashboard/reports">
                  <BarChart />
                   <span>Reportes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Estudiantes">
                <Link href="/dashboard/students">
                  <Users />
                   <span>Estudiantes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Profesores">
                <Link href="/dashboard/professors">
                  <BookUser />
                   <span>Profesores</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col flex-1 h-screen">
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6 sticky top-0 z-10 flex-shrink-0">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
             {/* Can add breadcrumbs or page title here */}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
