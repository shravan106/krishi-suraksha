async function getAdvice() {

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "<h3>🔄 Fetching Weather + Generating Smart Advisory...</h3>";

  const crop = document.getElementById("crop").value;
  const season = document.getElementById("season").value;
  const soil = document.getElementById("soil").value;
  const district = document.getElementById("district").value;

  const API_KEY = "7c615fb9cf5f5b283a6086f168b60218";

  try {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = await res.json();

        if (!data.main) {
          showToast("Weather API failed", "error");
          return;
        }

        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const weather = data.weather[0].main;

        // 🌾 Crop Info DB (ALL CROPS)
        const cropData = {
          Wheat:{water:"Moderate",fertilizer:"Nitrogen",risk:"Rust"},
          Rice:{water:"High",fertilizer:"NPK",risk:"Stem borer"},
          Maize:{water:"Moderate",fertilizer:"Nitrogen",risk:"Armyworm"},
          Barley:{water:"Low",fertilizer:"Nitrogen",risk:"Mildew"},
          Millet:{water:"Very Low",fertilizer:"Organic",risk:"Low risk"},
          Sorghum:{water:"Low",fertilizer:"Nitrogen",risk:"Shoot fly"},

          Chickpea:{water:"Low",fertilizer:"Phosphorus",risk:"Wilt"},
          PigeonPea:{water:"Low",fertilizer:"Organic",risk:"Pod borer"},
          GreenGram:{water:"Low",fertilizer:"Nitrogen",risk:"Mosaic"},
          BlackGram:{water:"Low",fertilizer:"Nitrogen",risk:"Leaf curl"},
          Soybean:{water:"Moderate",fertilizer:"Phosphorus",risk:"Leaf spot"},

          Groundnut:{water:"Low",fertilizer:"Calcium",risk:"Leaf spot"},
          Mustard:{water:"Low",fertilizer:"Nitrogen",risk:"Aphids"},
          Sunflower:{water:"Moderate",fertilizer:"Phosphorus",risk:"Rust"},

          Cotton:{water:"Low",fertilizer:"Balanced",risk:"Bollworm"},
          Sugarcane:{water:"Very High",fertilizer:"NPK",risk:"Red rot"},

          Tomato:{water:"Moderate",fertilizer:"Potassium",risk:"Blight"},
          Potato:{water:"Moderate",fertilizer:"Balanced",risk:"Blight"},
          Onion:{water:"Low",fertilizer:"Sulfur",risk:"Rot"},
          Garlic:{water:"Low",fertilizer:"Organic",risk:"White rot"},

          Banana:{water:"High",fertilizer:"Potassium",risk:"Panama"},
          Mango:{water:"Low",fertilizer:"Organic",risk:"Fruit fly"},
          Grapes:{water:"Moderate",fertilizer:"Balanced",risk:"Mildew"},
          Apple:{water:"Moderate",fertilizer:"Nitrogen",risk:"Scab"},
          Orange:{water:"Moderate",fertilizer:"Potassium",risk:"Canker"}
        };

        const cropInfo = cropData[crop] || {
          water:"Moderate",fertilizer:"General",risk:"No risk"
        };

        // 🌦 WEATHER LOGIC
        let weatherAdvice = "";
        if (temp > 35) weatherAdvice += "🔥 High heat → Increase irrigation<br>";
        if (temp < 15) weatherAdvice += "❄ Low temp → Protect crops<br>";
        if (humidity > 75) weatherAdvice += "💧 High humidity → Fungal risk<br>";
        if (weather.includes("Rain")) weatherAdvice += "🌧 Rain → Avoid irrigation<br>";

        // 🌱 Soil
        let soilAdvice = soil === "Clay"
          ? "Clay soil → avoid overwatering"
          : soil === "Sandy"
          ? "Sandy soil → water frequently"
          : "Loamy soil is ideal";

        // 🌾 Season
        let seasonAdvice = season === "Kharif"
          ? "🌧 Monsoon crop"
          : "❄ Winter crop";

        // 📍 DISTRICT DATA
       const districtData = {
  // Konkan
  "Mumbai": ["Rice", "Vegetables"],
  "Mumbai Suburban": ["Rice", "Vegetables"],
  "Thane": ["Rice", "Vegetables"],
  "Palghar": ["Rice", "Chickpea"],
  "Raigad": ["Rice", "Coconut"],
  "Ratnagiri": ["Rice", "Mango"],
  "Sindhudurg": ["Rice", "Mango"],

  // Western Maharashtra
  "Pune": ["Sugarcane", "Wheat", "Tomato"],
  "Satara": ["Sugarcane", "Wheat"],
  "Sangli": ["Sugarcane", "Grapes"],
  "Kolhapur": ["Sugarcane", "Rice"],
  "Solapur": ["Millet", "Sorghum"],

  // North Maharashtra
  "Nashik": ["Grapes", "Onion", "Tomato"],
  "Ahmednagar": ["Sugarcane", "Wheat"],
  "Dhule": ["Cotton", "Maize"],
  "Nandurbar": ["Millet", "Maize"],
  "Jalgaon": ["Banana", "Cotton"],

  // Marathwada
  "Aurangabad": ["Maize", "PigeonPea"],
  "Jalna": ["Cotton", "Soybean"],
  "Beed": ["Cotton", "Millet"],
  "Osmanabad": ["Sorghum", "Millet"],
  "Latur": ["Soybean", "PigeonPea"],
  "Nanded": ["Cotton", "Rice"],
  "Parbhani": ["Cotton", "Soybean"],
  "Hingoli": ["Soybean", "PigeonPea"],

  // Vidarbha
  "Nagpur": ["Orange", "Cotton"],
  "Wardha": ["Cotton", "Soybean"],
  "Bhandara": ["Rice"],
  "Gondia": ["Rice"],
  "Chandrapur": ["Cotton", "Rice"],
  "Gadchiroli": ["Rice", "Millet"],
  "Amravati": ["Cotton", "Soybean"],
  "Akola": ["Cotton", "Soybean"],
  "Washim": ["Soybean"],
  "Yavatmal": ["Cotton", "Soybean"],
  "Buldhana": ["Cotton", "Soybean"]

};

        // 🌾 MARKET + PROFIT
        const cropMarket = {
          Wheat:{minTemp:10,maxTemp:25,price:2200,yield:5},
          Rice:{minTemp:20,maxTemp:35,price:2000,yield:6},
          Maize:{minTemp:18,maxTemp:30,price:1800,yield:6},
          Cotton:{minTemp:21,maxTemp:32,price:7000,yield:2},
          Sugarcane:{minTemp:20,maxTemp:35,price:300,yield:60},
          Tomato:{minTemp:18,maxTemp:30,price:1500,yield:30},
          Potato:{minTemp:15,maxTemp:25,price:1200,yield:25},
          Onion:{minTemp:13,maxTemp:28,price:1800,yield:20},
          Banana:{minTemp:25,maxTemp:35,price:2000,yield:40},
          Mango:{minTemp:24,maxTemp:35,price:5000,yield:15},
          Grapes:{minTemp:15,maxTemp:30,price:6000,yield:20},
          Soybean:{minTemp:20,maxTemp:30,price:4000,yield:2},
          Groundnut:{minTemp:25,maxTemp:35,price:5500,yield:2},
          Mustard:{minTemp:10,maxTemp:25,price:5000,yield:2}
        };

        let rec = [];

        for (let c in cropMarket) {

          let d = cropMarket[c];
          let score = 10;

          if (temp >= d.minTemp && temp <= d.maxTemp) score += 40;
          if (humidity > 60) score += 20;

          if (districtData[district]?.includes(c)) {
            score += 50;
          }

          let profit = (d.price * d.yield) - 20000;

          rec.push({name:c,score,profit});
        }

        rec.sort((a,b)=>(b.score+b.profit)-(a.score+a.profit));
        const top = rec.slice(0,3);

        // 🔗 SAVE DATA FOR DETAILS PAGE
        localStorage.setItem("selectedCrop", crop);
        localStorage.setItem("weatherTemp", temp);
        localStorage.setItem("weatherHumidity", humidity);

        // 💥 FINAL UI
        resultBox.innerHTML = `
          <h2>🌟 AI Smart Crop Advisory</h2>
          <h3>📍 District: ${district}</h3>

          <div class="result-grid">

            <div class="result-box">
              <h4>🌡 Weather</h4>
              <p>${temp}°C | ${humidity}%</p>
              <p>${weather}</p>
            </div>

            <div class="result-box">
              <h4>🌾 Crop Info</h4>
                <p><strong>Water Requirement:</strong> ${cropInfo.water}</p>
                <p><strong>Fertilizer:</strong> ${cropInfo.fertilizer}</p>
                <p><strong>Risk:</strong> ${cropInfo.risk}</p>
            </div>

            <div class="result-box">
              <h4>🤖 Insights</h4>
              <p>${weatherAdvice}</p>
              <p>${soilAdvice}</p>
              <p>${seasonAdvice}</p>
            </div>

          </div>

          <div class="recommend-card">
            <h3>🌾 Top Crop Recommendations</h3>
            ${top.map(c=>`
              <div class="recommend-item">
                <h4>${c.name}</h4>
                    <p>🌟 Suitability Score: ${c.score}/100</p>
                    <p>💰 Estimated Profit: ₹${c.profit.toLocaleString()}</p>
              </div>
            `).join("")}
          </div>

          <button onclick="goToDetails()" class="primary-btn">
            🔍 View Full Crop Analysis
          </button>
        `;
      showToast("Advisory generated successfully", "success");
      },
      () => {
        showToast("Please allow location access", "error");
      }
    );

  } catch (error) {
    showToast("Error fetching data", "error");
  }
}

function goToDetails() {
  window.location.href = "crop-details.html";
}