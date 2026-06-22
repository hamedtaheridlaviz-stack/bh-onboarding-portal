const DOCS = {
  form_a: ["Title Deed", "Emirates ID Front", "Emirates ID Back", "Passport Copy", "Signed Form A", "POA / Company Documents", "Additional Documents"],
  lsa: ["Title Deed", "Emirates ID Front", "Emirates ID Back", "Passport Copy", "Signed LSA", "Ejari / Tenancy Contract", "POA / Company Documents", "Additional Documents"]
};

let selectedType = "form_a";

function $(id) { return document.getElementById(id); }
function esc(s) { return String(s || "").replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function renderDocs() {
  const wrap = $("docs");
  wrap.innerHTML = DOCS[selectedType].map((d, i) => `
    <label class="doc-pill">
      <input type="checkbox" value="${esc(d)}" checked />
      <span>${i + 1}</span>
      <strong>${esc(d)}</strong>
    </label>
  `).join("");
}

function setType(type) {
  selectedType = type;
  document.querySelectorAll(".type-card").forEach(btn => btn.classList.toggle("active", btn.dataset.type === type));
  renderDocs();
}

async function createRequest() {
  const btn = $("createBtn");
  const result = $("result");
  const debug = $("debug");
  result.classList.add("hidden");
  debug.classList.add("hidden");

  const payload = {
    request_type: selectedType,
    owner_name: $("ownerName").value.trim(),
    owner_email: $("ownerEmail").value.trim(),
    owner_mobile: $("ownerMobile").value.trim(),
    property_address: $("propertyAddress").value.trim(),
    documents: Array.from(document.querySelectorAll("#docs input:checked")).map(x => x.value),
    status: "pending"
  };

  if (!payload.owner_name || !payload.property_address) {
    result.innerHTML = `<strong>Please add owner name and property address.</strong>`;
    result.classList.remove("hidden");
    return;
  }
  if (!payload.documents.length) {
    result.innerHTML = `<strong>Please select at least one document.</strong>`;
    result.classList.remove("hidden");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Creating link...";
  try {
    const { data, error } = await window.sb.from("onboarding_requests").insert(payload).select("id").single();
    if (error) throw error;
    const url = `${window.location.origin}/client.html?id=${data.id}`;
    const whatsapp = `https://wa.me/?text=${encodeURIComponent("Please complete your Betterhomes secure document upload: " + url)}`;
    result.innerHTML = `
      <p class="success">Secure link created</p>
      <input class="linkbox" readonly value="${url}" />
      <div class="actions">
        <button type="button" onclick="navigator.clipboard.writeText('${url}')">Copy Link</button>
        <a href="${whatsapp}" target="_blank">WhatsApp</a>
        <a href="mailto:${esc(payload.owner_email)}?subject=Betterhomes secure document upload&body=${encodeURIComponent(url)}">Email</a>
      </div>
    `;
    result.classList.remove("hidden");
  } catch (err) {
    result.innerHTML = `<strong>Could not create request.</strong><br><small>${esc(err.message || err)}</small>`;
    result.classList.remove("hidden");
    debug.textContent = "Check Supabase SQL tables and RLS policies from supabase-schema.sql.";
    debug.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create client link";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderDocs();
  document.querySelectorAll(".type-card").forEach(btn => btn.addEventListener("click", () => setType(btn.dataset.type)));
  $("createBtn").addEventListener("click", createRequest);
});
