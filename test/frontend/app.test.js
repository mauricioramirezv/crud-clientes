import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Helpers de respuesta JSON para mock fetch
function jsonRes(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe("app.js UI + API flows", () => {
  let fetchMock;

  // Estructura mínima del HTML que usa app.js
  function mountDom() {
    document.body.innerHTML = `
      <form id="client-form">
        <input id="id" type="hidden" />
        <label>Nombre <input id="name" /></label>
        <label>Email <input id="email" /></label>
        <label>Teléfono <input id="phone" /></label>
        <button type="submit" id="save-btn">Guardar</button>
        <button type="button" id="reset-btn">Limpiar</button>
      </form>
      <table><tbody id="clients-body"></tbody></table>
    `;
  }

  beforeEach(async () => {
    // Estado simulado del backend
    let seqId = 3;
    let clients = [
      { id: 1, name: "Ada Lovelace",  email: "ada@ejemplo.com",  phone: null,                created_at: "2025-01-01T00:00:00Z" },
      { id: 2, name: "Alan Turing",   email: "alan@ejemplo.com", phone: "+57 300 000 0002", created_at: "2025-01-01T00:00:00Z" },
    ];

    // mocks globales
    window.scrollTo = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    fetchMock = vi.fn(async (url, options = {}) => {
      const method = (options.method || "GET").toUpperCase();

      // Lista
      if (url.endsWith("/api/clients") && method === "GET") {
        return jsonRes(clients);
      }

      // Obtener por id
      const mId = url.match(/\/api\/clients\/(\d+)$/);
      if (mId && method === "GET") {
        const id = Number(mId[1]);
        const one = clients.find(c => c.id === id);
        return one ? jsonRes(one) : jsonRes({ error: "No encontrado" }, 404);
      }

      // Crear
      if (url.endsWith("/api/clients") && method === "POST") {
        const body = JSON.parse(options.body || "{}");
        const created = {
          id: seqId++,
          name: body.name,
          email: body.email,
          phone: body.phone ?? null,
          created_at: new Date().toISOString(),
        };
        clients.push(created);
        return jsonRes(created, 201);
      }

      // Actualizar
      if (mId && method === "PUT") {
        const id = Number(mId[1]);
        const body = JSON.parse(options.body || "{}");
        const idx = clients.findIndex(c => c.id === id);
        if (idx === -1) return jsonRes({ error: "No encontrado" }, 404);
        clients[idx] = { ...clients[idx], ...body };
        return jsonRes(clients[idx]);
      }

      // Eliminar
      if (mId && method === "DELETE") {
        const id = Number(mId[1]);
        const before = clients.length;
        clients = clients.filter(c => c.id !== id);
        return before === clients.length ? jsonRes({ error: "No encontrado" }, 404) : jsonRes({ ok: true });
      }

      return jsonRes({ error: "Ruta no mockeada", url, method }, 500);
    });

    vi.stubGlobal("fetch", fetchMock);

    // DOM listo antes de importar el módulo (porque app.js agrega listeners al cargar)
    mountDom();

    // Asegura que el import no quede cacheado entre tests
    await vi.resetModules();

    // Importa app.js (esto dispara fetchClients() una vez)
    await import("../../frontend/src/app.js");

    // Espera un tick para que termine el fetch inicial + render
    await new Promise(r => setTimeout(r, 0));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renderiza la lista inicial al cargar", async () => {
    const rows = document.querySelectorAll("#clients-body tr");
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(document.body.textContent).toContain("Ada Lovelace");
    expect(document.body.textContent).toContain("Alan Turing");

    // Verifica la PRIMERA llamada a fetch (lista inicial)
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOpts] = fetchMock.mock.calls[0];
    expect(calledUrl).toMatch(/\/api\/clients$/);
    expect(calledOpts).toBeUndefined();
  });

  it("crea un cliente vía submit (POST) y refresca la tabla", async () => {
    const form  = document.getElementById("client-form");
    const name  = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    name.value  = "Grace Hopper";
    email.value = "grace@example.com";
    phone.value = "123";

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 0)); // espera POST + refresco

    // Verifica que se llamó al POST con el body correcto
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/clients$/),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining('"grace@example.com"'),
      })
    );

    // y que ahora hay más filas
    const rows = document.querySelectorAll("#clients-body tr");
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it("edita (rellena formulario) y elimina un cliente", async () => {
    const tbody = document.getElementById("clients-body");

    // Click en el primer botón "Editar"
    const editBtn = tbody.querySelector("button[data-edit]");
    editBtn.click();
    await new Promise(r => setTimeout(r, 0)); // espera GET por id

    // Form quedó cargado
    expect(document.getElementById("name").value).not.toBe("");
    expect(document.getElementById("email").value).toContain("@");

    // Click en "Eliminar" del primer registro
    const delBtn = tbody.querySelector("button[data-del]");
    delBtn.click();
    await new Promise(r => setTimeout(r, 0)); // espera DELETE + refresco

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/clients\/\d+$/),
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
