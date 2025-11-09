'use client';

import { Toggle } from '@/components/ui/toggle';

interface FormFieldToggleProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormFieldToggle({ 
  id, 
  label, 
  value, 
  onChange, 
  description, 
  error, 
  required = false,
  disabled = false,
  className 
}: FormFieldToggleProps) {
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
      <Toggle
        pressed={value}
        onPressedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
