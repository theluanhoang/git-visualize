'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserStatus } from '@/types/user';

interface AdminUserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSaveStatus: (userId: string, isActive: boolean) => Promise<void>;
}

export default function AdminUserEditDialog({ open, onClose, user, onSaveStatus }: AdminUserEditDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'banned' | string>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const [fn, ...ln] = (user.name || '').split(' ');
    setFirstName(fn || '');
    setLastName(ln.join(' '));
    setEmail(user.email || '');
    setStatus(user.status);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await onSaveStatus(user.id, status === 'active');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>
            Cập nhật trạng thái hoạt động. Các trường khác sẽ được hỗ trợ khi backend sẵn sàng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled />
            </div>
            <div className="space-y-2">
              <Label>Tên</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
          </div>
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={(v: UserStatus) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


