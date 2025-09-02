import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

beforeEach(async () => {
  process.env.DB_FILE = ":memory:";
});

async function getAppAndDb() {
  const { ensureDB, resetDB } = await import("../../backend/src/db/index.js");
  const { default: app } = await import("../../backend/src/app.js");
  await ensureDB();
  return { app, resetDB };
}

describe("API /api/clients", () => {
  it("lista inicial (seed)", async () => {
    const { app, resetDB } = await getAppAndDb();
    const res = await request(app).get("/api/clients");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    await resetDB();
  });

  it("crea y obtiene por id", async () => {
    const { app, resetDB } = await getAppAndDb();
    const create = await request(app).post("/api/clients").send({
      name: "Grace Hopper",
      email: "grace@example.com",
      phone: "123",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const one = await request(app).get(`/api/clients/${id}`);
    expect(one.status).toBe(200);
    expect(one.body.email).toBe("grace@example.com");
    await resetDB();
  });

  it("actualiza y elimina", async () => {
    const { app, resetDB } = await getAppAndDb();
    const { body: created } = await request(app).post("/api/clients").send({
      name: "Ada",
      email: "ada@x.com",
    });
    const upd = await request(app).put(`/api/clients/${created.id}`).send({ phone: "999" });
    expect(upd.status).toBe(200);
    expect(upd.body.phone).toBe("999");

    const del = await request(app).delete(`/api/clients/${created.id}`);
    expect(del.status).toBe(200);
    const again = await request(app).get(`/api/clients/${created.id}`);
    expect(again.status).toBe(404);
    await resetDB();
  });
});
