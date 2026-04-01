const API = "http://localhost:3000/api/orders";
const buyer_id = sessionStorage.getItem("userId");

/* ================= LOAD ORDERS ================= */
async function loadOrders() {
  const div = document.getElementById("orders");
  div.innerHTML = "";

  try {
    const res = await fetch(`${API}/${buyer_id}`);
    const orders = await res.json();

    if (!orders.length) {
      div.innerHTML = "<p>No orders yet</p>";
      return;
    }

    orders.forEach(o => {
      div.innerHTML += `
        <div class="card">
          <h3>${o.crop}</h3>
          <p>📍 ${o.district}</p>
          <p>₹ ${o.price}</p>
          <p>Qty: ${o.quantity}</p>
          <p>🏠 ${o.address}</p>
          <p>💳 ${o.payment_method}</p>
          <p>🧾 ${o.transaction_id || "Generating..."}</p>

          <p>📦 Order: <span class="status ${o.status}">${o.status}</span></p>
          <p>💳 Payment: <span class="status ${o.payment_status}">${o.payment_status}</span></p>

          ${getTimeline(o.status)}

          ${o.status !== "Cancelled" && o.status !== "Delivered" ? `
            <button onclick="cancelOrder(${o.id})">Cancel</button>
            <button onclick="changeAddress(${o.id})">Change Address</button>
          ` : ""}
        </div>
      `;
    });

  } catch (err) {
    showToast("Error loading orders", "error");
    div.innerHTML = "<p>Error loading orders</p>";
  }
}

/* ================= TIMELINE ================= */
function getTimeline(status) {
  const steps = ["Processing", "Confirmed", "Shipped", "Delivered"];

  if (status === "Cancelled") {
    return `
      <div class="timeline cancelled">
        <div class="step active">
          <div class="circle red"></div>
          <p>Cancelled</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="timeline">
      ${steps.map((step, index) => {
        const active = index <= steps.indexOf(status);

        return `
          <div class="step ${active ? "active" : ""}">
            <div class="circle"></div>
            <p>${step}</p>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/* ================= CANCEL ================= */
async function cancelOrder(id) {
  try {
    console.log("Cancelling order:", id); // DEBUG

    const res = await fetch(`${API}/cancel/${id}`, {
      method: "PUT"
    });

    const data = await res.json();
    console.log("Response:", data); // DEBUG

    if (data.success) {
      showToast("Order cancelled", "info");
      loadOrders();
    } else {
      showToast(data.error || "Cancel failed", "error");
    }

  } catch (err) {
    console.error(err);
    showToast("Failed to cancel order", "error");
  }
}

/* ================= CHANGE ADDRESS ================= */
async function changeAddress(id) {
  const address = prompt("Enter new address:");

  if (!address) {
    showToast("Address cannot be empty", "warning");
    return;
  }

  try {
    await fetch(`${API}/address/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address })
    });

    showToast("Address updated", "success");
    loadOrders();

  } catch {
    showToast("Failed to update address", "error");
  }
}

/* ================= AUTO REFRESH ================= */
loadOrders();

setInterval(() => {
  loadOrders();
}, 4000);

/* ================= NAVIGATION ================= */
function goTo(page) {
  if (page === "dashboard") window.location.href = "buyer_dashboard.html";
  if (page === "crops") window.location.href = "buyer_crops.html";
  if (page === "orders") window.location.href = "buyer_orders.html";
}