import { Router } from "express";
import { getDB } from "../db/index.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const db = await getDB();
    const rows = await db.all("SELECT * FROM clients ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error al listar", details: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const row = await db.get("SELECT * FROM clients WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener", details: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: "name y email son obligatorios" });
    }
    const db = await getDB();
    const result = await db.run(
      "INSERT INTO clients (name,email,phone) VALUES (?,?,?)",
      [name.trim(), email.trim(), phone?.trim() ?? null]
    );
    const created = await db.get("SELECT * FROM clients WHERE id = ?", [result.lastID]);
    res.status(201).json(created);
  } catch (e) {
    const code = /UNIQUE/.test(e.message) ? 409 : 500;
    res.status(code).json({ error: "Error al crear", details: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const existing = await db.get("SELECT * FROM clients WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "No encontrado" });

    const name = req.body.name?.trim() ?? existing.name;
    const email = req.body.email?.trim() ?? existing.email;
    const phone = req.body.phone?.trim() ?? existing.phone;

    await db.run(
      "UPDATE clients SET name=?, email=?, phone=? WHERE id=?",
      [name, email, phone, req.params.id]
    );
    const updated = await db.get("SELECT * FROM clients WHERE id = ?", [req.params.id]);
    res.json(updated);
  } catch (e) {
    const code = /UNIQUE/.test(e.message) ? 409 : 500;
    res.status(code).json({ error: "Error al actualizar", details: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.run("DELETE FROM clients WHERE id = ?", [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Error al eliminar", details: e.message });
  }
});

export default router;
