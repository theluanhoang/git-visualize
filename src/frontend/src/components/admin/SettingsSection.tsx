import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsFormField } from './SettingsFormField';

export interface SettingsSectionProps {
  title: string;
  fields: Array<{
    id: string;
    label: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'color' | 'textarea' | 'select' | 'toggle';
    value: unknown;
    onChange: (value: unknown) => void;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    description?: string;
    className?: string;
  }>;
  layout?: 'single' | 'double' | 'mixed';
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
}

export function SettingsSection({ title, fields, layout = 'single', actions }: SettingsSectionProps) {
  const renderField = (field: SettingsSectionProps['fields'][0], index: number) => (
    <SettingsFormField key={field.id || index} {...field} />
  );

  const renderFields = () => {
    if (layout === 'double') {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {fields.map(renderField)}
        </div>
      );
    }
    
    if (layout === 'mixed') {
      const toggleFields = fields.filter(f => f.type === 'toggle');
      const otherFields = fields.filter(f => f.type !== 'toggle');
      
      return (
        <div className="space-y-6">
          {toggleFields.length > 0 && (
            <div className="space-y-4">
              {toggleFields.map(renderField)}
            </div>
          )}
          {otherFields.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {otherFields.map(renderField)}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {fields.map(renderField)}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">{title}</h2>
      {renderFields()}
      {actions && actions.length > 0 && (
        <div className="pt-4 border-t border-gray-200 mt-6">
          <div className="flex items-center justify-between">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
