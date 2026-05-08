const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ========================================
// DATABASE
// ========================================

const dbPath = path.join(__dirname, "..", "..", "database", "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao conectar banco:", err.message);
    } else {
        console.log("Banco conectado com sucesso.");
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

    console.log("Tabelas verificadas.");
});

module.exports = db;