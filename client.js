let request = null;
let selectedFiles = {};
function $(id){return document.getElementById(id)}
function esc(s){return String(s||"").replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function safeName(s){return String(s||"document").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

async function loadRequest(){
  const id = new URLSearchParams(location.search).get("id");
  if(!id){ $("loading").textContent = "Missing request ID."; return; }
  const {data,error}=await window.sb.from("onboarding_requests").select("*").eq("id",id).single();
  if(error || !data){ $("loading").textContent = "Request not found."; return; }
  request=data;
  $("loading").classList.add("hidden");
  $("content").classList.remove("hidden");
  $("requestType").textContent = data.request_type === "lsa" ? "Leasing Listing — LSA" : "Sales Listing — Form A";
  $("propertyTitle").textContent = data.property_address || "Property onboarding";
  $("ownerLine").textContent = data.owner_name ? `Prepared for ${data.owner_name}` : "Secure document request";
  renderUploads(Array.isArray(data.documents) ? data.documents : []);
}

function renderUploads(docs){
  $("uploadList").innerHTML = docs.map((doc,i)=>`
    <label class="upload-card" for="file-${i}">
      <div><span class="doc-icon">📄</span><strong>${esc(doc)}</strong><small id="name-${i}">Tap to upload</small></div>
      <input id="file-${i}" type="file" data-doc="${esc(doc)}" hidden />
    </label>`).join("");
  document.querySelectorAll("input[type=file]").forEach(input=>{
    input.addEventListener("change",()=>{
      const idx=input.id.split("-")[1];
      selectedFiles[input.dataset.doc]=input.files[0];
      $("name-"+idx).textContent = input.files[0]?.name || "Tap to upload";
      input.closest(".upload-card").classList.toggle("done", !!input.files[0]);
    });
  });
}

async function submitDocs(){
  const status=$("status"); status.classList.add("hidden");
  if(!$("consent").checked){ status.innerHTML="Please tick the consent box."; status.classList.remove("hidden"); return; }
  const files=Object.entries(selectedFiles).filter(([,f])=>f);
  if(!files.length){ status.innerHTML="Please upload at least one document."; status.classList.remove("hidden"); return; }
  const btn=$("submitBtn"); btn.disabled=true; btn.textContent="Uploading...";
  try{
    for(const [doc,file] of files){
      const path=`${request.id}/${safeName(doc)}-${Date.now()}-${safeName(file.name)}`;
      const {error:upErr}=await window.sb.storage.from("onboarding-documents").upload(path,file,{upsert:false});
      if(upErr) throw upErr;
      const {error:dbErr}=await window.sb.from("uploaded_documents").insert({request_id:request.id,document_name:doc,file_path:path});
      if(dbErr) throw dbErr;
    }
    await window.sb.from("onboarding_requests").update({status:"completed"}).eq("id",request.id);
    status.innerHTML="<strong>Thank you. Your documents have been received securely.</strong>";
    status.classList.remove("hidden");
  }catch(err){
    status.innerHTML=`<strong>Upload failed.</strong><br><small>${esc(err.message || err)}</small>`;
    status.classList.remove("hidden");
  }finally{ btn.disabled=false; btn.textContent="Submit documents securely"; }
}

document.addEventListener("DOMContentLoaded",()=>{
  loadRequest();
  $("submitBtn").addEventListener("click",submitDocs);
});
