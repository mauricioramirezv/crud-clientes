# CRUD de Clientes (Frontend + Backend)

Proyecto base listo para **VS Code** con **Frontend (Vite + Vanilla JS)** y **Backend (Express + SQLite)**.

## Requisitos
- Node.js 18+
- Visual Studio Code

## Ejecución (monorepo con workspaces)
```bash
# 1) Instalar dependencias (front + back)
npm install

# 2) Configurar backend
cp backend/.env.example backend/.env

# 3) Correr todo (frontend: 5173, backend: 3000)
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/clients

### VS Code
Incluye `.vscode/launch.json` y `.vscode/tasks.json` para depurar backend y frontend.

