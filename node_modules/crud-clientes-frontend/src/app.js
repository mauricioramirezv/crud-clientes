const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE}/api/clients`;

const $ = (s) => document.querySelector(s);
const tbody = $("#clients-body");
const form = $("#client-form");
const idInput = $("#id");
const nameInput = $("#name");
const emailInput = $("#email");
const phoneInput = $("#phone");
const resetBtn = $("#reset-btn");

async function fetchClients() {
  const res = await fetch(API);
  const data = await res.json();
  renderTable(data);
}

function renderTable(clients) {
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
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(s) {
  return s?.replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m])) ?? "";
}

tbody.addEventListener("click", async (e) => {
  const editId = e.target.getAttribute("data-edit");
  const delId = e.target.getAttribute("data-del");

  if (editId) {
    const res = await fetch(`${API}/${editId}`);
    if (res.ok) {
      const c = await res.json();
      idInput.value = c.id;
      nameInput.value = c.name;
      emailInput.value = c.email;
      phoneInput.value = c.phone ?? "";
      nameInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (delId) {
    if (!confirm("¿Eliminar este cliente?")) return;
    const res = await fetch(`${API}/${delId}`, { method: "DELETE" });
    if (res.ok) fetchClients();
    else alert("No se pudo eliminar");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim() || null,
  };

  let res;
  if (idInput.value) {
    res = await fetch(`${API}/${idInput.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (res.ok) {
    resetForm();
    fetchClients();
  } else {
    const err = await res.json().catch(() => ({}));
    alert(err.error || "Error");
  }
});

function resetForm() {
  idInput.value = "";
  nameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
}

resetBtn.addEventListener("click", resetForm);

fetchClients();
