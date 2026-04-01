const API = "http://localhost:3000/api";

let allCrops = [];
let selectedCropId = null;

/* ================= FETCH ================= */
async function fetchCrops() {
  try {
    const res = await fetch(`${API}/all-crops`);
    allCrops = await res.json();

    populateDistricts(allCrops);
    render();
  } catch {
    document.getElementById("list").innerHTML = "Error loading data";
  }
}

/* ================= DISTRICTS ================= */
function populateDistricts(crops) {
  const filter = document.getElementById("filter");

  filter.innerHTML = `<option value="all">All Districts</option>`;

  const districts = [...new Set(crops.map(c => c.district).filter(Boolean))];

  districts.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    filter.appendChild(opt);
  });
}

/* ================= RENDER ================= */
function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  let data = [...allCrops];

  const search = document.getElementById("search").value.toLowerCase();
  const district = document.getElementById("filter").value;
  const sort = document.getElementById("sort").value;

  // SEARCH
  if (search) {
    data = data.filter(c =>
      c.crop.toLowerCase().includes(search)
    );
  }

  // FILTER
  if (district !== "all") {
    data = data.filter(c => c.district === district);
  }

  // SORT
  if (sort === "low") {
    data.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    data.sort((a, b) => b.price - a.price);
  }

  if (!data.length) {
    list.innerHTML = `
      <div class="card">
        <p>No crops match your filters</p>
      </div>
    `;
    return;
  }

  data.forEach(c => {
    list.innerHTML += `
      <div class="card">
        <h3>${c.crop}</h3>
        <p>📍 ${c.district}</p>
        <p>₹ ${c.price}</p>
        <p style="color:${c.quantity < 5 ? 'orange' : 'white'}">
          📦 ${c.quantity} kg
        </p>
        ${
          c.quantity > 0
          ? `<button onclick="buy(${c.id})">Buy</button>`
          : `<button disabled style="background:red;">Sold Out</button>`
      }
      </div>
    `;
  });
}

/* ================= BUY (OPEN MODAL) ================= */
function buy(id) {
  selectedCropId = id;

  document.getElementById("paymentModal").classList.remove("hidden");

  // reset fields
  document.getElementById("quantityInput").value = "";
  document.getElementById("addressInput").value = "";
  document.getElementById("payMethod").value = "";

  const btn = document.getElementById("payBtn");
  btn.innerText = "Pay Now";
  btn.disabled = false;
}

/* ================= PAYMENT ================= */
async function processPayment() {
  const quantity = Number(document.getElementById("quantityInput").value);
  const address = document.getElementById("addressInput").value;
  const method = document.getElementById("payMethod").value;

  const crop = allCrops.find(c => c.id === selectedCropId);

  // ❌ STOCK CHECK
  if (quantity > crop.quantity) {
    showToast("Not enough stock available", "error");
    return;
  }

  // ❌ METHOD CHECK
  if (!method) {
    showToast("Select payment method", "warning");
    return;
  }

  // ❌ BASIC VALIDATION
  if (!quantity || !address) {
    showToast("Please fill all fields", "warning");
    return;
  }

  // 🔵 UPI VALIDATION
  if (method === "UPI") {
    const upi = document.getElementById("upiId")?.value;
    if (!upi) {
      showToast("Enter UPI ID", "warning");
      return;
    }
  }

  // 💳 CARD VALIDATION
  if (method === "CARD") {
    const card = document.getElementById("cardNumber")?.value;
    const expiry = document.getElementById("expiry")?.value;
    const cvv = document.getElementById("cvv")?.value;

    if (!card || !expiry || !cvv) {
      showToast("Enter complete card details", "warning");
      return;
    }
  }

  const btn = document.getElementById("payBtn");

  // 🔥 ANIMATION
  btn.innerText = "Processing...";
  btn.disabled = true;

  await new Promise(r => setTimeout(r, 1500));

  const buyer_id = sessionStorage.getItem("userId");
  const transaction_id = "TXN" + Date.now();

  try {
    // ✅ FIX: store response
    const res = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        buyer_id,
        crop_id: selectedCropId,
        quantity,
        address,
        payment_method: method,
        payment_status: method === "COD" ? "Pending" : "Paid",
        transaction_id
      })
    });

    const data = await res.json();

    if (data.success) {

      // 🔥 UPDATE LOCAL DATA (NO RELOAD)
      crop.quantity -= quantity;
      if (crop.quantity < 0) crop.quantity = 0;

      render(); // ✅ instant UI update

      // 🎉 SUCCESS UI
      document.getElementById("successScreen").classList.remove("hidden");

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast("Payment successful", "success");

      setTimeout(() => {
        closeModal();
      }, 2000);

    } else {
      showToast(data.error || "Order failed", "error");
    }

  } catch (err) {
    console.error(err);
    showToast("Payment failed. Try again", "error");

    btn.innerText = "Pay Now";
    btn.disabled = false;
  }
}
/* ================= CLOSE MODAL ================= */
function closeModal() {
  document.getElementById("paymentModal").classList.add("hidden");

  // reset success screen
  document.getElementById("successScreen").classList.add("hidden");

  // reset button
  const btn = document.getElementById("payBtn");
  btn.innerText = "Pay Now";
  btn.disabled = false;
}

/* ================= NAV ================= */
function goTo(page) {
  if (page === "dashboard") window.location.href = "buyer_dashboard.html";
  if (page === "crops") window.location.href = "buyer_crops.html";
  if (page === "orders") window.location.href = "buyer_orders.html";
}

/* ================= EVENTS ================= */
document.getElementById("search").addEventListener("input", render);
document.getElementById("filter").addEventListener("change", render);
document.getElementById("sort").addEventListener("change", render);

/* ================= LOAD CROPS ================= */
async function loadCrops() {
  const res = await fetch(`${API}/all-crops`);
  const crops = await res.json();

  const div = document.getElementById("List");
  div.innerHTML = crops.map(c => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px;">
      <h3>${c.crop}</h3>
      <p>Quantity: ${c.quantity} kg</p>
      <p>Price: ₹${c.price}</p>

      <input 
        type="number" 
        min="1" 
        max="${c.quantity}" 
        value="1" 
        id="qty-${c.id}"
      />

      <button onclick="buyCrop(${c.id})">Buy</button>
    </div>
  `).join("");
}

/* ================= PAYMENT UI SWITCH ================= */
const payMethod = document.getElementById("payMethod");
const paymentDetails = document.getElementById("paymentDetails");

payMethod.addEventListener("change", updatePaymentUI);

function updatePaymentUI() {
  const method = payMethod.value;

  // 🔵 UPI
  if (method === "UPI") {
    paymentDetails.innerHTML = `
      <input type="text" id="upiId" placeholder="Enter UPI ID (e.g. name@upi)">
      <p style="text-align:center;">Scan QR</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi-demo" style="margin:auto;">
    `;
  }

  // 💳 CARD
  else if (method === "CARD") {
    paymentDetails.innerHTML = `
      <input type="text" id="cardNumber" placeholder="Card Number">
      <input type="text" id="expiry" placeholder="MM/YY">
      <input type="password" id="cvv" placeholder="CVV">
    `;
  }

  // 🟢 COD
  else {
    paymentDetails.innerHTML = "";
  }
}
updatePaymentUI();
/* ================= INIT ================= */
fetchCrops();