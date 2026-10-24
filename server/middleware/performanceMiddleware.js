const performanceMiddleware = (req, res, next) => {
    const startTime = process.hrtime.bigint();

    res.on("finish", () => {
        const endTime = process.hrtime.bigint();

        const durationMs =
            Number(endTime - startTime) / 1_000_000;
        const endpoint = req.originalUrl.replace(
            /\/api\/auth\/verify-email\/[^/?]+/i,
            "/api/auth/verify-email/[redacted]"
        );

        console.log({
            requestId: req.requestId,
            method: req.method,
            endpoint,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2))
        });

        if (durationMs > 1000) {
            console.warn(
                `SLOW API: ${req.method} ${endpoint} took ${durationMs.toFixed(2)} ms`
            );
        }
    });

    next();
};

module.exports = performanceMiddleware;