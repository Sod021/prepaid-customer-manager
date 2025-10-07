import {
  getCustomers,
  addCustomer,
  deleteCustomer,
  updateCustomer
} from "./supabase.js";

const searchTab = document.getElementById("tab-search");
const addTab = document.getElementById("tab-add");
const searchSection = document.getElementById("search-section");
const addSection = document.getElementById("add-section");

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const meterInput = document.getElementById("meterInput");
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
    c.meter_id.toLowerCase().includes(searchTerm)
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
  <td class="p-3">${c.name}</td>
  <td class="p-3 flex items-center space-x-2">
    <span>${c.phone}</span>
    <button class="copy-btn" data-value="${c.phone}" title="Copy phone">
      📋
    </button>
  </td>
  <td class="p-3 flex items-center space-x-2">
    <span>${c.meter_id}</span>
    <button class="copy-btn" data-value="${c.meter_id}" title="Copy meter ID">
      📋
    </button>
  </td>
  <td class="p-3">
    <button class="edit-btn underline" data-id="${c.id}">Edit</button>
    <button class="delete-btn underline ml-2" data-id="${c.id}">Delete</button>
  </td>
`;


    customerTableBody.appendChild(row);
  });

  setupActionButtons();
  setupCopyButtons();

}


function setupActionButtons() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      await deleteCustomer(btn.dataset.id);
      renderCustomers();
    };
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = async () => {
      const newName = prompt("Enter new name:");
      const newPhone = prompt("Enter new phone:");
      const newMeter = prompt("Enter new meter ID:");
      await updateCustomer(btn.dataset.id, newName, newPhone, newMeter);
      renderCustomers();
    };
  });
}


function setupCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.onclick = async () => {
      const value = btn.dataset.value;
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = "✅"; // temporary feedback
        setTimeout(() => (btn.textContent = "📋"), 1500);
      } catch (err) {
        alert("Failed to copy text.");
      }
    };
  });
}


addButton.onclick = async () => {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const meter = meterInput.value.trim();
  if (!name || !phone || !meter) return alert("Please fill all fields");

  await addCustomer(name, phone, meter);
  nameInput.value = phoneInput.value = meterInput.value = "";
  alert("Customer added successfully ✅");
  showTab("search");
};

searchInput.addEventListener("input", renderCustomers);
