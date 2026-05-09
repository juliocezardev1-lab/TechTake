const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'techtake_default_secret';

const router = express.Router();

// Middleware: apenas admin pode listar pedidos
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) return res.status(401).json({ success: false, message: 'Token não fornecido' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || !user.isAdmin) return res.status(403).json({ success: false, message: 'Acesso negado' });
        req.user = user;
        next();
    });
};

// ========================================
// ENVIAR PEDIDO / ORÇAMENTO
// ========================================

router.post('/pedidos', [
    body('nome').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('mensagem').trim().isLength({ min: 10 }).withMessage('Mensagem deve ter pelo menos 10 caracteres')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    try {
        const { nome, email, telefone, servico, mensagem } = req.body;

        db.run(
            `INSERT INTO pedidos (nome, email, telefone, servico, mensagem) VALUES (?, ?, ?, ?, ?)`,
            [nome, email, telefone, servico, mensagem],
            function (err) {
                if (err) {
                    console.error('Erro ao salvar pedido:', err);
                    return res.status(500).json({ success: false, error: 'Erro ao salvar pedido' });
                }
                console.log('Novo pedido criado:', this.lastID);
                res.json({ success: true, pedidoId: this.lastID });
            }
        );
    } catch (error) {
        console.error('Erro no pedido:', error);
        res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
});

// ========================================
// LISTAR PEDIDOS (PROTEGIDO)
// ========================================

router.get('/pedidos', verifyAdminToken, (req, res) => {
    db.all(`SELECT * FROM pedidos ORDER BY criado_em DESC`, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar pedidos:', err);
            return res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
        }
        res.json(rows);
    });
});

module.exports = router;