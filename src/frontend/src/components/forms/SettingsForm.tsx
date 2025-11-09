'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema, Settings } from '@/lib/schemas/settings';
import { useSettings, useUpdateSettings } from '@/lib/react-query/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Save, AlertTriangle } from 'lucide-react';
import { PageHeader, SettingsSidebar, SettingsSection } from '@/components/admin';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function SettingsForm() {
  const [activeTab, setActiveTab] = useState('general');
  const t = useTranslations('admin.settings');
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {},
    values: settings
  });

  const onSubmit = async (data: Settings) => {
    try {
      await updateSettingsMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const tabs = [
    { id: 'general', label: t('general'), icon: require('lucide-react').Settings },
    { id: 'notifications', label: t('notifications'), icon: require('lucide-react').Bell },
    { id: 'security', label: t('security'), icon: require('lucide-react').Shield },
    { id: 'appearance', label: t('appearance'), icon: require('lucide-react').Palette },
    { id: 'email', label: t('email'), icon: require('lucide-react').Mail },
    { id: 'backup', label: t('backup'), icon: require('lucide-react').Database }
  ];

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('title')}
        description={t('description')}
        actions={
          <div className="flex items-center gap-3">
            {isDirty && (
              <div className="flex items-center text-sm text-orange-500">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {t('unsavedChanges')}
              </div>
            )}
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {}
        <div className="lg:col-span-1">
          <SettingsSidebar 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)}>
            {}
            {activeTab === 'general' && (
              <SettingsSection
                title={t('generalSettings')}
                layout="mixed"
                fields={[
                  {
                    id: "siteName",
                    label: t('siteName'),
                    type: "text",
                    value: watch('general.siteName') || '',
                    onChange: (value) => setValue('general.siteName', value as string)
                  },
                  {
                    id: "siteUrl",
                    label: t('siteUrl'),
                    type: "text",
                    value: watch('general.siteUrl') || '',
                    onChange: (value) => setValue('general.siteUrl', value as string)
                  },
                  {
                    id: "siteDescription",
                    label: t('siteDescription'),
                    type: "text",
                    value: watch('general.siteDescription') || '',
                    onChange: (value) => setValue('general.siteDescription', value as string)
                  },
                  {
                    id: "adminEmail",
                    label: t('adminEmail'),
                    type: "email",
                    value: watch('general.adminEmail') || '',
                    onChange: (value) => setValue('general.adminEmail', value as string)
                  },
                  {
                    id: "timezone",
                    label: t('timezone'),
                    type: "select",
                    value: watch('general.timezone') || 'UTC',
                    onChange: (value) => setValue('general.timezone', value as string),
                    options: [
                      { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh" },
                      { value: "UTC", label: "UTC" },
                      { value: "America/New_York", label: "America/New_York" }
                    ]
                  }
                ]}
              />
            )}

            {}
            {activeTab === 'notifications' && (
              <SettingsSection
                title={t('notificationSettings')}
                layout="mixed"
                fields={[
                  {
                    id: "emailNotifications",
                    label: t('emailNotifications'),
                    type: "toggle",
                    value: watch('notifications.emailNotifications') || false,
                    onChange: (value) => setValue('notifications.emailNotifications', value as boolean),
                    description: t('emailNotificationsDesc')
                  },
                  {
                    id: "newUserRegistration",
                    label: t('newUserRegistration'),
                    type: "toggle",
                    value: watch('notifications.newUserRegistration') || false,
                    onChange: (value) => setValue('notifications.newUserRegistration', value as boolean),
                    description: t('newUserRegistrationDesc')
                  },
                  {
                    id: "lessonPublished",
                    label: t('lessonPublished'),
                    type: "toggle",
                    value: watch('notifications.lessonPublished') || false,
                    onChange: (value) => setValue('notifications.lessonPublished', value as boolean),
                    description: t('lessonPublishedDesc')
                  },
                  {
                    id: "systemAlerts",
                    label: t('systemAlerts'),
                    type: "toggle",
                    value: watch('notifications.systemAlerts') || false,
                    onChange: (value) => setValue('notifications.systemAlerts', value as boolean),
                    description: t('systemAlertsDesc')
                  },
                  {
                    id: "weeklyReports",
                    label: t('weeklyReports'),
                    type: "toggle",
                    value: watch('notifications.weeklyReports') || false,
                    onChange: (value) => setValue('notifications.weeklyReports', value as boolean),
                    description: t('weeklyReportsDesc')
                  }
                ]}
              />
            )}

            {}
            {activeTab === 'security' && (
              <SettingsSection
                title={t('securitySettings')}
                layout="mixed"
                fields={[
                  {
                    id: "requireEmailVerification",
                    label: t('requireEmailVerification'),
                    type: "toggle",
                    value: watch('security.requireEmailVerification') || false,
                    onChange: (value) => setValue('security.requireEmailVerification', value as boolean),
                    description: t('requireEmailVerificationDesc')
                  },
                  {
                    id: "allowUserRegistration",
                    label: t('allowUserRegistration'),
                    type: "toggle",
                    value: watch('security.allowUserRegistration') || false,
                    onChange: (value) => setValue('security.allowUserRegistration', value as boolean),
                    description: t('allowUserRegistrationDesc')
                  },
                  {
                    id: "enableTwoFactor",
                    label: t('enableTwoFactor'),
                    type: "toggle",
                    value: watch('security.enableTwoFactor') || false,
                    onChange: (value) => setValue('security.enableTwoFactor', value as boolean),
                    description: t('enableTwoFactorDesc')
                  },
                  {
                    id: "maxLoginAttempts",
                    label: t('maxLoginAttempts'),
                    type: "number",
                    value: watch('security.maxLoginAttempts') || 5,
                    onChange: (value) => setValue('security.maxLoginAttempts', parseInt(value as string))
                  },
                  {
                    id: "sessionTimeout",
                    label: t('sessionTimeout'),
                    type: "number",
                    value: watch('security.sessionTimeout') || 30,
                    onChange: (value) => setValue('security.sessionTimeout', parseInt(value as string))
                  }
                ]}
              />
            )}

            {}
            {activeTab === 'appearance' && (
              <SettingsSection
                title={t('appearanceSettings')}
                layout="mixed"
                fields={[
                  {
                    id: "theme",
                    label: t('theme'),
                    type: "select",
                    value: watch('appearance.theme') || 'light',
                    onChange: (value) => setValue('appearance.theme', value as any),
                    options: [
                      { value: "light", label: t('light') },
                      { value: "dark", label: t('dark') },
                      { value: "auto", label: t('auto') }
                    ]
                  },
                  {
                    id: "primaryColor",
                    label: t('primaryColor'),
                    type: "color",
                    value: watch('appearance.primaryColor') || '#000000',
                    onChange: (value) => setValue('appearance.primaryColor', value as string),
                    className: "h-10"
                  },
                  {
                    id: "logoUrl",
                    label: t('logoUrl'),
                    type: "text",
                    value: watch('appearance.logoUrl') || '',
                    onChange: (value) => setValue('appearance.logoUrl', value as string),
                    placeholder: "https://example.com/logo.png"
                  },
                  {
                    id: "faviconUrl",
                    label: t('faviconUrl'),
                    type: "text",
                    value: watch('appearance.faviconUrl') || '',
                    onChange: (value) => setValue('appearance.faviconUrl', value as string),
                    placeholder: "https://example.com/favicon.ico"
                  },
                  {
                    id: "customCSS",
                    label: t('customCSS'),
                    type: "textarea",
                    value: watch('appearance.customCSS') || '',
                    onChange: (value) => setValue('appearance.customCSS', value as string),
                    placeholder: ""
                  }
                ]}
              />
            )}

            {}
            {activeTab === 'email' && (
              <SettingsSection
                title={t('emailSettings')}
                layout="double"
                fields={[
                  {
                    id: "smtpHost",
                    label: t('smtpHost'),
                    type: "text",
                    value: watch('email.smtpHost') || '',
                    onChange: (value) => setValue('email.smtpHost', value as string)
                  },
                  {
                    id: "smtpPort",
                    label: t('smtpPort'),
                    type: "number",
                    value: watch('email.smtpPort') || 587,
                    onChange: (value) => setValue('email.smtpPort', parseInt(value as string))
                  },
                  {
                    id: "smtpUsername",
                    label: t('smtpUsername'),
                    type: "text",
                    value: watch('email.smtpUsername') || '',
                    onChange: (value) => setValue('email.smtpUsername', value as string)
                  },
                  {
                    id: "smtpPassword",
                    label: t('smtpPassword'),
                    type: "password",
                    value: watch('email.smtpPassword') || '',
                    onChange: (value) => setValue('email.smtpPassword', value as string)
                  },
                  {
                    id: "fromEmail",
                    label: t('fromEmail'),
                    type: "email",
                    value: watch('email.fromEmail') || '',
                    onChange: (value) => setValue('email.fromEmail', value as string)
                  },
                  {
                    id: "fromName",
                    label: t('fromName'),
                    type: "text",
                    value: watch('email.fromName') || '',
                    onChange: (value) => setValue('email.fromName', value as string)
                  }
                ]}
              />
            )}

            {}
            {activeTab === 'backup' && (
              <SettingsSection
                title={t('backupSettings')}
                layout="mixed"
                fields={[
                  {
                    id: "autoBackup",
                    label: t('autoBackup'),
                    type: "toggle",
                    value: watch('backup.autoBackup') || false,
                    onChange: (value) => setValue('backup.autoBackup', value as boolean),
                    description: t('autoBackupDesc')
                  },
                  {
                    id: "cloudStorage",
                    label: t('cloudStorage'),
                    type: "toggle",
                    value: watch('backup.cloudStorage') || false,
                    onChange: (value) => setValue('backup.cloudStorage', value as boolean),
                    description: t('cloudStorageDesc')
                  },
                  {
                    id: "backupFrequency",
                    label: t('backupFrequency'),
                    type: "select",
                    value: watch('backup.backupFrequency') || 'daily',
                    onChange: (value) => setValue('backup.backupFrequency', value as any),
                    options: [
                      { value: "hourly", label: t('hourly') },
                      { value: "daily", label: t('daily') },
                      { value: "weekly", label: t('weekly') },
                      { value: "monthly", label: t('monthly') }
                    ]
                  },
                  {
                    id: "backupRetention",
                    label: t('backupRetention'),
                    type: "number",
                    value: watch('backup.backupRetention') || 30,
                    onChange: (value) => setValue('backup.backupRetention', parseInt(value as string))
                  }
                ]}
                actions={[
                  {
                    label: t('createBackup'),
                    onClick: () => {},
                    variant: "outline"
                  }
                ]}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
