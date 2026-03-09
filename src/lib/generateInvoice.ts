import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '@/hooks/useOrders';

export function generateInvoice(order: Order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Roomly', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('AI-Powered Interior Design', 14, 28);

  // Invoice title
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 14, 22, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Order #${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 14, 28, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, pageWidth - 14, 34, { align: 'right' });
  doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, pageWidth - 14, 40, { align: 'right' });

  // Divider
  doc.setDrawColor(200);
  doc.line(14, 46, pageWidth - 14, 46);

  // Shipping address
  let y = 54;
  if (order.shipping_address) {
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text('SHIP TO', 14, y);
    y += 6;
    doc.setTextColor(0);
    doc.setFontSize(10);
    const addr = order.shipping_address;
    doc.text(`${addr.firstName || ''} ${addr.lastName || ''}`.trim(), 14, y);
    y += 5;
    if (addr.address) { doc.text(addr.address, 14, y); y += 5; }
    doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`.trim(), 14, y);
    y += 5;
  }

  // Contact
  if (order.contact_email) {
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text('CONTACT', pageWidth / 2, 54);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(order.contact_email, pageWidth / 2, 60);
    if (order.contact_phone) {
      doc.text(order.contact_phone, pageWidth / 2, 65);
    }
  }

  // Items table
  const startY = Math.max(y + 8, 80);
  const items = order.items || [];

  autoTable(doc, {
    startY,
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: items.map(item => [
      item.product_name + (item.selected_color ? ` (${item.selected_color})` : ''),
      String(item.quantity),
      `$${item.unit_price.toFixed(2)}`,
      `$${item.total_price.toFixed(2)}`,
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [45, 45, 45] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totals = [
    ['Subtotal', `$${order.subtotal.toFixed(2)}`],
    ['Shipping', order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`],
    ['Tax', `$${order.tax.toFixed(2)}`],
    ['Total', `$${order.total.toFixed(2)}`],
  ];

  let ty = finalY;
  totals.forEach(([label, value], i) => {
    const isBold = i === totals.length - 1;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 12 : 10);
    doc.text(label, pageWidth - 80, ty);
    doc.text(value, pageWidth - 14, ty, { align: 'right' });
    ty += isBold ? 8 : 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with Roomly!', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`roomly-invoice-${order.id.slice(0, 8)}.pdf`);
}
