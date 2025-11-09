import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  filters?: FilterConfig[];
  showSortButton?: boolean;
  onSortClick?: () => void;
  sortButtonText?: string;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filterValue,
  onFilterChange,
  filterOptions = [],
  filterLabel,
  filters,
  showSortButton = false,
  onSortClick,
  sortButtonText
}: FilterBarProps) {
  const t = useTranslations('common');
  const useMultipleFilters = filters && filters.length > 0;
  const useSingleFilter = !useMultipleFilters && filterOptions.length > 0 && onFilterChange;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder || t('search')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          {}
          {useMultipleFilters && filters.map((filter) => (
            <Select key={filter.id} value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          
          {}
          {useSingleFilter && (
            <Select value={filterValue} onValueChange={onFilterChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {showSortButton && onSortClick && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onSortClick}>
              <Filter className="h-4 w-4 mr-2" />
              {sortButtonText || t('sort')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
