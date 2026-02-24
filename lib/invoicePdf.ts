import jsPDF from 'jspdf';
import { JobWorkItem } from '@/firebase/types';

interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  vehicleInfo: string;
  workItems: JobWorkItem[];
  subtotal: number;
  tax: number | null;
  discount: number | null;
  total: number;
  serviceName: string | null;
  servicePhone: string | null;
  serviceAddress: string | null;
  notes: string | null;
  // Optional GST flags
  isGST?: boolean;
  gstNumber?: string | null;
}

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const darkColor: [number, number, number] = [15, 23, 42]; // Dark blue
  const lightGray: [number, number, number] = [241, 245, 249];
  const borderGray: [number, number, number] = [226, 232, 240];

  // Header Section
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, 30);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${data.invoiceNumber}`, pageWidth - margin, 20, { align: 'right' });
  doc.text(`Date: ${formatDate(data.issueDate)}`, pageWidth - margin, 28, { align: 'right' });

  yPos = 60;

  // Service Information (Left)
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (data.serviceName) {
    doc.text(data.serviceName, margin, yPos);
    yPos += 5;
  }
  if (data.serviceAddress) {
    const addressLines = doc.splitTextToSize(data.serviceAddress, contentWidth / 2 - 10);
    doc.text(addressLines, margin, yPos);
    yPos += addressLines.length * 5;
  }
  if (data.servicePhone) {
    doc.text(`Phone: ${data.servicePhone}`, margin, yPos);
    yPos += 5;
  }

  // Customer Information (Right)
  const customerX = pageWidth / 2 + 10;
  yPos = 60;
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', customerX, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.customerName, customerX, yPos);
  yPos += 5;
  
  if (data.customerAddress) {
    const addressLines = doc.splitTextToSize(data.customerAddress, contentWidth / 2 - 10);
    doc.text(addressLines, customerX, yPos);
    yPos += addressLines.length * 5;
  }
  if (data.customerEmail) {
    doc.text(`Email: ${data.customerEmail}`, customerX, yPos);
    yPos += 5;
  }
  if (data.customerPhone) {
    doc.text(`Phone: ${data.customerPhone}`, customerX, yPos);
    yPos += 5;
  }
  if (data.isGST && data.gstNumber) {
    doc.text(`GSTIN: ${data.gstNumber}`, customerX, yPos);
    yPos += 5;
  }

  // Vehicle Information
  yPos += 5;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Vehicle: ${data.vehicleInfo}`, margin, yPos);

  // Work Items Table
  yPos += 15;
  checkPageBreak(30);

  // Table Header
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPos, contentWidth, 10, 'F');
  
  doc.setTextColor(...darkColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 2, yPos + 7);
  doc.text('Amount', pageWidth - margin - 2, yPos + 7, { align: 'right' });

  yPos += 10;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);

  data.workItems.forEach((item, index) => {
    checkPageBreak(15);
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos, contentWidth, 12, 'F');
    }

    // Description
    const descLines = doc.splitTextToSize(item.title, contentWidth - 50);
    doc.text(descLines, margin + 2, yPos + 8);
    
    // Amount
    doc.text(`Rs. ${item.price.toFixed(2)}`, pageWidth - margin - 2, yPos + 8, { align: 'right' });
    
    yPos += Math.max(12, descLines.length * 5);
  });

  // Totals Section
  yPos += 10;
  checkPageBreak(40);

  const totalsX = pageWidth - margin - 60;
  
  // Subtotal
  doc.setFontSize(9);
  doc.text('Subtotal:', totalsX, yPos, { align: 'right' });
  doc.text(`Rs. ${data.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 8;

  // Tax/GST
  if (data.tax && data.tax > 0) {
    const taxLabel = data.isGST ? 'GST:' : 'Tax:';
    doc.text(taxLabel, totalsX, yPos, { align: 'right' });
    doc.text(`Rs. ${data.tax.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 8;
  }

  // Discount
  if (data.discount && data.discount > 0) {
    doc.text('Discount:', totalsX, yPos, { align: 'right' });
    doc.text(`-Rs. ${data.discount.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 8;
  }

  // Total
  yPos += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 10, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL:', totalsX, yPos, { align: 'right' });
  doc.text(`Rs. ${data.total.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });

  // Notes Section
  if (data.notes) {
    yPos += 20;
    checkPageBreak(30);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Notes:', margin, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(notesLines, margin, yPos);
  }

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

  return doc;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateInvoicePDFBlob = (data: InvoiceData): Blob => {
  const doc = generateInvoicePDF(data);
  return doc.output('blob');
};

export const generateInvoicePDFDataURL = (data: InvoiceData): string => {
  const doc = generateInvoicePDF(data);
  return doc.output('dataurlstring');
};
