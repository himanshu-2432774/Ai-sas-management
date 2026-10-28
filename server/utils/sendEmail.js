
const { Resend } = require("resend");

async function sendEmail({ to, subject, text, html }) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        const error = new Error("RESEND_API_KEY is not configured.");
        error.code = "EMAIL_CONFIG_MISSING";
        throw error;
    }

    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        ...(text ? { text } : {}),
        ...(html ? { html } : {})
    });

    if (error) {
        const sendError = new Error(error.message || "Resend email delivery failed.");
        sendError.code = error.name || "RESEND_API_ERROR";
        sendError.statusCode = error.statusCode;
        throw sendError;
    }

    return data;
}

module.exports = sendEmail;
