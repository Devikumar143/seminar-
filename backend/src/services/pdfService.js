const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate Registration Pass PDF and stream directly to response
 */
async function generatePassPDF(data, res) {
  const doc = new PDFDocument({
    size: 'A5',
    margin: 28,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Pass-${data.registration_id}.pdf`);

  doc.pipe(res);

  // Background card styling
  doc.rect(14, 14, doc.page.width - 28, doc.page.height - 28)
     .lineWidth(2)
     .strokeColor('#1e3a8a')
     .fillColor('#f8fafc')
     .fillAndStroke();

  // Header banner
  doc.rect(14, 14, doc.page.width - 28, 70)
     .fillColor('#1e3a8a')
     .fill();

  doc.fillColor('#ffffff')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('JOY UNIVERSITY', 24, 26, { align: 'center' });

  doc.fontSize(10)
     .font('Helvetica')
     .text('OFFICIAL SEMINAR ENTRY PASS', 24, 46, { align: 'center' });

  doc.fontSize(8)
     .text(`PASS ID: ${data.registration_id}`, 24, 60, { align: 'center' });

  // Seminar Title
  doc.moveDown(2);
  doc.fillColor('#0f172a')
     .fontSize(13)
     .font('Helvetica-Bold')
     .text(data.seminar_title, 28, 98, { width: doc.page.width - 56, align: 'center' });

  // Divider
  doc.moveTo(28, 126).lineTo(doc.page.width - 28, 126).strokeColor('#cbd5e1').lineWidth(1).stroke();

  // Details Section (Left column: details, Right column: QR code)
  const leftX = 32;
  let currentY = 138;

  function renderField(label, value) {
    doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold').text(label.toUpperCase(), leftX, currentY);
    doc.fillColor('#0f172a').fontSize(10).font('Helvetica').text(value || 'N/A', leftX, currentY + 11);
    currentY += 28;
  }

  renderField('Participant Name', data.student_name);
  renderField('Student Roll / ID', data.student_id);
  renderField('Department / Year', `${data.department || 'N/A'} - ${data.year || 'N/A'}`);
  renderField('Date & Time', `${new Date(data.date).toLocaleDateString()} | ${data.start_time} - ${data.end_time}`);
  renderField('Venue', data.venue);
  renderField('Keynote Speaker', `${data.speaker} (${data.speaker_designation || 'Presenter'})`);

  // QR Code Generation
  const qrBuffer = await QRCode.toBuffer(data.qr_code_token, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 140,
  });

  const qrX = doc.page.width - 170;
  const qrY = 145;

  doc.rect(qrX - 5, qrY - 5, 145, 145).strokeColor('#e2e8f0').lineWidth(1).fillColor('#ffffff').fillAndStroke();
  doc.image(qrBuffer, qrX, qrY, { width: 135, height: 135 });

  doc.fillColor('#1e40af')
     .fontSize(8)
     .font('Helvetica-Bold')
     .text('SCAN FOR CHECK-IN', qrX - 5, qrY + 145, { width: 145, align: 'center' });

  doc.fillColor('#64748b')
     .fontSize(7)
     .font('Helvetica')
     .text('Valid for single entry', qrX - 5, qrY + 158, { width: 145, align: 'center' });

  // Notice & Instructions Box at Bottom
  const footerY = doc.page.height - 95;
  doc.rect(28, footerY, doc.page.width - 56, 55)
     .fillColor('#f1f5f9')
     .strokeColor('#e2e8f0')
     .lineWidth(1)
     .fillAndStroke();

  doc.fillColor('#334155')
     .fontSize(8)
     .font('Helvetica-Bold')
     .text('IMPORTANT INSTRUCTIONS:', 36, footerY + 8);

  doc.font('Helvetica')
     .fontSize(7)
     .fillColor('#475569')
     .text('• Please arrive at least 15 minutes before the scheduled start time.', 36, footerY + 22)
     .text('• Present this digital pass or a printed copy along with your college identity card.', 36, footerY + 32)
     .text('• Certificate eligibility requires verified QR attendance scanning at the venue.', 36, footerY + 42);

  doc.end();
}

/**
 * Generate Academic Certificate PDF and stream directly to response
 */
async function generateCertificatePDF(data, res) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 36,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Certificate-${data.certificate_id}.pdf`);

  doc.pipe(res);

  const width = doc.page.width;
  const height = doc.page.height;

  // Outer Decorative Border
  doc.rect(20, 20, width - 40, height - 40)
     .lineWidth(4)
     .strokeColor('#1e3a8a')
     .stroke();

  // Inner Fine Gold Border
  doc.rect(26, 26, width - 52, height - 52)
     .lineWidth(1.5)
     .strokeColor('#d97706')
     .stroke();

  // Corner Accents
  const cornerSize = 20;
  // Top-left
  doc.rect(26, 26, cornerSize, cornerSize).fillColor('#1e3a8a').fill();
  // Top-right
  doc.rect(width - 26 - cornerSize, 26, cornerSize, cornerSize).fillColor('#1e3a8a').fill();
  // Bottom-left
  doc.rect(26, height - 26 - cornerSize, cornerSize, cornerSize).fillColor('#1e3a8a').fill();
  // Bottom-right
  doc.rect(width - 26 - cornerSize, height - 26 - cornerSize, cornerSize, cornerSize).fillColor('#1e3a8a').fill();

  // University Header
  doc.fillColor('#1e3a8a')
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('JOY UNIVERSITY', 0, 52, { align: 'center' });

  doc.fillColor('#64748b')
     .fontSize(10)
     .font('Helvetica')
     .text('OFFICE OF ACADEMIC AFFAIRS & STUDENT DEVELOPMENT', 0, 78, { align: 'center' });

  // Ornamental Divider
  doc.moveTo(width / 2 - 120, 96).lineTo(width / 2 + 120, 96).lineWidth(1.5).strokeColor('#d97706').stroke();

  // Main Title
  doc.fillColor('#b45309')
     .fontSize(26)
     .font('Helvetica-Bold')
     .text('CERTIFICATE OF PARTICIPATION', 0, 115, { align: 'center' });

  doc.fillColor('#475569')
     .fontSize(12)
     .font('Helvetica')
     .text('PROUDLY PRESENTED TO', 0, 150, { align: 'center' });

  // Recipient Name
  doc.fillColor('#0f172a')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(data.student_name.toUpperCase(), 0, 175, { align: 'center' });

  // Recipient info line
  const idInfo = data.student_id ? `(Student ID: ${data.student_id})` : '';
  const deptInfo = data.department ? ` • Department of ${data.department}` : '';
  doc.fillColor('#64748b')
     .fontSize(11)
     .font('Helvetica-Oblique')
     .text(`${idInfo}${deptInfo}`, 0, 205, { align: 'center' });

  // Body text
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const citation = `for successfully attending and participating in the specialized academic seminar titled`;

  doc.fillColor('#334155')
     .fontSize(12)
     .font('Helvetica')
     .text(citation, 70, 235, { align: 'center', width: width - 140 });

  doc.fillColor('#1e3a8a')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text(`"${data.seminar_title}"`, 70, 258, { align: 'center', width: width - 140 });

  doc.fillColor('#475569')
     .fontSize(11)
     .font('Helvetica')
     .text(`Delivered by Keynote Speaker ${data.speaker} (${data.speaker_designation || 'Specialist'}) on ${formattedDate} at Joy University.`, 70, 288, { align: 'center', width: width - 140 });

  // Verification URL QR Code
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${data.certificate_id}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 85,
  });

  const qrCenter = width / 2 - 42;
  doc.image(qrBuffer, qrCenter, 325, { width: 85, height: 85 });

  doc.fillColor('#64748b')
     .fontSize(7)
     .font('Helvetica')
     .text(`Verify Authenticity: ${data.certificate_id}`, 0, 415, { align: 'center' });

  // Signatures on Left and Right
  const signY = 360;

  // Left Signature: Speaker / Coordinator
  doc.moveTo(80, signY).lineTo(220, signY).lineWidth(1).strokeColor('#94a3b8').stroke();
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(data.speaker, 80, signY + 6, { width: 140, align: 'center' });
  doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Distinguished Speaker', 80, signY + 20, { width: 140, align: 'center' });

  // Right Signature: Dean / Registrar
  doc.moveTo(width - 220, signY).lineTo(width - 80, signY).lineWidth(1).strokeColor('#94a3b8').stroke();
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('Dr. Evelyn Richardson', width - 220, signY + 6, { width: 140, align: 'center' });
  doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Dean of Academic Affairs', width - 220, signY + 20, { width: 140, align: 'center' });

  // Security Footer note
  doc.fillColor('#94a3b8')
     .fontSize(8)
     .font('Helvetica')
     .text(`Joy University Official Certification System • Issued: ${new Date(data.issued_at || Date.now()).toLocaleDateString()}`, 0, height - 38, { align: 'center' });

  doc.end();
}

module.exports = {
  generatePassPDF,
  generateCertificatePDF,
};
