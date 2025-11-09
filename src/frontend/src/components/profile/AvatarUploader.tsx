'use client';

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { UploadCloud } from 'lucide-react'

interface Props {
  avatar?: string
  placeholderInitial?: string
  onChange: (avatarDataUrl: string) => void
  onClear: () => void
  onUpdate?: () => void
  updateDisabled?: boolean
}

export default function AvatarUploader({
  avatar,
  placeholderInitial = 'U',
  onChange,
  onClear,
  onUpdate,
  updateDisabled,
}: Props) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadError, setUploadError] = React.useState('')
  const [uploadMeta, setUploadMeta] = React.useState<{ name?: string; sizeKB?: number }>({})
  const [progress, setProgress] = React.useState(0)

  function handleFile(file: File) {
    setUploadError('')
    setUploadMeta({ name: file.name, sizeKB: Math.round(file.size / 1024) })
    if (!['image/png','image/jpeg','image/jpg'].includes(file.type)) {
      setUploadError('Only PNG/JPG images are supported.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File is larger than 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
      setProgress(100)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm">Avatar</Label>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
        <div className="relative h-24 w-24 mx-auto sm:mx-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)]">
          {avatar ? (
            <Image src={avatar} alt="Avatar" fill sizes="96px" className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xl font-semibold">
              {placeholderInitial.slice(0,1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`rounded-md border border-dashed p-3 transition-colors w-full ${isDragging ? 'border-[var(--primary-500)] bg-[color-mix(in_srgb,var(--primary-200),transparent_90%)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 mx-auto sm:mx-0 rounded-md bg-[var(--primary-100)] text-[var(--primary-700)] flex items-center justify-center shrink-0">
                <UploadCloud size={16} />
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="text-sm font-medium">Drag & drop or choose file</div>
                <div className="text-[11px] text-muted-foreground">PNG/JPG • ≤ 2MB</div>
                {uploadMeta.name && (
                  <div className="text-[11px] mt-1 truncate"><span className="font-medium">{uploadMeta.name}</span> {uploadMeta.sizeKB ? `· ${uploadMeta.sizeKB}KB` : ''}</div>
                )}
                {uploadError && (
                  <div className="text-[11px] text-red-500 mt-1">{uploadError}</div>
                )}
                {progress > 0 && progress < 100 && (
                  <div className="h-0.5 w-full bg-[var(--border)] rounded mt-1 overflow-hidden">
                    <div className="h-full bg-[var(--primary-600)]" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button asChild variant="outline" size="sm" className="h-8">
                  <Label className="inline-flex items-center gap-2 cursor-pointer">
                    Choose file
                    <Input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                  </Label>
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => { onClear(); setUploadMeta({}); setUploadError(''); setProgress(0) }}>Remove</Button>
              </div>
            </div>
          </div>
          {onUpdate && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
              <Button type="button" size="sm" className="h-8 w-full sm:w-auto" onClick={onUpdate} disabled={updateDisabled}>
                Update avatar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


