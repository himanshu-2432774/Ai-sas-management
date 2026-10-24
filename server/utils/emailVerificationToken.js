const crypto = require("node:crypto");

const VERIFICATION_TOKEN_TTL_MS = 15 * 60 * 1000;

function createVerificationToken() {
    const token = crypto.randomBytes(32).toString("hex");

    return {
        token,
        tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
    };
}

function hashVerificationToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
    createVerificationToken,
    hashVerificationToken,
    VERIFICATION_TOKEN_TTL_MS
};
