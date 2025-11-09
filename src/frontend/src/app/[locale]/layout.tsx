import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/common/Header';
import { Toaster } from 'sonner';
import Footer from '@/components/common/Footer';
import { SessionExpiredDialog } from '@/components/auth/SessionExpiredDialog';
import { CelebrationProvider } from '@/components/common/animations';
import { RouteGuard } from '@/components/auth/RouteGuard';

const locales = ['en', 'vi'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as 'en' | 'vi')) {
    notFound();
  }
  const messages = await getMessages({ locale });
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CelebrationProvider>
          <RouteGuard>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </RouteGuard>
          <SessionExpiredDialog />
        </CelebrationProvider>
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}