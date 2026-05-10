// Rotas de pedidos / formulário de contato
// POST /api/pedidos  — envia pedido (público, qualquer visitante pode enviar)
// GET  /api/pedidos  — lista pedidos (restrito a admins)

const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-local-desenvolvimento';
const router = express.Router();

// Middleware: verifica se o token é de um admin
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || !user.isAdmin) {
            return res.status(403).json({ success: false, error: 'Acesso restrito a administradores' });
        }
        req.user = user;
        next();
    });
};

// ── Enviar pedido (público) ───────────────────────────────────
router.post('/pedidos', [
    body('nome').trim().isLength({ min: 2 }).withMessage('Nome precisa ter ao menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('mensagem').trim().isLength({ min: 10 }).withMessage('Mensagem precisa ter ao menos 10 caracteres')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { nome, email, telefone, servico, mensagem } = req.body;

    db.run(
        'INSERT INTO pedidos (nome, email, telefone, servico, mensagem) VALUES (?, ?, ?, ?, ?)',
        [nome, email, telefone || null, servico || null, mensagem],
        function (err) {
            if (err) {
                console.error('Erro ao salvar pedido:', err);
                return res.status(500).json({ success: false, error: 'Erro ao salvar pedido' });
            }
            res.json({ success: true, pedidoId: this.lastID });
        }
    );
});

// ── Listar pedidos (somente admin) ────────────────────────────
router.get('/pedidos', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM pedidos ORDER BY criado_em DESC', [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar pedidos:', err);
            return res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
        }
        res.json({ success: true, pedidos: rows || [] });
    });
});

module.exports = router;
