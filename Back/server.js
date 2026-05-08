const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

const SECRET = "techtake_secret_key";

// ========================================
// MIDDLEWARES
// ========================================

app.use(cors());

// LOGS HTTP
app.use(morgan("dev"));

// JSON
app.use(express.json());

// ARQUIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, "..", "Front")));

// ========================================
// ROTAS DAS PÁGINAS
// ========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "Front", "home.html")
    );
});

app.get("/home", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "Front", "home.html")
    );
});

app.get("/servicos", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "Front", "servicos.html")
    );
});

app.get("/sobre", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "Front", "sobre.html")
    );
});

app.get("/contato", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "Front", "contato.html")
    );
});

app.get("/portefolio", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "Front", "portefolio.html")
    );
});

// ========================================
// DATABASE
// ========================================

const dbPath = path.join(
    __dirname,
    "..",
    "database",
    "database.db"
);

const db = new sqlite3.Database(dbPath, (err) => {

    if (err) {

        console.error(
            "Erro ao conectar banco:",
            err.message
        );

    } else {

        console.log(
            "Banco conectado com sucesso."
        );

    }

});

// ========================================
// CRIAR TABELAS
// ========================================

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT UNIQUE,
            senha TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT,
            telefone TEXT,
            servico TEXT,
            mensagem TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Banco de dados conectado.");
    console.log("Tabelas verificadas.");

});

// ========================================
// ROTA TESTE
// ========================================

app.get("/api", (req, res) => {

    res.json({
        success: true,
        message: "API funcionando!"
    });

});

// ========================================
// CADASTRO
// ========================================

app.post("/api/register", async (req, res) => {

    try {

        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {

            return res.status(400).json({
                success: false,
                error: "Preencha todos os campos."
            });

        }

        const senhaHash = await bcrypt.hash(senha, 10);

        db.run(
            `
            INSERT INTO usuarios(nome, email, senha)
            VALUES (?, ?, ?)
            `,
            [nome, email, senhaHash],
            function (err) {

                if (err) {

                    console.error(err);

                    return res.status(400).json({
                        success: false,
                        error: "E-mail já cadastrado."
                    });

                }

                console.log("Novo usuário cadastrado:", email);

                res.json({
                    success: true,
                    message: "Usuário criado com sucesso.",
                    id: this.lastID
                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Erro interno no servidor."
        });

    }

});

// ========================================
// LOGIN
// ========================================

app.post("/api/login", (req, res) => {

    try {

        const { email, senha } = req.body;

        if (!email || !senha) {

            return res.status(400).json({
                success: false,
                error: "Preencha todos os campos."
            });

        }

        db.get(
            `
            SELECT * FROM usuarios
            WHERE email = ?
            `,
            [email],
            async (err, user) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        error: "Erro interno."
                    });

                }

                if (!user) {

                    return res.status(401).json({
                        success: false,
                        error: "Usuário não encontrado."
                    });

                }

                const senhaValida = await bcrypt.compare(
                    senha,
                    user.senha
                );

                if (!senhaValida) {

                    return res.status(401).json({
                        success: false,
                        error: "Senha incorreta."
                    });

                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email
                    },
                    SECRET,
                    {
                        expiresIn: "7d"
                    }
                );

                console.log("Login realizado:", email);

                res.json({
                    success: true,
                    token,
                    usuario: {
                        id: user.id,
                        nome: user.nome,
                        email: user.email
                    }
                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Erro interno no servidor."
        });

    }

});

// ========================================
// ENVIAR PEDIDO / ORÇAMENTO
// ========================================

app.post("/api/pedidos", (req, res) => {

    try {

        const {
            nome,
            email,
            telefone,
            servico,
            mensagem
        } = req.body;

        if (!nome || !email || !mensagem) {

            return res.status(400).json({
                success: false,
                error: "Campos obrigatórios faltando."
            });

        }

        db.run(
            `
            INSERT INTO pedidos(
                nome,
                email,
                telefone,
                servico,
                mensagem
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                nome,
                email,
                telefone,
                servico,
                mensagem
            ],
            function (err) {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        error: "Erro ao salvar pedido."
                    });

                }

                console.log("Novo pedido criado:", this.lastID);

                res.json({
                    success: true,
                    pedidoId: this.lastID
                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Erro interno no servidor."
        });

    }

});

// ========================================
// LISTAR PEDIDOS
// ========================================

app.get("/api/pedidos", (req, res) => {

    db.all(
        `
        SELECT * FROM pedidos
        ORDER BY criado_em DESC
        `,
        [],
        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    error: "Erro ao buscar pedidos."
                });

            }

            res.json(rows);

        }
    );

});

// ========================================
// ROTA NÃO ENCONTRADA
// ========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: "Rota não encontrada."
    });

});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log(`
========================================
Servidor rodando:
http://localhost:${PORT}
========================================
    `);

});