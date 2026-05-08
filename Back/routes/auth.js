const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const db = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'techtake_default_secret';

const router = express.Router();

// ========================================
// VERIFICAR STATUS DE AUTENTICAÇÃO
// ========================================

router.get('/auth/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
        return res.json({ authenticated: false });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.json({ authenticated: false });
        }
        res.json({ authenticated: true, user });
    });
});

// ========================================
// LOGOUT
// ========================================

router.post('/logout', (req, res) => {
    // Como estamos usando JWT stateless, o logout é feito no frontend
    // removendo o token do localStorage
    res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// ========================================
// REGISTRO
// ========================================

router.post('/register', [
    body('nome').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    try {
        const { nome, email, senha } = req.body;

        const senhaHash = await bcrypt.hash(senha, 10);

        db.run(
            `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
            [nome, email, senhaHash],
            function (err) {
                if (err) {
                    console.error('Erro ao registrar:', err.message);
                    return res.status(400).json({ success: false, error: 'E-mail já cadastrado' });
                }
                console.log('Novo usuário cadastrado:', email);
                res.json({ success: true, message: 'Usuário criado com sucesso', id: this.lastID });
            }
        );
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
});

// ========================================
// LOGIN
// ========================================

router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    try {
        const { email, senha } = req.body;

        db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error('Erro no login:', err);
                return res.status(500).json({ success: false, error: 'Erro interno' });
            }

            if (!user) {
                return res.status(401).json({ success: false, error: 'Usuário não encontrado' });
            }

            const senhaValida = await bcrypt.compare(senha, user.senha);
            if (!senhaValida) {
                return res.status(401).json({ success: false, error: 'Senha incorreta' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            console.log('Login realizado:', email);
            res.json({
                success: true,
                token,
                usuario: { id: user.id, nome: user.nome, email: user.email }
            });
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
});

module.exports = router;