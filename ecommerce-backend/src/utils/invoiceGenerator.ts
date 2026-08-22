import PDFDocument from 'pdfkit';

export interface IInvoiceData {
  orderId: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export const generateInvoicePDF = (invoiceData: IInvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('ECommerce', { align: 'center' })
        .fontSize(10)
        .font('Helvetica')
        .text('Premium Spices & Natural Foods', { align: 'center' })
        .moveDown();

      // Invoice Title
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('INVOICE', { align: 'center' })
        .moveDown();

      // Order Info
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Order ID: ${invoiceData.orderId}`)
        .text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`)
        .moveDown();

      // Customer Info
      doc
        .text('Billed To:')
        .font('Helvetica')
        .text(invoiceData.customerName)
        .text(invoiceData.customerPhone)
        .text(invoiceData.customerAddress)
        .moveDown();

      // Table Header
      let currentY = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, currentY);
      doc.text('Qty', 300, currentY, { width: 50, align: 'right' });
      doc.text('Price', 350, currentY, { width: 70, align: 'right' });
      doc.text('Total', 420, currentY, { width: 80, align: 'right' });

      doc.moveTo(50, currentY + 15).lineTo(500, currentY + 15).stroke();
      currentY += 20;

      // Table Rows
      doc.font('Helvetica');
      invoiceData.items.forEach(item => {
        doc.text(item.name, 50, currentY, { width: 240 });
        doc.text(item.quantity.toString(), 300, currentY, { width: 50, align: 'right' });
        doc.text(`BDT ${item.unitPrice}`, 350, currentY, { width: 70, align: 'right' });
        doc.text(`BDT ${item.total}`, 420, currentY, { width: 80, align: 'right' });
        currentY += 20;
      });

      doc.moveTo(50, currentY + 5).lineTo(500, currentY + 5).stroke();
      currentY += 15;

      // Totals
      doc.font('Helvetica');
      doc.text('Subtotal:', 300, currentY, { width: 100, align: 'right' });
      doc.text(`BDT ${invoiceData.subtotal}`, 400, currentY, { width: 100, align: 'right' });
      currentY += 15;

      doc.text('Discount:', 300, currentY, { width: 100, align: 'right' });
      doc.text(`- BDT ${invoiceData.discount}`, 400, currentY, { width: 100, align: 'right' });
      currentY += 15;

      doc.text('Delivery Fee:', 300, currentY, { width: 100, align: 'right' });
      doc.text(`BDT ${invoiceData.deliveryFee}`, 400, currentY, { width: 100, align: 'right' });
      currentY += 15;

      doc.font('Helvetica-Bold');
      doc.text('Total:', 300, currentY, { width: 100, align: 'right' });
      doc.text(`BDT ${invoiceData.total}`, 400, currentY, { width: 100, align: 'right' });

      // Footer
      doc
        .moveDown(4)
        .font('Helvetica-Oblique')
        .fontSize(10)
        .text('Thank you for shopping with ECommerce!', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
