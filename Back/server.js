require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

const authRoutes   = require('./routes/auth');
const pedidosRoutes = require('./routes/pedidos');
const adminRoutes  = require('./routes/admin');
const { rateLimit } = require('./middlewares/rateLimit');

// ============================================================
// CONFIGURAÇÃO BÁSICA
// ============================================================

const app = express();
const PORT        = process.env.PORT        || 3000;
const NODE_ENV    = process.env.NODE_ENV    || 'development';
const isProduction = NODE_ENV === 'production';

// Necessário no Render: permite ler o IP real do cliente por trás do proxy
app.set('trust proxy', 1);

// ============================================================
// SEGURANÇA E CORS
// ============================================================

// Helmet adiciona headers de segurança HTTP (anti-clickjacking, anti-sniffing, etc.)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: define quem pode chamar a API
// - Em desenvolvimento: aceita localhost:3000
// - Em produção:        aceita apenas o domínio do Netlify definido em FRONTEND_ORIGIN
const allowedOrigins = isProduction
    ? [process.env.FRONTEND_ORIGIN]
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Permite chamadas sem origin (Postman, curl, apps mobile)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origem bloqueada pelo CORS: ${origin}`));
    },
    credentials: true
}));

// ============================================================
// MIDDLEWARES GERAIS
// ============================================================

// Log de requisições: formato simples em dev, detalhado em produção
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Interpreta JSON no body das requisições
app.use(express.json());

// Rate limiting: máximo 120 requisições por IP a cada 15 minutos
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 120 }));

// ============================================================
// ARQUIVOS ESTÁTICOS (somente desenvolvimento local)
// Em produção, o Netlify serve o frontend — o Render só expõe a API
// ============================================================

if (!isProduction) {
    app.use(express.static(path.join(__dirname, '..', 'Front')));

    // Rotas de página: mapeiam /home → home.html, /login → login.html, etc.
    const pages = ['home', 'login', 'cadastro', 'servicos', 'sobre', 'contato', 'portefolio', 'admin-login', 'admin-panel'];
    pages.forEach(page => {
        app.get(`/${page}`, (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'Front', `${page}.html`));
        });
    });

    // Raiz redireciona para home
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'Front', 'home.html'));
    });
}

// ============================================================
// ROTAS DA API
// ============================================================

// Health check — confirma que a API está online
app.get('/api', (req, res) => {
    res.json({ success: true, message: 'API TechTake funcionando!', env: NODE_ENV });
});

app.use('/api', authRoutes);    // /api/login, /api/register, /api/auth/status
app.use('/api', pedidosRoutes); // /api/pedidos
app.use('/api', adminRoutes);   // /api/admin/login, /api/pacotes, /api/pacotes-drone, /api/admin/...

// ============================================================
// HANDLERS DE ERRO
// ============================================================

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Rota não encontrada: ${req.method} ${req.path}` });
});

// Erro interno (qualquer exceção não tratada)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Erro interno:', err.message);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
});

// ============================================================
// START
// ============================================================

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  TechTake API — ${NODE_ENV}`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  CORS liberado para: ${allowedOrigins.join(', ')}`);
    console.log(`========================================\n`);
});
