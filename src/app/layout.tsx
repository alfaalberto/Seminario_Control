import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ProfessorsProvider } from '@/hooks/use-professors';
import { EvaluationsProvider } from '@/hooks/use-evaluations';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'ThesisEval',
  description: 'Evaluación en tiempo real para presentaciones de tesis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ProfessorsProvider>
            <EvaluationsProvider>
              {children}
            </EvaluationsProvider>
          </ProfessorsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
