import textract from 'textract';

export async function extractFileText(buffer: Buffer, ext: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let mime: string;
    switch (ext.toLowerCase()) {
      case 'pdf':
        mime = 'application/pdf';
        break;
      case 'docx':
        mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        return reject(new Error('Unsupported file extension for extraction'));
    }
    textract.fromBufferWithMime(mime, buffer, (err, text) => {
      if (err) return reject(err);
      resolve(text || '');
    });
  });
}
