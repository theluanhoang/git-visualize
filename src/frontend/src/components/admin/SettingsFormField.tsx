import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';

export interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'color' | 'textarea' | 'select' | 'toggle';
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  className?: string;
}

export function SettingsFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  options = [],
  description,
  className = ''
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{label}</h3>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <Toggle pressed={value} onPressedChange={onChange} />
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-1 w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm ${className}`}
            placeholder={placeholder}
          />
        );
      
      default:
        return (
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-1 ${className}`}
            placeholder={placeholder}
          />
        );
    }
  };

  if (type === 'toggle') {
    return <div className="space-y-4">{renderInput()}</div>;
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {renderInput()}
    </div>
  );
}
