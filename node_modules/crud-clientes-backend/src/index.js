import dotenv from "dotenv";
import { ensureDB } from "./db/index.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

await ensureDB();
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log(`CORS permitido desde ${FRONTEND_ORIGIN}`);
});
