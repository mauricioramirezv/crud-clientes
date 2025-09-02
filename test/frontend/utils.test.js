import { renderTable, escapeHtml } from "../../frontend/src/utils.js";
import { screen } from "@testing-library/dom";

describe("utils", () => {
  it("escapeHtml", () => {
    expect(escapeHtml('<script>"&</script>')).toBe("&lt;script&gt;&quot;&amp;&lt;/script&gt;");
  });

  it("renderTable dibuja filas", () => {
    document.body.innerHTML = `<table><tbody id="tb"></tbody></table>`;
    const tbody = document.getElementById("tb");
    const data = [
      { id: 1, name: "Ada", email: "ada@x.com", phone: null, created_at: "2025-01-01T00:00:00Z" },
      { id: 2, name: "Alan", email: "alan@x.com", phone: "123", created_at: "2025-01-01T00:00:00Z" },
    ];

    renderTable(tbody, data);

    const rows = tbody.querySelectorAll("tr");
    expect(rows.length).toBe(2);
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("alan@x.com")).toBeTruthy();
    expect(screen.getAllByText("Editar").length).toBe(2);
  });
});
