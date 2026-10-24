const assert = require("node:assert/strict");
const net = require("node:net");
const test = require("node:test");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const {
    hashVerificationToken,
    VERIFICATION_TOKEN_TTL_MS
} = require("../utils/emailVerificationToken");
const {
    getEmailDeliveryFailureDetails,
    logEmailDeliveryFailure
} = require("../utils/emailDeliveryError");

test("email delivery diagnostics classify failures without exposing provider details", () => {
    assert.deepEqual(
        getEmailDeliveryFailureDetails({
            code: "EAUTH",
            responseCode: 535,
            response: "Sensitive provider response",
            command: "AUTH PLAIN"
        }),
        {
            category: "smtp_authentication_rejected",
            smtpResponseCode: 535
        }
    );
    assert.equal(
        getEmailDeliveryFailureDetails({ code: "EMAIL_CONFIG_MISSING" }).category,
        "email_configuration_missing"
    );
    assert.equal(
        getEmailDeliveryFailureDetails({
            code: "EENVELOPE",
            command: "MAIL FROM:<sender@example.com>",
            responseCode: 550,
            response: "Sensitive provider response"
        }).category,
        "smtp_sender_rejected"
    );

    const logged = [];
    const originalError = console.error;
    console.error = (...args) => logged.push(args);
    try {
        logEmailDeliveryFailure("signup verification", {
            code: "EAUTH",
            responseCode: 535,
            response: "Sensitive provider response containing credentials and token"
        });
    } finally {
        console.error = originalError;
    }
    const logOutput = JSON.stringify(logged);
    assert.match(logOutput, /smtp_authentication_rejected/);
    assert.doesNotMatch(logOutput, /Sensitive provider response|credentials|token/);
});

function createSmtpCaptureServer() {
    const messages = [];
    const server = net.createServer((socket) => {
        let input = "";
        let dataMode = false;
        let authStep = 0;
        let message = "";

        socket.write("220 localhost test SMTP\r\n");
        socket.on("data", (chunk) => {
            input += chunk.toString();

            while (input.includes("\r\n")) {
                const separator = input.indexOf("\r\n");
                const line = input.slice(0, separator);
                input = input.slice(separator + 2);

                if (dataMode) {
                    if (line === ".") {
                        messages.push(message);
                        message = "";
                        dataMode = false;
                        socket.write("250 Message accepted\r\n");
                    } else {
                        message += `${line.startsWith("..") ? line.slice(1) : line}\r\n`;
                    }
                    continue;
                }

                const command = line.toUpperCase();
                if (command.startsWith("EHLO") || command.startsWith("HELO")) {
                    socket.write("250-localhost\r\n250 AUTH PLAIN LOGIN\r\n");
                } else if (command.startsWith("AUTH PLAIN")) {
                    socket.write("235 Authentication successful\r\n");
                } else if (command === "AUTH LOGIN") {
                    authStep = 1;
                    socket.write("334 VXNlcm5hbWU6\r\n");
                } else if (authStep === 1) {
                    authStep = 2;
                    socket.write("334 UGFzc3dvcmQ6\r\n");
                } else if (authStep === 2) {
                    authStep = 0;
                    socket.write("235 Authentication successful\r\n");
                } else if (command.startsWith("MAIL FROM") || command.startsWith("RCPT TO")) {
                    socket.write("250 OK\r\n");
                } else if (command === "DATA") {
                    dataMode = true;
                    socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
                } else if (command === "QUIT") {
                    socket.write("221 Bye\r\n");
                    socket.end();
                } else {
                    socket.write("250 OK\r\n");
                }
            }
        });
    });

    return { server, messages };
}

