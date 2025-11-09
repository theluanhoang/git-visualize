import { Card } from '@/components/ui/card';
import { TableProps } from './types';
import Pagination from '@/components/common/Pagination';
import { useTranslations } from 'next-intl';

export function AdminTable<T = Record<string, unknown>>({ columns, data, loading = false, emptyMessage, onRowClick, pagination }: TableProps<T>) {
  const t = useTranslations('admin');
  const defaultEmptyMessage = t('noData');
  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          {emptyMessage || defaultEmptyMessage}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-muted/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {column.render ? column.render((row as any)[column.key], row) : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))}
            onPageChange={pagination.onPageChange}
            itemsPerPage={pagination.pageSize}
            totalItems={pagination.totalItems}
            showInfo={pagination.showInfo}
          />
        </div>
      )}
    </Card>
  );
}
