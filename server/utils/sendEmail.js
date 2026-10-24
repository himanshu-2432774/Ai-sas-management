const createEmailTransport = require("../config/email");

async function sendEmail({ to, subject, text, html }) {
    const transporter = createEmailTransport();
    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    });
}

module.exports = sendEmail;
