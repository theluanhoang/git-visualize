'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPaymentsService, AdminPaymentQuery } from '@/services/admin-payment';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Search, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentStatus, PaymentMethod } from '@/services/payment';

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminPaymentQuery>({
    limit: 20,
    paymentStatus: undefined,
    paymentMethod: undefined,
    search: '',
  });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [refundReason, setRefundReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', page, filters],
    queryFn: () => AdminPaymentsService.getAll({ ...filters, page }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'payments', 'stats'],
    queryFn: () => AdminPaymentsService.getStats(),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount?: number; reason: string }) =>
      AdminPaymentsService.refund(id, { amount, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      toast.success('Hoàn tiền thành công');
      setRefundDialog(false);
      setRefundAmount('');
      setRefundReason('');
    },
  });

  const handleRefund = () => {
    if (!selectedPayment || !refundReason) {
      toast.error('Vui lòng nhập lý do hoàn tiền');
      return;
    }
    refundMutation.mutate({
      id: selectedPayment,
      amount: refundAmount ? Number(refundAmount) : undefined,
      reason: refundReason,
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      COMPLETED: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      REFUNDED: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quản lý Payments</h1>
        <p className="text-muted-foreground">Quản lý tất cả payments và doanh thu</p>
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
              <CardDescription>Thành công</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Doanh thu</CardDescription>
              <CardTitle className="text-2xl">
                {stats.totalRevenue.toLocaleString('vi-VN')} VND
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Doanh thu ròng</CardDescription>
              <CardTitle className="text-2xl">
                {stats.netRevenue.toLocaleString('vi-VN')} VND
              </CardTitle>
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
              value={filters.paymentStatus || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  paymentStatus: value === 'all' ? undefined : (value as PaymentStatus),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.paymentMethod || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  paymentMethod: value === 'all' ? undefined : (value as PaymentMethod),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phương thức</SelectItem>
                <SelectItem value="VNPAY">VNPay</SelectItem>
                <SelectItem value="STRIPE">Stripe</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ limit: 20, paymentStatus: undefined, paymentMethod: undefined, search: '' })
              }
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Payments</CardTitle>
          <CardDescription>Tổng: {data?.total || 0} payments</CardDescription>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Số tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Phương thức
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Ngày thanh toán
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.data.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-mono">
                          {payment.transactionId || payment.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {payment.subscription?.user?.email || payment.subscription?.userId || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {payment.amount.toLocaleString('vi-VN')} {payment.currency}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{payment.paymentMethod}</Badge>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(payment.paymentStatus)}</td>
                        <td className="px-4 py-3 text-sm">
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleDateString('vi-VN')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {payment.paymentStatus === 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayment(payment.id);
                                setRefundAmount(payment.amount);
                                setRefundDialog(true);
                              }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Hoàn tiền
                            </Button>
                          )}
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

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn tiền</DialogTitle>
            <DialogDescription>
              Nhập thông tin hoàn tiền cho payment này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Số tiền hoàn (để trống = hoàn toàn bộ)</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="Số tiền hoàn"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lý do hoàn tiền *</label>
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Lý do hoàn tiền"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleRefund} disabled={refundMutation.isPending || !refundReason}>
              {refundMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận hoàn tiền'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}








