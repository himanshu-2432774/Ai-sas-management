const nodemailer = require("nodemailer");

function createEmailTransport() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!user?.trim() || !pass?.trim()) {
        const error = new Error("EMAIL_USER and EMAIL_PASSWORD are required for SMTP delivery.");
        error.code = "EMAIL_CONFIG_MISSING";
        throw error;
    }

    const port = Number(process.env.SMTP_PORT || 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        const error = new Error("SMTP_PORT must be a valid TCP port.");
        error.code = "EMAIL_CONFIG_INVALID";
        throw error;
    }

    const secureSetting = process.env.SMTP_SECURE?.toLowerCase();
    if (secureSetting && secureSetting !== "true" && secureSetting !== "false") {
        const error = new Error("SMTP_SECURE must be true or false.");
        error.code = "EMAIL_CONFIG_INVALID";
        throw error;
    }

    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const secure = secureSetting
        ? secureSetting === "true"
        : port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
    });
}

module.exports = createEmailTransport;
