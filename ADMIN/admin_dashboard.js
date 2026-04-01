const API = "https://krishi-suraksha.onrender.com/api/admin";

const AdminState = {
  currentSection: "dashboard",
  chart: null
};

/* =========================
   ACCESS CONTROL
========================= */
function checkAdminAccess() {
  if (!sessionStorage.getItem("adminLoggedIn")) {
    window.location.href = "../LOGIN_SIGNUP/login_signup.html?role=admin";
    return false;
  }
  return true;
}

/* =========================
   LOGIN (TEMP)
========================= */
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // TEMP HARD-CODE (replace later)
  if (email === "admin@krishi.com" && password === "admin123") {
    
    sessionStorage.setItem("adminLoggedIn", true);

    window.location.href = "../ADMIN/admin_dashboard.html";

  } else {
    alert("Invalid admin credentials");
  }
}

/* =========================
   NAVIGATION
========================= */
function setupNavigation() {
  const menuItems = document.querySelectorAll(".menu a");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;

      // Active state
      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      // Update title
      document.getElementById("pageTitle").textContent =
        item.textContent;

      navigate(section);
    });
  });
}

function navigate(section) {
  AdminState.currentSection = section;

  const dashboard = document.getElementById("dashboardSection");
  const dynamic = document.getElementById("dynamicContent");

  if (section === "dashboard") {
    dashboard.style.display = "block";
    dynamic.innerHTML = "";
    loadDashboard();
  } else {
    dashboard.style.display = "none";

    switch (section) {
      case "users":
        loadUsers();
        break;
      case "orders":
        loadOrders();
        break;
      case "crops": 
        loadCrops();
        break;
      case "analytics":
        loadAnalytics();
        break;
      default:
        dynamic.innerHTML = `<div class="empty">Module coming soon 🚀</div>`;
    }
  }
}

/* =========================
   DASHBOARD
========================= */
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();

    animateValue("farmersCount", data.farmers);
    animateValue("buyersCount", data.buyers);
    animateValue("ordersCount", data.orders);

    document.getElementById("topCrop").textContent = data.topCrop || "Wheat";
    document.getElementById("topDistrict").textContent = data.topDistrict || "Pune";
    document.getElementById("activeListings").textContent = data.listings || 0;
    document.getElementById("revenue").textContent = "₹" + (data.revenue || 0);

    renderChart(data.chart);
    renderRecentOrders(data.recent);

  } catch (err) {
    console.error(err);
  }
}

/* =========================
   CHART (Chart.js)
========================= */
function renderChart(data) {
  const ctx = document.getElementById("activityChart").getContext("2d");

  // 🔥 Gradient fill (premium look)
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(34,197,94,0.6)");
  gradient.addColorStop(1, "rgba(34,197,94,0)");

  // If no backend data, fallback
const labels = data?.map(d => d.day) || ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const values = data?.map(d => d.orders) || [10,20,15,25,30,40];

  if (AdminState.chart) {
  AdminState.chart.destroy();
  }
  AdminState.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Orders",
        data: values,
        borderColor: "#22c55e",
        borderWidth: 3,
        tension: 0.45,
        fill: true,
        backgroundColor: gradient,

        // ✨ Points styling
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#22c55e",
        pointBorderWidth: 2,
        pointBorderColor: "#fff"
      }]
    },
    options: {
      responsive: true,

      // 🔥 Smooth animation
      animation: {
        duration: 1200,
        easing: "easeOutQuart"
      },

      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#020617",
          titleColor: "#fff",
          bodyColor: "#22c55e",
          borderColor: "#22c55e",
          borderWidth: 1
        }
      },

      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: {
            color: "rgba(255,255,255,0.05)"
          }
        }
      }
    }
  });
}
/* =========================
   RECENT ORDERS
========================= */
function renderRecentOrders(orders) {
  const container = document.getElementById("recentOrders");

  container.innerHTML = orders.map(o => `
    <div class="order-item">
      <strong>${o.crop}</strong> - ${o.quantity}kg
      <span class="status-badge">${o.status}</span>
    </div>
  `).join("");
}

