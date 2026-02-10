import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const hero = document.getElementById("sphere-hero");
const canvasHost = document.getElementById("sphere-canvas");
const fallback = document.getElementById("sphere-fallback");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (error) {
    return false;
  }
};

if (!hasWebGL()) {
  hero.classList.add("is-fallback");
  fallback.hidden = false;
} else {
  fallback.hidden = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasHost.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.SphereGeometry(2, 48, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0x206090,
    wireframe: true,
    wireframeLinewidth: 1,
    transparent: true,
    opacity: 0.9,
  });
  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);

  let isDragging = false;
  let startX = 0;
  let velocity = 0;
  let targetYaw = 0;
  let currentYaw = 0;
  let autoRotate = true;
  let autoRotateTimeout = null;

  const reduceMotionSettings = () => {
    return {
      damping: prefersReducedMotion.matches ? 0.08 : 0.12,
      inertia: prefersReducedMotion.matches ? 0.85 : 0.92,
      autoSpeed: prefersReducedMotion.matches ? 0 : 0.002,
    };
  };

  const updateSize = () => {
    const { width, height } = canvasHost.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const handlePointerDown = (event) => {
    isDragging = true;
    startX = event.clientX;
    canvasHost.setPointerCapture(event.pointerId);
    autoRotate = false;
    if (autoRotateTimeout) {
      window.clearTimeout(autoRotateTimeout);
    }
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - startX;
    startX = event.clientX;
    const sensitivity = 0.005;
    velocity = deltaX * sensitivity;
    targetYaw += velocity;
  };

  const handlePointerUp = (event) => {
    isDragging = false;
    canvasHost.releasePointerCapture(event.pointerId);
    autoRotateTimeout = window.setTimeout(() => {
      autoRotate = true;
    }, 2000);
  };

  canvasHost.addEventListener("pointerdown", handlePointerDown);
  canvasHost.addEventListener("pointermove", handlePointerMove);
  canvasHost.addEventListener("pointerup", handlePointerUp);
  canvasHost.addEventListener("pointerleave", handlePointerUp);
  canvasHost.addEventListener("pointercancel", handlePointerUp);

  prefersReducedMotion.addEventListener("change", () => {
    if (prefersReducedMotion.matches) {
      autoRotate = false;
    }
  });

  const animate = () => {
    const { damping, inertia, autoSpeed } = reduceMotionSettings();

    if (autoRotate) {
      targetYaw += autoSpeed;
    }

    currentYaw += (targetYaw - currentYaw) * damping;
    targetYaw += velocity;
    velocity *= inertia;

    group.rotation.y = currentYaw;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  updateSize();
  window.addEventListener("resize", updateSize);
  animate();
}
