import { describe, it, expect } from "vitest";

describe("frontend smoke (jsdom)", () => {
  it("crea un elemento en el DOM", () => {
    document.body.innerHTML = '<div id="root"></div>';
    const root = document.getElementById("root");
    const p = document.createElement("p");
    p.textContent = "hola";
    root.appendChild(p);
    expect(root.textContent).toBe("hola");
  });
});
