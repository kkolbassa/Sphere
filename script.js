const hero = document.getElementById("sphere-hero");
const canvasHost = document.getElementById("sphere-canvas");
const fallback = document.getElementById("sphere-fallback");

if (!hero || !canvasHost || !fallback) {
  throw new Error("Sphere container not found");
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const showFallback = () => {
  hero.classList.add("is-fallback");
  fallback.hidden = false;
};

const loadThree = async () => {
  const sources = [
    "https://unpkg.com/three@0.161.0/build/three.module.js",
    "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js",
    "https://esm.sh/three@0.161.0",
  ];

  for (const source of sources) {
    try {
      const mod = await import(source);
      if (mod?.WebGLRenderer) return mod;
    } catch (_error) {
      // try next CDN
    }
  }

  return null;
};

const THREE = await loadThree();
if (!THREE) {
  showFallback();
} else {
  fallback.hidden = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6.5);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (_error) {
    showFallback();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 1);
  canvasHost.appendChild(renderer.domElement);

  const sphereGeometry = new THREE.SphereGeometry(2, 64, 48);
  const wireGeometry = new THREE.WireframeGeometry(sphereGeometry);
  const wireMaterial = new THREE.LineBasicMaterial({
    color: 0x206090,
    transparent: true,
    opacity: 0.95,
  });
  const wireSphere = new THREE.LineSegments(wireGeometry, wireMaterial);
  scene.add(wireSphere);

  let isDragging = false;
  let startX = 0;
  let velocity = 0;
  let targetYaw = 0;
  let currentYaw = 0;
  let autoRotate = !prefersReducedMotion.matches;
  let autoRotateTimeout = null;

  const getMotionConfig = () => ({
    damping: prefersReducedMotion.matches ? 0.1 : 0.14,
    inertia: prefersReducedMotion.matches ? 0.78 : 0.9,
    autoSpeed: prefersReducedMotion.matches ? 0 : 0.0018,
    sensitivity: 0.005,
  });

  const updateSize = () => {
    const rect = canvasHost.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const startInteraction = (x) => {
    isDragging = true;
    startX = x;
    autoRotate = false;
    if (autoRotateTimeout) {
      clearTimeout(autoRotateTimeout);
      autoRotateTimeout = null;
    }
  };

  const moveInteraction = (x) => {
    if (!isDragging) return;
    const { sensitivity } = getMotionConfig();
    const deltaX = x - startX;
    startX = x;
    velocity = deltaX * sensitivity;
    targetYaw += velocity;
  };

  const endInteraction = () => {
    if (!isDragging) return;
    isDragging = false;
    autoRotateTimeout = setTimeout(() => {
      autoRotate = !prefersReducedMotion.matches;
    }, 2000);
  };

  canvasHost.addEventListener("pointerdown", (event) => {
    canvasHost.setPointerCapture(event.pointerId);
    startInteraction(event.clientX);
  });

  canvasHost.addEventListener("pointermove", (event) => {
    moveInteraction(event.clientX);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    canvasHost.addEventListener(eventName, (event) => {
      if (event.pointerId !== undefined && canvasHost.hasPointerCapture(event.pointerId)) {
        canvasHost.releasePointerCapture(event.pointerId);
      }
      endInteraction();
    });
  });

  canvasHost.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches[0]) return;
      startInteraction(event.touches[0].clientX);
    },
    { passive: true }
  );

  canvasHost.addEventListener(
    "touchmove",
    (event) => {
      if (!event.touches[0]) return;
      moveInteraction(event.touches[0].clientX);
    },
    { passive: true }
  );

  canvasHost.addEventListener("touchend", endInteraction, { passive: true });
  canvasHost.addEventListener("touchcancel", endInteraction, { passive: true });

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", () => {
      autoRotate = !prefersReducedMotion.matches;
      if (prefersReducedMotion.matches) velocity *= 0.5;
    });
  }

  const animate = () => {
    const { damping, inertia, autoSpeed } = getMotionConfig();

    if (autoRotate) {
      targetYaw += autoSpeed;
    }

    currentYaw += (targetYaw - currentYaw) * damping;
    targetYaw += velocity;
    velocity *= inertia;

    wireSphere.rotation.x = 0;
    wireSphere.rotation.y = currentYaw;
    wireSphere.rotation.z = 0;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  updateSize();
  window.addEventListener("resize", updateSize);
  animate();
}
