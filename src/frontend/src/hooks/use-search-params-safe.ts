import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export interface SearchParamsResult {
  get: (key: string) => string | null;
  getAll: (key: string) => string[];
  has: (key: string) => boolean;
  keys: () => IterableIterator<string>;
  values: () => IterableIterator<string>;
  entries: () => IterableIterator<[string, string]>;
  toString: () => string;
  size: number;
}

export function useSearchParamsSafe(): SearchParamsResult {
  const searchParams = useNextSearchParams();
  
  return useMemo(() => ({
    get: (key: string) => searchParams.get(key),
    getAll: (key: string) => searchParams.getAll(key),
    has: (key: string) => searchParams.has(key),
    keys: () => searchParams.keys(),
    values: () => searchParams.values(),
    entries: () => searchParams.entries(),
    toString: () => searchParams.toString(),
    size: Array.from(searchParams.keys()).length,
  }), [searchParams]);
}

