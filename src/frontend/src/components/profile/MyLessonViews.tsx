'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyLessonViews } from '@/lib/react-query/hooks/use-lessons';
import { BookOpen, Clock, ArrowRight, PlayCircle, ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MyLessonViews() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'lastViewedAt' | 'viewedAt' | 'viewCount'>('lastViewedAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const pageSize = 12;

  const { data, isLoading, error } = useMyLessonViews({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: sortBy,
    order: sortOrder,
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getTimeAgo = (date: string) => {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
      return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
    } catch {
      return '';
    }
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      'from-blue-500 via-blue-600 to-indigo-600',
      'from-purple-500 via-purple-600 to-pink-600',
      'from-green-500 via-emerald-600 to-teal-600',
      'from-orange-500 via-red-500 to-rose-600',
      'from-cyan-500 via-blue-500 to-indigo-600',
      'from-pink-500 via-rose-500 to-orange-600',
    ];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-3"></div>
              <div className="h-5 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">Không thể tải dữ liệu bài học đã xem.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const views = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Bài học đã xem
          </h2>
          {total > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatNumber(total)} bài học
            </p>
          )}
        </div>

        {views.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={sortBy === 'lastViewedAt' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSortBy('lastViewedAt');
                  setPage(1);
                }}
                className="text-xs"
              >
                Xem gần đây
              </Button>
              <Button
                variant={sortBy === 'viewedAt' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSortBy('viewedAt');
                  setPage(1);
                }}
                className="text-xs"
              >
                Xem lần đầu
              </Button>
              <Button
                variant={sortBy === 'viewCount' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSortBy('viewCount');
                  setPage(1);
                }}
                className="text-xs"
              >
                Xem nhiều nhất
              </Button>
            </div>
            {/* Sort Order Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
                setPage(1);
              }}
              title={sortOrder === 'DESC' ? 'Sắp xếp giảm dần (mới nhất/cao nhất)' : 'Sắp xếp tăng dần (cũ nhất/thấp nhất)'}
              className="flex-shrink-0"
            >
              {sortOrder === 'DESC' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {views.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-2xl"></div>
                <BookOpen className="h-16 w-16 mx-auto relative text-primary/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có bài học nào</h3>
              <p className="text-muted-foreground mb-6">
                Bắt đầu khám phá các bài học để xây dựng lịch sử học tập của bạn
              </p>
              <Link href={`/${locale}/git-theory`}>
                <Button size="lg" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Khám phá bài học
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {views.map((view, index) => (
              <motion.div
                key={view.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/${locale}/git-theory/${view.lesson?.slug || ''}`}
                  className="block group"
                >
                  <Card className="overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColor(index)} opacity-90 group-hover:opacity-100 transition-opacity`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white/80 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
                          <PlayCircle className="h-3 w-3" />
                          {formatNumber(view.viewCount)}x
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-background/20">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min(100, (view.viewCount / 10) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {view.lesson?.title || 'Bài học không có tiêu đề'}
                      </h3>
                      
                      {view.lesson?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {view.lesson.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeAgo(view.lastViewedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          <span>Xem tiếp</span>
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} trong tổng {formatNumber(total)} bài học
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1 px-3 text-sm">
                  <span className="font-medium">{page}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

