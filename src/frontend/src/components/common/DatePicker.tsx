"use client";

import { Label } from '@/components/ui/label';

type NativeDatePickerProps = {
  value?: string;
  onChange: (v: string) => void;
  id?: string;
  label?: string;
  className?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
  timeValue?: string;
  onTimeChange?: (v: string) => void;
};

export function DatePicker({
  value,
  onChange,
  id,
  label,
  className,
  placeholder = 'Chọn ngày',
  minDate,
  maxDate,
  showTime = false,
  timeValue,
  onTimeChange,
}: NativeDatePickerProps) {
  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={id || 'date'} className="mb-1 inline-block text-sm">
          {label}
        </Label>
      ) : null}
      <div className="flex flex-col gap-2">
        <input
          id={id || 'date'}
          type="date"
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          value={value || ''}
          min={minDate}
          max={maxDate}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {showTime ? (
          <input
            type="time"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            value={timeValue || ''}
            onChange={(e) => onTimeChange?.(e.target.value)}
          />
        ) : null}
      </div>
    </div>
  );
}