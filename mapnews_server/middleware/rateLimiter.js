/**
 * Rate Limiting Middleware for MapNews
 * Protects API endpoints from abuse and rapid request spamming.
 */

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
}

function createRateLimiter(options = {}) {
    const windowMs = options.windowMs || 15 * 1000; // 15 seconds window by default
    const max = options.max || 35; // 35 requests max per window
    const message = options.message || 'Пожалуйста, подождите перед следующим действием.';
    const statusCode = options.statusCode || 429;

    // In-memory store: Map<ip, { count: number, resetTime: number }>
    const store = new Map();

    // Auto-cleanup stale records every 30 seconds
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of store.entries()) {
            if (now >= record.resetTime) {
                store.delete(ip);
            }
        }
    }, 30000);

    // Unref so the interval doesn't hold the process open
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }

    return function rateLimiter(req, res, next) {
        const ip = getClientIp(req);
        const now = Date.now();

        let record = store.get(ip);

        if (!record || now >= record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            store.set(ip, record);
        } else {
            record.count += 1;
        }

        const remaining = Math.max(0, max - record.count);
        const resetSeconds = Math.ceil(record.resetTime / 1000);
        const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

        // Standard rate limit headers
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(resetSeconds));

        if (record.count > max) {
            res.setHeader('Retry-After', String(retryAfterSeconds));
            return res.status(statusCode).json({
                status: statusCode,
                error: 'Too Many Requests',
                message,
                retryAfter: retryAfterSeconds
            });
        }

        next();
    };
}

// General API rate limiter (35 requests per 15 seconds)
const apiRateLimiter = createRateLimiter({
    windowMs: 15 * 1000,
    max: 35,
    message: 'Пожалуйста, подождите перед следующим действием.'
});

// Stricter rate limiter for sensitive endpoints (e.g. auth brute force prevention: 12 attempts per minute)
const authRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 12,
    message: 'Слишком много попыток входа/регистрации. Пожалуйста, подождите.'
});

module.exports = {
    createRateLimiter,
    apiRateLimiter,
    authRateLimiter
};
