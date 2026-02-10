(() => {
  const section = document.getElementById("sphere-hero");
  const mount = document.getElementById("sphere-hero-canvas");

  const webglAvailable = (() => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (error) {
      return false;
    }
  })();

  if (!webglAvailable || !window.THREE || !THREE.OrbitControls) {
    section.classList.add("is-fallback");
    return;
  }

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2.8;
  controls.maxDistance = 4.8;
  controls.minPolarAngle = Math.PI * 0.35;
  controls.maxPolarAngle = Math.PI * 0.65;

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const color = new THREE.Color("#206090");
  const lineMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 });

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
    const v = -1 + (2 * i) / parallels;
    const y = radius * v;
    const ringRadius = Math.sqrt(radius * radius - y * y);
    const points = [];

    for (let j = 0; j <= segments; j += 1) {
      const t = (j / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(ringRadius * Math.cos(t), y, ringRadius * Math.sin(t)));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    globeGroup.add(new THREE.Line(geometry, lineMaterial));
  }

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
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
})();