/* =========================
   USERS MODULE
========================= */
async function loadUsers() {
  const container = document.getElementById("dynamicContent");

  container.innerHTML = `<div class="loader">Loading users...</div>`;

  const res = await fetch(`${API}/users`);
  const data = await res.json();

    if (!Array.isArray(data)) {
      container.innerHTML = `<div class="empty">Failed to load users</div>`;
      console.error(data);
      return;
    }

const users = data;

  container.innerHTML = `
    <h2>User Management</h2>

    <input id="userSearch" placeholder="Search users..." 
           style="margin:10px 0; padding:8px; border-radius:8px;" />

    <table class="admin-table">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
        
            <td>
              <span class="role-badge ${u.role}">
                ${u.role}
              </span>
            </td>
        
            <td>
              <span class="status-badge ${u.status}">
                ${u.status}
              </span>
            </td>

            <td>
              <button onclick="toggleUser(${u.id})">
                ${u.status === 'blocked' ? 'Unblock' : 'Block'}
              </button>

              <button onclick="deleteUser(${u.id})">
                ${u.status === 'deleted' ? 'Restore' : 'Delete'}
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // ADD SEARCH HERE
  document.getElementById("userSearch").addEventListener("input", e => {
    const val = e.target.value.toLowerCase();

    document.querySelectorAll(".admin-table tbody tr").forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(val)
        ? ""
        : "none";
    });
  });
}

async function deleteUser(id) {
  await fetch(`${API}/user/${id}`, { method: "DELETE" });
  loadUsers();
}

async function toggleUser(id) {
  await fetch(`${API}/user/block/${id}`, { method: "PUT" });
  loadUsers();
}

// ================= ANALYTICS STATE =================
let selectedRange = "7d";

/* =========================
   ANALYTICS MODULE
========================= */
async function loadAnalytics() {
  const container = document.getElementById("dynamicContent");

  container.innerHTML = `<div class="loader">Loading analytics...</div>`;

  const res = await fetch(`https://krishi-suraksha.onrender.com/api/admin/analytics?range=${selectedRange}`);
  const data = await res.json();

  if (!data.farmers) {
    container.innerHTML = `<div class="empty">Failed to load analytics</div>`;
    return;
  }

  container.innerHTML = `
    <h2>Analytics Dashboard</h2>

    <div class="filter-bar">
      <select id="rangeFilter">
        <option value="7d" ${selectedRange === "7d" ? "selected" : ""}>Last 7 Days</option>
        <option value="30d" ${selectedRange === "30d" ? "selected" : ""}>Last 30 Days</option>
        <option value="month" ${selectedRange === "month" ? "selected" : ""}>This Month</option>
      </select>
    </div>

    <div style="display:flex; gap:20px; flex-wrap:wrap;">

      <div style="flex:1;">
        <h3>Top Farmers</h3>
        <ul>
          ${data.farmers.map(f => `
            <li>🥇 ${f.name} - ${f.total_sold} kg</li>
          `).join("")}
        </ul>

        <h3 style="margin-top:20px;">Top Buyers</h3>
        <ul>
          ${data.buyers.map(b => `
            <li>🛒 ${b.name} - ${b.total_bought} kg</li>
          `).join("")}
        </ul>
      </div>

      <div style="flex:2;">
        <h3>Revenue Trend</h3>
        <canvas id="revenueChart"></canvas>
      </div>

    </div>
  `;

  renderRevenueChart(data.revenue);

  // 🔥 HANDLE RANGE CHANGE
  document.getElementById("rangeFilter").onchange = (e) => {
    selectedRange = e.target.value;
    loadAnalytics();
  };
}

