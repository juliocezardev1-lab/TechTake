const rateLimit = (options = {}) => {
    const requests = new Map();
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const maxRequests = options.max || 120;

    // Limpeza periódica de entradas expiradas para evitar memory leak
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of requests.entries()) {
            if (now - entry.firstRequest > windowMs) {
                requests.delete(ip);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const entry = requests.get(ip) || { count: 0, firstRequest: now };

        if (now - entry.firstRequest > windowMs) {
            entry.count = 1;
            entry.firstRequest = now;
        } else {
            entry.count += 1;
        }

        requests.set(ip, entry);

        if (entry.count > maxRequests) {
            return res.status(429).json({ success: false, error: 'Muitas requisições. Tente novamente mais tarde.' });
        }

        next();
    };
};

module.exports = { rateLimit };