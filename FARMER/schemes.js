const container = document.getElementById("schemeContainer");
const filter = document.getElementById("filter");
const search = document.getElementById("search");

/* ================= DATA ================= */
const schemes = [

{
  name: "PM-KISAN",
  category: "subsidy",
  desc: "Income support scheme by Government of India.",
  benefit: "₹6000/year to farmers",
  eligibility: "Small & marginal farmers",
  link: "https://pmkisan.gov.in"
},

{
  name: "PMFBY",
  category: "insurance",
  desc: "Crop insurance against natural disasters.",
  benefit: "Covers crop loss",
  eligibility: "All farmers",
  link: "https://pmfby.gov.in"
},

{
  name: "Kisan Credit Card",
  category: "loan",
  desc: "Provides easy farm loans.",
  benefit: "Low interest (4%)",
  eligibility: "Farmers with land",
  link: "https://www.myscheme.gov.in"
},

{
  name: "Soil Health Card",
  category: "subsidy",
  desc: "Soil testing & recommendations.",
  benefit: "Improve productivity",
  eligibility: "All farmers",
  link: "https://soilhealth.dac.gov.in"
},

{
  name: "e-NAM",
  category: "subsidy",
  desc: "Online agricultural trading platform.",
  benefit: "Better price discovery",
  eligibility: "Registered farmers",
  link: "https://enam.gov.in"
},

{
  name: "Loan Waiver Scheme",
  category: "loan",
  desc: "Maharashtra farmer loan relief scheme.",
  benefit: "Loan waiver up to ₹2 lakh",
  eligibility: "Eligible farmers",
  link: "https://maharashtra.gov.in"
}

];

/* ================= DISPLAY ================= */
function displaySchemes(list) {

  if (!list.length) {
    showToast("No schemes found", "info");
    return;
  }

  container.innerHTML = list.map(s => `
    <div class="scheme-card">

      <h3>${s.name}</h3>

      <p><strong>About:</strong> ${s.desc}</p>
      <p><strong>Benefit:</strong> ${s.benefit}</p>
      <p><strong>Eligibility:</strong> ${s.eligibility}</p>

      <a href="${s.link}" target="_blank" class="apply-btn">
        🔗 Learn More
      </a>

      <span class="tag">${s.category}</span>

    </div>
  `).join("");
}

/* ================= FILTER + SEARCH ================= */
function applyFilters() {

  let filtered = schemes;

  const filterValue = filter.value;
  const searchValue = search.value.toLowerCase();

  if (filterValue !== "all") {
    filtered = filtered.filter(s => s.category === filterValue);
  }

  if (searchValue) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchValue)
    );
  }

  displaySchemes(filtered);
}

/* EVENTS */
filter.addEventListener("change", applyFilters);
search.addEventListener("input", applyFilters);

/* INIT */
displaySchemes(schemes);