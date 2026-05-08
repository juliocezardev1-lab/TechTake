const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const db = require('../models/db');

const router = express.Router();

// ========================================
// ENVIAR PEDIDO / ORÇAMENTO
// ========================================

router.post('/pedidos', authenticateToken, [
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

router.get('/pedidos', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM pedidos ORDER BY criado_em DESC`, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar pedidos:', err);
            return res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
        }
        res.json(rows);
    });
});

module.exports = router;