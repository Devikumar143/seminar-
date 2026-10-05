const db = require('../config/db');
const { generateCertificateId, generateQRCodeDataURL } = require('../services/qrService');
const { generateCertificatePDF } = require('../services/pdfService');
const { sendCertificateEmail } = require('../services/emailService');

// 1. Get Logged-in Student Certificates
async function getMyCertificates(req, res, next) {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        c.id,
        c.certificate_id,
        c.issued_at,
        c.qr_verification_code,
        s.id AS seminar_id,
        s.title AS seminar_title,
        s.speaker,
        s.speaker_designation,
        s.date,
        s.venue,
        s.category,
        s.banner_image,
        u.name AS student_name,
        u.student_id,
        u.department
      FROM certificates c
      JOIN registrations r ON c.registration_id = r.id
      JOIN seminars s ON r.seminar_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = $1
      ORDER BY c.issued_at DESC
    `;

    const result = await db.query(sql, [userId]);

    const certificatesWithQR = await Promise.all(
      result.rows.map(async (cert) => {
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${cert.certificate_id}`;
        const qrDataUrl = await generateQRCodeDataURL(verifyUrl);
        return {
          ...cert,
          verify_url: verifyUrl,
          qr_code_image: qrDataUrl,
        };
      })
    );

    return res.json({
      success: true,
      certificates: certificatesWithQR,
    });
  } catch (error) {
    next(error);
  }
}

// 2. Get Certificate by ID
async function getCertificateById(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        c.id,
        c.certificate_id,
        c.issued_at,
        c.qr_verification_code,
        s.id AS seminar_id,
        s.title AS seminar_title,
        s.speaker,
        s.speaker_designation,
        s.date,
        s.venue,
        s.category,
        u.name AS student_name,
        u.student_id,
        u.department,
        u.year
      FROM certificates c
      JOIN registrations r ON c.registration_id = r.id
      JOIN seminars s ON r.seminar_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE ${/^\d+$/.test(String(id).trim()) ? 'c.id = $1' : 'c.certificate_id = $1'}
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    const cert = result.rows[0];
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${cert.certificate_id}`;
    const qrDataUrl = await generateQRCodeDataURL(verifyUrl);

    return res.json({
      success: true,
      certificate: {
        ...cert,
        verify_url: verifyUrl,
        qr_code_image: qrDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 3. Download Certificate as PDF
async function downloadCertificatePDF(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        c.id,
        c.certificate_id,
        c.issued_at,
        c.qr_verification_code,
        s.id AS seminar_id,
        s.title AS seminar_title,
        s.speaker,
        s.speaker_designation,
        s.date,
        s.venue,
        u.name AS student_name,
        u.student_id,
        u.department,
        u.year
      FROM certificates c
      JOIN registrations r ON c.registration_id = r.id
      JOIN seminars s ON r.seminar_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE ${/^\d+$/.test(String(id).trim()) ? 'c.id = $1' : 'c.certificate_id = $1'}
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    const cert = result.rows[0];
    await generateCertificatePDF(cert, res);
  } catch (error) {
    next(error);
  }
}

// 4. Public Certificate Verification (Requirement 12)
async function verifyCertificate(req, res, next) {
  try {
    const { certificateId } = req.params;

    const sql = `
      SELECT 
        c.certificate_id,
        c.issued_at,
        s.title AS seminar_title,
        s.speaker,
        s.speaker_designation,
        s.date AS seminar_date,
        s.venue,
        u.name AS student_name,
        u.department
      FROM certificates c
      JOIN registrations r ON c.registration_id = r.id
      JOIN seminars s ON r.seminar_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE c.certificate_id = $1 OR c.qr_verification_code = $1
    `;

    const result = await db.query(sql, [certificateId.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: 'No record found. This certificate ID could not be verified in the Joy University academic registry.',
      });
    }

    const cert = result.rows[0];

    return res.json({
      success: true,
      isValid: true,
      message: 'Certificate Verified Authentically.',
      verification: {
        certificate_id: cert.certificate_id,
        student_name: cert.student_name,
        department: cert.department,
        seminar_title: cert.seminar_title,
        speaker: `${cert.speaker} (${cert.speaker_designation || 'Specialist'})`,
        seminar_date: cert.seminar_date,
        venue: cert.venue,
        issuing_organization: 'Joy University Academic Senate',
        status: 'VERIFIED & AUTHENTIC',
        issued_at: cert.issued_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 5. Admin: Bulk Issue Certificates for Attendees of a Completed Seminar
async function generateCertificatesForSeminar(req, res, next) {
  try {
    const { seminar_id } = req.body;

    if (!seminar_id) {
      return res.status(400).json({
        success: false,
        message: 'Seminar ID is required.',
      });
    }

    // Get all present attendees without certificates
    const attendeesSql = `
      SELECT 
        r.id AS registration_id,
        u.id AS user_id,
        u.name AS student_name,
        u.email,
        s.title AS seminar_title,
        s.date AS seminar_date
      FROM registrations r
      JOIN attendance a ON r.id = a.registration_id
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      LEFT JOIN certificates c ON r.id = c.registration_id
      WHERE r.seminar_id = $1 
        AND a.status = 'present'
        AND c.id IS NULL
    `;

    const attendeesRes = await db.query(attendeesSql, [seminar_id]);
    const eligibleAttendees = attendeesRes.rows;

    if (eligibleAttendees.length === 0) {
      return res.json({
        success: true,
        message: 'No eligible pending attendees found. Certificates may have already been issued.',
        issuedCount: 0,
      });
    }

    let issuedCount = 0;
    for (const att of eligibleAttendees) {
      const certId = generateCertificateId();
      const qrCode = `VERIFY-${certId}`;

      const insertRes = await db.query(
        `INSERT INTO certificates (certificate_id, registration_id, qr_verification_code)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [certId, att.registration_id, qrCode]
      );

      const cert = insertRes.rows[0];

      // In-app notification
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'success')`,
        [
          att.user_id,
          'Certificate Issued! 🎓',
          `Your Certificate of Participation for "${att.seminar_title}" is ready to download! (ID: ${certId})`,
        ]
      );

      // Email notification
      sendCertificateEmail(
        { name: att.student_name, email: att.email },
        { title: att.seminar_title },
        cert
      ).catch((err) => console.error('Certificate email error:', err));

      issuedCount++;
    }

    return res.json({
      success: true,
      message: `Successfully issued ${issuedCount} certificates for verified seminar attendees.`,
      issuedCount,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyCertificates,
  getCertificateById,
  downloadCertificatePDF,
  verifyCertificate,
  generateCertificatesForSeminar,
};
