require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");

// Importar rotas
const authRoutes = require('./routes/auth');
const pedidosRoutes = require('./routes/pedidos');
const adminRoutes = require('./routes/admin');
const { rateLimit } = require('./middlewares/rateLimit');

const app = express();

// Necessário para o Render (e outros proxies reversos) — permite ler o IP real do cliente
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ========================================
// MIDDLEWARES
// ========================================

app.use(helmet({ contentSecurityPolicy: false }));

// CORS: em produção aceita a própria URL do Render; em dev aceita localhost
const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? [process.env.FRONTEND_ORIGIN]
    : ['http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (ex: curl, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Bloqueado pelo CORS'));
    },
    credentials: true
}));

app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 120 }));

// Servir arquivos estáticos do Front — usado APENAS em desenvolvimento local
// Em produção, o Front é hospedado no Netlify e o Back apenas expõe a API
if (!isProduction) {
    app.use(express.static(path.join(__dirname, "..", "Front")));
}

// ========================================
// ROTAS DAS PÁGINAS
// ========================================

if (!isProduction) {
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "cadastro.html"));
    });
    
    app.get("/home", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "home.html"));
    });
    
    app.get("/login", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "login.html"));
    });
    
    app.get("/cadastro", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "cadastro.html"));
    });
    
    app.get("/servicos", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "servicos.html"));
    });
    
    app.get("/sobre", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "sobre.html"));
    });
    
    app.get("/contato", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "contato.html"));
    });
    
    app.get("/portefolio", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "portefolio.html"));
    });
    
    app.get("/admin-login", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "admin-login.html"));
    });
    
    app.get("/admin-panel", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "Front", "admin-panel.html"));
    });
}

// ========================================
// ROTA TESTE (deve ficar antes dos routers para não ser capturada por eles)
// ========================================

app.get("/api", (req, res) => {
    res.json({ success: true, message: "API funcionando!" });
});

// ========================================
// API ROUTES
// ========================================

app.use('/api', authRoutes);
app.use('/api', pedidosRoutes);
app.use('/api', adminRoutes);

// ========================================
// ROTA NÃO ENCONTRADA
// ========================================

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "..", "Front", "home.html"));
});

// ========================================
// HANDLER DE ERRO GLOBAL
// ========================================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.message);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Servidor rodando:`);
    console.log(`http://localhost:${PORT}`);
    console.log(`========================================`);
});
