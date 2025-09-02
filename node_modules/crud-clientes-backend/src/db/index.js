import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let db;

function getPaths() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, "..", ".."); // /backend
  const dataDir = path.join(repoRoot, "data");
  const dbFile = process.env.DB_FILE || path.join(dataDir, "app.db");
  return { dataDir, dbFile };
}

export async function ensureDB() {
  const { dataDir } = getPaths();
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  await getDB();
}

export async function getDB() {
  if (db) return db;
  const { dbFile } = getPaths();

  db = await open({
    filename: dbFile,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
  `);

  const row = await db.get("SELECT COUNT(*) AS c FROM clients");
  if (row.c === 0) {
    await db.run(
      "INSERT INTO clients (name,email,phone) VALUES (?,?,?)",
      ["Ada Lovelace", "ada@ejemplo.com", "+57 300 000 0001"]
    );
    await db.run(
      "INSERT INTO clients (name,email,phone) VALUES (?,?,?)",
      ["Alan Turing", "alan@ejemplo.com", "+57 300 000 0002"]
    );
  }

  return db;
}
export async function resetDB() {
  if (db) {
    try { await db.close(); } catch {}
    db = undefined;
  }
}
