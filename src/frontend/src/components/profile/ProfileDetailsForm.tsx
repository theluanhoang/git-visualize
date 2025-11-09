'use client';

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const profileSchema = z.object({
  firstName: z.string().max(50, 'First name is too long').optional().or(z.literal('')),
  lastName: z.string().max(50, 'Last name is too long').optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface Props {
  email?: string
  role?: string
  defaultValues: ProfileFormValues
  saving?: boolean
  onCancel: () => void
  onSubmit: (values: ProfileFormValues) => void
}

export default function ProfileDetailsForm({
  email,
  role,
  defaultValues,
  saving,
  onCancel,
  onSubmit,
}: Props) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onSubmit',
  })

  const errors = form.formState.errors

  return (
    <div className="order-1">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-sm">Email</Label>
            <Input value={email ?? ''} disabled />
            <p className="text-xs text-muted-foreground">Primary email for your account.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Role</Label>
            <Input value={role ?? ''} disabled />
            <p className="text-xs text-muted-foreground">Your current permission level.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">First name</Label>
            <Input {...form.register('firstName')} />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message as string}</p>}
            <p className="text-xs text-muted-foreground">Your given name as it appears on your profile.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Last name</Label>
            <Input {...form.register('lastName')} />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message as string}</p>}
            <p className="text-xs text-muted-foreground">Your family name/surname.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => { form.reset(defaultValues); onCancel() }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!!saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}


