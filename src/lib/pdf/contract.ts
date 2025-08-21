import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Contract } from '@/types/contract';

export async function generateContractPDF(contract: Contract): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const fontSize = 12;
  
  // Add contract title
  page.drawText('Freelance Contract', {
    x: 50,
    y: height - 50,
    size: 24,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Add contract details
  page.drawText(`Contract ID: ${contract._id}`, {
    x: 50,
    y: height - 100,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  // Add more contract details...
  
  return await pdfDoc.save();
}