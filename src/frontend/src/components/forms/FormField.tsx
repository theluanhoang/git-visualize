'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'color' | 'textarea' | 'select' | 'toggle';
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    id, 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    options, 
    description, 
    className,
    error,
    disabled = false
  }, ref) => {
    const renderInput = () => {
      switch (type) {
        case 'select':
          return (
            <Select value={value} onValueChange={onChange} disabled={disabled}>
              <SelectTrigger className={cn("mt-1", className)}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'toggle':
          return (
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-sm font-medium text-foreground">{label}</h3>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
              <Toggle
                pressed={value}
                onPressedChange={onChange}
                disabled={disabled}
              />
            </div>
          );
        case 'textarea':
          return (
            <textarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn("mt-1 w-full h-32 p-3 border border-border rounded-md font-mono text-sm bg-background text-foreground", className)}
              placeholder={placeholder}
              disabled={disabled}
            />
          );
        case 'color':
          return (
            <Input
              id={id}
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn("mt-1 h-10 w-full", className)}
              disabled={disabled}
            />
          );
        default:
          return (
            <Input
              id={id}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn("mt-1", className)}
              disabled={disabled}
              ref={ref}
            />
          );
      }
    };

    return (
      <div className={type === 'toggle' ? '' : 'space-y-1'}>
        {type !== 'toggle' && <Label htmlFor={id}>{label}</Label>}
        {renderInput()}
        {type !== 'toggle' && description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
