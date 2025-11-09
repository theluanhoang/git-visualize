'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from './FormFieldWrapper';

interface FormFieldInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'color';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FormFieldInput = forwardRef<HTMLInputElement, FormFieldInputProps>(
  ({ 
    id, 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    description, 
    error, 
    required = false,
    disabled = false,
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
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="mt-1"
          ref={ref}
        />
      </FormFieldWrapper>
    );
  }
);

FormFieldInput.displayName = 'FormFieldInput';
