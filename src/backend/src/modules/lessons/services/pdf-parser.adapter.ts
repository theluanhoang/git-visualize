export async function parsePdfText(buffer: Buffer): Promise<string> {
  let pdfParseFn: ((data: Buffer | Uint8Array) => Promise<{ text: string }>) | null = null;

  try {
    const mod = require('pdf-parse');
    const candidate = (mod && mod.default) ? mod.default : mod;
    if (typeof candidate === 'function') {
      pdfParseFn = candidate as (data: Buffer | Uint8Array) => Promise<{ text: string }>;
    }
  } catch (_) {}

  if (!pdfParseFn) {
    const mod: any = await import('pdf-parse');
    const candidate = (mod && mod.default) ? mod.default : mod;
    if (typeof candidate === 'function') {
      pdfParseFn = candidate as (data: Buffer | Uint8Array) => Promise<{ text: string }>;
    }
  }

  if (!pdfParseFn) {
    throw new Error('pdf-parse module did not export a callable function');
  }

  const result = await pdfParseFn(buffer);
  return result?.text ?? '';
}


