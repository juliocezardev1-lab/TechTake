// Middleware de autenticação para rotas de usuários comuns
// Uso: router.get('/rota-protegida', authenticateToken, (req, res) => { ... })

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'chave-local-desenvolvimento';

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Token inválido ou expirado' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
