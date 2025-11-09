import { getDocument } from 'pdfjs-dist';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const loadingTask = getDocument({ data: buffer });
  const doc = await loadingTask.promise;

  let allText: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
      .filter(Boolean)
      .join(' ');
    allText.push(pageText);
  }

  return allText.join('\n');
}


