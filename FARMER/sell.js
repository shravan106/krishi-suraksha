const API = "https://krishi-suraksha.onrender.com/api/crops";

const form = document.getElementById("sellForm");
const container = document.getElementById("listingContainer");

const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
  window.location.href = "../LOGIN_SIGNUP/login_signup.html";
}

const farmerId = user.id;
let editingId = null;

/* ================= MESSAGE ================= */
function showMessage(msg, color = "white") {
  let box = document.getElementById("message");

  if (!box) {
    box = document.createElement("div");
    box.id = "message";
    form.prepend(box);
  }

  box.innerText = msg;
  box.style.color = color;

  setTimeout(() => box.innerText = "", 3000);
}

/* ================= SUBMIT ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const crop = document.getElementById("cropName").value.trim();
  const quantity = document.getElementById("quantity").value.trim();
  const price = document.getElementById("price").value.trim();
  const district = document.getElementById("district").value.trim();

  // VALIDATION
  if (!crop || !quantity || !price || !district) {
    showToast("All fields are required", "error");
    return;
  }

  if (quantity <= 0 || price <= 0) {
    showToast("Invalid quantity or price", "error");
    return;
  }

  try {

    if (editingId) {

      const res = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop, quantity, price, district })
      });

      if (!res.ok) throw new Error();
      showToast("Listing updated!", "success");
      editingId = null;
    } else {

      const district = document.getElementById("district").value;
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_id: farmerId,
          quantity,
          crop,
          price,
          district
      })
      });

      if (!res.ok) throw new Error();
      showToast("Listing added successfully!", "success");
    }

    form.reset();
    loadListings();

  } catch {
    showToast("Server error. Try again.", "error");
  }
});

/* ================= LOAD LISTINGS ================= */
async function loadListings() {

  try {

    const res = await fetch(`${API}/${farmerId}`);
    const listings = await res.json();

    container.innerHTML = "";

    if (!listings.length) {
      container.innerHTML = "<p>No listings yet.</p>";
      return;
    }

    listings.forEach(item => {

      const div = document.createElement("div");
      div.className = "listing-card";

div.innerHTML = `
  <div class="scheme-card">

    <h3>${item.crop}</h3>

    <p><strong>Quantity:</strong> ${item.quantity} kg</p>
    <p><strong>Price:</strong> ₹${item.price}</p>
    <p><strong>District:</strong> ${item.district || "N/A"}</p>

    <span class="status-badge ${item.status}">
      ${item.status.toUpperCase()}
    </span>

    <div class="listing-actions" style="margin-top:10px;">
      <button class="primary-btn"
        onclick="editListing(${item.id}, '${item.crop}', '${item.quantity}', '${item.price}', '${item.district}')">
        Edit
      </button>

      <button class="primary-btn"
        onclick="deleteListing(${item.id})">
        Delete
      </button>
    </div>

  </div>
`;

      container.appendChild(div);
    });

  } catch {
    container.innerHTML = "<p>Error loading listings</p>";
  }
}

/* ================= EDIT ================= */
function editListing(id, crop, quantity, price, district) {

  document.getElementById("cropName").value = crop;
  document.getElementById("quantity").value = quantity;
  document.getElementById("price").value = price;
  document.getElementById("district").value = district;

  editingId = id;

  showToast("Editing mode enabled", "info");
}

/* ================= DELETE ================= */
async function deleteListing(id) {

  showToast("Click delete again to confirm", "info");

  try {

    const res = await fetch(`${API}/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error();
    showToast("Listing deleted", "error");
    loadListings();
  } catch {
    showToast("Delete failed", "error");
  }
}

/* ================= INIT ================= */
loadListings();