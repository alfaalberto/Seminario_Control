import type { Metadata, Viewport } from 'next';
import React from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/combined";
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: 'Seminario SEPI',
  description: 'Plataforma de Evaluación del Seminario Departamental - Maestría en Ciencias en Ingeniería Electrónica.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
