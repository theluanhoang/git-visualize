'use client';

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
  showInfo?: boolean
  allowJump?: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems,
  showInfo = true,
  allowJump = true
}: PaginationProps) {
  const t = useTranslations('common');
  const nf = React.useMemo(() => new Intl.NumberFormat(undefined), []);
  const isCompact = totalPages > 1000; // Avoid rendering many buttons when very large
  const [target, setTarget] = React.useState<string>(String(currentPage));

  React.useEffect(() => {
    setTarget(String(currentPage));
  }, [currentPage]);

  const jump = (e?: React.FormEvent) => {
    e?.preventDefault();
    const n = Number(target);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(1, Math.min(totalPages || 1, Math.floor(n)));
    if (clamped !== currentPage) onPageChange(clamped);
  };
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {showInfo && typeof totalItems === 'number' && (
        <div className="text-sm text-muted-foreground">
          {t('showingResults', { start: nf.format(startItem), end: nf.format(endItem), total: nf.format(totalItems) })}
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {isCompact ? (
          <div className="mx-2 text-sm text-muted-foreground whitespace-nowrap">
            {nf.format(currentPage)} / {nf.format(totalPages)}
          </div>
        ) : (
          visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="flex h-8 w-8 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {allowJump && (
          <form onSubmit={jump} className="ml-2 flex items-center gap-1">
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-8 w-16 px-2 text-sm"
              aria-label={t('page', { default: 'Page' })}
            />
            <Button type="submit" variant="outline" size="sm" className="h-8 px-2">
              {t('go', { default: 'Go' })}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
