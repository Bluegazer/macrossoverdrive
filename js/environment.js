const ISLAND_POLY = new Array(
  { x: -165, z: -210 },
  { x: -40,  z: -235 },
  { x: 95,   z: -195 },
  { x: 185,  z: -115 },
  { x: 165,  z: 10 },
  { x: 135,  z: 95 },
  { x: 45,   z: 85 },
  { x: -15,  z: 125 },
  { x: -35,  z: 195 },
  { x: -15,  z: 245 },
  { x: -95,  z: 255 },
  { x: -135, z: 215 },
  { x: -95,  z: 185 },
  { x: -110, z: 145 },
  { x: -185, z: 115 },
  { x: -215, z: -20 },
  { x: -195, z: -135 }
);

const ISLETS = new Array(
  { x: 175, z: -215, rx: 28, rz: 18, h: 6.5 },
  { x: 225, z: -225, rx: 16, rz: 12, h: 4.5 },
  { x: 205, z: -185, rx: 14, rz: 10, h: 3.5 }
);

const CRATERS = new Array(
  { x: 115, z: -75,  outerR: 48, innerR: 22, height: 24 },
  { x: 95,  z: 25,   outerR: 38, innerR: 16, height: 19 },
  { x: 35,  z: -165, outerR: 42, innerR: 18, height: 21 },
  { x: -115,z: -155, outerR: 44, innerR: 19, height: 22 },
  { x: -145,z: 165,  outerR: 32, innerR: 14, height: 15 }
);

function distToSegment(px, pz, x1, z1, x2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (pz - z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projZ = z1 + t * dz;
  return Math.hypot(px - projX, pz - projZ);
}
function signedDistanceToIsland(x, z) {
  let inside = false;
  let minEdgeDist = 99999;
  const n = ISLAND_POLY.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ISLAND_POLY[i].x, zi = ISLAND_POLY[i].z;
    const xj = ISLAND_POLY[j].x, zj = ISLAND_POLY[j].z;

    const intersect = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi + 0.00001) + xi);
    if (intersect) inside = !inside;

    const d = distToSegment(x, z, xi, zi, xj, zj);
    if (d < minEdgeDist) minEdgeDist = d;
  }

  const coastNoise = Math.sin(x * 0.045) * 4.5 + Math.cos(z * 0.045) * 4.5;
  return (inside ? -minEdgeDist : minEdgeDist) + coastNoise;
}

function getTerrainHeight(x, z) {
  for (let i = 0; i < ISLETS.length; i++) {
    const isl = ISLETS[i];
    const nx = (x - isl.x) / isl.rx;
    const nz = (z - isl.z) / isl.rz;
    const d2 = nx * nx + nz * nz;
    if (d2 < 1.35) {
      const t = Math.max(0, 1.0 - d2 / 1.35);
      return -0.8 + t * (isl.h + 0.8);
    }
  }

  const sd = signedDistanceToIsland(x, z);
  if (sd > 14) return -2.5;

  let baseH = 2.2;
  if (sd > -14) {
    const t = (14 - sd) / 28;
    const smooth = t * t * (3 - 2 * t);
    baseH = -2.5 + smooth * 4.7;
  }

  const inCentralPlateau = (x > -155 && x < 75 && z > -115 && z < 85);
  if (inCentralPlateau || sd > -16) {
    return baseH;
  }

  let extraH = 0;
  for (let i = 0; i < CRATERS.length; i++) {
    const c = CRATERS[i];
    const dist = Math.hypot(x - c.x, z - c.z);
    if (dist < c.outerR) {
      const norm = dist / c.outerR;
      const rimPeak = c.innerR / c.outerR;
      if (norm > rimPeak) {
        const slope = 1.0 - (norm - rimPeak) / (1.0 - rimPeak);
        extraH += Math.sin(slope * Math.PI * 0.5) * c.height;
      } else {
        const bowl = norm / rimPeak;
        extraH += (0.35 + 0.65 * bowl * bowl) * c.height;
      }
    }
  }

  const hills = (Math.sin(x * 0.025) * Math.cos(z * 0.025) + 1.0) * 2.2;
  return baseH + extraH + hills;
}

const structureColliders = new Array();

