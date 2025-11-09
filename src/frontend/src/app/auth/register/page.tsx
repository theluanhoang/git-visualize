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

export default function RegisterPage() {
  const [ok, setOk] = useState<string | null>(null)
  const { register, isLoading } = useAuth()
  const isPending = isLoading
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
  type FormValues = z.infer<typeof schema>
  const { register: rhfRegister, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (values: FormValues) => {
    setOk(null)
    try {
      await register(values.email, values.password)
      setOk('Registered. You can login now.')
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Register failed'
      toast.error('Register failed', { description: message })
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
            <CardTitle className="text-xl">Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {ok && <p className="text-sm text-green-600">{ok}</p>}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" placeholder="you@example.com" {...rhfRegister('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} {...rhfRegister('password')} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? 'Creating account...' : 'Create account'}
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
          Already have an account? <a href="/auth/login" className="underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}