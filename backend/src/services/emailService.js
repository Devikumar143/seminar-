const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development fallback mock transporter
    transporter = {
      sendMail: async (options) => {
        console.log('\n==========================================');
        console.log('📧 [MOCK EMAIL SERVICE] Message Sent');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Date: ${new Date().toISOString()}`);
        console.log('------------------------------------------');
        console.log(options.text || '[HTML content rendered]');
        console.log('==========================================\n');
        return { messageId: 'mock-' + Date.now() };
      },
    };
  }
  return transporter;
}

function baseTemplate(title, preheader, contentHtml) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #334155; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 32px 24px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
      .content { padding: 32px 24px; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; }
      .card-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
      .card-item:last-child { margin-bottom: 0; }
      .card-label { color: #64748b; font-weight: 500; }
      .card-value { color: #0f172a; font-weight: 600; text-align: right; }
      .badge { display: inline-block; padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-weight: 600; font-size: 12px; }
      .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 16px; }
      .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>
    <div class="container">
      <div class="header">
        <h1>Joy University</h1>
        <p>Office of Academic Seminars & Guest Lectures</p>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>This is an automated notification from Joy University Seminar Management System.</p>
        <p>© ${new Date().getFullYear()} Joy University. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

async function sendRegistrationEmail(user, seminar, registration) {
  const content = `
    <h2>Registration Confirmed! 🎉</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>You have successfully registered for the seminar <strong>${seminar.title}</strong>.</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">Registration ID:</span><span class="card-value">${registration.registration_id}</span></div>
      <div class="card-item"><span class="card-label">Student ID:</span><span class="card-value">${user.student_id || 'N/A'}</span></div>
      <div class="card-item"><span class="card-label">Date:</span><span class="card-value">${new Date(seminar.date).toLocaleDateString()}</span></div>
      <div class="card-item"><span class="card-label">Time:</span><span class="card-value">${seminar.start_time} - ${seminar.end_time}</span></div>
      <div class="card-item"><span class="card-label">Venue:</span><span class="card-value">${seminar.venue}</span></div>
      <div class="card-item"><span class="card-label">Speaker:</span><span class="card-value">${seminar.speaker} (${seminar.speaker_designation || 'Keynote'})</span></div>
    </div>

    <p>Please present your digital QR pass from your student dashboard at the venue entrance for attendance verification.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-registrations" class="btn">View & Download Pass</a>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"Joy University Seminars" <seminars@joyuniversity.edu>',
    to: user.email,
    subject: `Registration Confirmed: ${seminar.title} [${registration.registration_id}]`,
    html: baseTemplate('Registration Confirmed', `Your registration for ${seminar.title} is confirmed`, content),
    text: `Registration Confirmed for ${seminar.title}. Reg ID: ${registration.registration_id}. Venue: ${seminar.venue}. Date: ${new Date(seminar.date).toLocaleDateString()}`,
  });
}

async function sendCancellationEmail(user, seminar) {
  const content = `
    <h2>Registration Cancelled</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>Your registration for <strong>${seminar.title}</strong> has been cancelled.</p>
    <p>If you did not request this, please contact the academic events coordinator immediately.</p>
  `;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"Joy University Seminars" <seminars@joyuniversity.edu>',
    to: user.email,
    subject: `Registration Cancelled: ${seminar.title}`,
    html: baseTemplate('Registration Cancelled', `Your registration for ${seminar.title} has been cancelled`, content),
    text: `Your registration for ${seminar.title} has been cancelled.`,
  });
}

