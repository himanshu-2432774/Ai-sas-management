const logger = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const requestUrl = req.originalUrl.replace(
            /\/api\/auth\/verify-email\/[^/?]+/i,
            "/api/auth/verify-email/[redacted]"
        );

        console.log(
            `${req.method} ${requestUrl} ${res.statusCode} ${duration}ms`
        );
    });

    next();
};

module.exports = logger;