'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormFieldWrapper } from './FormFieldWrapper';

interface FormFieldSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormFieldSelect({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  description, 
  error, 
  required = false,
  disabled = false,
  className 
}: FormFieldSelectProps) {
  return (
    <FormFieldWrapper
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
}