/* =========================
   REVENUE CHART
========================= */
function renderRevenueChart(data) {
  const canvas = document.getElementById("revenueChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // destroy old chart
  if (AdminState.revenueChart) {
    AdminState.revenueChart.destroy();
  }

  const labels = data.length
    ? data.map(d =>
        new Date(d.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short"
        })
      )
    : ["No Data"];

  const values = data.length
    ? data.map(d => d.total)
    : [0];

  // gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(34,197,94,0.6)");
  gradient.addColorStop(1, "rgba(34,197,94,0)");

  AdminState.revenueChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue ₹",
        data: values,
        borderColor: "#22c55e",
        backgroundColor: gradient,
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
/* =========================
   CROPS MODULE (load)
========================= */
async function loadCrops() {
  const container = document.getElementById("dynamicContent");

  container.innerHTML = `<div class="loader">Loading crops...</div>`;

  const res = await fetch("https://krishi-suraksha.onrender.com/api/admin/crops");
  const crops = await res.json();

  container.innerHTML = `
    <h2>Crop Listings Management</h2>

    <table class="admin-table">
      <thead>
        <tr>
          <th>Farmer</th>
          <th>Crop</th>
          <th>Qty</th>
          <th>Price</th>
          <th>District</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        ${crops.map(c => `
          <tr>
            <td>${c.farmer_name}</td>
            <td>${c.crop}</td>
            <td>${c.quantity}kg</td>
            <td>₹${c.price}</td>
            <td>${c.district}</td>
            <td>${c.status}</td>
            <td>
              ${c.status !== 'sold' ? `
              <button onclick="approveCrop(${c.id})">Approve</button>
              <button onclick="rejectCrop(${c.id})">Reject</button>
              ` : ''}
              <button onclick="deleteCrop(${c.id})">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* =========================
   CROPS MODULE (actions)
========================= */
async function approveCrop(id) {
  await fetch(`https://krishi-suraksha.onrender.com/api/admin/crops/approve/${id}`, { method: "PUT"
  });
  loadCrops();
}

async function rejectCrop(id) {
  await fetch(`https://krishi-suraksha.onrender.com/api/admin/crops/reject/${id}`, { method: "PUT" });
  loadCrops();
}

async function deleteCrop(id) {
  await fetch(`https://krishi-suraksha.onrender.com/api/admin/crops/${id}`, { method: "DELETE" });
  loadCrops();
}

/* =========================
   ORDERS MODULE
========================= */
async function loadOrders() {
  const container = document.getElementById("dynamicContent");

  container.innerHTML = `<div class="loader">Loading orders...</div>`;

  const res = await fetch(`${API}/orders`);
  const orders = await res.json();
  if (!Array.isArray(orders)) {
    container.innerHTML = `<div class="empty">Failed to load orders</div>`;
     console.error(orders);
     return;
  }

container.innerHTML = `
  <h2>Order Management</h2>

  <div class="order-grid">
    ${orders.map(o => `
      <div class="order-card">

        <h4>${o.crop}</h4>

        <p><b>Buyer:</b> ${o.buyer_name || "N/A"}</p>
        <p><b>Qty:</b> ${o.quantity}kg</p>
        <p><b>Price:</b> ₹${o.price}</p>

        <span class="status-badge ${o.status}">
          ${o.status}
        </span>

        <div style="margin-top:10px;">
          ${o.status !== "Delivered" && o.status !== "Cancelled" ? `
            <button onclick="updateOrderStatus(${o.id}, 'Confirmed')">Confirm</button>
            <button onclick="updateOrderStatus(${o.id}, 'Shipped')">Ship</button>
            <button onclick="updateOrderStatus(${o.id}, 'Delivered')">Deliver</button>
          ` : ''}

          ${o.status !== "Cancelled" ? `
            <button onclick="cancelOrder(${o.id})">Cancel</button>
          ` : ''}
        </div>

      </div>
    `).join("")}
  </div>
`;
          }
/* =========================
   ORDER UPDATE (STATUS CHANGE)
========================= */
async function updateOrderStatus(id, status) {
  await fetch(`${API}/order/status/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  loadOrders();
}

async function cancelOrder(id) {
  const res = await fetch(`https://krishi-suraksha.onrender.com/api/orders/cancel/${id}`, {
    method: "PUT"
  });

  const data = await res.json();

  if (!data.success) {
    alert(data.error);
  }

  loadOrders();
}

/* =========================
   SEARCH
========================= */
function setupSearch() {
  const input = document.getElementById("globalSearch");

  input.addEventListener("input", () => {
    const term = input.value.toLowerCase();

    document.querySelectorAll(".order-card, tr").forEach(el => {
      el.style.display = el.innerText.toLowerCase().includes(term)
        ? ""
        : "none";
    });
  });
}

/* =========================
   LOGOUT
========================= */
function setupLogout() {
  document.getElementById("logoutBtn").onclick = () => {
    sessionStorage.removeItem("adminLoggedIn");
    window.location.href = "../PRELOADER/preloader.html";
  };
}
/* =========================
   CROPS MODULE
========================= */
let allCrops = [];
function animateValue(id, value) {
  let start = 0;
  const duration = 800;
  const step = value / (duration / 16);

  const el = document.getElementById(id);

  const counter = setInterval(() => {
    start += step;
    if (start >= value) {
      el.textContent = value;
      clearInterval(counter);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}
/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAccess()) return;

  setupNavigation();
  setupSearch();
  setupLogout();
  loadDashboard();
});