// Rotas de autenticação de usuários
// POST /api/register  — cria conta
// POST /api/login     — faz login, retorna JWT
// POST /api/logout    — (simbólico, o token é removido no frontend)
// GET  /api/auth/status — verifica se o token é válido

const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-local-desenvolvimento';
const router = express.Router();

// ── Verificar status do token ─────────────────────────────────
router.get('/auth/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.json({ authenticated: false });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.json({ authenticated: false });
        res.json({ authenticated: true, user });
    });
});

// ── Logout (simbólico) ────────────────────────────────────────
router.post('/logout', (req, res) => {
    // JWT é stateless: o logout real acontece no frontend,
    // removendo o token do localStorage/sessionStorage
    res.json({ success: true });
});

// ── Cadastro ──────────────────────────────────────────────────
router.post('/register', [
    body('nome').trim().isLength({ min: 2 }).withMessage('Nome precisa ter ao menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha precisa ter ao menos 6 caracteres')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    try {
        const { nome, email, senha } = req.body;
        const senhaHash = await bcrypt.hash(senha, 10);

        db.run(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaHash],
            function (err) {
                if (err) {
                    // Erro de UNIQUE constraint = e-mail já cadastrado
                    return res.status(400).json({ success: false, error: 'E-mail já cadastrado' });
                }
                res.json({ success: true, message: 'Conta criada com sucesso' });
            }
        );
    } catch (err) {
        console.error('Erro no cadastro:', err);
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

// ── Login ─────────────────────────────────────────────────────
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('senha').notEmpty().withMessage('Senha obrigatória')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    try {
        const { email, senha } = req.body;

        db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
            if (err) return res.status(500).json({ success: false, error: 'Erro interno' });

            // Mensagem genérica para não revelar se o e-mail existe ou não
            const MSG_INVALIDO = 'E-mail ou senha incorretos';

            if (!user) return res.status(401).json({ success: false, error: MSG_INVALIDO });

            const senhaValida = await bcrypt.compare(senha, user.senha);
            if (!senhaValida) return res.status(401).json({ success: false, error: MSG_INVALIDO });

            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                token,
                usuario: { id: user.id, nome: user.nome, email: user.email }
            });
        });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ success: false, error: 'Erro interno' });
    }
});

module.exports = router;
