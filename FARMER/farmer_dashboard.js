// ================= USER LOAD =================
function loadUser() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const user = JSON.parse(storedUser);
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileRole").textContent = user.role;

  const initials = user.name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase();

  document.getElementById("avatar").textContent = initials;
}

// ================= PROFILE DROPDOWN =================
const profileToggle = document.getElementById("profileToggle");
const profileDropdown = document.getElementById("profileDropdown");

profileToggle.addEventListener("click", () => {
  profileDropdown.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!profileToggle.contains(e.target)) {
    profileDropdown.classList.remove("active");
  }
});

// ================= LOGOUT =================
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  showToast("Logged out successfully", "success");
  setTimeout(() => {
  localStorage.removeItem("user");
  window.location.href = "../PRELOADER/preloader.html";
  }, 1000);
});

// ================= MAP =================
document.addEventListener("DOMContentLoaded", () => {

  loadUser();

  const API = "https://krishi-suraksha.onrender.com/api/weather";
  const card = document.getElementById("weatherCard");
  let lockedDistrict = null;

  const map = L.map("map").setView([19.75, 75.71], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  async function showWeather(district, lat, lon) {

    card.classList.remove("hidden");
    card.innerHTML = `<h3>${district}</h3><p>Loading...</p>`;

    try {
      const res = await fetch(`${API}?lat=${lat}&lon=${lon}`);
      const d = await res.json();

      card.innerHTML = `
        <h3>${district}</h3>
        <p>🌡 ${d.temperature}°C</p>
        <p>💧 ${d.humidity}%</p>
        <p>🌬 ${d.wind_speed} m/s</p>
        <p>🌦 ${d.description}</p>
      `;
    } catch {
      card.innerHTML = "<p>Weather unavailable</p>";
    }
  }

  fetch("geo/maharashtra_districts.geojson")
    .then(res => res.json())
    .then(data => {

      const layer = L.geoJSON(data, {

        style: {
          color: "#ffffff",
          weight: 1,
          fillColor: "#15803d",
          fillOpacity: 0.6
        },

        onEachFeature: function (feature, layer) {

          const districtName = feature.properties.DISTRICT;

          layer.on({

            mouseover: function () {
              if (!lockedDistrict) {
                const center = layer.getBounds().getCenter();
                showWeather(districtName, center.lat, center.lng);
              }
              layer.setStyle({ weight: 3, fillOpacity: 0.8 });
            },

            mouseout: function () {
              if (!lockedDistrict) {
                card.classList.add("hidden");
              }
              layer.setStyle({ weight: 1, fillOpacity: 0.6 });
            },

            click: function () {
              lockedDistrict = districtName;
              const center = layer.getBounds().getCenter();
              showWeather(districtName, center.lat, center.lng);
            }

          });
        }

      }).addTo(map);

      map.fitBounds(layer.getBounds());
    });

  map.on("click", () => {
    lockedDistrict = null;
    card.classList.add("hidden");
  });

});
