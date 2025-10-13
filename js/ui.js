import { getCurrentUser } from "./supabase.js";

const user = await getCurrentUser();
if (!user) {
  window.location.href = "login.html";
}

import {
  getCustomers,
  addCustomer,
  deleteCustomer,
  updateCustomer
} from "./supabase.js";

// const { data: { user } } = await supabase.auth.getUser();
// if (!user) window.location.href = 'login.html';


const searchTab = document.getElementById("tab-search");
const addTab = document.getElementById("tab-add");
const searchSection = document.getElementById("search-section");
const addSection = document.getElementById("add-section");

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const meterInput = document.getElementById("meterInput");
const meterNameInput = document.getElementById("meterNameInput");
const addButton = document.getElementById("addButton");
const searchInput = document.getElementById("searchInput");
const customerTableBody = document.getElementById("customerTableBody");
const resultsContainer = document.getElementById("resultsContainer");

// Add fade classes to sections
searchSection.classList.add("fade");
addSection.classList.add("fade");

// --- TAB SWITCHING WITH FADE ---
function showTab(tab) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active-tab"));

  // Hide both sections
  searchSection.classList.remove("show");
  addSection.classList.remove("show");
  searchSection.classList.add("hidden");
  addSection.classList.add("hidden");

  // Wait a moment for fade-out to finish, then show the new one
  setTimeout(() => {
    if (tab === "search") {
      searchSection.classList.remove("hidden");
      searchSection.classList.add("show");
      searchTab.classList.add("active-tab");
      renderCustomers();
    } else {
      addSection.classList.remove("hidden");
      addSection.classList.add("show");
      addTab.classList.add("active-tab");
    }
  }, 100);
}

searchTab.addEventListener("click", () => showTab("search"));
addTab.addEventListener("click", () => showTab("add"));
showTab("search"); // default view

// --- SHOW / HIDE MODAL ANIMATIONS ---
function showModal() {
  const modal = document.getElementById("editModal");
  modal.classList.remove("hidden", "hide");
  modal.classList.add("show");
}

function hideModal() {
  const modal = document.getElementById("editModal");
  modal.classList.remove("show");
  modal.classList.add("hide");
  setTimeout(() => modal.classList.add("hidden"), 400); // wait for fade out
}

// --- SUCCESS POPUP ---
function showSuccess(message) {
  const popup = document.getElementById("successPopup");
  const msgText = document.getElementById("successMessage");
  msgText.textContent = message;

  popup.classList.remove("hidden");
  popup.classList.add("flex");
  setTimeout(() => popup.classList.add("opacity-100"), 10); // fade in

  // Hide automatically after 1.5s
  setTimeout(() => hideSuccess(), 1500);
}

function hideSuccess() {
  const popup = document.getElementById("successPopup");
  popup.classList.remove("opacity-100");
  setTimeout(() => popup.classList.add("hidden"), 500); // wait for fade out
}

// --- CUSTOMER RENDERING ---
async function renderCustomers() {
  const customers = await getCustomers();
  const searchTerm = searchInput.value.trim().toLowerCase();
  customerTableBody.innerHTML = "";

  // Hide results if search is empty
  if (!searchTerm) {
    resultsContainer.classList.add("hidden");
    return;
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm) ||
    c.phone.toLowerCase().includes(searchTerm) ||
    c.meter_id.toLowerCase().includes(searchTerm) ||
    (c.meter_name && c.meter_name.toLowerCase().includes(searchTerm))
  );

  if (filtered.length === 0) {
    resultsContainer.classList.add("hidden");
    return;
  }

  resultsContainer.classList.remove("hidden");

  filtered.forEach(c => {
    const row = document.createElement("tr");
    row.classList.add("border-b", "border-white");

    row.innerHTML = `
      <td class="p-3 align-middle">${c.name}</td>

      <td class="p-3 align-middle">
        <span class="inline-flex items-center gap-2">
          ${c.phone}
          <button class="copy-btn" data-value="${c.phone}" title="Copy phone">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </span>
      </td>

      

      <td class="p-3 align-middle">
        <span class="inline-flex items-center gap-2">
          ${c.meter_id}
          <button class="copy-btn" data-value="${c.meter_id}" title="Copy meter ID">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </span>
      </td>


      <td class="p-3 align-middle max-w-[100px] relative group">
        <span class="block truncate cursor-pointer">${c.meter_name || '-'}</span>
        <span class="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-orange-800 text-white text-sm px-5 py-1 rounded shadow-lg whitespace-nowrap z-10">
          ${c.meter_name || '-'}
        </span>
      </td>



      <td class="p-3 align-middle">
        <button class="edit-btn underline" data-id="${c.id}">Edit</button>
        <button class="delete-btn underline ml-2" data-id="${c.id}">Delete</button>
      </td>
    `;

    customerTableBody.appendChild(row);
  });

  setupActionButtons();
  setupCopyButtons();
}

// --- BUTTON ACTIONS ---
function setupActionButtons() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      await deleteCustomer(btn.dataset.id);
      renderCustomers();
    };
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const customers = await getCustomers();
      const customer = customers.find(c => c.id === id);

      const nameInput = document.getElementById("editName");
      const phoneInput = document.getElementById("editPhone");
      const meterInput = document.getElementById("editMeter");
      const meterNameInput = document.getElementById("editMeterName");
      const saveBtn = document.getElementById("saveEditBtn");
      const cancelBtn = document.getElementById("cancelEditBtn");

      // Pre-fill inputs
      nameInput.value = customer.name;
      phoneInput.value = customer.phone;
      meterInput.value = customer.meter_id;
      meterNameInput.value = customer.meter_name || "";

      showModal(); // 🌟 smooth fade-in modal

      cancelBtn.onclick = () => hideModal(); // 🌟 smooth fade-out

      saveBtn.onclick = async () => {
        const newName = nameInput.value.trim();
        const newPhone = phoneInput.value.trim();
        const newMeter = meterInput.value.trim();
        const newMeterName = meterNameInput.value.trim();

        if (!newName || !newPhone || !newMeter) {
          alert("Please fill all required fields");
          return;
        }

        await updateCustomer(id, newName, newPhone, newMeter, newMeterName);
        hideModal();
        renderCustomers();
      };
    };
  });
}

// --- COPY BUTTONS ---
function setupCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.onclick = async () => {
      const value = btn.dataset.value;
      try {
        await navigator.clipboard.writeText(value);

        // Replace the SVG temporarily with a check icon
        const original = btn.innerHTML;
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        `;
        setTimeout(() => (btn.innerHTML = original), 1500);
      } catch (err) {
        alert("Failed to copy text.");
      }
    };
  });
}

// --- ADD CUSTOMER ---
addButton.onclick = async () => {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const meter = meterInput.value.trim();
  const meterName = meterNameInput.value.trim();

  if (!name || !phone || !meter) return alert("Please fill all required fields");

  await addCustomer(name, phone, meter, meterName || null);
  nameInput.value = phoneInput.value = meterInput.value = meterNameInput.value = "";
  showSuccess("Customer added successfully ✅");
  showTab("add");
};

searchInput.addEventListener("input", renderCustomers);
