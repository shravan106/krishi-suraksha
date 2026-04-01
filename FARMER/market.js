/* ================= DISTRICTS ================= */
const districts = [
"Mumbai","Mumbai Suburban","Thane","Palghar","Raigad","Ratnagiri","Sindhudurg",
"Pune","Satara","Sangli","Kolhapur","Solapur",
"Nashik","Ahmednagar","Dhule","Nandurbar","Jalgaon",
"Aurangabad","Jalna","Beed","Osmanabad","Latur","Nanded","Parbhani","Hingoli",
"Nagpur","Wardha","Bhandara","Gondia","Chandrapur","Gadchiroli",
"Amravati","Akola","Washim","Yavatmal","Buldhana"
];

/* ================= CROPS (FULL LIST) ================= */
const crops = [
"Wheat","Rice","Maize","Jowar","Bajra",
"Gram","Tur","Moong","Urad","Masur",
"Groundnut","Soybean","Sunflower","Sesamum",
"Onion","Tomato","Potato","Brinjal","Chillies","Garlic","Ginger",
"Cabbage","Cauliflower",
"Mango","Banana","Grapes","Pomegranate","Orange","Apple",
"Cotton","Sugarcane","Tobacco"
];

/* ================= LOAD DROPDOWNS ================= */
window.onload = () => {

  const d = document.getElementById("district");
  const c = document.getElementById("crop");

  // DISTRICTS
  d.innerHTML = `<option>Select District</option>`;
  districts.sort().forEach(x => {
    d.innerHTML += `<option>${x}</option>`;
  });

  // CROPS (keep your existing list)
  c.innerHTML = `<option>Select Crop</option>`;
  crops.sort().forEach(x => {
    c.innerHTML += `<option>${x}</option>`;
  });
};

/* ================= FETCH DATA ================= */
async function getMarketData() {

  const district = document.getElementById("district").value;
  const crop = document.getElementById("crop").value;

  if (!district || district === "Select District" || crop === "Select Crop") {
    showToast("Select district and crop", "error");
    return;
  }

  const result = document.getElementById("result");
  result.innerHTML = "Loading live market data...";

  try {

const res = await fetch(
  `https://krishi-suraksha.onrender.com/api/market?district=${district}&crop=${crop}`
);

    const data = await res.json();

    if (!data.records || data.records.length === 0) {
      result.innerHTML = "No data available for this crop in selected district";
      showToast("No data available for this crop", "info");
      return;
    }

    processMarketData(data.records);

  } catch (e) {
    console.error(e);
    showToast("Failed to fetch market data", "error");
  }
}

/* ================= SMART ANALYSIS ================= */
function processMarketData(records) {

  // SORT BY PRICE (HIGH → LOW)
  records.sort((a, b) => parseInt(b.modal_price) - parseInt(a.modal_price));

  const topMandis = records.slice(0, 5);

  const prices = topMandis.map(r => parseInt(r.modal_price));

  const avg = prices.reduce((a,b)=>a+b,0)/prices.length;
  const current = prices[0];

  // 🔥 PRICE PREDICTION (SIMPLE AI LOGIC)
  let trend = prices[0] - prices[prices.length-1];

  let prediction = "";
  if (trend > 0) {
    prediction = "📈 Prices likely to increase";
  } else {
    prediction = "📉 Prices may drop";
  }

  // 🔥 BEST DISTRICT (from records)
  let best = topMandis[0];

  // 🔥 CARDS UI
  let cards = topMandis.map((m, i) => `
    <div class="mandi-card">
      <h3>#${i+1} ${m.market}</h3>
      <p>📍 ${m.district}</p>
      <p>💰 ₹${m.modal_price}</p>
    </div>
  `).join("");

  // 🔥 FINAL OUTPUT
  document.getElementById("result").innerHTML = `
    <h2>🏆 Best Market: ${best.market}</h2>
    <p>💰 Highest Price: ₹${best.modal_price}</p>

    <hr>

    <p>📊 Average Price: ₹${avg.toFixed(2)}</p>
    <p>📌 Current Price: ₹${current}</p>

    <hr>

    <h3>${prediction}</h3>

    <hr>

    <h3>📍 Top 5 Mandis</h3>
    <div class="mandi-container">
      ${cards}
    </div>
  `;
showToast("Market data loaded successfully", "success");
  drawChart(records);
}
/* ================= CHART ================= */
function drawChart(records) {

  const ctx = document.getElementById('priceChart').getContext('2d');

  if (window.chart) window.chart.destroy();

  const top = records.slice(0,5);

const labels = top.map(r => {
  if (!r.market) return "Unknown";

  const parts = r.market.split("(");

  if (parts.length > 1) {
    return parts[1].replace(")", "");
  }

  return r.market; // fallback if no brackets
});
  const prices = top.map(r => parseInt(r.modal_price));

  window.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Top Mandis Price (₹)',
        data: prices,
        backgroundColor: prices.map((p, i) =>
          i === 0 ? "#00e676" : "#4fc3f7"
        ),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Top 5 Mandis Price Comparison"
        },
        legend: {
          display: true
        },
        scales: {
  x: {
    ticks: {
      color: "white"
    }
  },
  y: {
    ticks: {
      color: "white"
    }
  }
}
      }
    }
  });
}