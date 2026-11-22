/*
 * Mr. Sprinkle Sprinkle Studio 3D
 * Proprietary, parametric dental-cast and grillz mockup renderer.
 * Three.js is pinned in pricing.html; all dental geometry and design logic are ours.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

(() => {
  "use strict";

  const host = document.getElementById("grill3DViewport");
  if (!host) return;

  const UPPER = ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"];
  const LOWER = ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"];
  const MATERIALS = {
    silver:       { label: "Polished silver",      color: 0xc5ccd4, roughness: 0.16, metalness: 1.00 },
    gold10k:      { label: "10K yellow gold",      color: 0xb9832e, roughness: 0.22, metalness: 1.00 },
    gold14k:      { label: "14K yellow gold",      color: 0xd1a13d, roughness: 0.18, metalness: 1.00 },
    dentalGold14k:{ label: "14K dental gold",      color: 0xe0bd62, roughness: 0.19, metalness: 1.00 },
    quote:        { label: "Custom quote metal",   color: 0xd1d5db, roughness: 0.20, metalness: 1.00 }
  };
  const NS = "http://www.w3.org/2000/svg";
  let renderer, scene, camera, controls, modelRoot, pmrem;
  let lastConfig = null;
  let resizeObserver = null;
  let disposed = false;
  const toothMeshes = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const viewButtons = Array.from(document.querySelectorAll("[data-grill-view]"));

  function setStatus(message, isError) {
    const status = document.getElementById("grill3DStatus");
    if (status) {
      status.textContent = message;
      status.classList.toggle("is-error", !!isError);
    }
  }

  const metalMaterialCache = {};
  function materialForMetal(key) {
    const materialKey = MATERIALS[key] ? key : "silver";
    if (metalMaterialCache[materialKey]) return metalMaterialCache[materialKey];
    const data = MATERIALS[materialKey];
    metalMaterialCache[materialKey] = new THREE.MeshPhysicalMaterial({
      color: data.color,
      metalness: data.metalness,
      roughness: data.roughness,
      clearcoat: 1,
      clearcoatRoughness: 0.10,
      envMapIntensity: 1.35
    });
    return metalMaterialCache[materialKey];
  }

  const enamelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf4f1e9,
    roughness: 0.29,
    metalness: 0,
    clearcoat: 0.34,
    clearcoatRoughness: 0.22
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6e1d7,
    roughness: 0.86,
    metalness: 0.02
  });
  const stoneEdgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9c3b9,
    roughness: 0.72,
    metalness: 0.01
  });
  const gemMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf6fbff,
    roughness: 0.045,
    metalness: 0.02,
    transmission: 0.28,
    thickness: 0.22,
    ior: 2.1,
    clearcoat: 1,
    clearcoatRoughness: 0.015,
    envMapIntensity: 1.8
  });
  const dustMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe6a0,
    roughness: 0.2,
    metalness: 0.75,
    emissive: 0x3a2204,
    emissiveIntensity: 0.12
  });
  const grooveMaterial = new THREE.MeshStandardMaterial({
    color: 0x533c1d,
    roughness: 0.45,
    metalness: 0.28
  });

  function makeArchCurve(jaw, radiusX, radiusY, z) {
    const points = [];
    const segments = 52;
    for (let i = 0; i <= segments; i++) {
      const theta = -1.36 + (2.72 * i / segments);
      points.push(new THREE.Vector3(
        radiusX * Math.sin(theta),
        -radiusY * Math.cos(theta),
        z
      ));
    }
    return new THREE.CatmullRomCurve3(points, false, "centripetal");
  }

  function toothClass(index) {
    const centerDistance = Math.min(index, 15 - index);
    if (centerDistance <= 1) return "incisor";
    if (centerDistance === 2) return "incisor";
    if (centerDistance === 3) return "canine";
    if (centerDistance <= 5) return "premolar";
    return "molar";
  }

  function toothDimensions(index) {
    const type = toothClass(index);
    const sizes = {
      incisor:  [0.15, 0.175, 0.33],
      canine:   [0.155, 0.18, 0.38],
      premolar: [0.185, 0.215, 0.325],
      molar:    [0.23, 0.245, 0.30]
    };
    return { type, width: sizes[type][0], depth: sizes[type][1], height: sizes[type][2] };
  }

  function makeToothGeometry(dimensions, jaw) {
    const geometry = new THREE.SphereGeometry(1, 32, 24);
    const position = geometry.attributes.position;
    const kind = dimensions.type;
    for (let i = 0; i < position.count; i++) {
      let x = position.getX(i);
      let y = position.getY(i);
      let z = position.getZ(i);

      // Anatomical character: tapered cervical end, broader biting edge,
      // canines slightly sharper, molars subtly multi-cusped.
      const crown = jaw === "upper" ? -z : z;
      if (kind === "canine") {
        const taper = 1 - 0.17 * Math.max(0, crown);
        x *= taper;
        y *= taper;
      } else if (kind === "incisor") {
        x *= 1.04 - 0.07 * Math.max(0, crown);
        y *= 0.98;
      } else if (kind === "molar" && crown > 0.25) {
        const cusp = Math.cos(x * 8) * Math.cos(y * 7) * 0.045;
        z += (jaw === "upper" ? -1 : 1) * cusp;
      }
      position.setXYZ(i, x, y, z);
    }
    geometry.computeVertexNormals();
    geometry.scale(dimensions.width, dimensions.depth, dimensions.height);
    return geometry;
  }

  function createJaw(jaw) {
    const isUpper = jaw === "upper";
    const baseZ = isUpper ? 0.70 : -0.70;
    const crownZ = isUpper ? 0.40 : -0.40;
    const group = new THREE.Group();
    group.name = jaw + " dental stone cast";

    const archCurve = makeArchCurve(jaw, 2.02, 1.18, baseZ);
    const baseGeometry = new THREE.TubeGeometry(archCurve, 76, 0.38, 24, false);
    const base = new THREE.Mesh(baseGeometry, stoneMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const edgeCurve = makeArchCurve(jaw, 2.02, 1.18, baseZ + (isUpper ? 0.14 : -0.14));
    const edge = new THREE.Mesh(
      new THREE.TubeGeometry(edgeCurve, 76, 0.065, 12, false),
      stoneEdgeMaterial
    );
    edge.castShadow = true;
    group.add(edge);

    const toothNumbers = isUpper ? UPPER : LOWER;
    toothNumbers.forEach((number, index) => {
      const t = (index - 7.5) / 7.5;
      const theta = t * 1.36;
      const x = 2.02 * Math.sin(theta);
      const y = -1.18 * Math.cos(theta);
      const dims = toothDimensions(index);
      const root = new THREE.Group();
      root.position.set(x, y, crownZ);
      root.rotation.z = -theta * 0.42;
      root.userData.tooth = number;

      const toothGeometry = makeToothGeometry(dims, jaw);
      const enamel = new THREE.Mesh(toothGeometry, enamelMaterial);
      enamel.castShadow = true;
      enamel.receiveShadow = true;
      enamel.userData.tooth = number;
      root.add(enamel);

      const cap = new THREE.Mesh(toothGeometry.clone(), materialForMetal("gold14k"));
      cap.scale.set(1.035, 1.045, 1.025);
      cap.position.y = -0.012;
      cap.visible = false;
      cap.castShadow = true;
      cap.receiveShadow = true;
      cap.userData.tooth = number;
      root.add(cap);

      group.add(root);
      toothMeshes.push({
        number,
        jaw,
        index,
        type: dims.type,
        dimensions: dims,
        root,
        enamel,
        cap
      });
    });

    modelRoot.add(group);
  }

  function disposeChildMeshes(group) {
    const toRemove = [];
    group.traverse(function (child) {
      if (child !== group && child.isMesh && child.userData.designDetail) {
        if (child.geometry) child.geometry.dispose();
        toRemove.push(child);
      }
    });
    toRemove.forEach(function (child) { child.parent.remove(child); });
  }

  function addDesignDetails(item, config, metalMaterial) {
    const cap = item.cap;
    const dims = item.dimensions;
    const cuts = Array.isArray(config.cuts) ? config.cuts : [];
    const stoneType = config.stones || "none";
    const totalStoneCount = Math.max(0, Math.min(100, Number(config.stoneCount) || 0));
    const selected = toothMeshes.filter(function (entry) {
      return config.teeth && config.teeth.map(String).includes(entry.number);
    });
    const selectedIndex = selected.findIndex(function (entry) { return entry.number === item.number; });
    if (selectedIndex < 0) return;

    if (stoneType !== "none" && totalStoneCount > 0 && selected.length) {
      const baseCount = Math.floor(totalStoneCount / selected.length);
      const remainder = totalStoneCount % selected.length;
      const count = baseCount + (selectedIndex < remainder ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const across = count === 1 ? 0 : (i / (count - 1) - 0.5) * dims.width * 0.48;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.061, 1), gemMaterial);
        gem.position.set(across, -dims.depth * 0.49, dims.height * 0.06 + (i % 2 ? 0.035 : 0));
        gem.scale.set(0.88, 0.60, 1.0);
        gem.userData.designDetail = true;
        cap.add(gem);
      }
    }

    if (cuts.includes("diamondDust")) {
      for (let i = 0; i < 5; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), dustMaterial);
        dot.position.set((i - 2) * dims.width * 0.15, -dims.depth * 0.50, dims.height * 0.08);
        dot.userData.designDetail = true;
        cap.add(dot);
      }
    }

    if (cuts.includes("centerSplit")) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.018, dims.height * 0.58),
        grooveMaterial
      );
      line.position.set(0, -dims.depth * 0.51, 0);
      line.userData.designDetail = true;
      cap.add(line);
    }

    if (cuts.includes("deepBar")) {
      [-1, 1].forEach(function (side) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, 0.02, dims.height * 0.48),
          grooveMaterial
        );
        line.position.set(side * dims.width * 0.20, -dims.depth * 0.50, 0);
        line.userData.designDetail = true;
        cap.add(line);
      });
    }

    if (cuts.includes("openFace")) {
      const inset = new THREE.Mesh(
        new THREE.BoxGeometry(dims.width * 0.40, 0.018, dims.height * 0.24),
        grooveMaterial
      );
      inset.position.set(0, -dims.depth * 0.505, dims.height * 0.06);
      inset.userData.designDetail = true;
      cap.add(inset);
    }
  }

  function update(config) {
    lastConfig = config || {};
    const selected = new Set(Array.isArray(lastConfig.teeth) ? lastConfig.teeth.map(String) : []);
    const look = MATERIALS[lastConfig.metal] || MATERIALS.silver;
    const capMaterial = materialForMetal(lastConfig.metal);
    const selectedList = Array.from(selected);

    toothMeshes.forEach(function (item) {
      const isSelected = selected.has(item.number);
      item.cap.visible = isSelected;
      item.cap.material = capMaterial;
      item.cap.scale.set(1.035, 1.045, 1.025);
      disposeChildMeshes(item.cap);
      if (isSelected) {
        if (lastConfig.design === "fangs" && ["13","23","33","43"].includes(item.number)) {
          item.cap.scale.set(1.04, 1.06, 1.18);
        }
        addDesignDetails(item, lastConfig, capMaterial);
      }
    });

    const count = selectedList.length;
    const materialLabel = look.label;
    const statusText = count
      ? count + " selected tooth" + (count === 1 ? "" : "s") + " · " + materialLabel
      : "Select any tooth or combination to see your grill mockup";
    setStatus(statusText, false);

    const note = document.getElementById("grill3DMaterialNote");
    if (note) {
      note.textContent = lastConfig.metal === "quote"
        ? "Illustrative custom-metal appearance only. Exact alloy and final finish are confirmed in your custom quote."
        : "Live concept mockup · final crown contours and fit are confirmed from your approved mold.";
    }
    render();
  }

  function render() {
    if (renderer && scene && camera && !disposed) renderer.render(scene, camera);
  }

  function setView(view) {
    if (!camera || !controls) return;
    const views = {
      front:  { position: [0, -6.8, 2.0], target: [0, 0, 0] },
      top:    { position: [0, 0.1, 7.2], target: [0, 0, 0] },
      upper:  { position: [0, -2.7, 7.1], target: [0, 0, 0.28] },
      lower:  { position: [0, -2.7, -7.1], target: [0, 0, -0.28] }
    };
    const preset = views[view] || views.front;
    camera.position.set(preset.position[0], preset.position[1], preset.position[2]);
    controls.target.set(preset.target[0], preset.target[1], preset.target[2]);
    controls.update();
    viewButtons.forEach(function (button) {
      const active = button.getAttribute("data-grill-view") === view;
      button.setAttribute("aria-pressed", String(active));
    });
    render();
  }

  function handlePointerDown(event) {
    host.__grillPointerStart = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event) {
    const start = host.__grillPointerStart;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const candidates = [];
    toothMeshes.forEach(function (item) {
      candidates.push(item.enamel);
      if (item.cap.visible) candidates.push(item.cap);
    });
    const hit = raycaster.intersectObjects(candidates, false)[0];
    if (!hit || !hit.object.userData.tooth) return;
    if (typeof window.MrSprinkleGrillSelectTooth === "function") {
      window.MrSprinkleGrillSelectTooth(String(hit.object.userData.tooth));
    }
  }

  function init() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
      renderer.setSize(host.clientWidth || 640, host.clientHeight || 390, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
 
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", "Interactive 3D dental stone model with selected grillz crowns");
      host.replaceChildren(renderer.domElement);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x171716);

      camera = new THREE.PerspectiveCamera(34, Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight), 0.1, 100);
      camera.position.set(0, -6.8, 2.0);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const environment = new RoomEnvironment();
      scene.environment = pmremGenerator.fromScene(environment, 0.04).texture;
      pmremGenerator.dispose();

      scene.add(new THREE.HemisphereLight(0xffffff, 0x6a6256, 2.1));

      const key = new THREE.DirectionalLight(0xfff1d7, 3.4);
      key.position.set(-3.8, -4.5, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xd8e5ff, 1.7);
      fill.position.set(4, -1.5, 2.8);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 2.0);
      rim.position.set(0, 4.5, 4.4);
      scene.add(rim);

      modelRoot = new THREE.Group();
      scene.add(modelRoot);
      createJaw("upper");
      createJaw("lower");

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(5, 64),
        new THREE.MeshStandardMaterial({ color: 0x171716, roughness: 0.92 })
      );
      floor.rotation.x = 0;
      floor.position.z = -1.25;
      floor.receiveShadow = true;
      scene.add(floor);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.enablePan = false;
      controls.minDistance = 4.8;
      controls.maxDistance = 12;
      controls.minPolarAngle = 0.15;
      controls.maxPolarAngle = Math.PI - 0.15;
      controls.target.set(0, 0, 0);
      controls.addEventListener("change", render);

      renderer.domElement.addEventListener("pointerdown", handlePointerDown);
      renderer.domElement.addEventListener("pointerup", handlePointerUp);

      viewButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          setView(button.getAttribute("data-grill-view"));
        });
      });

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(function () {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          render();
        });
        resizeObserver.observe(host);
      } else {
        window.addEventListener("resize", function () {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          render();
        });
      }

      window.MrSprinkleGrill3D = Object.freeze({ update, setView });
      window.addEventListener("mr-sprinkle:grill-config", function (event) {
        if (event.detail) update(event.detail);
      });
      host.dataset.ready = "true";
      host.setAttribute("aria-label", "Interactive three-dimensional grillz mockup");
      const fallback = document.getElementById("designPreview");
      if (fallback) fallback.hidden = true;
      setStatus("Drag to rotate · scroll to zoom · select teeth in the model or arch chart", false);
      setView("front");
      if (window.__MrSprinkleGrillConfig) update(window.__MrSprinkleGrillConfig);
      window.dispatchEvent(new CustomEvent("mr-sprinkle:grill-renderer-ready"));
    } catch (error) {
      console.error("Sprinkle Studio 3D failed to initialize:", error);
      host.dataset.ready = "false";
      host.replaceChildren();
      setStatus("3D preview is unavailable in this browser. The flat design diagram remains available below.", true);
      const fallback = document.getElementById("designPreview");
      if (fallback) fallback.hidden = false;
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") render();
  });

  init();
})();
