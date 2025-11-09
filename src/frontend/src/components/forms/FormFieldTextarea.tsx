'use client';

import { forwardRef } from 'react';
import { FormFieldWrapper } from './FormFieldWrapper';

interface FormFieldTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const FormFieldTextarea = forwardRef<HTMLTextAreaElement, FormFieldTextareaProps>(
  ({ 
    id, 
    label, 
    value, 
    onChange, 
    placeholder, 
    description, 
    error, 
    required = false,
    disabled = false,
    rows = 4,
    className 
  }, ref) => {
    return (
      <FormFieldWrapper
        id={id}
        label={label}
        description={description}
        error={error}
        required={required}
        className={className}
      >
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="mt-1 w-full p-3 border border-border rounded-md font-mono text-sm bg-background text-foreground"
          ref={ref}
        />
      </FormFieldWrapper>
    );
  }
);

FormFieldTextarea.displayName = 'FormFieldTextarea';
