// Rotas administrativas
// POST /api/admin/login           — login do admin
// GET  /api/pacotes               — lista pacotes (público)
// GET  /api/pacotes-drone         — lista pacotes drone (público)
// POST /api/admin/pacotes         — cria pacote (admin)
// PUT  /api/admin/pacotes/:id     — edita pacote (admin)
// DELETE /api/admin/pacotes/:id   — deleta pacote (admin)
// POST /api/admin/pacotes-drone   — cria pacote drone (admin)
// PUT  /api/admin/pacotes-drone/:id   — edita (admin)
// DELETE /api/admin/pacotes-drone/:id — deleta (admin)

const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-local-desenvolvimento';
const router = express.Router();

// Middleware: verifica token de admin
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

// ── Login admin ───────────────────────────────────────────────
router.post('/admin/login', [
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('senha').notEmpty().withMessage('Senha obrigatória')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, senha } = req.body;

    db.get('SELECT * FROM admin WHERE email = ?', [email], async (err, admin) => {
        if (err) return res.status(500).json({ success: false, error: 'Erro interno' });

        // Mesma mensagem para e-mail errado ou senha errada (evita enumeração)
        if (!admin) return res.status(401).json({ success: false, error: 'Credenciais inválidas' });

        const senhaValida = await bcrypt.compare(senha, admin.senha);
        if (!senhaValida) return res.status(401).json({ success: false, error: 'Credenciais inválidas' });

        const token = jwt.sign(
            { id: admin.id, email: admin.email, isAdmin: true },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, token });
    });
});

// ── Listar pacotes (público) ──────────────────────────────────
router.get('/pacotes', (req, res) => {
    db.all('SELECT * FROM pacotes ORDER BY id', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, pacotes: rows || [] });
    });
});

// ── Listar pacotes drone (público) ────────────────────────────
router.get('/pacotes-drone', (req, res) => {
    db.all('SELECT * FROM pacotes_drone ORDER BY pacote_id', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, pacotes_drone: rows || [] });
    });
});

// ── Criar pacote (admin) ──────────────────────────────────────
router.post('/admin/pacotes', verifyAdmin, [
    body('nome').trim().isLength({ min: 3 }).withMessage('Nome precisa ter ao menos 3 caracteres'),
    body('investimento_min').isFloat({ min: 0 }).withMessage('Investimento mínimo inválido'),
    body('investimento_max').isFloat({ min: 0 }).withMessage('Investimento máximo inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao } = req.body;

    db.run(
        `INSERT INTO pacotes (nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao],
        function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, id: this.lastID, message: 'Pacote criado' });
        }
    );
});

// ── Editar pacote (admin) ─────────────────────────────────────
router.put('/admin/pacotes/:id', verifyAdmin, [
    body('nome').trim().isLength({ min: 3 }).withMessage('Nome precisa ter ao menos 3 caracteres'),
    body('investimento_min').isFloat({ min: 0 }).withMessage('Investimento mínimo inválido'),
    body('investimento_max').isFloat({ min: 0 }).withMessage('Investimento máximo inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao } = req.body;

    db.run(
        `UPDATE pacotes
         SET nome = ?, configuracao_tecnica = ?, destaque_servico = ?,
             investimento_min = ?, investimento_max = ?, descricao = ?,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao, id],
        function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (this.changes === 0) return res.status(404).json({ success: false, error: 'Pacote não encontrado' });
            res.json({ success: true, message: 'Pacote atualizado' });
        }
    );
});

// ── Deletar pacote (admin) ────────────────────────────────────
router.delete('/admin/pacotes/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM pacotes WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Pacote não encontrado' });
        res.json({ success: true, message: 'Pacote deletado' });
    });
});

// ── Criar pacote drone (admin) ────────────────────────────────
router.post('/admin/pacotes-drone', verifyAdmin, [
    body('pacote_id').isInt({ min: 1 }).withMessage('pacote_id inválido'),
    body('investimento').isFloat({ min: 0 }).withMessage('Investimento inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { pacote_id, configuracao_tecnica, destaque_servico, investimento } = req.body;

    db.run(
        `INSERT INTO pacotes_drone (pacote_id, configuracao_tecnica, destaque_servico, investimento)
         VALUES (?, ?, ?, ?)`,
        [pacote_id, configuracao_tecnica, destaque_servico, investimento],
        function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, id: this.lastID, message: 'Pacote drone criado' });
        }
    );
});

// ── Editar pacote drone (admin) ───────────────────────────────
router.put('/admin/pacotes-drone/:id', verifyAdmin, [
    body('investimento').isFloat({ min: 0 }).withMessage('Investimento inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { configuracao_tecnica, destaque_servico, investimento } = req.body;

    db.run(
        `UPDATE pacotes_drone
         SET configuracao_tecnica = ?, destaque_servico = ?, investimento = ?
         WHERE id = ?`,
        [configuracao_tecnica, destaque_servico, investimento, id],
        function (err) {
            if (err) return res.status(500).json({ success: false, error: err.message });
            if (this.changes === 0) return res.status(404).json({ success: false, error: 'Pacote drone não encontrado' });
            res.json({ success: true, message: 'Pacote drone atualizado' });
        }
    );
});

// ── Deletar pacote drone (admin) ──────────────────────────────
router.delete('/admin/pacotes-drone/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM pacotes_drone WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Pacote drone não encontrado' });
        res.json({ success: true, message: 'Pacote drone deletado' });
    });
});

module.exports = router;
