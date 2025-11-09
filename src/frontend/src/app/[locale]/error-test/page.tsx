export default function Page() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Test error (i18n): this route intentionally crashes to show [locale]/error.tsx');
  }
  return null;
}


