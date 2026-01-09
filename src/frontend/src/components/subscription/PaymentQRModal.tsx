'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, Clock, XCircle, QrCode, Building2 } from 'lucide-react';
import { Payment } from '@/services/payment';
import { usePayment } from '@/hooks/use-payment';
import { usePaymentWebSocket } from '@/hooks/use-payment-websocket';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Helper để format bank name
const formatBankName = (bankCode: string | null | undefined): string => {
  if (!bankCode) return '';
  const bankNames: Record<string, string> = {
    VCB: 'Vietcombank',
    TCB: 'Techcombank',
    VTB: 'VietinBank',
    ACB: 'ACB',
    VPB: 'VPBank',
    MSB: 'MSB',
    TPB: 'TPBank',
    HDB: 'HDBank',
    OCB: 'OCB',
    MB: 'MBBank',
    BID: 'BIDV',
    VBA: 'Agribank',
  };
  return bankNames[bankCode] || bankCode;
};

interface PaymentQRModalProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: () => void;
}

export function PaymentQRModal({ payment, open, onOpenChange, onPaymentSuccess }: PaymentQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false);
  const { user } = useAuth();
  const paymentId = payment?.id;
  const userId = user?.id;

  // Debug: Log userId để kiểm tra
  React.useEffect(() => {
    if (open && userId) {
      console.log('🔍 [PaymentQRModal] User info:', {
        userId,
        userEmail: user?.email,
        paymentId,
        paymentUserId: payment?.userId,
        userIdMatch: userId === payment?.userId,
        timestamp: new Date().toISOString(),
      });
    }
  }, [open, userId, user?.email, paymentId, payment?.userId]);

  // Chỉ fetch payment một lần khi mở modal
  const { data: currentPayment, refetch } = usePayment(paymentId || '', {
    enabled: !!paymentId && open,
  });

  const displayPayment: Payment | null = (currentPayment as Payment | undefined) || payment;

  // Sử dụng WebSocket để nhận thông báo thanh toán real-time
  // Join socket khi mở modal (không cần đợi payment PENDING)
  const { isConnected: isSocketConnected } = usePaymentWebSocket({
    enabled: open && !!userId,
    userId: userId || undefined,
    onPaymentCompleted: (data) => {
      console.log('🎉 PaymentQRModal: Payment completed callback received', {
        receivedPaymentId: data.paymentId,
        currentPaymentId: paymentId,
        hasTriggeredSuccess,
        data,
      });
      
      if (data.paymentId === paymentId && !hasTriggeredSuccess) {
        console.log('✅ PaymentQRModal: Processing payment completion...');
        setHasTriggeredSuccess(true);
        toast.success('🎉 Thanh toán thành công! Tài khoản Pro đã được kích hoạt.');
        setTimeout(() => {
          console.log('✅ PaymentQRModal: Closing modal and calling onPaymentSuccess');
          onPaymentSuccess?.();
          onOpenChange(false);
        }, 2000);
      } else {
        console.warn('⚠️ PaymentQRModal: Payment ID mismatch or already processed', {
          receivedPaymentId: data.paymentId,
          currentPaymentId: paymentId,
          hasTriggeredSuccess,
        });
      }
    },
  });

  // Debug: Log payment data để kiểm tra (chỉ trong development)
  React.useEffect(() => {
    if (open && displayPayment && process.env.NODE_ENV === 'development') {
      console.log('🔍 PaymentQRModal Debug:', {
        paymentId: displayPayment.id,
        status: displayPayment.status,
        amount: displayPayment.amount,
        isSocketConnected,
        hasTriggeredSuccess,
        timestamp: new Date().toISOString(),
      });
    }
  }, [open, displayPayment, isSocketConnected, hasTriggeredSuccess]);

  // Reset hasTriggeredSuccess khi modal đóng
  React.useEffect(() => {
    if (!open) {
      setHasTriggeredSuccess(false);
    }
  }, [open]);

  const handleCopyAccount = () => {
    if (displayPayment?.bankAccount) {
      navigator.clipboard.writeText(displayPayment.bankAccount);
      setCopied(true);
      toast.success('Đã copy số tài khoản');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAmount = () => {
    if (displayPayment?.amount) {
      navigator.clipboard.writeText(displayPayment.amount.toString());
      toast.success('Đã copy số tiền');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (!displayPayment) {
    return null;
  }

  const getStatusBadge = () => {
    switch (displayPayment.status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" />Đã thanh toán</Badge>;
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Đang chờ thanh toán</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Thất bại</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline"><XCircle className="mr-1 h-3 w-3" />Đã hủy</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thanh toán nâng cấp Pro</DialogTitle>
          <DialogDescription>
            Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trạng thái:</span>
            {getStatusBadge()}
          </div>

          {/* QR Code */}
          {displayPayment.status === 'PENDING' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Mã QR thanh toán
                </CardTitle>
                <CardDescription>
                  Quét mã QR bằng ứng dụng ngân hàng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {(displayPayment.qrCode || displayPayment.paymentUrl) ? (
                  <>
                    <div className="relative w-64 h-64 bg-white p-4 rounded-lg border-2 border-dashed flex items-center justify-center">
                      <img
                        src={displayPayment.qrCode || displayPayment.paymentUrl || ''}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('❌ QR Code image load error');
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent && !parent.querySelector('.qr-error-fallback')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'qr-error-fallback text-center text-muted-foreground';
                            errorDiv.innerHTML = `
                              <div class="text-4xl mb-2">📱</div>
                              <p class="text-sm font-medium mb-1">Không thể tải QR code</p>
                              <p class="text-xs">Vui lòng sử dụng thông tin chuyển khoản bên dưới</p>
                            `;
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                    </div>
                    {(displayPayment.qrCode || displayPayment.paymentUrl) && (
                      <div className="text-xs text-muted-foreground text-center space-y-1">
                        <p>
                          Hoặc mở URL: <a 
                            href={displayPayment.qrCode || displayPayment.paymentUrl || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary underline break-all"
                          >
                            Mở QR code trong trình duyệt
                          </a>
                        </p>
                        <p className="text-[10px] opacity-70 break-all max-w-md">
                          {displayPayment.qrCode || displayPayment.paymentUrl}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-64 h-64 bg-muted rounded-lg border-2 border-dashed flex items-center justify-center">
                    <div className="text-center space-y-2 p-4">
                      <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">QR code chưa được tạo</p>
                      <p className="text-xs text-muted-foreground">Vui lòng sử dụng thông tin chuyển khoản bên dưới</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Thông tin chuyển khoản
              </CardTitle>
              <CardDescription>
                Chuyển khoản theo thông tin sau
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Số tiền:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {formatAmount(displayPayment.amount)} {displayPayment.currency || 'VND'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAmount}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bank Account */}
              {displayPayment.bankAccount && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold">
                      {displayPayment.bankAccount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAccount}
                      className="h-8 w-8 p-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Bank Name */}
              {displayPayment.bankName && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Ngân hàng:</span>
                  <span className="text-lg font-semibold">{formatBankName(displayPayment.bankName)}</span>
                </div>
              )}

              {/* Description */}
              {displayPayment.description && (
                <div className="p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium block mb-1">Nội dung chuyển khoản:</span>
                  <span className="text-sm text-muted-foreground">{displayPayment.description}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Hướng dẫn thanh toán:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Quét mã QR bằng ứng dụng ngân hàng hoặc chuyển khoản theo thông tin trên</li>
                <li>Nhập đúng số tiền: <strong>{formatAmount(displayPayment.amount)} VND</strong></li>
                <li>Nội dung chuyển khoản: <strong>{displayPayment.description || 'Thanh toán nâng cấp Pro'}</strong></li>
                <li>Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận trong vài phút</li>
                <li>Tài khoản Pro sẽ được kích hoạt tự động sau khi thanh toán thành công</li>
              </ol>
            </CardContent>
          </Card>

          {/* Info message */}
          {displayPayment.status === 'PENDING' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {isSocketConnected ? (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Đang chờ xác nhận thanh toán (real-time)...</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Đang chờ thanh toán...</span>
                  </>
                )}
              </div>
              <div className="text-xs text-center text-muted-foreground">
                Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận và kích hoạt tài khoản Pro ngay lập tức.
                {!isSocketConnected && ' (Đang kết nối WebSocket...)'}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Đóng
            </Button>
            {displayPayment.status === 'PENDING' && (
              <Button
                variant="secondary"
                onClick={async () => {
                  // Cho phép user refresh thủ công nếu muốn
                  await refetch();
                  toast.info('Đã kiểm tra lại. Hệ thống đang tự động kiểm tra mỗi 3 giây.');
                }}
                className="flex-1"
              >
                Làm mới
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

