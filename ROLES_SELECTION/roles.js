/* 🔁 FORCE PRELOADER ON REFRESH */
const nav = performance.getEntriesByType("navigation")[0];
if (nav && nav.type === "reload") {
  window.location.href = "../PRELOADER/preloader.html";
}

/* ✅ RUN ONLY AFTER HTML IS READY */
document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;

  document.querySelectorAll(".card, .role-col-click").forEach(card => {
    const role = card.dataset.role;

    if (!role) return; // safety

    /* 🌟 SPOTLIGHT EFFECT */
    card.addEventListener("mouseenter", () => {
      body.classList.remove("spot-farmer", "spot-buyer", "spot-admin");
      body.classList.add("spot-" + role);
    });

    card.addEventListener("mouseleave", () => {
      body.classList.remove("spot-farmer", "spot-buyer", "spot-admin");
    });

    /* 🔗 NAVIGATION */
    card.addEventListener("click", () => {
      window.location.href =
        "../LOGIN_SIGNUP/login_signup.html?role=" + role;
    });
  });

});
