/*
 * Mr. Sprinkle Sprinkle Studio 3D
 * Proprietary, parametric dental-cast and grillz mockup renderer.
 * Three.js is pinned in pricing.html; all dental geometry and design logic are ours.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

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
  let renderer, scene, camera, modelRoot, pmrem;
  let lastConfig = null;
  let resizeObserver = null;
  let disposed = false;
  const toothMeshes = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

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
  const STONE_FINISHES = {
    natural:         { color: 0xf4f8ff, roughness: 0.018, transmission: 0.52, ior: 2.42, envMapIntensity: 2.2 },
    labGrownDiamond: { color: 0xf4faff, roughness: 0.022, transmission: 0.50, ior: 2.42, envMapIntensity: 2.15 },
    vvsMoissanite:   { color: 0xeaf4ff, roughness: 0.025, transmission: 0.40, ior: 2.55, envMapIntensity: 2.3 },
    cubicZirconia:   { color: 0xfff2dc, roughness: 0.075, transmission: 0.24, ior: 2.15, envMapIntensity: 1.55 }
  };
  const stoneMaterialCache = new Map();

  function materialForStone(type, color) {
    const key = STONE_FINISHES[type] ? type : "natural";
    const finish = STONE_FINISHES[key];
    const colorValue = /^#[0-9a-f]{6}$/i.test(String(color || "")) ? String(color) : "#" + finish.color.toString(16).padStart(6, "0");
    const cacheKey = key + "|" + colorValue.toLowerCase();
    if (stoneMaterialCache.has(cacheKey)) return stoneMaterialCache.get(cacheKey);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorValue),
      roughness: finish.roughness,
      metalness: 0.02,
      transmission: finish.transmission,
      thickness: 0.26,
      ior: finish.ior,
      clearcoat: 1,
      clearcoatRoughness: 0.012,
      envMapIntensity: finish.envMapIntensity
    });
    stoneMaterialCache.set(cacheKey, material);
    return material;
  }

  const gumMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb85161, roughness: 0.38, metalness: 0,
    clearcoat: 0.46, clearcoatRoughness: 0.22
  });
  const gumHighlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xe18d91, roughness: 0.42, metalness: 0
  });
  const lipMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xa83f50, roughness: 0.31, metalness: 0,
    clearcoat: 0.62, clearcoatRoughness: 0.18
  });
  const lipHighlightMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd47a83, roughness: 0.29, metalness: 0,
    clearcoat: 0.74, clearcoatRoughness: 0.16
  });
  const mouthInteriorMaterial = new THREE.MeshStandardMaterial({
    color: 0x17080d, roughness: 0.92, metalness: 0
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
    if (centerDistance <= 2) return "molar";
    if (centerDistance <= 4) return "premolar";
    if (centerDistance === 5) return "canine";
    return "incisor";
  }

  function toothDimensions(index) {
    const centerDistance = Math.min(index, 15 - index);
    const type = toothClass(index);
    const sizes = {
      incisor:  [centerDistance === 7 ? 0.165 : 0.142, 0.145, centerDistance === 7 ? 0.39 : 0.35],
      canine:   [0.158, 0.158, 0.43],
      premolar: [centerDistance === 4 ? 0.175 : 0.182, 0.174, centerDistance === 4 ? 0.33 : 0.32],
      molar:    [centerDistance === 0 ? 0.205 : centerDistance === 1 ? 0.222 : 0.235, 0.213, centerDistance === 0 ? 0.27 : 0.30]
    };
    return { type, width: sizes[type][0], depth: sizes[type][1], height: sizes[type][2], centerDistance };
  }

  function gaussian(x, y, cx, cy, spread) {
    const dx = (x - cx) / spread;
    const dy = (y - cy) / spread;
    return Math.exp(-(dx * dx + dy * dy) * 1.4);
  }

  function cuspProfile(type, x, y) {
    if (type === "canine") return gaussian(x, y, 0, -0.06, 0.43);
    if (type === "premolar") {
      return Math.max(gaussian(x, y, -0.02, -0.48, 0.36), gaussian(x, y, -0.02, 0.48, 0.36));
    }
    if (type === "molar") {
      return Math.max(
        gaussian(x, y, -0.44, -0.43, 0.34),
        gaussian(x, y,  0.44, -0.43, 0.34),
        gaussian(x, y, -0.44,  0.43, 0.34),
        gaussian(x, y,  0.44,  0.43, 0.34)
      );
    }
    return 0.16 * (1 - x * x);
  }

  function makeToothGeometry(dimensions, jaw) {
    // Lofted, tooth-specific crown geometry: tapered cervical neck,
    // individual crown proportions, rounded incisal edges and natural cusps.
    const geometry = new THREE.BufferGeometry();
    const kind = dimensions.type;
    const sign = jaw === "upper" ? -1 : 1;
    const profile = {
      incisor: [
        [0.00,0.60,0.66],[0.08,0.76,0.79],[0.22,0.91,0.93],
        [0.48,1.00,1.00],[0.70,1.00,0.99],[0.88,0.96,0.94],[1.00,0.82,0.86]
      ],
      canine: [
        [0.00,0.58,0.64],[0.10,0.75,0.80],[0.26,0.92,0.95],
        [0.52,1.00,1.00],[0.76,0.91,0.94],[0.92,0.70,0.76],[1.00,0.20,0.26]
      ],
      premolar: [
        [0.00,0.62,0.66],[0.10,0.79,0.81],[0.26,0.94,0.95],
        [0.52,1.00,1.00],[0.76,0.97,0.97],[0.90,0.86,0.89],[1.00,0.70,0.75]
      ],
      molar: [
        [0.00,0.64,0.66],[0.10,0.80,0.81],[0.28,0.96,0.96],
        [0.56,1.00,1.00],[0.78,0.98,0.98],[0.92,0.91,0.92],[1.00,0.80,0.82]
      ]
    }[kind];
    const segments = 40;
    const positions = [];
    const indices = [];

    profile.forEach(function (level) {
      const fraction = level[0];
      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment / segments) * Math.PI * 2;
        const nx = Math.cos(angle);
        const ny = Math.sin(angle);
        const x = nx * dimensions.width * level[1];
        const y = ny * dimensions.depth * level[2];
        const cusp = cuspProfile(kind, nx, ny);
        const blend = Math.max(0, Math.min(1, (fraction - 0.70) / 0.30));
        const crownZ = dimensions.height * fraction + dimensions.height * 0.095 * cusp * blend;
        positions.push(x, y, sign * crownZ);
      }
    });

    const ringCount = profile.length;
    for (let ring = 0; ring < ringCount - 1; ring++) {
      for (let segment = 0; segment < segments; segment++) {
        const next = (segment + 1) % segments;
        const a = ring * segments + segment;
        const b = ring * segments + next;
        const c = (ring + 1) * segments + next;
        const d = (ring + 1) * segments + segment;
        if (sign > 0) indices.push(a,b,d,b,c,d);
        else indices.push(a,d,b,b,d,c);
      }
    }

    const lowerCenter = positions.length / 3;
    positions.push(0,0,0);
    const upperCenter = positions.length / 3;
    positions.push(0,0,sign * dimensions.height * 1.035);
    const topStart = (ringCount - 1) * segments;
    for (let segment = 0; segment < segments; segment++) {
      const next = (segment + 1) % segments;
      if (sign > 0) {
        indices.push(lowerCenter,next,segment,upperCenter,topStart + segment,topStart + next);
      } else {
        indices.push(lowerCenter,segment,next,upperCenter,topStart + next,topStart + segment);
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }

  function createMouthFrame() {
    const cavity = new THREE.Shape();
    cavity.absellipse(0, 0, 2.12, 0.86, 0, Math.PI * 2, false, 0);
    const mouth = new THREE.Mesh(new THREE.ShapeGeometry(cavity, 72), mouthInteriorMaterial);
    mouth.rotation.x = Math.PI / 2;
    mouth.position.set(0, -0.88, 0);
    modelRoot.add(mouth);

    // The upper and lower lip are one continuous soft oval rim around the smile.
    const lipRim = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.145, 24, 112), lipMaterial);
    lipRim.rotation.x = Math.PI / 2;
    lipRim.scale.set(1.08, 0.47, 1);
    lipRim.position.set(0, -1.49, 0);
    lipRim.castShadow = true;
    modelRoot.add(lipRim);

    const lipHighlight = new THREE.Mesh(new THREE.TorusGeometry(1.91, 0.045, 12, 112), lipHighlightMaterial);
    lipHighlight.rotation.x = Math.PI / 2;
    lipHighlight.scale.set(1.08, 0.47, 1);
    lipHighlight.position.set(0, -1.515, 0);
    modelRoot.add(lipHighlight);

    // Soft mouth corners add depth without distracting from the tooth design.
    [-1, 1].forEach(function (side) {
      const corner = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 14), lipMaterial);
      corner.scale.set(1.35, 0.55, 0.78);
      corner.position.set(side * 1.93, -1.48, 0);
      modelRoot.add(corner);
    });
  }

  function createJaw(jaw) {
    const isUpper = jaw === "upper";
    const crownZ = isUpper ? 0.40 : -0.40;
    const group = new THREE.Group();
    group.name = jaw + " anatomical gum arch";

    const archCurve = makeArchCurve(jaw, 2.02, 1.18, crownZ);
    const gumBand = new THREE.Mesh(
      new THREE.TubeGeometry(archCurve, 88, 0.19, 28, false),
      gumMaterial
    );
    gumBand.castShadow = true;
    gumBand.receiveShadow = true;
    group.add(gumBand);

    const gumLineCurve = makeArchCurve(jaw, 2.02, 1.18, crownZ + (isUpper ? -0.12 : 0.12));
    const gumLine = new THREE.Mesh(
      new THREE.TubeGeometry(gumLineCurve, 88, 0.035, 12, false),
      gumHighlightMaterial
    );
    group.add(gumLine);

    const toothNumbers = isUpper ? UPPER : LOWER;
    toothNumbers.forEach((number, index) => {
      const t = (index - 7.5) / 7.5;
      const theta = t * 1.36;
      const x = 2.02 * Math.sin(theta);
      const y = -1.18 * Math.cos(theta);
      const dims = toothDimensions(index);
      const root = new THREE.Group();
      root.position.set(x, y, crownZ);
      root.rotation.z = theta * 0.48;
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
    const stoneProfiles = config.stoneProfiles && typeof config.stoneProfiles === "object" ? config.stoneProfiles : {};
    const profile = stoneProfiles[item.number] || {};
    const stoneType = profile.manual ? profile.type : (config.stones || "none");
    const stoneColor = profile.color || "#f4f8ff";
    const stoneShape = profile.manual ? (profile.shape || config.stoneShape || "round") : (config.stoneShape || "round");
    const stoneMaterial = materialForStone(stoneType, stoneColor);
    const totalStoneCount = Math.max(0, Math.min(100, Number(config.stoneCount) || 0));
    const selected = toothMeshes.filter(function (entry) {
      return config.teeth && config.teeth.map(String).includes(entry.number);
    });
    const selectedIndex = selected.findIndex(function (entry) { return entry.number === item.number; });
    if (selectedIndex < 0) return;

    const stoneTargets = Array.isArray(config.stoneTeeth) ? config.stoneTeeth.map(String) : selected.map(entry => entry.number);
    const placements = config.stoneLayout && typeof config.stoneLayout === "object" ? config.stoneLayout : {};
    const targetCells = stoneTargets.includes(item.number) && Array.isArray(placements[item.number])
      ? placements[item.number].map(Number).filter(cell => Number.isInteger(cell) && cell >= 0 && cell < 25)
      : [];
    if (stoneType !== "none" && totalStoneCount > 0 && targetCells.length) {
      const stoneDiameter = ({ "1.3": 0.047, "1.5": 0.055, "2.0": 0.073, "3.0": 0.108 })[String(config.size)] || 0.055;
      targetCells.forEach(function (cell) {
        const column = cell % 5;
        const row = Math.floor(cell / 5);
        const x = ((column - 2) / 2) * dims.width * 0.72;
        const z = ((2 - row) / 2) * dims.height * 0.60 + dims.height * 0.045;
        const surfaceRatio = Math.min(0.92,
          (x * x) / (dims.width * dims.width * 1.02) +
          (z * z) / (dims.height * dims.height * 1.02));
        const frontSurface = -dims.depth * Math.sqrt(1 - surfaceRatio) * 1.015;
        const fitDiameter = Math.min(stoneDiameter, dims.width * 0.72, dims.height * 0.52);
        const shape = stoneShape === "square"
          ? new RoundedBoxGeometry(fitDiameter, Math.max(0.014, fitDiameter * 0.28), fitDiameter, 2, fitDiameter * 0.12)
          : new THREE.OctahedronGeometry(fitDiameter * 0.56, 1);
        const gem = new THREE.Mesh(shape, stoneMaterial);
        gem.position.set(x, frontSurface - 0.009, z);
        if (config.stoneShape !== "square") gem.scale.set(1, 0.48, 1);
        gem.userData.designDetail = true;
        gem.userData.stoneCell = cell;
        cap.add(gem);
      });
    }

    if (cuts.includes("diamondDust")) {
      for (let i = 0; i < 5; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), dustMaterial);
        dot.position.set((i - 2) * dims.width * 0.15, -dims.depth * 1.055, dims.height * 0.08);
        dot.userData.designDetail = true;
        cap.add(dot);
      }
    }

    if (cuts.includes("centerSplit")) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.018, dims.height * 0.58),
        grooveMaterial
      );
      line.position.set(0, -dims.depth * 1.06, 0);
      line.userData.designDetail = true;
      cap.add(line);
    }

    if (cuts.includes("deepBar")) {
      [-1, 1].forEach(function (side) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, 0.02, dims.height * 0.48),
          grooveMaterial
        );
        line.position.set(side * dims.width * 0.20, -dims.depth * 1.06, 0);
        line.userData.designDetail = true;
        cap.add(line);
      });
    }

    if (cuts.includes("openFace")) {
      const inset = new THREE.Mesh(
        new THREE.BoxGeometry(dims.width * 0.40, 0.018, dims.height * 0.24),
        grooveMaterial
      );
      inset.position.set(0, -dims.depth * 1.06, dims.height * 0.06);
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
      const stoneNote = lastConfig.stones && lastConfig.stones !== "none" && Number(lastConfig.stoneCount) > 0
        ? " The exact tooth-by-tooth stone layout is shown in this preview. Final setting, clearances and fit are verified against your approved mold."
        : "";
      note.textContent = (lastConfig.metal === "quote"
        ? "Illustrative custom-metal appearance only. Exact alloy and final finish are confirmed in your custom quote."
        : "Live concept mockup · final crown contours and fit are confirmed from your approved mold.") + stoneNote;
    }
    render();
  }

  function render() {
    if (renderer && scene && camera && !disposed) renderer.render(scene, camera);
  }

  function setFrontCamera() {
    if (!camera) return;
    camera.up.set(0, 0, 1);
    camera.position.set(0, -8.1, 0.02);
    camera.lookAt(0, -0.88, 0);
    camera.updateProjectionMatrix();
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
    const toothNumber = String(hit.object.userData.tooth);
    if (window.MrSprinkleGrillEditMode === "stones" && typeof window.MrSprinkleGrillSelectStoneTooth === "function") {
      window.MrSprinkleGrillSelectStoneTooth(toothNumber);
    } else if (typeof window.MrSprinkleGrillSelectTooth === "function") {
      window.MrSprinkleGrillSelectTooth(toothNumber);
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
      scene.background = new THREE.Color(0x080d10);

      camera = new THREE.PerspectiveCamera(27, Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight), 0.1, 100);
      camera.position.set(0, -8.1, 0.02);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const environment = new RoomEnvironment();
      scene.environment = pmremGenerator.fromScene(environment, 0.04).texture;
      pmremGenerator.dispose();

      scene.add(new THREE.HemisphereLight(0xfff1e8, 0x382c31, 2.35));

      const key = new THREE.DirectionalLight(0xffe5c1, 3.7);
      key.position.set(-3.8, -4.5, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xa9e7e5, 2.0);
      fill.position.set(4, -1.5, 2.8);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 2.0);
      rim.position.set(0, 4.5, 4.4);
      scene.add(rim);

      modelRoot = new THREE.Group();
      scene.add(modelRoot);
      createMouthFrame();
      createJaw("upper");
      createJaw("lower");

      const frontFill = new THREE.DirectionalLight(0xffffff, 2.25);
      frontFill.position.set(0, -5, 0.2);
      scene.add(frontFill);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(5, 64),
        new THREE.MeshStandardMaterial({ color: 0x080d10, roughness: 0.92 })
      );
      floor.rotation.x = 0;
      floor.position.z = -1.55;
      floor.receiveShadow = true;
      scene.add(floor);

      setFrontCamera();
      renderer.setAnimationLoop(function () {
        if (disposed) return;
        renderer.render(scene, camera);
      });

      renderer.domElement.addEventListener("pointerdown", handlePointerDown);
      renderer.domElement.addEventListener("pointerup", handlePointerUp);

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

      window.MrSprinkleGrill3D = Object.freeze({ update });
      window.addEventListener("mr-sprinkle:grill-config", function (event) {
        if (event.detail) update(event.detail);
      });
      host.dataset.ready = "true";
      host.setAttribute("aria-label", "Fixed front-facing three-dimensional mouth and grillz mockup");
      const fallback = document.getElementById("designPreview");
      if (fallback) fallback.hidden = true;
      setStatus("Fixed front view · tap a tooth to select it or choose stone placement mode", false);
      setFrontCamera();
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
