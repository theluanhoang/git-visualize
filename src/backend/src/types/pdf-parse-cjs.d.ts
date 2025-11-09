declare module 'pdf-parse/dist/pdf-parse/cjs/index' {
  const pdfParse: (data: Buffer | Uint8Array) => Promise<{ text: string }>;
  export default pdfParse;
}


