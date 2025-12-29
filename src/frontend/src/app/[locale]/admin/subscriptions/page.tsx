'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminSubscriptionsService, AdminSubscriptionQuery } from '@/services/admin-subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Using simple HTML table instead
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Search, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
// Using simple date formatting
import type { SubscriptionStatus, SubscriptionPlanType } from '@/services/subscription';

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminSubscriptionQuery>({
    limit: 20,
    status: undefined,
    planType: undefined,
    search: '',
  });
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<'extend' | 'activate' | 'deactivate' | 'cancel' | null>(null);
  const [extendDays, setExtendDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', page, filters],
    queryFn: () => AdminSubscriptionsService.getAll({ ...filters, page }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'subscriptions', 'stats'],
    queryFn: () => AdminSubscriptionsService.getStats(),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => AdminSubscriptionsService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      toast.success('Kích hoạt subscription thành công');
      setActionDialog(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => AdminSubscriptionsService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      toast.success('Vô hiệu hóa subscription thành công');
      setActionDialog(null);
    },
  });

  const extendMutation = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      AdminSubscriptionsService.extend(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      toast.success('Gia hạn subscription thành công');
      setActionDialog(null);
      setExtendDays(30);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => AdminSubscriptionsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      toast.success('Hủy subscription thành công');
      setActionDialog(null);
    },
  });

  const handleAction = () => {
    if (!selectedSubscription) return;

    switch (actionDialog) {
      case 'activate':
        activateMutation.mutate(selectedSubscription);
        break;
      case 'deactivate':
        deactivateMutation.mutate(selectedSubscription);
        break;
      case 'extend':
        extendMutation.mutate({ id: selectedSubscription, days: extendDays });
        break;
      case 'cancel':
        cancelMutation.mutate(selectedSubscription);
        break;
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const variants: Record<SubscriptionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      PENDING: 'secondary',
      CANCELLED: 'outline',
      EXPIRED: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý Subscriptions</h1>
        <p className="text-muted-foreground">Quản lý tất cả subscriptions và Pro users</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổng số</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Đang hoạt động</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Đã hủy</CardDescription>
              <CardTitle className="text-2xl">{stats.cancelled}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Hết hạn</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.expired}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value === 'all' ? undefined : (value as SubscriptionStatus) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.planType || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, planType: value === 'all' ? undefined : (value as SubscriptionPlanType) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Gói" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả gói</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setFilters({ limit: 20, status: undefined, planType: undefined, search: '' })}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Subscriptions</CardTitle>
          <CardDescription>
            Tổng: {data?.total || 0} subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Gói</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ngày bắt đầu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ngày kết thúc</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Auto Renew</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.data.map((subscription: any) => (
                      <tr key={subscription.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">
                          {subscription.user?.email || subscription.userId}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{subscription.planType}</Badge>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(subscription.status)}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(subscription.startDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(subscription.endDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          {subscription.autoRenew ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSubscription(subscription.id);
                                setActionDialog('activate');
                              }}
                              disabled={subscription.status === 'ACTIVE'}
                            >
                              Kích hoạt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSubscription(subscription.id);
                                setActionDialog('extend');
                              }}
                            >
                              Gia hạn
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedSubscription(subscription.id);
                                setActionDialog('cancel');
                              }}
                            >
                              Hủy
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.total > (filters.limit || 20) && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Trang {page} / {Math.ceil(data.total / (filters.limit || 20))}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(data.total / (filters.limit || 20))}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Dialogs */}
      <Dialog open={actionDialog === 'extend'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gia hạn Subscription</DialogTitle>
            <DialogDescription>
              Nhập số ngày muốn gia hạn
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            value={extendDays}
            onChange={(e) => setExtendDays(parseInt(e.target.value) || 30)}
            min={1}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleAction}
              disabled={extendMutation.isPending}
            >
              {extendMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Gia hạn'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'activate'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kích hoạt Subscription</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn kích hoạt subscription này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Hủy
            </Button>
            <Button onClick={handleAction} disabled={activateMutation.isPending}>
              {activateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Kích hoạt'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog === 'cancel'} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy Subscription</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy subscription này?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleAction} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận hủy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

