const performanceMiddleware = (req, res, next) => {
    const startTime = process.hrtime.bigint();

    res.on("finish", () => {
        const endTime = process.hrtime.bigint();

        const durationMs =
            Number(endTime - startTime) / 1_000_000;

        console.log({
            method: req.method,
            endpoint: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2))
        });

        if (durationMs > 1000) {
            console.warn(
                `SLOW API: ${req.method} ${req.originalUrl} took ${durationMs.toFixed(2)} ms`
            );
        }
    });

    next();
};

module.exports = performanceMiddleware;