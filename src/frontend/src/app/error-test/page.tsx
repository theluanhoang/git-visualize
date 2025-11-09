
export default function Page() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('Test error: this route intentionally crashes to show error.tsx');
  }
  return null;
}


