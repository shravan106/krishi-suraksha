function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");

  if (!container) {
    console.error("Toast container not found");
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}