import express from "express";
import cors from "cors";
import clientsRouter from "./routes/clients.js";

export function buildApp({ origin = "http://localhost:5173" } = {}) {
  const app = express();
  app.use(cors({ origin }));
  app.use(express.json());
  app.use("/api/clients", clientsRouter);
  app.get("/health", (_req, res) => res.json({ ok: true }));
  return app;
}

export default buildApp();
