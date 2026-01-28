const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateReceipt(data) {
  const receiptsDir = path.join(__dirname, "../receipts");

  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
  }

  const fileName = `receipt_${data.applicationId}_${Date.now()}.pdf`;
  const filePath = path.join(receiptsDir, fileName);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  /* ================= HEADER ================= */
  doc
    .rect(0, 0, doc.page.width, 120)
    .fill("#0a1f44");

  doc
    .fillColor("white")
    .fontSize(26)
    .text("TIE COLLEGE", 50, 40);

  doc
    .fontSize(12)
    .text("College Admission Management System", 50, 75);

  doc.moveDown(4);

  /* ================= TITLE ================= */
  doc
    .fillColor("#0a1f44")
    .fontSize(18)
    .text("COLLEGE ADMISSION PAYMENT RECEIPT", {
      align: "center",
    });

  doc.moveDown(2);

  /* ================= RECEIPT BOX ================= */
  const boxTop = doc.y;

  doc
    .roundedRect(40, boxTop, doc.page.width - 80, 300, 10)
    .stroke("#0a1f44");

  let y = boxTop + 20;

  const labelX = 70;
  const valueX = 260;

  doc.fontSize(12).fillColor("black");

  doc.text("Receipt No:", labelX, y);
  doc.text(data.receiptNo, valueX, y);

  y += 25;
  doc.text("Student Name:", labelX, y);
  doc.text(data.studentName, valueX, y);

  y += 25;
  doc.text("Application ID:", labelX, y);
  doc.text(String(data.applicationId), valueX, y);

  y += 25;
  doc.text("Course:", labelX, y);
  doc.text(data.course || "N/A", valueX, y);

  y += 30;

  /* ================= AMOUNT HIGHLIGHT ================= */
  doc
    .rect(60, y, doc.page.width - 120, 45)
    .fill("#f0f4ff");

  doc
    .fillColor("#0a1f44")
    .fontSize(16)
    .text(`Amount Paid: ₹${data.amount}`, 70, y + 13);

  y += 70;

  /* ================= STATUS ================= */
  doc
    .fillColor("green")
    .fontSize(14)
    .text("Payment Status: SUCCESS", labelX, y);

  y += 25;

  doc
    .fillColor("black")
    .fontSize(12)
    .text(`Date: ${new Date().toLocaleString()}`, labelX, y);

  /* ================= FOOTER ================= */
  doc
    .moveTo(50, doc.page.height - 100)
    .lineTo(doc.page.width - 50, doc.page.height - 100)
    .stroke("#cccccc");

  doc
    .fontSize(10)
    .fillColor("gray")
    .text(
      "This is a system-generated receipt. No signature is required.",
      50,
      doc.page.height - 80,
      { align: "center" }
    );

  doc.end();

  return fileName;
}

module.exports = generateReceipt;