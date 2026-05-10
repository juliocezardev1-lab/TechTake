const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'techtake_default_secret';

const router = express.Router();

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO ADMIN
// ========================================

const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || !user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }
        req.user = user;
        next();
    });
};

// ========================================
// LOGIN ADMIN
// ========================================

router.post('/admin/login', [
    body('email').isEmail().normalizeEmail(),
    body('senha').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, senha } = req.body;

    // Buscar admin no banco de dados
    db.get('SELECT * FROM admin WHERE email = ?', [email], async (err, admin) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        // Comparar senhas
        const passwordMatch = await bcrypt.compare(senha, admin.senha);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: admin.id, email: admin.email, isAdmin: true },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ success: true, token, message: 'Login realizado com sucesso' });
    });
});

// ========================================
// GET TODOS OS PACOTES
// ========================================

router.get('/pacotes', (req, res) => {
    db.all('SELECT * FROM pacotes ORDER BY id', (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, pacotes: rows || [] });
    });
});

// ========================================
// GET PACOTES COM DRONE
// ========================================

router.get('/pacotes-drone', (req, res) => {
    db.all('SELECT * FROM pacotes_drone ORDER BY pacote_id', (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, pacotes_drone: rows || [] });
    });
});

// ========================================
// CRIAR NOVO PACOTE (ADMIN)
// ========================================

router.post('/admin/pacotes', verifyAdminToken, [
    body('nome').trim().isLength({ min: 3 }),
    body('investimento_min').isFloat({ min: 0 }),
    body('investimento_max').isFloat({ min: 0 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao } = req.body;

    db.run(
        `INSERT INTO pacotes (nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, message: 'Pacote criado com sucesso', id: this.lastID });
        }
    );
});

// ========================================
// ATUALIZAR PACOTE (ADMIN)
// ========================================

router.put('/admin/pacotes/:id', verifyAdminToken, [
    body('nome').trim().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
    body('investimento_min').isFloat({ min: 0 }).withMessage('Investimento mínimo inválido'),
    body('investimento_max').isFloat({ min: 0 }).withMessage('Investimento máximo inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { id } = req.params;
    const { nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao } = req.body;

    db.run(
        `UPDATE pacotes 
         SET nome = ?, configuracao_tecnica = ?, destaque_servico = ?, investimento_min = ?, investimento_max = ?, descricao = ?, atualizado_em = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao, id],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, message: 'Pacote atualizado com sucesso' });
        }
    );
});

// ========================================
// DELETAR PACOTE (ADMIN)
// ========================================

router.delete('/admin/pacotes/:id', verifyAdminToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM pacotes WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Pacote deletado com sucesso' });
    });
});

// ========================================
// CRIAR PACOTE COM DRONE (ADMIN)
// ========================================

router.post('/admin/pacotes-drone', verifyAdminToken, (req, res) => {
    const { pacote_id, configuracao_tecnica, destaque_servico, investimento } = req.body;

    db.run(
        `INSERT INTO pacotes_drone (pacote_id, configuracao_tecnica, destaque_servico, investimento) 
         VALUES (?, ?, ?, ?)`,
        [pacote_id, configuracao_tecnica, destaque_servico, investimento],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, message: 'Pacote drone criado com sucesso', id: this.lastID });
        }
    );
});

// ========================================
// ATUALIZAR PACOTE COM DRONE (ADMIN)
// ========================================

router.put('/admin/pacotes-drone/:id', verifyAdminToken, (req, res) => {
    const { id } = req.params;
    const { configuracao_tecnica, destaque_servico, investimento } = req.body;

    db.run(
        `UPDATE pacotes_drone 
         SET configuracao_tecnica = ?, destaque_servico = ?, investimento = ?
         WHERE id = ?`,
        [configuracao_tecnica, destaque_servico, investimento, id],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, message: 'Pacote drone atualizado com sucesso' });
        }
    );
});

// ========================================
// DELETAR PACOTE COM DRONE (ADMIN)
// ========================================

router.delete('/admin/pacotes-drone/:id', verifyAdminToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM pacotes_drone WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Pacote drone deletado com sucesso' });
    });
});

module.exports = router;
