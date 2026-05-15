const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// ========================================
// DATABASE
// ========================================

// Usa a pasta /database na raiz do projeto, garantindo que ela exista
const dbDir = path.join(__dirname, "..", "..", "database");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log("Pasta database/ criada.");
}

const dbPath = path.join(dbDir, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao conectar banco:", err.message);
    } else {
        console.log("Banco conectado com sucesso em:", dbPath);
        // WAL mode: melhora concorrência (múltiplas leituras simultâneas sem travar escritas)
        db.run("PRAGMA journal_mode = WAL;");
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
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            senha TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS pacotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            configuracao_tecnica TEXT,
            destaque_servico TEXT,
            investimento_min REAL,
            investimento_max REAL,
            descricao TEXT,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS pacotes_drone (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pacote_id INTEGER,
            configuracao_tecnica TEXT,
            destaque_servico TEXT,
            investimento REAL,
            FOREIGN KEY (pacote_id) REFERENCES pacotes(id)
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

    console.log("Tabelas verificadas.");
});

module.exports = db;
