let progress = 0;
const bar = document.getElementById("progress");
const percent = document.getElementById("percent");

const timer = setInterval(() => {
  progress++;
  bar.style.width = progress + "%";
  percent.textContent = progress + "%";

  if (progress >= 100) {
    clearInterval(timer);
    setTimeout(() => {
      window.location.href = "../ROLES_SELECTION/roles.html";
    }, 500);
  }
}, 35);
