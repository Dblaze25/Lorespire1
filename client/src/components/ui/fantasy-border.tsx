import React from 'react';
import { cn } from '@/lib/utils';

interface FantasyBorderProps {
  children: React.ReactNode;
  className?: string;
}

const FantasyBorder = ({ children, className }: FantasyBorderProps) => {
  return (
    <div className={cn("fantasy-border", className)}>
      {children}
    </div>
  );
};

export default FantasyBorder;
