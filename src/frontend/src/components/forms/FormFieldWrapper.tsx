'use client';

import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldWrapperProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormFieldWrapper({ 
  id, 
  label, 
  description, 
  error, 
  required = false,
  children, 
  className 
}: FormFieldWrapperProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
