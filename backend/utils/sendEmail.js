const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    // Check if using a service (like Gmail) or custom SMTP
    let transporter;

    if (process.env.EMAIL_SERVICE) {
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '');
        console.log(`[Email Debug] Attempting to send with User: '${user}'`);
        console.log(`[Email Debug] Password length: ${pass?.length || 0} (First 3 chars: ${pass?.substring(0, 3)}***)`);

        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
            auth: {
                user: user,
                pass: pass,
            },
        });
    } else {
        // Fallback to SMTP or Ethereal (for testing)
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER || 'ethereal_user',
                pass: process.env.EMAIL_PASS || 'ethereal_pass',
            },
        });
    }

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Certisure Security" <noreply@certisure.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional HTML content
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