function registerBoxCollider(cx, cy, cz, w, h, d) {
  structureColliders.push({
    minX: cx - w * 0.5,
    maxX: cx + w * 0.5,
    minY: cy - h * 0.5,
    maxY: cy + h * 0.5,
    minZ: cz - d * 0.5,
    maxZ: cz + d * 0.5
  });
}

function resolveStructureCollisions(pos, vel) {
  const r = 0.85;
  let hit = false;

  for (let i = 0; i < structureColliders.length; i++) {
    const b = structureColliders[i];

    if (
      pos.x + r > b.minX && pos.x - r < b.maxX &&
      pos.y + r > b.minY && pos.y - r < b.maxY &&
      pos.z + r > b.minZ && pos.z - r < b.maxZ
    ) {
      hit = true;
      const penLeft   = (pos.x + r) - b.minX;
      const penRight  = b.maxX - (pos.x - r);
      const penBottom = (pos.y + r) - b.minY;
      const penTop    = b.maxY - (pos.y - r);
      const penFront  = (pos.z + r) - b.minZ;
      const penBack   = b.maxZ - (pos.z - r);

      const minPen = Math.min(penLeft, penRight, penBottom, penTop, penFront, penBack);

      if (minPen === penTop) {
        pos.y = b.maxY + r;
        if (vel.y < 0) vel.y = 0;
      } else if (minPen === penBottom) {
        pos.y = b.minY - r;
        if (vel.y > 0) vel.y = 0;
      } else if (minPen === penLeft) {
        pos.x = b.minX - r;
        vel.x *= -0.25;
      } else if (minPen === penRight) {
        pos.x = b.maxX + r;
        vel.x *= -0.25;
      } else if (minPen === penFront) {
        pos.z = b.minZ - r;
        vel.z *= -0.25;
      } else if (minPen === penBack) {
        pos.z = b.maxZ + r;
        vel.z *= -0.25;
      }
    }
  }
  return hit;
}
let waterNormalTex1 = null;
let waterNormalTex2 = null;

