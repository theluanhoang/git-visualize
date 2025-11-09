'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types/user';
import { Smile, Paperclip, Send } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

interface AdminUserEmailDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSend: (params: { userId: string; subject: string; message: string; attachments?: File[] }) => Promise<void>;
}

export default function AdminUserEmailDialog({ open, onClose, user, onSend }: AdminUserEmailDialogProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const getInitials = (text: string) => {
    if (!text) return '?';
    const parts = text.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return text[0]?.toUpperCase() || '?';
  };


  useEffect(() => {
    if (!open || !user) {
      setAttachments([]);
      setShowEmojis(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSubject('');
    setMessage('');
    setAttachments([]);
    setShowEmojis(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [user, open]);

  const handleSend = async () => {
    if (!user) return;
    setSending(true);
    try {
      await onSend({ userId: user.id, subject, message, attachments });
      toast('Đã gửi email thành công', { description: `Email đã được gửi tới ${user.email}` });
      setSubject('');
      setMessage('');
      setAttachments([]);
      setShowEmojis(false);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const serverMsg = error?.response?.data?.message || error?.message || 'Không thể gửi email';
      toast.error('Gửi email thất bại', { description: serverMsg });
    } finally {
      setSending(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setAttachments(prev => [...prev, ...arr]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => `${prev}${emoji}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b px-6 pt-5 pb-4">
          <DialogHeader>
            <DialogTitle>Gửi email</DialogTitle>
            <DialogDescription>
              Gửi email trực tiếp đến người dùng. Nội dung sẽ được gửi qua hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 grid place-items-center text-primary font-semibold">
              {getInitials(user?.name || user?.email || '')}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || user?.email || 'Người dùng'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            {user?.role && (
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full border bg-background text-muted-foreground">
                {user.role}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase text-muted-foreground tracking-wide">Đến</Label>
            <Input value={user?.email ?? ''} disabled className="bg-muted/40" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase text-muted-foreground tracking-wide">Tiêu đề</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Nhập tiêu đề" className="h-10" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground tracking-wide">Nội dung</Label>
            <div className="rounded-lg border bg-background shadow-sm">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                placeholder="Soạn nội dung email..."
                className="min-h-[180px] resize-y border-0 focus-visible:ring-0"
              />
              <div className="flex items-center justify-between border-t px-2 py-1.5 bg-muted/30 rounded-b-lg">
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" onClick={() => setShowEmojis(v => !v)} aria-label="Chèn emoji" className="h-8 w-8">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Đính kèm tệp" className="h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </div>
                <div className="text-xs text-muted-foreground mr-1">{message.length} ký tự</div>
              </div>
            </div>

            {showEmojis && (
              <div className="p-2 border rounded-md bg-background">
                <div className="flex flex-wrap gap-1">
                  {['😀','🎉','🙏','👍','🔥','✨','💡','🚀','✅','❤️','🥳','😎','🤝','🤩','👏','🙌','💯','📌','📝'].map(em => (
                    <button key={em} type="button" className="px-2 py-1 rounded hover:bg-muted" onClick={() => insertEmoji(em)}>{em}</button>
                  ))}
                </div>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground tracking-wide">Tệp đính kèm</Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-background shadow-sm">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]" title={f.name}>{f.name}</span>
                      <button type="button" className="text-muted-foreground hover:text-red-600" onClick={() => removeAttachment(i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-muted-foreground">
              {attachments.length > 0 ? `${attachments.length} tệp đính kèm` : 'Không có tệp đính kèm'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={sending}>Hủy</Button>
              <Button onClick={handleSend} disabled={sending || !subject || !message}>
                {sending ? 'Đang gửi...' : (
                  <span className="inline-flex items-center gap-1">
                    <Send className="h-4 w-4" /> Gửi
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


