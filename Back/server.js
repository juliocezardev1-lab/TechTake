require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");

// Importar rotas
const authRoutes = require('./routes/auth');
const pedidosRoutes = require('./routes/pedidos');
const { rateLimit } = require('./middlewares/rateLimit');

const app = express();

const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES
// ========================================

app.use(helmet({ contentSecurityPolicy: false })); // Headers de segurança
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000',
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 120 }));
app.use(express.static(path.join(__dirname, "..", "Front")));

// ========================================
// ROTAS DAS PÁGINAS
// ========================================

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

// ========================================
// API ROUTES
// ========================================

app.use('/api', authRoutes);
app.use('/api', pedidosRoutes);

// ========================================
// ROTA TESTE
// ========================================

app.get("/api", (req, res) => {
    res.json({ success: true, message: "API funcionando!" });
});

// ========================================
// ROTA NÃO ENCONTRADA
// ========================================

app.use((req, res) => {
    res.status(404).json({ success: false, error: "Rota não encontrada." });
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