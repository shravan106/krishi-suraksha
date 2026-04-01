const user = sessionStorage.getItem("loggedInUser");

if (!user) {
  window.location.href = "../LOGIN_SIGNUP/login_signup.html";
}

document.getElementById("userName").innerText = "👤 " + user;

document.getElementById("logoutBtn").onclick = () => {
  sessionStorage.clear();
  window.location.href = "../PRELOADER/preloader.html";
};

function goTo(page) {
  if (page === "dashboard") window.location.href = "buyer_dashboard.html";
  if (page === "crops") window.location.href = "buyer_crops.html";
  if (page === "orders") window.location.href = "buyer_orders.html";
}

const API = "http://localhost:3000/api/all-crops";

/* ================= STATS ================= */
async function loadStats() {
  try {
    // 🔹 FETCH CROPS
    const res = await fetch(API);
    const crops = await res.json();

    document.getElementById("cropCount").innerText = crops.length;

    // 🔹 FETCH ORDERS FROM BACKEND
    const buyer_id = sessionStorage.getItem("userId");

    const orderRes = await fetch(`http://localhost:3000/api/orders/${buyer_id}`);
    const orders = await orderRes.json();

    document.getElementById("orderCount").innerText = orders.length;

    // 🔹 DISTRICT COUNT
    const districts = new Set(crops.map(c => c.district));
    document.getElementById("districtCount").innerText = districts.size;

  } catch {
    document.getElementById("cropCount").innerText = 0;
    document.getElementById("orderCount").innerText = 0;
  }
}

/* ================= RECENT CROPS ================= */
async function loadRecentCrops() {
  const container = document.getElementById("recentCrops");
  container.innerHTML = `
  <div class="card skeleton"></div>
  <div class="card skeleton"></div>
  `;
  container.innerHTML = ""; 
  try {
    const res = await fetch(API);
    const crops = await res.json();

    if (!crops.length) {
      container.innerHTML = "<p>No crops available</p>";
      return;
    }

    const latest = crops.slice(-4).reverse();

    latest.forEach(c => {
      container.innerHTML += `
        <div class="card">
          <h3>${c.crop}</h3>
          <p>📍 ${c.district || "N/A"}</p>
          <p>₹ ${c.price}</p>
        </div>
      `;
    });

  } catch {
      container.innerHTML = "<p>Error loading crops</p>";
      showToast("Failed to load crops", "error");
    }
}

/* ================= RECENT ORDERS ================= */
async function loadRecentOrders() {
  const container = document.getElementById("recentOrders");
  const buyer_id = sessionStorage.getItem("userId");
  container.innerHTML = `
  <div class="card skeleton"></div>
  <div class="card skeleton"></div>
  `;
  container.innerHTML = ""; 
  try {
    const res = await fetch(`http://localhost:3000/api/orders/${buyer_id}`);
    const orders = await res.json();

    if (!orders.length) {
      container.innerHTML = "<p>No orders yet</p>";
      return;
    }

    const latest = orders.slice(0, 4);

    latest.forEach(o => {
      container.innerHTML += `
        <div class="card">
          <h3>${o.crop}</h3>
          <p>Status: ${o.status}</p>
        </div>
      `;
    });

  } catch {
    container.innerHTML = "<p>Error loading orders</p>";
    showToast("Failed to load orders", "error");
  }
}

/* ================= INIT ================= */
setInterval(() => {
  loadStats();
  loadRecentCrops();
  loadRecentOrders();
}, 5000);

/* ================= CHARTS ================= */
async function loadChart() {
  const res = await fetch(API);
  const crops = await res.json();

  const labels = crops.map(c => c.crop);
  const prices = crops.map(c => c.price);

  const ctx = document.getElementById("priceChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Crop Prices",
        data: prices
      }]
    }
  });
}

/* ================= ANALYTICS ================= */
async function loadUserStats() {
  const buyer_id = sessionStorage.getItem("userId");

  const res = await fetch(`http://localhost:3000/api/orders/${buyer_id}`);
  const orders = await res.json();

  let total = 0;
  let cropCount = {};

  orders.forEach(o => {
    total += o.price * o.quantity;

    cropCount[o.crop] = (cropCount[o.crop] || 0) + 1;
  });

  // Total Spending
  document.getElementById("totalSpent").innerText = "₹" + total;

  // Most bought crop
  let top = Object.keys(cropCount).reduce((a, b) =>
    cropCount[a] > cropCount[b] ? a : b, "-"
  );

  document.getElementById("topCrop").innerText = top;
}
loadChart();
loadUserStats();

/* ================= LOAD INSIGHTS ================= */
async function loadInsights() {
  const res = await fetch(API);
  const crops = await res.json();

  if (!crops.length) return;

  // 💰 Best Price (lowest)
  const best = crops.reduce((a, b) =>
    a.price < b.price ? a : b
  );

  document.getElementById("bestPrice").innerText = best.crop;

  // 📈 Trending (highest quantity)
  const trending = crops.reduce((a, b) =>
    a.quantity > b.quantity ? a : b
  );

  document.getElementById("trending").innerText = trending.crop;
}
/* ================= LOAD DEMAND ================= */
async function loadDemand() {
  const buyer_id = sessionStorage.getItem("userId");

  const res = await fetch(`http://localhost:3000/api/orders/${buyer_id}`);
  const orders = await res.json();

  if (!orders.length) return;

  let demand = {};

  orders.forEach(o => {
    demand[o.crop] = (demand[o.crop] || 0) + 1;
  });

  let high = Object.keys(demand).reduce((a, b) =>
    demand[a] > demand[b] ? a : b
  );

  document.getElementById("highDemand").innerText = high;
}
/*================== LOAD RECOMMENDATIONS ================= */
async function loadRecommendations() {
  const container = document.getElementById("recommendations");
  container.innerHTML = "";

  const res1 = await fetch(API);
  const crops = await res1.json();

  const buyer_id = sessionStorage.getItem("userId");
  const res2 = await fetch(`http://localhost:3000/api/orders/${buyer_id}`);
  const orders = await res2.json();

  if (!orders.length) {
    container.innerHTML = "<p>No recommendations yet</p>";
    return;
  }

  const lastCrop = orders[0].crop;

  const recommended = crops.filter(c =>
    c.crop === lastCrop
  );

  if (!recommended.length) {
    container.innerHTML = "<p>No recommendations available</p>";
    return;
  }

  recommended.slice(0, 3).forEach(c => {
    container.innerHTML += `
      <div class="card">
        <h3>${c.crop}</h3>
        <p>₹ ${c.price}</p>
        <p>📍 ${c.district}</p>
      </div>
    `;
  });
}

/* ================= CALLING FUNCTIONS ================= */
loadInsights();
loadDemand();
loadRecommendations();