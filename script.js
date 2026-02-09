const globe = document.getElementById("globe");

let isDragging = false;
let startX = 0;
let currentYaw = -18;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setYaw = (value) => {
  currentYaw = clamp(value, -70, 70);
  globe.style.setProperty("--yaw", `${currentYaw}deg`);
};

const handlePointerDown = (event) => {
  isDragging = true;
  startX = event.clientX;
  globe.setPointerCapture(event.pointerId);
  globe.classList.add("is-dragging");
};

const handlePointerMove = (event) => {
  if (!isDragging) return;
  const deltaX = event.clientX - startX;
  setYaw(currentYaw + deltaX * 0.35);
  startX = event.clientX;
};

const handlePointerUp = (event) => {
  isDragging = false;
  globe.releasePointerCapture(event.pointerId);
  globe.classList.remove("is-dragging");
};

setYaw(currentYaw);

globe.addEventListener("pointerdown", handlePointerDown);
globe.addEventListener("pointermove", handlePointerMove);
globe.addEventListener("pointerup", handlePointerUp);
globe.addEventListener("pointerleave", handlePointerUp);
globe.addEventListener("pointercancel", handlePointerUp);
