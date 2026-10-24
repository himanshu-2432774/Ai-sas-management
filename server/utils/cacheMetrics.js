const metrics = {
    hits: 0,
    misses: 0,
    errors: 0
};

const recordCacheHit = () => {
    metrics.hits += 1;
};

const recordCacheMiss = () => {
    metrics.misses += 1;
};

const recordCacheError = () => {
    metrics.errors += 1;
};

const getCacheMetrics = () => {
    const totalRequests = metrics.hits + metrics.misses;

    const hitRate = totalRequests === 0
        ? 0
        : Number(
            ((metrics.hits / totalRequests) * 100).toFixed(2)
        );

    return {
        hits: metrics.hits,
        misses: metrics.misses,
        errors: metrics.errors,
        totalRequests,
        hitRate
    };
};

module.exports = {
    recordCacheHit,
    recordCacheMiss,
    recordCacheError,
    getCacheMetrics
};