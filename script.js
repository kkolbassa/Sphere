const globe = document.getElementById("globe");

let isDragging = false;
let startY = 0;
let currentTilt = -15;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setTilt = (value) => {
  currentTilt = clamp(value, -75, 75);
  globe.style.setProperty("--tilt", `${currentTilt}deg`);
};

const handlePointerDown = (event) => {
  isDragging = true;
  startY = event.clientY;
  globe.setPointerCapture(event.pointerId);
};

const handlePointerMove = (event) => {
  if (!isDragging) return;
  const deltaY = event.clientY - startY;
  setTilt(currentTilt + deltaY * 0.3);
  startY = event.clientY;
};

const handlePointerUp = (event) => {
  isDragging = false;
  globe.releasePointerCapture(event.pointerId);
};

setTilt(currentTilt);

globe.addEventListener("pointerdown", handlePointerDown);
globe.addEventListener("pointermove", handlePointerMove);
globe.addEventListener("pointerup", handlePointerUp);
globe.addEventListener("pointerleave", handlePointerUp);