async function sendWaitlistEmail(user, seminar, position) {
  const content = `
    <h2>Added to Waitlist ⏳</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>The seminar <strong>${seminar.title}</strong> has reached capacity. You have been placed on the priority waitlist.</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">Waitlist Position:</span><span class="card-value">#${position}</span></div>
      <div class="card-item"><span class="card-label">Seminar:</span><span class="card-value">${seminar.title}</span></div>
      <div class="card-item"><span class="card-label">Date:</span><span class="card-value">${new Date(seminar.date).toLocaleDateString()}</span></div>
    </div>

    <p>If another participant cancels their reservation, you will automatically be enrolled and notified immediately!</p>
  `;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"Joy University Seminars" <seminars@joyuniversity.edu>',
    to: user.email,
    subject: `Waitlist Confirmation (#${position}): ${seminar.title}`,
    html: baseTemplate('Waitlist Status', `You are #${position} on the waitlist for ${seminar.title}`, content),
    text: `You have joined the waitlist for ${seminar.title} at position #${position}.`,
  });
}

async function sendWaitlistPromotionEmail(user, seminar, registration) {
  const content = `
    <h2>Good News! You're Off the Waitlist! 🚀</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>A seat has become available for <strong>${seminar.title}</strong>, and you have been automatically confirmed!</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">Registration ID:</span><span class="card-value">${registration.registration_id}</span></div>
      <div class="card-item"><span class="card-label">Date:</span><span class="card-value">${new Date(seminar.date).toLocaleDateString()}</span></div>
      <div class="card-item"><span class="card-label">Venue:</span><span class="card-value">${seminar.venue}</span></div>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-registrations" class="btn">View Registration Pass</a>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"Joy University Seminars" <seminars@joyuniversity.edu>',
    to: user.email,
    subject: `Spot Available! Confirmed: ${seminar.title}`,
    html: baseTemplate('Promoted from Waitlist', `You've been confirmed for ${seminar.title}`, content),
    text: `A seat became available! Your registration for ${seminar.title} is now confirmed. Reg ID: ${registration.registration_id}`,
  });
}

async function sendAttendanceEmail(user, seminar, checkInTime) {
  const content = `
    <h2>Attendance Marked: Present ✅</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>Your attendance has been recorded for the seminar <strong>${seminar.title}</strong>.</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">Check-in Time:</span><span class="card-value">${new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
      <div class="card-item"><span class="card-label">Date:</span><span class="card-value">${new Date(seminar.date).toLocaleDateString()}</span></div>
      <div class="card-item"><span class="card-label">Status:</span><span class="badge">PRESENT</span></div>
    </div>

    <p>Thank you for participating! Following the seminar completion, your official Certificate of Participation will be generated.</p>
  `;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"Joy University Seminars" <seminars@joyuniversity.edu>',
    to: user.email,
    subject: `Attendance Recorded: ${seminar.title}`,
    html: baseTemplate('Attendance Verified', `Attendance recorded for ${seminar.title}`, content),
    text: `Attendance recorded as PRESENT for ${seminar.title} at ${new Date(checkInTime).toLocaleString()}.`,
  });
}

async function sendCertificateEmail(user, seminar, certificate) {
  const content = `
    <h2>Your Certificate is Ready! 🎓</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>Congratulations! Your official Certificate of Participation for <strong>${seminar.title}</strong> is now available for download.</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">Certificate ID:</span><span class="card-value">${certificate.certificate_id}</span></div>
      <div class="card-item"><span class="card-label">Seminar:</span><span class="card-value">${seminar.title}</span></div>
      <div class="card-item"><span class="card-label">Date Issued:</span><span class="card-value">${new Date(certificate.issued_at).toLocaleDateString()}</span></div>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificates" class="btn">View & Download Certificate</a>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"Joy University Seminars" <seminars@joyuniversity.edu>',
    to: user.email,
    subject: `Certificate Ready: ${seminar.title} [${certificate.certificate_id}]`,
    html: baseTemplate('Certificate Available', `Your certificate for ${seminar.title} is ready`, content),
    text: `Your certificate for ${seminar.title} is ready. Certificate ID: ${certificate.certificate_id}`,
  });
}

module.exports = {
  sendRegistrationEmail,
  sendCancellationEmail,
  sendWaitlistEmail,
  sendWaitlistPromotionEmail,
  sendAttendanceEmail,
  sendCertificateEmail,
};