function getVerificationToken(message) {
    const decodedMessage = message
        .replace(/=\r?\n/g, "")
        .replace(/=([a-f0-9]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    const match = decodedMessage.match(/token=([a-f0-9]{64})/i);
    assert.ok(match, "verification email should contain a single-use token");
    return match[1];
}

test("email verification workflow", async (t) => {
    const mongo = await MongoMemoryServer.create({
        instance: { launchTimeout: 60_000 }
    });
    const smtp = createSmtpCaptureServer();
    await new Promise((resolve, reject) => {
        smtp.server.once("error", reject);
        smtp.server.listen(0, "127.0.0.1", resolve);
    });

    process.env.MONGO_URI = mongo.getUri();
    process.env.JWT_SECRET = "test-only-jwt-secret";
    process.env.FRONTEND_URL = "http://127.0.0.1:5173";
    process.env.EMAIL_USER = "test-sender@example.invalid";
    process.env.EMAIL_PASSWORD = "test-only-password";
    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = String(smtp.server.address().port);
    process.env.SMTP_SECURE = "false";
    await mongoose.connect(process.env.MONGO_URI);

    const app = express();
    app.use(express.json());
    app.use("/api/auth", require("../routes/authRoutes"));
    const httpServer = await new Promise((resolve) => {
        const server = app.listen(0, "127.0.0.1", () => resolve(server));
    });
    const baseUrl = `http://127.0.0.1:${httpServer.address().port}/api/auth`;

    t.after(async () => {
        await new Promise((resolve) => httpServer.close(resolve));
        await mongoose.disconnect();
        await mongo.stop();
        await new Promise((resolve) => smtp.server.close(resolve));
    });

    await t.test("signup sends a link without exposing verification secrets", async () => {
        const response = await fetch(`${baseUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test User",
                email: "Signup.Test@example.invalid",
                password: "TestPassword123"
            })
        });
        const payload = await response.json();

        assert.equal(response.status, 201);
        assert.equal(payload.data.verificationEmailSent, true);
        assert.equal(Object.hasOwn(payload.data, "verificationToken"), false);
        assert.equal(Object.hasOwn(payload.data, "password"), false);
        assert.equal(smtp.messages.length, 1);
        assert.match(
            smtp.messages[0].replace(/=\r?\n/g, ""),
            /http:\/\/127\.0\.0\.1:5173\/verify-email\?token=/i
        );

        const user = await User.findOne({ email: "signup.test@example.invalid" })
            .select("+emailVerificationToken +emailVerificationExpire");
        assert.ok(user);
        assert.equal(user.isVerified, false);
        assert.match(user.emailVerificationToken, /^[a-f0-9]{64}$/);
        assert.ok(user.emailVerificationExpire > new Date());
        assert.ok(user.emailVerificationExpire <= new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS));
        assert.notEqual(user.emailVerificationToken, getVerificationToken(smtp.messages[0]));
    });

    await t.test("login is rejected before verification", async () => {
        const response = await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "signup.test@example.invalid",
                password: "TestPassword123"
            })
        });

        assert.equal(response.status, 403);
        assert.match((await response.json()).message, /verify your email/i);
    });

    await t.test("verification succeeds once and clears the token", async () => {
        const token = getVerificationToken(smtp.messages[0]);
        const beforeVerification = await User.findOne({ email: "signup.test@example.invalid" })
            .select("+emailVerificationToken +emailVerificationExpire");
        assert.equal(
            hashVerificationToken(token),
            beforeVerification.emailVerificationToken,
            "the email token should match the stored token hash"
        );
        assert.ok(beforeVerification.emailVerificationExpire > new Date());
        const responses = await Promise.all([
            fetch(`${baseUrl}/verify-email/${token}`),
            fetch(`${baseUrl}/verify-email/${token}`)
        ]);
        assert.deepEqual(
            responses.map((response) => response.status).sort(),
            [200, 400]
        );

        const user = await User.findOne({ email: "signup.test@example.invalid" })
            .select("+emailVerificationToken +emailVerificationExpire");
        assert.equal(user.isVerified, true);
        assert.equal(user.emailVerificationToken, null);
        assert.equal(user.emailVerificationExpire, null);

    });

    await t.test("login succeeds after email verification", async () => {
        const response = await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "signup.test@example.invalid",
                password: "TestPassword123"
            })
        });
        const payload = await response.json();

        assert.equal(response.status, 200);
        assert.equal(payload.message, "Login Successful");
        assert.equal(typeof payload.data.token, "string");
    });

    await t.test("invalid and expired tokens are rejected", async () => {
        const expiredToken = "a".repeat(64);
        await User.create({
            name: "Expired User",
            email: "expired@example.invalid",
            password: "not-a-real-login-hash",
            emailVerificationToken: hashVerificationToken(expiredToken),
            emailVerificationExpire: new Date(Date.now() - 1000)
        });

        const expired = await fetch(`${baseUrl}/verify-email/${expiredToken}`);
        const invalid = await fetch(`${baseUrl}/verify-email/${"b".repeat(64)}`);
        const malformed = await fetch(`${baseUrl}/verify-email/not-a-token`);
        assert.equal(expired.status, 400);
        assert.equal(invalid.status, 400);
        assert.equal(malformed.status, 400);
    });

    await t.test("resend sends a replacement link and is rate limited", async () => {
        const user = await User.create({
            name: "Resend User",
            email: "resend@example.invalid",
            password: "not-a-real-login-hash"
        });
        const firstToken = "c".repeat(64);
        user.emailVerificationToken = hashVerificationToken(firstToken);
        user.emailVerificationExpire = new Date(Date.now() + 60_000);
        await user.save();

        const sendResend = () => fetch(`${baseUrl}/resend-verification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "RESEND@example.invalid" })
        });

        const first = await sendResend();
        assert.equal(first.status, 200);
        assert.equal(smtp.messages.length, 2);
        const replacementToken = getVerificationToken(smtp.messages[1]);
        assert.notEqual(replacementToken, firstToken);

        const staleToken = await fetch(`${baseUrl}/verify-email/${firstToken}`);
        assert.equal(staleToken.status, 400);

        const second = await sendResend();
        const third = await sendResend();
        const limited = await sendResend();
        assert.equal(second.status, 200);
        assert.equal(third.status, 200);
        assert.equal(limited.status, 429);
        assert.equal(smtp.messages.length, 4);

        const latestResendToken = getVerificationToken(smtp.messages[3]);
        const verifyResent = await fetch(`${baseUrl}/verify-email/${latestResendToken}`);
        assert.equal(verifyResent.status, 200);
    });

    await t.test("signup reports missing mail configuration without claiming delivery", async () => {
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASSWORD;

        try {
            const response = await fetch(`${baseUrl}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "No Mail User",
                    email: "no-mail@example.invalid",
                    password: "TestPassword123"
                })
            });
            const payload = await response.json();

            assert.equal(response.status, 201);
            assert.equal(payload.data.verificationEmailSent, false);
            assert.match(payload.message, /could not be sent/i);
            assert.equal(smtp.messages.length, 4);
        } finally {
            process.env.EMAIL_USER = emailUser;
            process.env.EMAIL_PASSWORD = emailPassword;
        }
    });
});
