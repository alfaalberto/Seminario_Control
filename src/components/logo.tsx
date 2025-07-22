import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-2">
      <GraduationCap className="h-6 w-6" />
    </div>
  );
}
