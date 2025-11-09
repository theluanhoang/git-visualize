'use client';

import React from 'react';
import Link from 'next/link';
import { useLessons } from '@/lib/react-query/hooks/use-lessons';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function GitTheoryPage() {
  const router = useRouter();
  const { data, isLoading, error } = useLessons({
    limit: 100,
    offset: 0,
    status: 'published'
  });

  React.useEffect(() => {
    if (data && data.length > 0) {
      const sorted = [...data].sort((a: any, b: any) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id ?? 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id ?? 0;
        return aTime - bTime;
      });
      const first = sorted[0];
      if (first?.slug) {
        router.replace(`/git-theory/${first.slug}`);
      }
    }
  }, [data, router]);

  if (isLoading) return <div className="p-4">Đang tải bài học...</div>;
  if (error) return <div className="p-4 text-red-500">Không tải được danh sách bài học.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách bài học</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((lesson: any) => (
          <Link key={lesson.id ?? lesson.slug} href={`/git-theory/${lesson.slug}`} className="block border rounded-md p-4 hover:bg-muted/40">
            <h2 className="font-semibold text-lg">{lesson.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{lesson.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}