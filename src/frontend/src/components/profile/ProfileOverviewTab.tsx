'use client';

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import AvatarUploader from '@/components/profile/AvatarUploader'
import ProfileDetailsForm from '@/components/profile/ProfileDetailsForm'

interface UserLite {
  email?: string
  role?: string
  firstName?: string
  lastName?: string
  avatar?: string
}

interface Props {
  user?: UserLite | null
  firstName: string
  lastName: string
  avatar: string
  saving?: boolean
  onChangeAvatar: (v: string) => void
  onCancel: () => void
  onSave: (values: { firstName?: string; lastName?: string; avatar?: string }) => void
}

export default function ProfileOverviewTab({
  user,
  firstName,
  lastName,
  avatar,
  saving,
  onChangeAvatar,
  onCancel,
  onSave,
}: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3 order-2">
            <AvatarUploader
              avatar={avatar}
              placeholderInitial={(user?.email ?? 'U').slice(0,1)}
              onChange={onChangeAvatar}
              onClear={() => onChangeAvatar('')}
              onUpdate={() => onSave({ firstName, lastName, avatar })}
              updateDisabled={!!saving || !avatar}
            />
            <p className="text-xs text-muted-foreground">Tip: Kéo thả ảnh vào khung hoặc chọn file. Xem trước sẽ hiển thị bên trái.</p>
          </div>

          <ProfileDetailsForm
            email={user?.email}
            role={user?.role}
            defaultValues={{ firstName, lastName }}
            saving={saving}
            onCancel={onCancel}
            onSubmit={(vals) => onSave({ ...vals, avatar })}
          />
        </div>
      </CardContent>
    </Card>
  )
}


