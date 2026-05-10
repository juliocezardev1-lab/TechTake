// Rate limiting manual (sem dependências externas)
// Limita o número de requisições por IP em uma janela de tempo

const rateLimit = (options = {}) => {
    const windowMs   = options.windowMs || 15 * 60 * 1000; // 15 minutos
    const maxRequests = options.max     || 120;

    // Mapa: IP → { count, firstRequest }
    const requests = new Map();

    // Limpa entradas expiradas periodicamente para evitar memory leak
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of requests.entries()) {
            if (now - entry.firstRequest > windowMs) {
                requests.delete(ip);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const ip  = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        const entry = requests.get(ip) || { count: 0, firstRequest: now };

        // Reinicia a janela se já passou o tempo
        if (now - entry.firstRequest > windowMs) {
            entry.count = 1;
            entry.firstRequest = now;
        } else {
            entry.count += 1;
        }

        requests.set(ip, entry);

        if (entry.count > maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Muitas requisições. Aguarde alguns minutos e tente novamente.'
            });
        }

        next();
    };
};

module.exports = { rateLimit };
