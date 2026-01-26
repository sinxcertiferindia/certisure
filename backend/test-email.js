require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log("--- Email Configuration Test ---");
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '');

    console.log(`User: '${user}'`);
    console.log(`Pass: ${pass ? pass.slice(0, 3) + '...' + pass.slice(-3) : 'Not Set'} (Length: ${pass?.length})`);

    if (!user || !pass) {
        console.error("ERROR: EMAIL_USER or EMAIL_PASS is missing in .env");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    try {
        console.log("Attempting to verify SMTP connection...");
        await transporter.verify();
        console.log("✅ SUCCESS: SMTP connection established!");
        console.log("Your credentials are correct.");
    } catch (error) {
        console.error("❌ FAILED: SMTP connection rejected.");
        console.error("Error Code:", error.code);
        console.error("Response:", error.response);

        if (error.response && error.response.includes('535-5.7.8')) {
            console.log("\n--- TROUBLESHOOTING ---");
            console.log("1. Ensure 'EMAIL_USER' matches the Google Account used to generate the App Password.");
            console.log("2. Ensure 'EMAIL_PASS' is the 16-character App Password (not your login password).");
            console.log("3. If you changed 'EMAIL_USER' recently, ensure you generated a NEW App Password for that specific account.");
        }
    }
};

testEmail();
