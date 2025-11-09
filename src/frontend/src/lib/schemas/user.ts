import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1, 'Tên là bắt buộc').max(100, 'Tên không được quá 100 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['student', 'instructor', 'admin'], {
    required_error: 'Vai trò là bắt buộc'
  }),
  status: z.enum(['active', 'inactive', 'banned'], {
    required_error: 'Trạng thái là bắt buộc'
  }),
  avatar: z.string().url('URL avatar không hợp lệ').optional().or(z.literal('')),
  bio: z.string().max(500, 'Tiểu sử không được quá 500 ký tự').optional(),
  website: z.string().url('URL website không hợp lệ').optional().or(z.literal('')),
  location: z.string().max(100, 'Địa điểm không được quá 100 ký tự').optional(),
  timezone: z.string().optional(),
  language: z.string().optional()
});

export const userUpdateSchema = userSchema.partial();

export const userCreateSchema = userSchema.omit({ status: true }).extend({
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const userProfileSchema = userSchema.pick({
  name: true,
  email: true,
  avatar: true,
  bio: true,
  website: true,
  location: true,
  timezone: true,
  language: true
});

export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type UserCreateData = z.infer<typeof userCreateSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