function createAnimeToonGradient() {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#52525b';
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(1, 0, 2, 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(3, 0, 1, 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

function createRetro80sSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#091e3a');
  grad.addColorStop(0.5, '#164e7a');
  grad.addColorStop(0.85, '#4b86a8');
  grad.addColorStop(1.0, '#b8b2a6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 256);

  return new THREE.CanvasTexture(canvas);
}

function createWaterNormalTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 2;
      const ny = (y / size) * Math.PI * 2;
      const dx = Math.cos(nx * 3 + Math.sin(ny * 2)) * 0.5 + Math.cos(nx * 5 - ny * 4) * 0.25;
      const dy = Math.sin(ny * 3 + Math.cos(nx * 2)) * 0.5 + Math.sin(ny * 5 + nx * 3) * 0.25;

      const idx = (y * size + x) * 4;
      data[idx]     = Math.floor((dx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((dy * 0.5 + 0.5) * 255);
      data[idx + 2] = 240;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(48, 48);
  return tex;
}

function updateEnvironment(delta) {
  if (waterNormalTex1 && waterNormalTex2) {
    waterNormalTex1.offset.x += 0.035 * delta;
    waterNormalTex1.offset.y += 0.022 * delta;
    waterNormalTex2.offset.x -= 0.024 * delta;
    waterNormalTex2.offset.y += 0.031 * delta;
  }
}
function createRunwayTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#27272a';
  ctx.fillRect(0, 0, 128, 512);

  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(8, 0, 4, 512);
  ctx.fillRect(116, 0, 4, 512);

  for (let x = 18; x <= 102; x += 12) {
    ctx.fillRect(x, 12, 6, 26);
    ctx.fillRect(x, 474, 6, 26);
  }

  for (let y = 56; y < 456; y += 36) {
    ctx.fillRect(61, y, 6, 20);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

function buildAirbaseRunways(scene, toonGradient) {
  const baseGroup = new THREE.Group();
  baseGroup.position.set(0, 2.26, 0);

  const runwayTex = createRunwayTexture();
  const runwayMat = new THREE.MeshToonMaterial({
    map: runwayTex,
    gradientMap: toonGradient
  });

  const rwy1Geo = new THREE.PlaneGeometry(11, 145);
  rwy1Geo.rotateX(-Math.PI / 2);
  const rwy1 = new THREE.Mesh(rwy1Geo, runwayMat);
  rwy1.position.set(-28, 0.02, -58);
  rwy1.rotation.y = 0.52;
  baseGroup.add(rwy1);

  const rwy2Geo = new THREE.PlaneGeometry(10, 130);
  rwy2Geo.rotateX(-Math.PI / 2);
  const rwy2 = new THREE.Mesh(rwy2Geo, runwayMat);
  rwy2.position.set(-8, 0.04, -52);
  rwy2.rotation.y = -0.68;
  baseGroup.add(rwy2);

  const apronMat = new THREE.MeshToonMaterial({
    color: 0x3f3f46,
    gradientMap: toonGradient
  });

  const apronGeo = new THREE.PlaneGeometry(42, 34);
  apronGeo.rotateX(-Math.PI / 2);
  const apron = new THREE.Mesh(apronGeo, apronMat);
  apron.position.set(28, 0.01, -48);
  apron.rotation.y = 0.15;
  baseGroup.add(apron);

  const hangarMat = new THREE.MeshToonMaterial({
    color: 0x64748b,
    gradientMap: toonGradient
  });
  const hangarRoofMat = new THREE.MeshToonMaterial({
    color: 0x334155,
    gradientMap: toonGradient
  });

  for (let i = 0; i < 4; i++) {
    const hx = 36 + (i % 2) * 11;
    const hz = -60 + Math.floor(i / 2) * 16;

    const hGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3.2, 11), hangarMat);
    body.position.y = 1.6;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.8, 11.4), hangarRoofMat);
    roof.position.y = 3.4;
    hGroup.add(body, roof);

    hGroup.position.set(hx, 0, hz);
    hGroup.rotation.y = 0.15;
    baseGroup.add(hGroup);

    registerBoxCollider(hx, 2.26 + 1.9, hz, 8.2, 3.8, 11.6);
  }

  const towerBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 8.5, 3.2), hangarMat);
  towerBase.position.set(22, 4.25, -34);
  const towerCab = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.2, 4.6), new THREE.MeshToonMaterial({
    color: 0x0ea5e9,
    gradientMap: toonGradient
  }));
  towerCab.position.set(22, 9.2, -34);
  baseGroup.add(towerBase, towerCab);

  registerBoxCollider(22, 2.26 + 5.15, -34, 4.6, 10.3, 4.6);

  scene.add(baseGroup);
}
function buildSouthAtariaEnvironment(scene) {
  const skyTex = createRetro80sSkyTexture();
  skyTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = skyTex;
  scene.fog = new THREE.FogExp2(0x9ac5db, 0.0011);

  const toonGradient = createAnimeToonGradient();

  waterNormalTex1 = createWaterNormalTexture();
  waterNormalTex2 = waterNormalTex1.clone();
  waterNormalTex2.needsUpdate = true;
  waterNormalTex2.repeat.set(32, 32);

  const oceanGeo = new THREE.PlaneGeometry(3400, 3400);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0a365c,
    roughness: 0.16,
    metalness: 0.78,
    normalMap: waterNormalTex1,
    normalScale: new THREE.Vector2(0.45, 0.45),
    envMap: skyTex,
    envMapIntensity: 1.15
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.position.y = -0.35;
  scene.add(ocean);

  const size = 620;
  const segments = 190;
  const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);
  const cColor = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const vy = getTerrainHeight(vx, vz);
    posAttr.setY(i, vy);

    if (vy < 0.02) {
      cColor.setHex(0x165382);
    } else if (vy < 0.95) {
      cColor.setHex(0x8c6d46);
    } else if (vy < 5.5) {
      cColor.setHex(0x4a3723);
    } else if (vy < 14.5) {
      cColor.setHex(0x382819);
    } else {
      cColor.setHex(0x291e14);
    }

    colors[i * 3]     = cColor.r;
    colors[i * 3 + 1] = cColor.g;
    colors[i * 3 + 2] = cColor.b;
  }

  terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshToonMaterial({
    vertexColors: true,
    gradientMap: toonGradient
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  scene.add(terrainMesh);

  buildAirbaseRunways(scene, toonGradient);
}
