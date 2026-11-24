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

  let referenceSampleImage = null;
  let referenceSampleHits = null;
  let referenceSampleReady = false;
  let isReferenceSampleMode = true;
  const referenceSampleToothHits = Object.create(null);

  // The supplied reference photo is a design reference only. Never place it over
  // the interactive renderer: customers must always see the live 3D mouth model.
  function setReferenceSampleVisible() {
    if (referenceSampleImage) referenceSampleImage.style.display = "none";
    if (referenceSampleHits) referenceSampleHits.style.display = "none";
    if (renderer && renderer.domElement) renderer.domElement.style.opacity = "1";
    if (host) host.dataset.referenceSample = "false";
  }

  function syncReferenceSampleSelection(selected) {
    Object.keys(referenceSampleToothHits).forEach(function (number) {
      const hit = referenceSampleToothHits[number];
      const active = selected.has(number);
      hit.dataset.selected = active ? "true" : "false";
      hit.style.borderColor = active ? "rgba(0,188,212,.98)" : "rgba(220,210,190,.18)";
      hit.style.background = active ? "rgba(0,188,212,.08)" : "rgba(0,0,0,.34)";
      hit.style.boxShadow = active ? "inset 0 0 0 1px rgba(0,188,212,.25), 0 0 12px rgba(0,188,212,.18)" : "none";
      hit.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function buildReferenceSampleLayer() {
    // Keep the renderer full-size and visible. Do not fetch or overlay the
    // supplied reference photo; all tooth selection and rendering is genuine 3D.
    host.style.position = "relative";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.opacity = "1";
    renderer.domElement.style.transition = "none";
    host.dataset.referenceSample = "false";
    referenceSampleReady = false;
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
    color: 0x9b4a55, roughness: 0.31, metalness: 0,
    clearcoat: 0.46, clearcoatRoughness: 0.22
  });
  const gumHighlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xc87983, roughness: 0.34, metalness: 0
  });
  const castMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe9e3d5, roughness: 0.72, metalness: 0.015,
    clearcoat: 0.12, clearcoatRoughness: 0.38
  });
  const castEdgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xcfc6b4, roughness: 0.76, metalness: 0.01
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
    // The arch is ordered from the back molars toward the midline and back
    // out again. Distance 7 is the central incisor; distance 0 is the last molar.
    const centerDistance = Math.min(index, 15 - index);
    if (centerDistance >= 6) return "incisor";
    if (centerDistance === 5) return "canine";
    if (centerDistance >= 3) return "premolar";
    return "molar";
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
    for (let segment = 0; segment < segments; segment++) {
      const next = (segment + 1) % segments;
      if (sign > 0) indices.push(lowerCenter, next, segment);
      else indices.push(lowerCenter, segment, next);
    }

    // Build a contoured occlusal/incisal surface instead of closing the crown
    // with a flat fan. Intermediate polar rings carry the same cusp profile as
    // the crown wall, creating smooth incisor edges, canine tips, paired
    // premolar cusps and four-cusp molar tables while retaining one tooth mesh.
    const topProfile = profile[profile.length - 1];
    const topRings = [];
    [0.25, 0.50, 0.75].forEach(function (radial) {
      const start = positions.length / 3;
      topRings.push(start);
      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment / segments) * Math.PI * 2;
        const nx = Math.cos(angle);
        const ny = Math.sin(angle);
        const x = nx * dimensions.width * topProfile[1] * radial;
        const y = ny * dimensions.depth * topProfile[2] * radial;
        const cusp = cuspProfile(kind, nx, ny);
        const z = sign * dimensions.height * (1 + 0.095 * cusp);
        positions.push(x, y, z);
      }
    });

    const topCenter = positions.length / 3;
    positions.push(0, 0, sign * dimensions.height * (1 + 0.095 * cuspProfile(kind, 0, 0)));
    const topStart = (ringCount - 1) * segments;

    // Fan from the crown center to the innermost contour ring.
    const innerStart = topRings[0];
    for (let segment = 0; segment < segments; segment++) {
      const next = (segment + 1) % segments;
      if (sign > 0) indices.push(topCenter, innerStart + segment, innerStart + next);
      else indices.push(topCenter, innerStart + next, innerStart + segment);
    }

    // Join each contoured ring and the original crown perimeter with consistent
    // winding so the upper and lower arches have outward-facing normals.
    const connectedRings = topRings.concat([topStart]);
    for (let ring = 0; ring < connectedRings.length - 1; ring++) {
      const currentStart = connectedRings[ring];
      const nextStart = connectedRings[ring + 1];
      for (let segment = 0; segment < segments; segment++) {
        const next = (segment + 1) % segments;
        const a = currentStart + segment;
        const b = currentStart + next;
        const c = nextStart + next;
        const d = nextStart + segment;
        if (sign > 0) indices.push(a, b, d, b, c, d);
        else indices.push(a, d, b, b, d, c);
      }
    }

    // Preserve a closed cervical base without changing the crown's tooth ID.

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }

  const oralCavityMaterial = new THREE.MeshBasicMaterial({
    color: 0x16090b,
    side: THREE.DoubleSide,
    depthWrite: true
  });
  const upperLipMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x68333a,
    roughness: 0.245,
    metalness: 0,
    clearcoat: 0.92,
    clearcoatRoughness: 0.14,
    sheen: 0.42,
    sheenColor: 0x9f5158
  });
  const lowerLipMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x82404a,
    roughness: 0.225,
    metalness: 0,
    clearcoat: 0.96,
    clearcoatRoughness: 0.12,
    sheen: 0.5,
    sheenColor: 0xc16a72
  });
  const lipInnerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc56d76,
    roughness: 0.24,
    metalness: 0,
    clearcoat: 0.82,
    clearcoatRoughness: 0.12
  });

  function makeLipGeometry(isUpper) {
    const width = 2.13;
    const columns = 88;
    const rows = 14;
    const positions = [];
    const indices = [];

    for (let row = 0; row <= rows; row++) {
      const t = row / rows;
      for (let column = 0; column <= columns; column++) {
        const u = (column / columns) * 2 - 1;
        const x = u * width;
        const taper = Math.pow(Math.max(0.0005, 1 - u * u), 0.43);
        const theta = Math.asin(Math.max(-0.995, Math.min(0.995, x / 2.08)));
        const archY = -1.18 * Math.cos(theta);

        let outerZ;
        let innerZ;
        if (isUpper) {
          const cupidPeaks = 0.105 * Math.exp(-Math.pow((Math.abs(u) - 0.19) / 0.105, 2));
          const cupidDip = 0.052 * Math.exp(-Math.pow(u / 0.075, 2));
          outerZ = 1.15 * taper + cupidPeaks - cupidDip;
          innerZ = 0.84 * taper;
        } else {
          innerZ = -0.84 * taper;
          outerZ = -1.22 * taper;
        }
        const z = outerZ + (innerZ - outerZ) * t;
        const fullness = Math.sin(Math.PI * t) * taper;
        const lipBulge = (isUpper ? 0.045 : 0.060) * fullness;
        const y = archY - 0.205 - lipBulge - 0.018 * taper;
        positions.push(x, y, z);
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const a = row * (columns + 1) + column;
        const b = a + 1;
        const c = b + columns + 1;
        const d = a + columns + 1;
        indices.push(a, b, d, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function createOralCavity() {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 2.12, 0.82, 0, Math.PI * 2, false, 0);
    const geometry = new THREE.ShapeGeometry(shape, 88);
    geometry.rotateX(Math.PI / 2);
    const cavity = new THREE.Mesh(geometry, oralCavityMaterial);
    cavity.position.set(0, -1.055, 0);
    cavity.name = "dark oral cavity behind the teeth";
    modelRoot.add(cavity);
  }

  function createSmileLips() {
    const upperGeometry = makeLipGeometry(true);
    const lowerGeometry = makeLipGeometry(false);
    const upper = new THREE.Mesh(upperGeometry, upperLipMaterial);
    const lower = new THREE.Mesh(lowerGeometry, lowerLipMaterial);
    upper.name = "sculpted upper lip";
    lower.name = "sculpted lower lip";
    upper.castShadow = true;
    lower.castShadow = true;
    upper.receiveShadow = true;
    lower.receiveShadow = true;
    modelRoot.add(upper, lower);

    [-1, 1].forEach(function (side) {
      const corner = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), upperLipMaterial);
      corner.scale.set(1.32, 0.68, 0.82);
      corner.position.set(side * 2.01, -0.39, -0.005);
      corner.name = "mouth corner";
      modelRoot.add(corner);
    });

    const upperWetlinePoints = [];
    const lowerWetlinePoints = [];
    for (let i = 0; i <= 88; i++) {
      const u = (i / 88) * 2 - 1;
      const x = u * 2.13;
      const taper = Math.pow(Math.max(0.0005, 1 - u * u), 0.43);
      const theta = Math.asin(Math.max(-0.995, Math.min(0.995, x / 2.08)));
      const y = -1.18 * Math.cos(theta) - 0.215;
      upperWetlinePoints.push(new THREE.Vector3(x, y - 0.012, 0.84 * taper));
      lowerWetlinePoints.push(new THREE.Vector3(x, y - 0.018, -0.84 * taper));
    }
    const upperWetline = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(upperWetlinePoints), 100, 0.022, 8, false),
      lipInnerMaterial
    );
    const lowerWetline = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lowerWetlinePoints), 100, 0.026, 8, false),
      lipInnerMaterial
    );
    upperWetline.name = "upper wet lip line";
    lowerWetline.name = "lower wet lip line";
    modelRoot.add(upperWetline, lowerWetline);
  }

  function createJaw(jaw) {
    const isUpper = jaw === "upper";
    const crownZ = isUpper ? 0.45 : -0.45;
    const group = new THREE.Group();
    group.name = jaw + " open dental-model gum arch";

    const archCurve = makeArchCurve(jaw, 2.02, 1.18, crownZ);
    const gumBand = new THREE.Mesh(
      new THREE.TubeGeometry(archCurve, 88, 0.125, 32, false),
      gumMaterial
    );
    gumBand.castShadow = true;
    gumBand.receiveShadow = true;
    group.add(gumBand);

    const gumLineCurve = makeArchCurve(jaw, 2.02, 1.18, crownZ + (isUpper ? -0.12 : 0.12));
    const gumLine = new THREE.Mesh(
      new THREE.TubeGeometry(gumLineCurve, 88, 0.022, 12, false),
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

  function crownRadiiAt(type, fraction) {
    const profile = {
      incisor: [[0.00,0.60,0.66],[0.08,0.76,0.79],[0.22,0.91,0.93],[0.48,1.00,1.00],[0.70,1.00,0.99],[0.88,0.96,0.94],[1.00,0.82,0.86]],
      canine: [[0.00,0.58,0.64],[0.10,0.75,0.80],[0.26,0.92,0.95],[0.52,1.00,1.00],[0.76,0.91,0.94],[0.92,0.70,0.76],[1.00,0.20,0.26]],
      premolar: [[0.00,0.62,0.66],[0.10,0.79,0.81],[0.26,0.94,0.95],[0.52,1.00,1.00],[0.76,0.97,0.97],[0.90,0.86,0.89],[1.00,0.70,0.75]],
      molar: [[0.00,0.64,0.66],[0.10,0.80,0.81],[0.28,0.96,0.96],[0.56,1.00,1.00],[0.78,0.98,0.98],[0.92,0.91,0.92],[1.00,0.80,0.82]]
    }[type] || [[0,0.62,0.66],[0.5,1,1],[1,0.82,0.86]];
    const f = Math.max(0, Math.min(1, fraction));
    for (let i = 0; i < profile.length - 1; i++) {
      const a = profile[i], b = profile[i + 1];
      if (f < a[0] || f > b[0]) continue;
      const t = (f - a[0]) / Math.max(0.0001, b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    return [profile[profile.length - 1][1], profile[profile.length - 1][2]];
  }

  // Returns the actual front-facing Y coordinate of the tooth-specific loft,
  // not an unrelated flat/ellipsoid approximation. The sign of Z follows
  // upper/lower crown orientation so placements remain on both arches.
  function crownFrontSurfaceY(dimensions, jaw, x, signedZ) {
    const targetZ = Math.abs(signedZ);
    let low = 0;
    let high = 1;
    let fraction = targetZ / Math.max(0.001, dimensions.height);

    for (let i = 0; i < 24; i++) {
      fraction = (low + high) * 0.5;
      const radii = crownRadiiAt(dimensions.type, fraction);
      const nx = Math.max(-0.995, Math.min(0.995, x / (dimensions.width * radii[0])));
      const ny = -Math.sqrt(Math.max(0.0001, 1 - nx * nx));
      const cusp = cuspProfile(dimensions.type, nx, ny);
      const blend = Math.max(0, Math.min(1, (fraction - 0.70) / 0.30));
      const actualZ = dimensions.height * fraction + dimensions.height * 0.095 * cusp * blend;
      if (actualZ < targetZ) low = fraction;
      else high = fraction;
    }

    fraction = (low + high) * 0.5;
    const radii = crownRadiiAt(dimensions.type, fraction);
    const nx = Math.max(-0.995, Math.min(0.995, x / (dimensions.width * radii[0])));
    const ny = -Math.sqrt(Math.max(0.0001, 1 - nx * nx));
    return ny * dimensions.depth * radii[1];
  }

  function capLocalPoint(cap, x, y, z) {
    return new THREE.Vector3(
      x / cap.scale.x,
      (y - cap.position.y) / cap.scale.y,
      z / cap.scale.z
    );
  }

  // A faceted brilliant-cut stone with a flat table, crown facets and pavilion.
  // Its table faces the viewer (negative Y in this model's local coordinates).
  function makeBrilliantCutGeometry(diameter) {
    const r = diameter * 0.5;
    const segments = 8;
    const vertices = [];
    const indices = [];
    const rings = [
      { radius: r * 0.48, y: -diameter * 0.48, offset: 0 },
      { radius: r,        y: -diameter * 0.16, offset: Math.PI / segments },
      { radius: r * 0.91, y:  diameter * 0.08, offset: 0 },
      { radius: r * 0.34, y:  diameter * 0.36, offset: Math.PI / segments }
    ];
    rings.forEach(function (ring) {
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2 + ring.offset;
        vertices.push(Math.cos(a) * ring.radius, ring.y, Math.sin(a) * ring.radius);
      }
    });
    const tableCenter = vertices.length / 3;
    vertices.push(0, -diameter * 0.53, 0);
    const culet = vertices.length / 3;
    vertices.push(0, diameter * 0.46, 0);
    for (let i = 0; i < segments; i++) {
      const n = (i + 1) % segments;
      indices.push(tableCenter, n, i);
      for (let ring = 0; ring < rings.length - 1; ring++) {
        const a = ring * segments + i;
        const b = ring * segments + n;
        const c = (ring + 1) * segments + n;
        const d = (ring + 1) * segments + i;
        indices.push(a, b, d, b, c, d);
      }
      const a = (rings.length - 1) * segments + i;
      const b = (rings.length - 1) * segments + n;
      indices.push(a, b, culet);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  const prongMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe2e5e9, metalness: 0.96, roughness: 0.16,
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.8
  });

  function addEnamelOverlay(item, profile) {
    if (!profile || !/^#[0-9a-f]{6}$/i.test(String(profile.color || ""))) return;
    const cap = item.cap;
    const dims = item.dimensions;
    const sign = item.jaw === "upper" ? -1 : 1;
    const rows = 8;
    const columns = 8;
    const positions = [];
    const indices = [];

    for (let row = 0; row <= rows; row++) {
      const toothFraction = 0.24 + (row / rows) * 0.50;
      const z = sign * dims.height * toothFraction;
      for (let col = 0; col <= columns; col++) {
        const x = ((col / columns) * 2 - 1) * dims.width * 0.54;
        const y = crownFrontSurfaceY(dims, item.jaw, x, z) - 0.004;
        const point = capLocalPoint(cap, x * cap.scale.x, cap.position.y + y * cap.scale.y, z * cap.scale.z);
        positions.push(point.x, point.y, point.z);
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const a = row * (columns + 1) + col;
        const b = a + 1;
        const c = b + columns + 1;
        const d = a + columns + 1;
        indices.push(a, b, d, b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(profile.color),
      roughness: 0.19,
      metalness: 0.035,
      clearcoat: 0.72,
      clearcoatRoughness: 0.13,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const overlay = new THREE.Mesh(geometry, material);
    overlay.userData.designDetail = true;
    overlay.userData.enamelOverlay = true;
    cap.add(overlay);
  }

  function addDesignDetails(item, config, metalMaterial) {
    const cap = item.cap;
    const dims = item.dimensions;
    const cuts = Array.isArray(config.cuts) ? config.cuts : [];
    const stoneProfiles = config.stoneProfiles && typeof config.stoneProfiles === "object" ? config.stoneProfiles : {};
    const enamelProfiles = config.enamelProfiles && typeof config.enamelProfiles === "object" ? config.enamelProfiles : {};
    const enamelProfile = enamelProfiles[item.number] || null;
    const profile = stoneProfiles[item.number] || {};
    if (enamelProfile && enamelProfile.color) addEnamelOverlay(item, enamelProfile);
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
    if (stoneTargets.includes(item.number)) {
      const stoneDiameter = ({ "1.3": 0.026, "1.5": 0.030, "2.0": 0.040, "3.0": 0.060 })[String(config.size)] || 0.030;
      const jawSign = item.jaw === "upper" ? -1 : 1;
      const placedCells = new Set(targetCells);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x55565a,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      // Render only the stones the customer actually selected. Empty 5×5 seat
      // outlines looked like a spreadsheet overlay and are intentionally omitted.
      targetCells.forEach(function (cell) {
        const column = cell % 5;
        const row = Math.floor(cell / 5);
        const x = ((column - 2) / 2) * dims.width * 0.68;
        const verticalFraction = item.jaw === "upper"
          ? 0.32 + row * 0.09
          : 0.68 - row * 0.09;
        const z = jawSign * dims.height * verticalFraction;
        const frontSurface = crownFrontSurfaceY(dims, item.jaw, x, z);
        const surfaceY = cap.position.y + frontSurface * cap.scale.y;
        const fitDiameter = Math.min(stoneDiameter, dims.width * 0.52, dims.height * 0.34);
        const mountDepth = Math.max(0.010, fitDiameter * 0.18);
        const gemHalfDepth = fitDiameter * (stoneShape === "square" ? 0.14 : 0.27);
        const mount = new THREE.Mesh(
          new THREE.CylinderGeometry(fitDiameter * 0.53, fitDiameter * 0.53, mountDepth / cap.scale.y, 20),
          metalMaterial
        );
        const mountPoint = capLocalPoint(cap, x * cap.scale.x, surfaceY - mountDepth * 0.5, z * cap.scale.z);
        mount.position.copy(mountPoint);
        mount.scale.set(1 / cap.scale.x, 1, 1 / cap.scale.z);
        mount.userData.designDetail = true;
        mount.userData.stoneCell = cell;
        cap.add(mount);

        const shape = stoneShape === "square"
          ? new RoundedBoxGeometry(fitDiameter, Math.max(0.014, fitDiameter * 0.28), fitDiameter, 2, fitDiameter * 0.12)
          : makeBrilliantCutGeometry(fitDiameter);
        const gem = new THREE.Mesh(shape, stoneMaterial);
        const gemPoint = capLocalPoint(cap, x * cap.scale.x, surfaceY - mountDepth - gemHalfDepth, z * cap.scale.z);
        gem.position.copy(gemPoint);
        gem.scale.set(1 / cap.scale.x, 1 / cap.scale.y, 1 / cap.scale.z);
        if (stoneShape !== "square") gem.scale.y *= 0.92;
        gem.userData.designDetail = true;
        gem.userData.stoneCell = cell;
        gem.castShadow = true;
        gem.receiveShadow = true;
        cap.add(gem);

        if (stoneShape !== "square") {
          const prongRadius = Math.max(0.006, fitDiameter * 0.075);
          const prongGeo = new THREE.SphereGeometry(prongRadius, 8, 6);
          [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function (corner) {
            const prong = new THREE.Mesh(prongGeo, metalMaterial);
            const px = x + corner[0] * fitDiameter * 0.34;
            const pz = z + corner[1] * fitDiameter * 0.34;
            const py = surfaceY - mountDepth - fitDiameter * 0.30;
            prong.position.copy(capLocalPoint(cap, px * cap.scale.x, py, pz * cap.scale.z));
            prong.scale.set(1 / cap.scale.x, 1 / cap.scale.y, 1 / cap.scale.z);
            prong.userData.designDetail = true;
            prong.userData.stoneCell = cell;
            cap.add(prong);
          });
        }
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

  function samplePaveConfig() {
    // Curated showroom sample: a restrained six-tooth smile in each arch,
    // polished 14K gold with three visible stones per crown (not a 25-seat grid).
    const sampleTeeth = UPPER.slice(5, 11).concat(LOWER.slice(5, 11));
    const layout = {};
    sampleTeeth.forEach(function (number) { layout[number] = [6, 12, 18]; });
    return {
      design: "standard",
      metal: "gold14k",
      teeth: sampleTeeth,
      stones: "natural",
      stoneShape: "round",
      size: "1.5",
      stoneCount: sampleTeeth.length * 3,
      stoneTeeth: sampleTeeth,
      stoneLayout: layout,
      stoneProfiles: {},
      enamelProfiles: {},
      cuts: [],
      paveSample: false
    };
  }

  function update(config) {
    const requested = config || {};
    const requestedTeeth = Array.isArray(requested.teeth) ? requested.teeth.map(String) : [];
    const isSample = requestedTeeth.length === 0;
    isReferenceSampleMode = isSample;
    lastConfig = isSample ? samplePaveConfig() : requested;
    setReferenceSampleVisible();
    const selected = new Set(Array.isArray(lastConfig.teeth) ? lastConfig.teeth.map(String) : []);
    syncReferenceSampleSelection(isSample ? new Set() : selected);
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
    const statusText = isSample
      ? "Sample full-pavé grill · select teeth to create your own design"
      : count + (count === 1 ? " selected tooth" : " selected teeth") + " · reference smile retained · " + materialLabel;
    setStatus(statusText, false);

    const note = document.getElementById("grill3DMaterialNote");
    if (note) {
      const stoneNote = lastConfig.stones && lastConfig.stones !== "none" && Number(lastConfig.stoneCount) > 0
        ? " The exact tooth-by-tooth stone layout is shown in this preview. Final setting, clearances and fit are verified against your approved mold."
        : "";
      note.textContent = isSample
        ? "Illustrative silver pavé sample across both arches. Your tooth selections, stone choices and estimate remain independent until you customize the design."
        : (lastConfig.metal === "quote"
          ? "Illustrative custom-metal appearance only. Exact alloy and final finish are confirmed in your custom quote."
          : "Reference-photo design preview · final crown contours and fit are confirmed from your approved mold.") + stoneNote;
    }
    render();
  }

  function render() {
    if (renderer && scene && camera && !disposed) renderer.render(scene, camera);
  }

  // Development-facing inventory for validating the complete procedural arch.
  // This describes the on-screen mockup only; it is not a dental scan or CAD fit.
  function getToothInventory() {
    if (modelRoot) modelRoot.updateMatrixWorld(true);
    return toothMeshes.map(function (item) {
      const position = item.root.getWorldPosition(new THREE.Vector3());
      const geometry = item.enamel.geometry;
      const bounds = geometry.boundingBox || (geometry.computeBoundingBox(), geometry.boundingBox);
      return Object.freeze({
        fdi: item.number,
        jaw: item.jaw,
        class: item.type,
        dimensions: Object.freeze({
          width: item.dimensions.width,
          depth: item.dimensions.depth,
          height: item.dimensions.height
        }),
        position: Object.freeze({
          x: Number(position.x.toFixed(5)),
          y: Number(position.y.toFixed(5)),
          z: Number(position.z.toFixed(5))
        }),
        rotationZ: Number(item.root.rotation.z.toFixed(5)),
        vertexCount: geometry.getAttribute("position").count,
        triangleCount: geometry.index ? geometry.index.count / 3 : 0,
        localBounds: Object.freeze({
          width: Number((bounds.max.x - bounds.min.x).toFixed(5)),
          depth: Number((bounds.max.y - bounds.min.y).toFixed(5)),
          height: Number((bounds.max.z - bounds.min.z).toFixed(5))
        }),
        capVisible: item.cap.visible,
        capScale: Object.freeze({
          x: item.cap.scale.x,
          y: item.cap.scale.y,
          z: item.cap.scale.z
        })
      });
    });
  }

  function getGeometryDiagnostics() {
    const inventory = getToothInventory();
    const counts = inventory.reduce(function (out, tooth) {
      out[tooth.class] = (out[tooth.class] || 0) + 1;
      out[tooth.jaw] = (out[tooth.jaw] || 0) + 1;
      return out;
    }, {});
    return Object.freeze({
      toothCount: inventory.length,
      upperCount: inventory.filter(function (tooth) { return tooth.jaw === "upper"; }).length,
      lowerCount: inventory.filter(function (tooth) { return tooth.jaw === "lower"; }).length,
      classCounts: Object.freeze({
        incisor: inventory.filter(function (tooth) { return tooth.class === "incisor"; }).length,
        canine: inventory.filter(function (tooth) { return tooth.class === "canine"; }).length,
        premolar: inventory.filter(function (tooth) { return tooth.class === "premolar"; }).length,
        molar: inventory.filter(function (tooth) { return tooth.class === "molar"; }).length
      }),
      selectedTeeth: inventory.filter(function (tooth) { return tooth.capVisible; }).map(function (tooth) { return tooth.fdi; }),
      inventory: inventory
    });
  }

  function setFrontCamera() {
    if (!camera) return;
    const aspect = Math.max(0.55, camera.aspect || 1);
    // Preserve a consistent horizontal smile width on narrow phone viewports.
    camera.fov = Math.max(34, Math.min(64,
      2 * Math.atan(Math.tan(17 * Math.PI / 180) * 1.5 / aspect) * 180 / Math.PI
    ));
    camera.up.set(0, 0, 1);
    camera.position.set(0.02, -4.8, 0.58);
    camera.lookAt(0, -0.10, 0);
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
      renderer.toneMappingExposure = 1.13;
      renderer.shadowMap.enabled = true;
 
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", "Interactive close-up 3D mouth preview with sculpted lips, gums, upper and lower teeth, and customizable grillz");
      host.replaceChildren(renderer.domElement);
      buildReferenceSampleLayer();

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x090607);

      camera = new THREE.PerspectiveCamera(34, Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight), 0.1, 100);
      camera.position.set(0.02, -4.8, 0.58);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const environment = new RoomEnvironment();
      scene.environment = pmremGenerator.fromScene(environment, 0.04).texture;
      pmremGenerator.dispose();

      scene.add(new THREE.HemisphereLight(0xfff1e8, 0x382c31, 2.35));

      const key = new THREE.DirectionalLight(0xffe8cb, 3.0);
      key.position.set(-3.4, -4.0, 4.4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffc7c1, 1.15);
      fill.position.set(4, -2.5, 1.5);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 1.8);
      rim.position.set(0, 4.5, 2.2);
      scene.add(rim);

      modelRoot = new THREE.Group();
      scene.add(modelRoot);
      createOralCavity();
      createJaw("upper");
      createJaw("lower");
      createSmileLips();

      const frontFill = new THREE.DirectionalLight(0xffffff, 1.75);
      frontFill.position.set(0, -5, 0.2);
      scene.add(frontFill);



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
          setFrontCamera();
        });
        resizeObserver.observe(host);
      } else {
        window.addEventListener("resize", function () {
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          setFrontCamera();
        });
      }

      window.MrSprinkleGrill3D = Object.freeze({ update, getToothInventory, getGeometryDiagnostics });
      window.addEventListener("mr-sprinkle:grill-config", function (event) {
        if (event.detail) update(event.detail);
      });
      host.dataset.ready = "true";
      host.setAttribute("aria-label", "Close-up mouth and grillz mockup with sculpted lips");
      const fallback = document.getElementById("designPreview");
      if (fallback) fallback.hidden = true;
      setStatus("Close-up smile preview · tap any visible tooth to customize it", false);
      setFrontCamera();
      update(window.__MrSprinkleGrillConfig || {});
      window.dispatchEvent(new CustomEvent("mr-sprinkle:grill-renderer-ready"));
    } catch (error) {
      console.error("Sprinkle Studio 3D failed to initialize:", error);
      host.dataset.ready = "false";
      host.replaceChildren();
      setStatus("3D preview is unavailable in this browser. The flat design diagram remains available below.", true);
      const fallback = document.getElementById("designPreview");
      if (fallback) {
        fallback.hidden = false;
        fallback.dataset.fallback = "true";
        if (window.MrSprinkleGrillPreview && typeof window.MrSprinkleGrillPreview.render === "function") {
          window.MrSprinkleGrillPreview.render(fallback, window.__MrSprinkleGrillConfig || {});
        }
      }
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") render();
  });

  init();
})();
