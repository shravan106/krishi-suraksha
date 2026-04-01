// 🔥 AUTO LOAD FROM ADVISORY (CORRECT PLACE)
document.addEventListener("DOMContentLoaded", () => {
  const savedCrop = localStorage.getItem("selectedCrop");

  if (savedCrop) {
    document.getElementById("cropSelect").value = savedCrop;

    setTimeout(() => {
      loadCropDetails();
    }, 300);
  }
});

function loadCropDetails() {

  const temp = localStorage.getItem("weatherTemp");
  const humidity = localStorage.getItem("weatherHumidity");

  const crop = document.getElementById("cropSelect").value;
  const result = document.getElementById("cropResult");

  result.innerHTML = "<h3>🔄 Loading Crop Insights...</h3>";

  setTimeout(() => {

    const cropDB = {

      Wheat:{type:"Cereal",season:"Rabi",duration:"120 days",temp:"10-25°C",rainfall:"50-100 cm",soil:"Loamy",ph:"6-7",water:"Moderate",fertilizer:"Nitrogen",risk:"Rust",yield:"5"},
      Rice:{type:"Cereal",season:"Kharif",duration:"120 days",temp:"20-35°C",rainfall:"100-200 cm",soil:"Clay",ph:"5-6.5",water:"High",fertilizer:"NPK",risk:"Stem borer",yield:"6"},
      Maize:{type:"Cereal",season:"Kharif",duration:"100 days",temp:"18-27°C",rainfall:"50-100 cm",soil:"Loamy",ph:"6",water:"Moderate",fertilizer:"Nitrogen",risk:"Armyworm",yield:"6"},
      Cotton:{type:"Commercial",season:"Kharif",duration:"150 days",temp:"21-30°C",rainfall:"50-100 cm",soil:"Black",ph:"6-8",water:"Low",fertilizer:"Balanced",risk:"Bollworm",yield:"2"},
      Sugarcane:{type:"Commercial",season:"Annual",duration:"12 months",temp:"20-35°C",rainfall:"75-150 cm",soil:"Loamy",ph:"6-7.5",water:"Very High",fertilizer:"NPK",risk:"Red rot",yield:"60"},

      Tomato:{type:"Vegetable",season:"All",duration:"90 days",temp:"18-27°C",rainfall:"50-70 cm",soil:"Loamy",ph:"6-7",water:"Moderate",fertilizer:"Potassium",risk:"Blight",yield:"30"},
      Potato:{type:"Vegetable",season:"Rabi",duration:"100 days",temp:"15-20°C",rainfall:"50-75 cm",soil:"Sandy",ph:"5-6.5",water:"Moderate",fertilizer:"Balanced",risk:"Blight",yield:"25"},
      Onion:{type:"Vegetable",season:"All",duration:"100 days",temp:"13-24°C",rainfall:"30-50 cm",soil:"Loamy",ph:"6-7",water:"Low",fertilizer:"Sulfur",risk:"Rot",yield:"20"},
      Garlic:{type:"Vegetable",season:"Rabi",duration:"120 days",temp:"12-20°C",rainfall:"30-50 cm",soil:"Loamy",ph:"6-7",water:"Low",fertilizer:"Organic",risk:"White rot",yield:"7"},

      Banana:{type:"Fruit",season:"All",duration:"12 months",temp:"25-35°C",rainfall:"100-150 cm",soil:"Loamy",ph:"6-7.5",water:"High",fertilizer:"Potassium",risk:"Panama",yield:"40"},
      Mango:{type:"Fruit",season:"Summer",duration:"5 years",temp:"24-30°C",rainfall:"75-100 cm",soil:"Loamy",ph:"5.5-7.5",water:"Low",fertilizer:"Organic",risk:"Fruit fly",yield:"15"},
      Grapes:{type:"Fruit",season:"Winter",duration:"3 years",temp:"15-30°C",rainfall:"50-75 cm",soil:"Loamy",ph:"6-7.5",water:"Moderate",fertilizer:"Balanced",risk:"Mildew",yield:"20"},
      Apple:{type:"Fruit",season:"Winter",duration:"4 years",temp:"7-24°C",rainfall:"100 cm",soil:"Loamy",ph:"5.5-6.5",water:"Moderate",fertilizer:"Nitrogen",risk:"Scab",yield:"10"},
      Orange:{type:"Fruit",season:"Winter",duration:"3 years",temp:"13-37°C",rainfall:"75-125 cm",soil:"Sandy",ph:"5.5-7",water:"Moderate",fertilizer:"Potassium",risk:"Canker",yield:"15"},

      Soybean:{type:"Pulse",season:"Kharif",duration:"100 days",temp:"20-30°C",rainfall:"60-100 cm",soil:"Loamy",ph:"6-7",water:"Moderate",fertilizer:"Phosphorus",risk:"Leaf spot",yield:"2"},
      Groundnut:{type:"Oilseed",season:"Kharif",duration:"120 days",temp:"25-35°C",rainfall:"50-100 cm",soil:"Sandy",ph:"6",water:"Low",fertilizer:"Calcium",risk:"Leaf spot",yield:"2"},
      Mustard:{type:"Oilseed",season:"Rabi",duration:"110 days",temp:"10-25°C",rainfall:"30-50 cm",soil:"Loamy",ph:"6-7.5",water:"Low",fertilizer:"Nitrogen",risk:"Aphids",yield:"2"},

      // 🔥 FIXED EXTRA CROPS
      PigeonPea:{type:"Pulse",season:"Kharif",duration:"150 days",temp:"25-35°C",rainfall:"60-100 cm",soil:"Loamy",ph:"6-7",water:"Low",fertilizer:"Organic",risk:"Pod borer",yield:"2"},
      GreenGram:{type:"Pulse",season:"Kharif",duration:"70 days",temp:"25-35°C",rainfall:"50-70 cm",soil:"Loamy",ph:"6-7",water:"Low",fertilizer:"Nitrogen",risk:"Mosaic",yield:"1.5"},
      BlackGram:{type:"Pulse",season:"Kharif",duration:"80 days",temp:"25-35°C",rainfall:"60 cm",soil:"Loamy",ph:"6-7",water:"Low",fertilizer:"Nitrogen",risk:"Leaf curl",yield:"1.5"}
    };

    const data = cropDB[crop];

    let score = 0;
    if (temp >= 20 && temp <= 30) score += 40;
    if (humidity > 60) score += 20;
    if (data.soil.includes("Loam")) score += 30;

    let prediction = score > 70 ? "High Yield 🚀" : score > 40 ? "Moderate 👍" : "Low ⚠️";

    // 🔥 FULL UI BACK (FIXED)
    result.innerHTML = `

    <div class="analytics-grid">
      <div class="analytics-card"><h4>🌡 Temp</h4><p>${data.temp}</p></div>
      <div class="analytics-card"><h4>💧 Water</h4><p>${data.water}</p></div>
      <div class="analytics-card"><h4>🌿 Fertilizer</h4><p>${data.fertilizer}</p></div>
      <div class="analytics-card"><h4>⚠ Risk</h4><p>${data.risk}</p></div>
    </div>

    <div class="details-grid">
      <div class="detail-card"><h4>🌾 Type</h4><p>${data.type}</p></div>
      <div class="detail-card"><h4>📅 Season</h4><p>${data.season}</p></div>
      <div class="detail-card"><h4>⏳ Duration</h4><p>${data.duration}</p></div>
      <div class="detail-card"><h4>🌧 Rainfall</h4><p>${data.rainfall}</p></div>
      <div class="detail-card"><h4>🌱 Soil</h4><p>${data.soil}</p></div>
      <div class="detail-card"><h4>⚗ pH</h4><p>${data.ph}</p></div>
      <div class="detail-card"><h4>📈 Yield</h4><p>${data.yield}</p></div>
    </div>

    <div class="ai-card">
      <h3>🤖 AI Prediction</h3>
      <p>Score: ${score}%<br>${prediction}</p>
    </div>

    <div class="chart-card">
      <canvas id="yieldChart"></canvas>
    </div>
    `;
    showToast("Crop details loaded", "success");
    const ctx = document.getElementById('yieldChart').getContext('2d');

    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Yield','Water','Risk'],
        datasets: [{
          label: crop,
          data: [parseFloat(data.yield),5,6],
          backgroundColor:['#22c55e','#3b82f6','#ef4444']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  }, 300);
}