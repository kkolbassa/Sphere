(() => {
  const section = document.getElementById("sphere-hero");
  const mount = document.getElementById("sphere-hero-canvas");

  const hasWebGL = (() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch (error) {
      return false;
    }
  })();

  if (!hasWebGL) {
    section.classList.add("is-fallback");
    return;
  }

  if (!window.THREE) {
    const fallbackText = document.getElementById("sphere-hero-fallback");
    fallbackText.textContent = "Не удалось загрузить Three.js";
    section.classList.add("is-fallback");
    return;
  }

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.3);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mount.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color("#206090"),
    transparent: true,
    opacity: 0.98,
  });

  const radius = 1;
  const meridians = 18;
  const parallels = 11;
  const segments = 180;

  for (let i = 0; i < meridians; i += 1) {
    const phi = (i / meridians) * Math.PI * 2;
    const points = [];

    for (let j = 0; j <= segments; j += 1) {
      const theta = (j / segments) * Math.PI;
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.cos(theta);
      const z = radius * Math.sin(theta) * Math.sin(phi);
      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    globeGroup.add(new THREE.Line(geometry, lineMaterial));
  }

  for (let i = 1; i < parallels; i += 1) {
    const y = -radius + (2 * radius * i) / parallels;
    const ringRadius = Math.sqrt(radius * radius - y * y);
    const points = [];

    for (let j = 0; j <= segments; j += 1) {
      const t = (j / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(ringRadius * Math.cos(t), y, ringRadius * Math.sin(t)));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    globeGroup.add(new THREE.Line(geometry, lineMaterial));
  }

  const rotation = {
    yaw: 0,
    pitch: 0,
    velocityYaw: 0,
    velocityPitch: 0,
  };

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const onPointerDown = (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;

    rotation.velocityYaw = dx * 0.004;
    rotation.velocityPitch = dy * 0.003;
  };

  const onPointerUp = (event) => {
    dragging = false;
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  };

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", onPointerUp);

  const resize = () => {
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    if (!width || !height) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener("resize", resize);

  const animate = () => {
    rotation.yaw += rotation.velocityYaw;
    rotation.pitch = clamp(rotation.pitch + rotation.velocityPitch, -0.5, 0.5);

    rotation.velocityYaw *= 0.94;
    rotation.velocityPitch *= 0.9;

    globeGroup.rotation.y = rotation.yaw;
    globeGroup.rotation.x = rotation.pitch;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
})();
