import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export Weekly / Monthly / Daily Records to Excel (.xlsx)
export const exportToExcel = (data, filename = 'MilkCollectionReport.xlsx') => {
  const formattedData = data.map((item, idx) => ({
    'S.No': idx + 1,
    'Customer ID': item.customer_id,
    'Customer Name': item.customer_name,
    'Date': item.collection_date || item.date,
    'Time': item.collection_time || '',
    'Shift': item.shift || '',
    'Milk Type': item.milk_type || '',
    'Quantity (Liters)': item.quantity,
    'Rate (Rs./L)': item.rate,
    'Total Amount (Rs.)': item.total_amount
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Milk Collections");
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // Customer ID
    { wch: 22 }, // Customer Name
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 10 }, // Shift
    { wch: 12 }, // Milk Type
    { wch: 16 }, // Quantity
    { wch: 12 }, // Rate
    { wch: 16 }  // Total Amount
  ];

  XLSX.writeFile(workbook, filename);
};

// Export to PDF (.pdf)
export const exportToPDF = (data, title = 'Milk Collection Summary Report', filename = 'MilkReport.pdf') => {
  const doc = new jsPDF();

  // Header Title - Using standard ASCII to avoid PDF stream corruption
  doc.setFontSize(18);
  doc.setTextColor(22, 163, 74); // Emerald color
  doc.text('Milkman Dairy Collection System', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(title, 14, 28);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

  // Table columns & rows
  const tableColumn = ["ID", "Name", "Date", "Shift", "Type", "Qty (L)", "Rate", "Total (Rs.)"];
  const tableRows = data.map(item => [
    item.customer_id,
    item.customer_name,
    item.collection_date || item.date,
    item.shift || '-',
    item.milk_type || '-',
    parseFloat(item.quantity).toFixed(2),
    `Rs.${item.rate}`,
    `Rs.${item.total_amount}`
  ]);

  autoTable(doc, {
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { top: 40 }
  });

  // Calculate totals
  const totalLiters = data.reduce((acc, c) => acc + parseFloat(c.quantity || 0), 0);
  const totalAmount = data.reduce((acc, c) => acc + parseFloat(c.total_amount || 0), 0);

  const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 40) + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Grand Total Liters: ${totalLiters.toFixed(2)} L`, 14, finalY);
  doc.text(`Grand Total Amount: Rs.${totalAmount.toFixed(2)}`, 14, finalY + 7);

  doc.save(filename);
};

// Export to CSV (.csv)
export const exportToCSV = (data, filename = 'MilkCollectionReport.csv') => {
  const headers = ['Customer ID', 'Customer Name', 'Date', 'Time', 'Shift', 'Milk Type', 'Quantity', 'Rate', 'Total Amount'];
  const rows = data.map(item => [
    item.customer_id,
    `"${item.customer_name}"`,
    item.collection_date || item.date,
    item.collection_time || '',
    item.shift || '',
    item.milk_type || '',
    item.quantity,
    item.rate,
    item.total_amount
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

