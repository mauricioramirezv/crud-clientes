export function escapeHtml(s) {
  return s?.replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m])) ?? "";
}

export function renderTable(tbody, clients) {
  tbody.innerHTML = "";
  for (const c of clients) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${c.phone ? escapeHtml(c.phone) : ""}</td>
      <td>${new Date(c.created_at).toLocaleString()}</td>
      <td class="row-actions">
        <button data-edit="${c.id}">Editar</button>
        <button data-del="${c.id}" class="danger">Eliminar</button>
      </td>`;
    tbody.appendChild(tr);
  }
}
