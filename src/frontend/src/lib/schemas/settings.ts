import { z } from 'zod';

export const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Tên trang web là bắt buộc').max(100, 'Tên trang web không được quá 100 ký tự'),
  siteDescription: z.string().min(1, 'Mô tả trang web là bắt buộc').max(500, 'Mô tả không được quá 500 ký tự'),
  siteUrl: z.string().url('URL không hợp lệ'),
  adminEmail: z.string().email('Email không hợp lệ'),
  timezone: z.string().min(1, 'Múi giờ là bắt buộc'),
  language: z.string().min(1, 'Ngôn ngữ là bắt buộc')
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  newUserRegistration: z.boolean(),
  lessonPublished: z.boolean(),
  systemAlerts: z.boolean(),
  weeklyReports: z.boolean(),
  maintenanceMode: z.boolean()
});

export const securitySettingsSchema = z.object({
  requireEmailVerification: z.boolean(),
  allowUserRegistration: z.boolean(),
  maxLoginAttempts: z.number().min(1, 'Số lần đăng nhập tối đa phải lớn hơn 0').max(10, 'Số lần đăng nhập tối đa không được quá 10'),
  sessionTimeout: z.number().min(5, 'Thời gian phiên tối thiểu là 5 phút').max(480, 'Thời gian phiên tối đa là 480 phút'),
  enableTwoFactor: z.boolean(),
  passwordMinLength: z.number().min(6, 'Độ dài mật khẩu tối thiểu là 6 ký tự').max(50, 'Độ dài mật khẩu tối đa là 50 ký tự')
});

export const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Màu chính phải là mã hex hợp lệ'),
  logoUrl: z.string().url('URL logo không hợp lệ').optional().or(z.literal('')),
  faviconUrl: z.string().url('URL favicon không hợp lệ').optional().or(z.literal('')),
  customCSS: z.string().optional()
});

export const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP Host là bắt buộc'),
  smtpPort: z.number().min(1, 'SMTP Port phải lớn hơn 0').max(65535, 'SMTP Port không được quá 65535'),
  smtpUsername: z.string().min(1, 'SMTP Username là bắt buộc'),
  smtpPassword: z.string().min(1, 'SMTP Password là bắt buộc'),
  fromEmail: z.string().email('Email gửi không hợp lệ'),
  fromName: z.string().min(1, 'Tên người gửi là bắt buộc')
});

export const backupSettingsSchema = z.object({
  autoBackup: z.boolean(),
  backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  backupRetention: z.number().min(1, 'Thời gian lưu trữ phải lớn hơn 0').max(365, 'Thời gian lưu trữ không được quá 365 ngày'),
  cloudStorage: z.boolean()
});

export const settingsSchema = z.object({
  general: generalSettingsSchema,
  notifications: notificationSettingsSchema,
  security: securitySettingsSchema,
  appearance: appearanceSettingsSchema,
  email: emailSettingsSchema,
  backup: backupSettingsSchema
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>;
export type EmailSettings = z.infer<typeof emailSettingsSchema>;
export type BackupSettings = z.infer<typeof backupSettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;
