// utils/generateAdmissionLetter.js

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = function generateAdmissionLetter(student) {
  // Create directory if it doesn't exist
  const dir = path.join(__dirname, "../uploads/admission_letters");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fileName = `admission_${student.id}_${Date.now()}.pdf`;
  const filePath = path.join(dir, fileName);
  
  const doc = new PDFDocument({ margin: 50 });

  // Pipe to file
  doc.pipe(fs.createWriteStream(filePath));

  // Add university header
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text("TIE UNIVERSITY", { align: "center" })
     .fontSize(12)
     .font('Helvetica')
     .text("Office of Admissions", { align: "center" })
     .moveDown(2);

  // Add date
  doc.fontSize(11)
     .text(`Date: ${new Date().toLocaleDateString('en-IN', { 
       day: '2-digit', 
       month: '2-digit', 
       year: 'numeric' 
     })}`, { align: 'left' })
     .moveDown(2);

  // Add recipient
  doc.fontSize(11)
     .text(`To,`)
     .text(`${student.student_name}`)
     .text(`Application ID: ${student.id}`)
     .moveDown(1.5);

  // Add subject
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text("Subject: Admission Confirmation – Payment of Admission Fee")
     .moveDown(1.5);

  // Add body
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Dear ${student.student_name},`, { align: 'left' })
     .moveDown(1);

  doc.text(
    `We are pleased to inform you that you have been selected for admission to ` +
    `${student.course_name || 'the selected program'} at TIE University for the Academic Year 2025-26.`,
    { align: 'justify' }
  )
  .moveDown(1);

  doc.text(
    `Your admission has been confirmed upon successful receipt of the admission fee. ` +
    `This letter serves as your official admission confirmation.`,
    { align: 'justify' }
  )
  .moveDown(1);

  doc.text(
    `Please report to the university on the orientation date mentioned in your student portal. ` +
    `Bring this admission letter along with original documents for verification.`,
    { align: 'justify' }
  )
  .moveDown(2);

  // Add closing
  doc.text("We look forward to welcoming you to TIE University.", { align: 'justify' })
     .moveDown(2);

  doc.text("Yours sincerely,")
     .moveDown(0.5)
     .font('Helvetica-Bold')
     .text("Admissions Office")
     .text("TIE University");

  // Add footer
  doc.moveDown(3)
     .fontSize(9)
     .font('Helvetica')
     .text("_______________________________________________________________________________", { align: 'center' })
     .moveDown(0.5)
     .text("This is a computer-generated document and does not require a signature.", { align: 'center' })
     .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

  // Finalize PDF
  doc.end();

  // Return the web-accessible path
  return `/uploads/admission_letters/${fileName}`;
};