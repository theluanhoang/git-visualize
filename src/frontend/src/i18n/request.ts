import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'vi'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as 'en' | 'vi')) {
    locale = 'en'; // fallback to default locale
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  
  // Debug logging
  console.log('=== I18N REQUEST DEBUG ===');
  console.log('Requested locale:', locale);
  console.log('Messages loaded:', Object.keys(messages));
  console.log('Home hero title:', messages.home?.hero?.title);
  console.log('========================');

  return {
    locale,
    messages
  };
});