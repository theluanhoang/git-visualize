'use client'
import React, { useState } from 'react'
import { useAuth } from '@/contexts'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, GitFork } from 'lucide-react'
import CodeImageBackground from '@/components/common/CodeImageBackground'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function LoginPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const { login, isLoading } = useAuth()
  const t = useTranslations('auth')
  const isPending = isLoading
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
  type FormValues = z.infer<typeof schema>
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password)
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || t('loginFailed')
      toast.error(t('loginFailed'), { description: message })
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <CodeImageBackground />
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--surface)]/70 border border-[var(--border)]">
            <GitFork className="text-[var(--primary-600)]" />
          </div>
          <h1 className="text-xl font-semibold">Git Visualized Engine</h1>
        </div>
        <Card className="border border-[var(--border)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t('signInToAccount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? t('loggingOut') : t('signIn')}
              </Button>
            </form>
            
            <OAuthButtons 
              isLoading={isPending} 
              disabled={isPending}
              className="mt-6"
            />
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t('dontHaveAccount')} <a href={`/${locale}/auth/register`} className="underline">{t('signUp')}</a>
        </p>
      </div>
    </div>
  )
}