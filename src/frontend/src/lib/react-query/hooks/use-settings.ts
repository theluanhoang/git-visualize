import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsKeys } from '@/lib/react-query/query-keys';
import { Settings } from '@/lib/schemas/settings';

const settingsApi = {
  get: async (): Promise<Settings> => {
    return {
      general: {
        siteName: 'Git Learning Platform',
        siteDescription: 'Học Git một cách trực quan và hiệu quả',
        siteUrl: 'https://git-learning.com',
        adminEmail: 'admin@git-learning.com',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi'
      },
      notifications: {
        emailNotifications: true,
        newUserRegistration: true,
        lessonPublished: true,
        systemAlerts: true,
        weeklyReports: true,
        maintenanceMode: false
      },
      security: {
        requireEmailVerification: true,
        allowUserRegistration: true,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        enableTwoFactor: false,
        passwordMinLength: 8
      },
      appearance: {
        theme: 'light',
        primaryColor: '#3B82F6',
        logoUrl: '',
        faviconUrl: '',
        customCSS: ''
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        fromEmail: 'noreply@git-learning.com',
        fromName: 'Git Learning Platform'
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        cloudStorage: false
      }
    };
  },
  
  update: async (data: Settings) => {
    return data;
  }
};

export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsApi.get,
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
};
