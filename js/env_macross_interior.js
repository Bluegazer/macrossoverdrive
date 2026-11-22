const INTERIOR_CONFIG = {
  length: 960,
  roadWidth: 2.4,
  boulevardWidth: 0.40,
  sidewalkWidth: 1.5,
  upperDeckY: 2.15,
  upperDeckWidth: 116,
  halfHullW: 124,
  ceilingY: 82,
  bridgeInterval: 48,
  bridgeElevation: 0.75
};

const DECK_CUTOUTS = {
  '-1': [
    { z0: -232, z1: -200, depth: 9, bevel: 9 },
    { z0: -88,  z1: -56,  depth: 9, bevel: 9 },
    { z0: 56,   z1: 88,   depth: 9, bevel: 9 },
    { z0: 200,  z1: 232,  depth: 9, bevel: 9 }
  ],
  '1': [
    { z0: -280, z1: -248, depth: 9, bevel: 9 },
    { z0: -136, z1: -104, depth: 9, bevel: 9 },
    { z0: 104,  z1: 136,  depth: 9, bevel: 9 },
    { z0: 248,  z1: 280,  depth: 9, bevel: 9 }
  ]
};

function getUpperDeckInnerDist(sign, z) {
  const baseDist = (INTERIOR_CONFIG.roadWidth * 0.5) + INTERIOR_CONFIG.sidewalkWidth;
  const list = DECK_CUTOUTS[String(sign)] || [];
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (z >= c.z0 && z <= c.z1) {
      if (z < c.z0 + c.bevel) return baseDist + c.depth * ((z - c.z0) / c.bevel);
      if (z > c.z1 - c.bevel) return baseDist + c.depth * ((c.z1 - z) / c.bevel);
      return baseDist + c.depth;
    }
  }
  return baseDist;
}

const level2TerracePolys = new Array();
const level2CylinderTerraces = new Array();
const level3Pavilions = new Array();
const level3PolyTerraces = new Array();

function isPointInPolyXZ(x, z, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts.at(i).x, zi = pts.at(i).z;
    const xj = pts.at(j).x, zj = pts.at(j).z;
    const intersect = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / ((zj - zi) || 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function getInteriorTerrainHeight(x, z) {
  const currentY = (typeof playerContainer !== 'undefined' && playerContainer)
    ? playerContainer.position.y
    : 10.0;
	
  for (let p = 0; p < level3Pavilions.length; p++) {
    const pav = level3Pavilions.at(p);
    if (currentY >= pav.topY - 0.35 && Math.hypot(x - pav.x, z - pav.z) <= pav.r) {
      return pav.topY;
    }
  }

  for (let k = 0; k < level3PolyTerraces.length; k++) {
    const poly3 = level3PolyTerraces.at(k);
    if (currentY >= poly3.topY - 0.35 && isPointInPolyXZ(x, z, poly3.pts)) {
      return poly3.topY;
    }
  }	

  for (let i = 0; i < level2TerracePolys.length; i++) {
    const poly = level2TerracePolys.at(i);
    if (currentY >= poly.topY - 0.35 && isPointInPolyXZ(x, z, poly.pts)) {
      return poly.topY;
    }
  }

  for (let c = 0; c < level2CylinderTerraces.length; c++) {
    const cyl = level2CylinderTerraces.at(c);
    if (currentY >= cyl.topY - 0.35 && Math.hypot(x - cyl.x, z - cyl.z) <= cyl.r) {
      return cyl.topY;
    }
  }

  const sign = x < 0 ? -1 : 1;
  const minDist = getUpperDeckInnerDist(sign, z);
  const maxDist = (INTERIOR_CONFIG.roadWidth * 0.5) + INTERIOR_CONFIG.sidewalkWidth + INTERIOR_CONFIG.upperDeckWidth;

  if (Math.abs(x) >= minDist && Math.abs(x) <= maxDist && Math.abs(z) <= INTERIOR_CONFIG.length * 0.5) {
    if (currentY >= INTERIOR_CONFIG.upperDeckY - 0.25) {
      return INTERIOR_CONFIG.upperDeckY;
    }
  }
  return 0.0;
}


function createInteriorAvenueTexture() {
  const w = 512;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0c1017';
  ctx.fillRect(0, 0, w, h);

  const glowPositions = new Array(170, 512, 850);
  for (let g = 0; g < glowPositions.length; g++) {
    const gy = glowPositions.at(g);
    const grad = ctx.createRadialGradient(w * 0.5, gy, 10, w * 0.5, gy, 210);
    grad.addColorStop(0.0, 'rgba(56, 189, 248, 0.14)');
    grad.addColorStop(0.5, 'rgba(250, 204, 21, 0.06)');
    grad.addColorStop(1.0, 'rgba(12, 16, 23, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, gy - 210, w, 420);
  }

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(10, 0, 6, h);
  ctx.fillRect(w - 16, 0, 6, h);

  const leftLaneDivider = Math.floor(w * 0.23);
  const rightLaneDivider = Math.floor(w * 0.77);
  for (let y = 20; y < h; y += 64) {
    ctx.fillRect(leftLaneDivider - 3, y, 6, 34);
    ctx.fillRect(rightLaneDivider - 3, y, 6, 34);
  }
  const drawRoadArrow = (cx, cy, dirY) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, dirY);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.92)';
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(18, -8);
    ctx.lineTo(7, -8);
    ctx.lineTo(7, 30);
    ctx.lineTo(-7, 30);
    ctx.lineTo(-7, -8);
    ctx.lineTo(-18, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const leftLaneOuter = w * 0.125;
  const leftLaneInner = w * 0.335;
  const rightLaneInner = w * 0.665;
  const rightLaneOuter = w * 0.875;
  const arrowYPositions = new Array(240, 560, 880);

  for (let i = 0; i < arrowYPositions.length; i++) {
    const ay = arrowYPositions.at(i);
    drawRoadArrow(leftLaneOuter, ay, 1);
    drawRoadArrow(leftLaneInner, ay, 1);
    drawRoadArrow(rightLaneInner, ay, -1);
    drawRoadArrow(rightLaneOuter, ay, -1);
  }
  ctx.fillStyle = '#f8fafc';
  for (let x = 22; x < w - 22; x += 26) {
    if (x > w * 0.41 && x < w * 0.59) continue;
    ctx.fillRect(x, 18, 14, 58);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, Math.round(INTERIOR_CONFIG.length / 8.0));
  tex.anisotropy = 4;
  return tex;
}

function createOchreConcentricTileTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#cf8942';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#18110b';
  ctx.lineWidth = 2.0;
  const gridStep = 32;
  for (let g = 0; g <= size; g += gridStep) {
    ctx.beginPath();
    ctx.moveTo(g, 0);
    ctx.lineTo(g, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, g);
    ctx.lineTo(size, g);
    ctx.stroke();
  }
  const drawRosette = (cx, cy, maxR) => {
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fillStyle = '#cf8942';
    ctx.fill();

    const rings = new Array(
      { rIn: maxR * 0.74, rOut: maxR * 0.99, count: 20 },
      { rIn: maxR * 0.50, rOut: maxR * 0.74, count: 16 },
      { rIn: maxR * 0.24, rOut: maxR * 0.50, count: 14 }
    );

    for (let r = 0; r < rings.length; r++) {
      const ring = rings.at(r);
      const step = (Math.PI * 2) / ring.count;

      for (let i = 0; i < ring.count; i++) {
        const a0 = i * step;
        const a1 = (i + 1) * step;

        ctx.beginPath();
        ctx.arc(cx, cy, ring.rOut, a0, a1);
        ctx.arc(cx, cy, ring.rIn, a1, a0, true);
        ctx.closePath();

        ctx.fillStyle = '#cf8942';
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#18110b';
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = '#d8964e';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#18110b';
    ctx.stroke();
  };

  const cornerR = size * 0.34;
  drawRosette(0, 0, cornerR);
  drawRosette(size, 0, cornerR);
  drawRosette(0, size, cornerR);
  drawRosette(size, size, cornerR);
  drawRosette(size * 0.5, size * 0.5, size * 0.44);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}
function createBrushedMetalTexture(baseHex, lineHex) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseHex || '#3a424d';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 2) {
    const shade = (Math.sin(y * 13.7) * 0.5 + 0.5) * 14;
    ctx.fillStyle = `rgba(255, 255, 255, ${shade / 255})`;
    ctx.fillRect(0, y, size, 1);
  }

  ctx.strokeStyle = lineHex || '#1e242b';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.5);
  ctx.lineTo(size, size * 0.5);
  ctx.moveTo(size * 0.5, 0);
  ctx.lineTo(size * 0.5, size);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}
function createStorefrontTextures() {
  const shopConfigs = new Array(
    { name: 'FASHION // BOUTIQUE', neon: '#f472b6', bg: '#2e1026', windowBg: '#fce7f3', accent: '#ec4899', type: 'CLOTHES' },
    { name: 'ARCADE // GAME CENTER', neon: '#38bdf8', bg: '#082038', windowBg: '#0c4a6e', accent: '#22d3ee', type: 'ARCADE' },
    { name: 'CAFE // STARLIGHT', neon: '#fbbf24', bg: '#291a0a', windowBg: '#fef3c7', accent: '#f59e0b', type: 'CAFE' },
    { name: 'NYAN-NYAN // RAMEN', neon: '#4ade80', bg: '#0a2615', windowBg: '#dcfce7', accent: '#22c55e', type: 'RESTAURANT' }
  );

  const results = new Array();

  for (let i = 0; i < shopConfigs.length; i++) {
    const cfg = shopConfigs.at(i);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(24, 14, 464, 46);
    ctx.strokeStyle = cfg.neon;
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 14, 464, 46);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = cfg.neon;
    ctx.textAlign = 'center';
    ctx.fillText(cfg.name, 256, 45);
    ctx.fillStyle = cfg.windowBg;
    ctx.fillRect(30, 74, 310, 152);
    ctx.strokeStyle = cfg.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 74, 310, 152);

    if (cfg.type === 'CLOTHES') {
      ctx.fillStyle = cfg.accent;
      ctx.fillRect(75, 110, 36, 85);
      ctx.fillRect(155, 105, 42, 95);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(240, 115, 38, 80);
    } else if (cfg.type === 'ARCADE') {
      for (let m = 0; m < 4; m++) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(48 + m * 70, 115, 52, 105);
        ctx.fillStyle = (m % 2 === 0) ? '#38bdf8' : '#f472b6';
        ctx.fillRect(54 + m * 70, 128, 40, 32);
      }
    } else {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(48, 175, 274, 16);
      ctx.fillStyle = cfg.accent;
      ctx.beginPath();
      ctx.arc(110, 145, 22, 0, Math.PI * 2);
      ctx.arc(240, 145, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(364, 74, 116, 178);
    ctx.fillStyle = cfg.neon;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(374, 84, 96, 158);
    ctx.globalAlpha = 1.0;

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    results.push({ tex: tex, neonHex: cfg.neon });
  }
  return results;
}
function buildAvenueAndSidewalks(targetGroup, toonGradient) {
  const len = INTERIOR_CONFIG.length;
  const roadW = INTERIOR_CONFIG.roadWidth;
  const swW = INTERIOR_CONFIG.sidewalkWidth;

  const roadTex = createInteriorAvenueTexture();
  const roadGeo = new THREE.PlaneGeometry(roadW, len);
  roadGeo.rotateX(-Math.PI / 2);
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    emissiveMap: roadTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.35,
    roughness: 0.45,
    metalness: 0.25
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.position.set(0, 0.01, 0);
  targetGroup.add(roadMesh);

  const blvW = INTERIOR_CONFIG.boulevardWidth;
  const blvGeo = new THREE.BoxGeometry(blvW, 0.08, len);
  const blvMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65, metalness: 0.25 });
  const blvMesh = new THREE.Mesh(blvGeo, blvMat);
  blvMesh.position.set(0, 0.04, 0);

  const stripeGeo = new THREE.PlaneGeometry(blvW * 0.35, len - 2);
  stripeGeo.rotateX(-Math.PI / 2);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
  stripeMesh.position.set(0, 0.082, 0);
  targetGroup.add(blvMesh, stripeMesh);


  const lampPoleGeo = new THREE.CylinderGeometry(0.03, 0.045, 1.25, 6);
  lampPoleGeo.translate(0, 0.625, 0);
  const lampHeadGeo = new THREE.BoxGeometry(0.32, 0.06, 0.10);
  lampHeadGeo.translate(0.14, 1.24, 0);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.6 });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  const lampSpots = new Array();
  for (let z = -len * 0.5 + 12; z <= len * 0.5 - 12; z += 16) {
    lampSpots.push({ x: -(roadW * 0.5 + 0.18), z: z, rotY: 0 });
    lampSpots.push({ x: (roadW * 0.5 + 0.18), z: z, rotY: Math.PI });
  }

  if (lampSpots.length > 0) {
    const instPoles = new THREE.InstancedMesh(lampPoleGeo, poleMat, lampSpots.length);
    const instHeads = new THREE.InstancedMesh(lampHeadGeo, lampGlowMat, lampSpots.length);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < lampSpots.length; i++) {
      const sp = lampSpots.at(i);
      dummy.position.set(sp.x, 0.04, sp.z);
      dummy.rotation.set(0, sp.rotY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instPoles.setMatrixAt(i, dummy.matrix);
      instHeads.setMatrixAt(i, dummy.matrix);
    }
    instPoles.instanceMatrix.needsUpdate = true;
    instHeads.instanceMatrix.needsUpdate = true;
    targetGroup.add(instPoles, instHeads);
  }

  for (let z = -360; z <= 360; z += 180) {
    const streetLight = new THREE.PointLight(0xfde68a, 2.0, 55);
    streetLight.position.set(0, 3.8, z);
    targetGroup.add(streetLight);
  }
  const ochreTex = createOchreConcentricTileTexture();
  ochreTex.repeat.set(2, Math.round(len / 1.0));
  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: ochreTex,
    emissiveMap: ochreTex,
    emissive: new THREE.Color(0xd9934c),
    emissiveIntensity: 0.22,
    roughness: 0.65
  });

  const swGeo = new THREE.PlaneGeometry(swW, len);
  swGeo.rotateX(-Math.PI / 2);

  const leftSw = new THREE.Mesh(swGeo, sidewalkMat);
  leftSw.position.set(-(roadW * 0.5 + swW * 0.5), 0.04, 0);

  const rightSw = new THREE.Mesh(swGeo, sidewalkMat);
  rightSw.position.set(roadW * 0.5 + swW * 0.5, 0.04, 0);

  targetGroup.add(leftSw, rightSw);
}

function buildUpperCityDecksAndShops(targetGroup) {
  const len = INTERIOR_CONFIG.length;
  const halfL = len * 0.5;
  const deckY = INTERIOR_CONFIG.upperDeckY;
  const deckW = INTERIOR_CONFIG.upperDeckWidth;
  const innerEdgeX = (INTERIOR_CONFIG.roadWidth * 0.5) + INTERIOR_CONFIG.sidewalkWidth;
  const outerEdgeX = innerEdgeX + deckW;
  const slabThickness = 0.25;
  const clearUnderHeight = deckY - slabThickness;

  const pedCanvas = document.createElement('canvas');
  pedCanvas.width = 256;
  pedCanvas.height = 256;
  const pCtx = pedCanvas.getContext('2d');
  pCtx.fillStyle = '#9aa5b4';
  pCtx.fillRect(0, 0, 256, 256);
  pCtx.strokeStyle = '#838f9f';
  pCtx.lineWidth = 2;
  for (let g = 0; g <= 256; g += 64) {
    pCtx.beginPath(); pCtx.moveTo(g, 0); pCtx.lineTo(g, 256); pCtx.stroke();
    pCtx.beginPath(); pCtx.moveTo(0, g); pCtx.lineTo(256, g); pCtx.stroke();
  }


  const pedDeckTex = new THREE.CanvasTexture(pedCanvas);
  pedDeckTex.wrapS = THREE.RepeatWrapping;
  pedDeckTex.wrapT = THREE.RepeatWrapping;
  pedDeckTex.repeat.set(0.08, 0.08);
  pedDeckTex.anisotropy = 4;

  const deckMetalTex = createBrushedMetalTexture('#3b434e', '#1c2128');
  deckMetalTex.repeat.set(0.15, 0.15);

  const topMat = new THREE.MeshStandardMaterial({ map: pedDeckTex, color: 0xffffff, roughness: 0.78, metalness: 0.15 });
  const wallMat = new THREE.MeshStandardMaterial({ map: deckMetalTex, color: 0x525d6b, roughness: 0.72, metalness: 0.40 });

  const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.55, metalness: 0.55 });

  const sharedCutoutTex = createOchreConcentricTileTexture();
  sharedCutoutTex.repeat.set(9.4 / 0.75, 32 / 0.75);
  const sharedCutoutMat = new THREE.MeshStandardMaterial({
    map: sharedCutoutTex, emissiveMap: sharedCutoutTex, emissive: new THREE.Color(0xd9934c), emissiveIntensity: 0.22, roughness: 0.65
  });
  const storeTextures = createStorefrontTextures();
  const storeMats = storeTextures.map(st => new THREE.MeshBasicMaterial({ map: st.tex }));

  const sides = [-1, 1];
  for (let s = 0; s < sides.length; s++) {
    const sign = sides[s];
    const cutouts = DECK_CUTOUTS[String(sign)] || [];

    // Construir puntos del contorno interior (con recortes angulares a 45°)
    const edgePts = [];
    edgePts.push({ x: sign * innerEdgeX, z: -halfL });
    for (let c = 0; c < cutouts.length; c++) {
      const cut = cutouts[c];
      edgePts.push({ x: sign * innerEdgeX, z: cut.z0 });
      edgePts.push({ x: sign * (innerEdgeX + cut.depth), z: cut.z0 + cut.bevel });
      edgePts.push({ x: sign * (innerEdgeX + cut.depth), z: cut.z1 - cut.bevel });
      edgePts.push({ x: sign * innerEdgeX, z: cut.z1 });

      const plazaW = cut.depth + 0.4;
      const plazaL = cut.z1 - cut.z0;
      const plazaGeo = new THREE.PlaneGeometry(plazaW, plazaL);
      plazaGeo.rotateX(-Math.PI / 2);
      const plazaMesh = new THREE.Mesh(plazaGeo, sharedCutoutMat);
      plazaMesh.position.set(sign * (innerEdgeX + cut.depth * 0.5), 0.039, (cut.z0 + cut.z1) * 0.5);
      targetGroup.add(plazaMesh);
    }
	
    edgePts.push({ x: sign * innerEdgeX, z: halfL });

    // 1. Losa extruida del Nivel 1 respetando los recortes angulares
    const shape = new THREE.Shape();
    shape.moveTo(edgePts[0].x, -edgePts[0].z);
    for (let i = 1; i < edgePts.length; i++) {
      shape.lineTo(edgePts[i].x, -edgePts[i].z);
    }
    shape.lineTo(sign * outerEdgeX, -halfL);
    shape.lineTo(sign * outerEdgeX, halfL);
    shape.closePath();

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, { depth: slabThickness, bevelEnabled: false });
    extrudeGeo.rotateX(-Math.PI / 2);
    const slabMesh = new THREE.Mesh(extrudeGeo, [topMat, wallMat]);
    slabMesh.position.y = deckY - slabThickness;
    targetGroup.add(slabMesh);

    // 2. Muros de soporte verticales + Barandas continuas siguiendo todo el contorno (rectos + ángulos 45°)
    const interval = INTERIOR_CONFIG.bridgeInterval;
    for (let i = 0; i < edgePts.length - 1; i++) {
      const pA = edgePts[i];
      const pB = edgePts[i + 1];
      const dx = pB.x - pA.x;
      const dz = pB.z - pA.z;
      const segLen = Math.hypot(dx, dz);
      if (segLen < 0.1) continue;

      const midX = (pA.x + pB.x) * 0.5;
      const midZ = (pA.z + pB.z) * 0.5;
      const angleY = Math.atan2(dx, dz);

      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, clearUnderHeight, segLen), wallMat);
      wallMesh.position.set(midX + sign * 0.22, clearUnderHeight * 0.5, midZ);
      wallMesh.rotation.y = angleY;
      targetGroup.add(wallMesh);

      // Baranda continua sobre el borde del Nivel 1 (dejando paso donde llegan los puentes peatonales)
      const isStraightFront = Math.abs(dx) < 0.05;
      if (!isStraightFront) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.22, segLen), railMat);
        rail.position.set(midX + sign * 0.08, deckY + 0.11, midZ);
        rail.rotation.y = angleY;
        targetGroup.add(rail);
      } else {
        // Subdividir los tramos rectos para dejar abertura de 1.7m donde conectan las escaleras de los puentes
        let curZ = pA.z;
        while (curZ < pB.z - 0.1) {
          let nextZ = pB.z;
          for (let bz = -halfL + interval; bz <= halfL - interval; bz += interval) {
            if (bz - 0.9 > curZ + 0.2 && bz - 0.9 < nextZ) { nextZ = bz - 0.9; break; }
            if (curZ >= bz - 0.9 && curZ < bz + 0.9) { curZ = bz + 0.9; break; }
          }
          if (curZ >= pB.z - 0.1) break;
          const pieceLen = nextZ - curZ;
          if (pieceLen > 0.2) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.22, pieceLen), railMat);
            rail.position.set(pA.x + sign * 0.08, deckY + 0.11, (curZ + nextZ) * 0.5);
            targetGroup.add(rail);
          }
          curZ = nextZ;
        }
      }
    }

    // 3. Locales comerciales iluminados en los tramos rectos junto a la avenida
    const shopW = 2.4;
    const shopGeo = new THREE.PlaneGeometry(shopW, 0.78);
    const rotY = sign < 0 ? (Math.PI / 2) : (-Math.PI / 2);
    const buckets1F = [[], [], [], []];
    const buckets2F = [[], [], [], []];
    const shopDummy = new THREE.Object3D();

    for (let sz = -halfL + 6; sz <= halfL - 6; sz += shopW) {
      const distFromCenter = getUpperDeckInnerDist(sign, sz);
      if (distFromCenter > innerEdgeX + 0.1) continue; // No poner locales en los recortes abiertos

      const shopX = sign * (innerEdgeX + 0.02);
      shopDummy.position.set(shopX, 0.43, sz);
      shopDummy.rotation.set(0, rotY, 0);
      shopDummy.updateMatrix();
      buckets1F[Math.abs(Math.floor(sz)) % storeMats.length].push(shopDummy.matrix.clone());

      shopDummy.position.set(shopX, 1.30, sz);
      shopDummy.updateMatrix();
      buckets2F[Math.abs(Math.floor(sz) + 2) % storeMats.length].push(shopDummy.matrix.clone());
    }

    for (let m = 0; m < storeMats.length; m++) {
      if (buckets1F[m].length > 0) {
        const i1 = new THREE.InstancedMesh(shopGeo, storeMats[m], buckets1F[m].length);
        buckets1F[m].forEach((mat, idx) => i1.setMatrixAt(idx, mat));
        i1.instanceMatrix.needsUpdate = true;
        targetGroup.add(i1);
      }
      if (buckets2F[m].length > 0) {
        const i2 = new THREE.InstancedMesh(shopGeo, storeMats[m], buckets2F[m].length);
        buckets2F[m].forEach((mat, idx) => i2.setMatrixAt(idx, mat));
        i2.instanceMatrix.needsUpdate = true;
        targetGroup.add(i2);
      }
    }

       if (typeof registerBoxCollider === 'function') {
      // 1. Bloque macizo continuo detrás de los recortes (desde innerEdgeX + 9 hasta el borde exterior)
      const backW = deckW - 9;
      registerBoxCollider(sign * (innerEdgeX + 9 + backW * 0.5), deckY * 0.5, 0, backW, deckY, len, 0);

      // 2. Bloques macizos salientes hasta innerEdgeX (entre cada recorte angular)
      let zCursor = -halfL;
      for (let c = 0; c < cutouts.length; c++) {
        const cut = cutouts[c];
        const segL = (cut.z0 + 3) - zCursor;
        if (segL > 1) {
          registerBoxCollider(sign * (innerEdgeX + 4.5), deckY * 0.5, zCursor + segL * 0.5, 9, deckY, segL, 0);
        }
        zCursor = cut.z1 - 3;
      }
      const lastSegL = halfL - zCursor;
      if (lastSegL > 1) {
        registerBoxCollider(sign * (innerEdgeX + 4.5), deckY * 0.5, zCursor + lastSegL * 0.5, 9, deckY, lastSegL, 0);
       }
     }
   }
 }

function buildStraightBridgesWithStairs(targetGroup) {
  const len = INTERIOR_CONFIG.length;
  const interval = INTERIOR_CONFIG.bridgeInterval;
  const deckY = INTERIOR_CONFIG.upperDeckY;
  const elev = INTERIOR_CONFIG.bridgeElevation;
  const bridgeTopY = deckY + elev;

  const innerEdgeX = (INTERIOR_CONFIG.roadWidth * 0.5) + INTERIOR_CONFIG.sidewalkWidth;
  const spanWidth = innerEdgeX * 2;
  const bridgeDepth = 1.6;

  const bridgeMetalTex = createBrushedMetalTexture('#454f5c', '#1c2128');
  bridgeMetalTex.repeat.set(8, 2);

  const bridgeMat = new THREE.MeshStandardMaterial({ map: bridgeMetalTex, color: 0x8c97a6, roughness: 0.64, metalness: 0.48 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x525d6b, roughness: 0.58, metalness: 0.55 });
  const stairMat = new THREE.MeshStandardMaterial({ map: bridgeMetalTex, color: 0x737e8c, roughness: 0.70, metalness: 0.42 });
  const stairHypotenuse = Math.hypot(elev, elev);

  for (let z = -len * 0.5 + interval; z <= len * 0.5 - interval; z += interval) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 0, z);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(spanWidth, 0.24, bridgeDepth), bridgeMat);
    deck.position.set(0, bridgeTopY - 0.12, 0);
    const railN = new THREE.Mesh(new THREE.BoxGeometry(spanWidth, 0.18, 0.08), railMat);
    railN.position.set(0, bridgeTopY + 0.09, -bridgeDepth * 0.5 + 0.06);
    const railS = railN.clone();
    railS.position.z = bridgeDepth * 0.5 - 0.06;
    bridgeGroup.add(deck, railN, railS);

    if (typeof registerBoxCollider === 'function') registerBoxCollider(0, bridgeTopY - 0.12, z, spanWidth, 0.24, bridgeDepth, 0);
    const ends = new Array(-1, 1);
    for (let e = 0; e < ends.length; e++) {
      const sign = ends.at(e);
      const stairX = sign * (innerEdgeX + elev * 0.5);
      const stairY = deckY + elev * 0.5;

      const ramp = new THREE.Mesh(new THREE.BoxGeometry(stairHypotenuse, 0.16, bridgeDepth - 0.14), stairMat);
      ramp.position.set(stairX, stairY - 0.07, 0);
      ramp.rotation.z = sign * (-Math.PI / 4);
      bridgeGroup.add(ramp);

      for (let st = 0; st < 12; st++) {
        const t = (st + 0.5) / 12;
        const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(elev / 12, 0.09, bridgeDepth - 0.18), bridgeMat);
        stepMesh.position.set(sign * (innerEdgeX + t * elev), bridgeTopY - t * elev, 0);
        bridgeGroup.add(stepMesh);
      }

      if (typeof registerBoxCollider === 'function') registerBoxCollider(stairX, stairY - 0.07, z, elev, elev * 0.6, bridgeDepth - 0.14, 0);
    }
    targetGroup.add(bridgeGroup);
  }
}
let auditoriumLaserGroup = null;

function buildOpenDomeAuditorium(targetGroup) {
  const deckY = INTERIOR_CONFIG.upperDeckY;
  const audX = 62;
  const audZ = -20;

  const audGroup = new THREE.Group();
  audGroup.position.set(audX, deckY, audZ);

  const plazaGeo = new THREE.CylinderGeometry(42, 44, 0.4, 48);
  const plazaMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
  plazaMesh.position.y = 0.2;
  audGroup.add(plazaMesh);

  const shellGeo = new THREE.SphereGeometry(
    48, 24, 18, Math.PI * 0.28, Math.PI * 1.48, Math.PI * 0.14, Math.PI * 0.42
  );
  const shellOuterMat = new THREE.MeshStandardMaterial({
    color: 0x262320, roughness: 0.55, metalness: 0.45, flatShading: true, side: THREE.FrontSide
  });
  const shellInnerMat = new THREE.MeshBasicMaterial({ color: 0xbe185d, side: THREE.BackSide });

  const shellOuter = new THREE.Mesh(shellGeo, shellOuterMat);
  shellOuter.position.y = -4.0;
  const shellInner = new THREE.Mesh(shellGeo, shellInnerMat);
  shellInner.position.y = -4.0;
  shellInner.scale.set(0.985, 0.985, 0.985);
  audGroup.add(shellOuter, shellInner);
  for (let t = 0; t < 4; t++) {
    const rOuter = 44 - t * 4.5;
    const rInner = rOuter - 4.2;
    const h = 7.5 - t * 1.6;
    const tierGeo = new THREE.CylinderGeometry(rOuter, rOuter, h, 36, 1, true);
    const tierMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, side: THREE.DoubleSide });
    const tierMesh = new THREE.Mesh(tierGeo, tierMat);
    tierMesh.position.y = h * 0.5;
    audGroup.add(tierMesh);

    const stepCapGeo = new THREE.RingGeometry(rInner, rOuter, 36);
    stepCapGeo.rotateX(-Math.PI / 2);
    const stepCap = new THREE.Mesh(stepCapGeo, tierMat);
    stepCap.position.y = h;
    audGroup.add(stepCap);
  }

  const stageGeo = new THREE.CylinderGeometry(18, 20, 1.2, 36);
  const stageMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const stageMesh = new THREE.Mesh(stageGeo, stageMat);
  stageMesh.position.set(-10, 0.8, 0);
  audGroup.add(stageMesh);

  const stageLight = new THREE.PointLight(0xf43f5e, 3.5, 75);
  stageLight.position.set(-8, 12, 0);
  audGroup.add(stageLight);
  auditoriumLaserGroup = new THREE.Group();
  const cyanLaserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.92 });
  const pinkLaserMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.90 });

  const laserEndpoints = new Array(
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(34, 9, 14), mat: cyanLaserMat },
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(36, 10, 4), mat: cyanLaserMat },
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(32, 11, -12), mat: cyanLaserMat },
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(14, 15, -34), mat: cyanLaserMat },
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(-2, 16, -38), mat: cyanLaserMat },
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(-14, 6, 32), mat: cyanLaserMat },
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(-4, 6, 34), mat: cyanLaserMat },
    { p1: new THREE.Vector3(-18, 16, -8), p2: new THREE.Vector3(-24, 5, 24), mat: pinkLaserMat },
    { p1: new THREE.Vector3(12, 18, -22), p2: new THREE.Vector3(-22, 8, 18), mat: cyanLaserMat }
  );

  for (let l = 0; l < laserEndpoints.length; l++) {
    const item = laserEndpoints.at(l);
    const dist = item.p1.distanceTo(item.p2);
    const beamGeo = new THREE.CylinderGeometry(0.14, 0.14, dist, 6);
    beamGeo.rotateX(Math.PI / 2);
    const beamMesh = new THREE.Mesh(beamGeo, item.mat);
    beamMesh.position.copy(item.p1).lerp(item.p2, 0.5);
    beamMesh.lookAt(item.p2);
    auditoriumLaserGroup.add(beamMesh);
  }
  audGroup.add(auditoriumLaserGroup);
  targetGroup.add(audGroup);

  if (typeof registerBoxCollider === 'function') registerBoxCollider(audX, deckY + 6.0, audZ, 90, 12, 90, 0);
}

function createProceduralLawnTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1d4d22';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const gx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const gy = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const px = Math.abs(gx) * 256, py = Math.abs(gy) * 256;
    ctx.fillStyle = (i % 5 === 0) ? '#4a3b28' : ((i % 2 === 0) ? '#2b6e31' : '#153b19');
    ctx.fillRect(px, py, 2, 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function buildInteriorParks(targetGroup) {
  const deckY = INTERIOR_CONFIG.upperDeckY;
  const parks = new Array(
    { x: -58, z: -180, w: 54, d: 78 },
    { x: -58, z: 180,  w: 54, d: 78 },
    { x: 60,  z: -210, w: 54, d: 78 },
    { x: 60,  z: 190,  w: 54, d: 78 }
  );

  const lawnTex = createProceduralLawnTexture();
  const grassMat = new THREE.MeshStandardMaterial({ map: lawnTex, color: 0xffffff, emissive: new THREE.Color(0x0f2912), emissiveIntensity: 0.35, roughness: 0.88 });
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, emissive: new THREE.Color(0x38bdf8), emissiveIntensity: 0.18, roughness: 0.6 });
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.4, 6);
  trunkGeo.translate(0, 0.7, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b281e, roughness: 0.9 });
  const crownGeo = new THREE.IcosahedronGeometry(1.15, 1);
  crownGeo.scale(1.0, 0.85, 1.0);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x2a5e23, roughness: 0.8 });
  const treeCoords = new Array();

  for (let p = 0; p < parks.length; p++) {
    const pk = parks.at(p);
    const lawn = new THREE.Mesh(new THREE.BoxGeometry(pk.w, 0.25, pk.d), grassMat);
    lawn.position.set(pk.x, deckY + 0.125, pk.z);
    const pathX = new THREE.Mesh(new THREE.BoxGeometry(pk.w - 4, 0.3, 3.2), pathMat);
    pathX.position.set(pk.x, deckY + 0.15, pk.z);
    const pathZ = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, pk.d - 4), pathMat);
    pathZ.position.set(pk.x, deckY + 0.15, pk.z);
    const pond = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.35, 24), waterMat);
    pond.position.set(pk.x, deckY + 0.18, pk.z);
    targetGroup.add(lawn, pathX, pathZ, pond);

    for (let tx = pk.x - pk.w * 0.42; tx <= pk.x + pk.w * 0.42; tx += 8) {
      for (let tz = pk.z - pk.d * 0.42; tz <= pk.z + pk.d * 0.42; tz += 8) {
        if (Math.abs(tx - pk.x) < 7 || Math.abs(tz - pk.z) < 7) continue;
        treeCoords.push({ x: tx, z: tz });
      }
    }
  }
  if (treeCoords.length > 0) {
    const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCoords.length);
    const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, treeCoords.length);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < treeCoords.length; i++) {
      const tc = treeCoords.at(i);
      const s = 0.85 + Math.abs(Math.sin(i * 7.1)) * 0.45;
      dummy.position.set(tc.x, deckY + 0.22, tc.z);
      dummy.rotation.set(0, i * 0.9, 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tc.x, deckY + 0.22 + 1.5 * s, tc.z);
      dummy.scale.set(s, s * 1.1, s);
      dummy.updateMatrix();
      crownInst.setMatrixAt(i, dummy.matrix);
    }

    trunkInst.instanceMatrix.needsUpdate = true;
    crownInst.instanceMatrix.needsUpdate = true;
    targetGroup.add(trunkInst, crownInst);
  }
}
function buildInteriorCityBuildings(targetGroup) {
  const deckY = INTERIOR_CONFIG.upperDeckY;
  const len = INTERIOR_CONFIG.length;
  const pairYellow1 = (typeof createBuildingFacadePair === 'function') ? createBuildingFacadePair('#1e293b', '#fde047', 6, 16) : null;
  const pairYellow2 = (typeof createBuildingFacadePair === 'function') ? createBuildingFacadePair('#27272a', '#fef08a', 5, 14) : null;
  const pairCyan    = (typeof createBuildingFacadePair === 'function') ? createBuildingFacadePair('#0f172a', '#7dd3fc', 6, 16) : null;
  const pairPink    = (typeof createBuildingFacadePair === 'function') ? createBuildingFacadePair('#1e1b2e', '#f472b6', 5, 14) : null;
  const roofTex = (typeof createBuildingRoofTexture === 'function') ? createBuildingRoofTexture(false) : null;

  const makeMatSet = (pair, fallbackHex) => {
    const wall = new THREE.MeshStandardMaterial({
      map: pair ? pair.diffuse : null, emissiveMap: pair ? pair.emissive : null,
      emissive: new THREE.Color(0xffffff), emissiveIntensity: pair ? 1.45 : 0.6,
      color: pair ? 0xffffff : fallbackHex, roughness: 0.5
    });
    const roof = new THREE.MeshStandardMaterial({ map: roofTex, color: 0x475569, roughness: 0.6 });
    return new Array(wall, wall, roof, roof, wall, wall);
  };

  const matSets = new Array(
    makeMatSet(pairYellow1, 0x334155),
    makeMatSet(pairYellow2, 0x27272a),
    makeMatSet(pairCyan, 0x1e293b),
    makeMatSet(pairPink, 0x2e1065)
  );
  const buckets = new Array(new Array(), new Array(), new Array(), new Array());
  const dummy = new THREE.Object3D();
  
    const domeList = new Array();
  const sides = new Array(-1, 1);
  for (let s = 0; s < sides.length; s++) {
    const sign = sides.at(s);
    for (let bx = 4.5; bx <= 112; bx += 5.8) {
      const tierBoost = bx > 75 ? 4.8 : (bx > 42 ? 2.2 : 0);
      for (let bz = -len * 0.5 + 8; bz <= len * 0.5 - 8; bz += 5.8) {
        const wx = sign * bx, wz = bz;
        if (Math.hypot(wx - 62, wz - (-20)) < 46) continue;
        if (Math.abs(wx - (-58)) < 30 && Math.abs(Math.abs(wz) - 180) < 42) continue;
        if (Math.abs(wx - 60) < 30 && (Math.abs(wz - (-210)) < 42 || Math.abs(wz - 190) < 42)) continue;

        const seed = Math.abs(Math.sin(wx * 13.7 + wz * 41.3) * 43758.5453) % 1;
        if (seed < 0.08) continue;

        const w = 2.2 + seed * 1.4, d = 2.2 + ((seed * 3) % 1) * 1.4, h = 2.8 + tierBoost + seed * 7.2;
        dummy.position.set(wx, deckY, wz);
        dummy.scale.set(w, h, d);
        dummy.updateMatrix();

        const matIdx = (seed < 0.42) ? 0 : (seed < 0.80 ? 1 : (seed < 0.92 ? 2 : 3));
        buckets.at(matIdx).push(dummy.matrix.clone());
        if (seed > 0.62) domeList.push({ x: wx, y: deckY + h, z: wz, r: Math.min(w, d) * 0.46 });
        if (typeof registerBoxCollider === 'function') registerBoxCollider(wx, deckY + h * 0.5, wz, w, h, d, 0);
      }
    }
  }

  if (domeList.length > 0) {
    const domeGeo = new THREE.CylinderGeometry(0.55, 1.0, 0.85, 8);
    domeGeo.translate(0, 0.425, 0);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.55 });
    const domeInst = new THREE.InstancedMesh(domeGeo, domeMat, domeList.length);
    for (let d = 0; d < domeList.length; d++) {
      const dm = domeList.at(d);
      dummy.position.set(dm.x, dm.y, dm.z);
      dummy.scale.set(dm.r, dm.r * 0.9, dm.r);
      dummy.updateMatrix();
      domeInst.setMatrixAt(d, dummy.matrix);
    }
    domeInst.instanceMatrix.needsUpdate = true;
    targetGroup.add(domeInst);
  }


  const bldgGeo = new THREE.BoxGeometry(1, 1, 1);
  bldgGeo.translate(0, 0.5, 0);
  for (let m = 0; m < 4; m++) {
    const list = buckets.at(m);
    if (list.length === 0) continue;
    const inst = new THREE.InstancedMesh(bldgGeo, matSets.at(m), list.length);
    for (let i = 0; i < list.length; i++) inst.setMatrixAt(i, list.at(i));
    inst.instanceMatrix.needsUpdate = true;
    targetGroup.add(inst);
  }
}
const vaultVideoElements = new Array();
const spaceWindowExplosions = new Array();
let spaceWindowExpGroup = null;
const spaceExpFrames = new Array();

function createEngineHullWallTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#141922'; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#090c12'; ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, size - 8, size - 8);
  ctx.strokeRect(4, size * 0.5, size - 8, size * 0.5 - 4);
  ctx.fillStyle = '#283242';
  ctx.fillRect(36, 0, 22, size); ctx.fillRect(72, 0, 14, size);
  ctx.fillRect(0, 140, size, 18); ctx.fillRect(0, 390, size, 24);
  ctx.fillStyle = '#475569';
  ctx.fillRect(42, 0, 5, size); ctx.fillRect(0, 144, size, 4);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(180, 60, 120, 64);
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.strokeRect(180, 60, 120, 64);
  const ledColors = new Array('#38bdf8', '#facc15', '#22c55e', '#f43f5e');
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = ledColors.at(i % ledColors.length);
    ctx.fillRect(194 + i * 12, 82, 6, 18);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  return tex;
}

function buildSDF1EngineVault(targetGroup) {
  const halfW = INTERIOR_CONFIG.halfHullW || 124;
  const halfL = INTERIOR_CONFIG.length * 0.5;
  const ceilingY = INTERIOR_CONFIG.ceilingY || 82;

  const hullTex = createEngineHullWallTexture();
  hullTex.repeat.set(8, 3);
  const wallMat = new THREE.MeshStandardMaterial({ map: hullTex, emissiveMap: hullTex, emissive: new THREE.Color(0x38bdf8), emissiveIntensity: 0.28, roughness: 0.65, metalness: 0.55 });
  const ceilTex = createBrushedMetalTexture('#1a202c', '#0b0f17');
  ceilTex.repeat.set(14, 36);
  const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, emissive: new THREE.Color(0x0f172a), emissiveIntensity: 0.35, roughness: 0.6, metalness: 0.6 });

  const ceilGeo = new THREE.PlaneGeometry(halfW * 2, halfL * 2);
  ceilGeo.rotateX(Math.PI / 2);
  const ceilMesh = new THREE.Mesh(ceilGeo, ceilMat);
  ceilMesh.position.set(0, ceilingY, 0);
  targetGroup.add(ceilMesh);

  const wallNSGeo = new THREE.PlaneGeometry(halfW * 2, ceilingY);
  const wallN = new THREE.Mesh(wallNSGeo, wallMat); wallN.position.set(0, ceilingY * 0.5, -halfL);
  const wallS = new THREE.Mesh(wallNSGeo, wallMat); wallS.position.set(0, ceilingY * 0.5, halfL); wallS.rotation.y = Math.PI;
  const wallEWGeo = new THREE.PlaneGeometry(halfL * 2, ceilingY);
  const wallW = new THREE.Mesh(wallEWGeo, wallMat); wallW.position.set(-halfW, ceilingY * 0.5, 0); wallW.rotation.y = Math.PI / 2;
  const wallE = new THREE.Mesh(wallEWGeo, wallMat); wallE.position.set(halfW, ceilingY * 0.5, 0); wallE.rotation.y = -Math.PI / 2;
  targetGroup.add(wallN, wallS, wallW, wallE);


  // Detalle estructural del techo: vigas transversales, largueros, pasarelas técnicas y paneles de luz
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x26303d, roughness: 0.55, metalness: 0.65 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.75 });
  const skyPanelMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  const ribZList = new Array();
  for (let z = -halfL + 30; z <= halfL - 30; z += 45) ribZList.push(z);

  const instRibW = new THREE.InstancedMesh(new THREE.BoxGeometry(4.5, ceilingY, 3.8), ribMat, ribZList.length);
  const instRibE = new THREE.InstancedMesh(new THREE.BoxGeometry(4.5, ceilingY, 3.8), ribMat, ribZList.length);
  const instTopBeam = new THREE.InstancedMesh(new THREE.BoxGeometry(halfW * 2, 4.2, 3.8), ribMat, ribZList.length);
  const instSubTruss = new THREE.InstancedMesh(new THREE.BoxGeometry(halfW * 1.92, 1.4, 1.4), pipeMat, ribZList.length);
  const instLightStrip = new THREE.InstancedMesh(new THREE.BoxGeometry(halfW * 0.55, 0.35, 1.2), skyPanelMat, ribZList.length);
  const instPipes = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.1, 1.1, ceilingY, 10), pipeMat, ribZList.length * 2);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < ribZList.length; i++) {
    const z = ribZList.at(i);
    const blocksMonitor = Math.abs(z) < 32;

    dummy.scale.set(blocksMonitor ? 0 : 1, blocksMonitor ? 0 : 1, blocksMonitor ? 0 : 1);
    dummy.position.set(-halfW + 2.2, ceilingY * 0.5, z); dummy.updateMatrix(); instRibW.setMatrixAt(i, dummy.matrix);
    dummy.position.set(-halfW + 5.0, ceilingY * 0.5, z + 5); dummy.updateMatrix(); instPipes.setMatrixAt(i * 2, dummy.matrix);
    dummy.position.set(-halfW + 5.0, ceilingY * 0.5, z + 9); dummy.updateMatrix(); instPipes.setMatrixAt(i * 2 + 1, dummy.matrix);

    dummy.scale.set(1, 1, 1);
    dummy.position.set(halfW - 2.2, ceilingY * 0.5, z); dummy.updateMatrix(); instRibE.setMatrixAt(i, dummy.matrix);
    dummy.position.set(0, ceilingY - 2.1, z); dummy.updateMatrix(); instTopBeam.setMatrixAt(i, dummy.matrix);
    dummy.position.set(0, ceilingY - 5.2, z); dummy.updateMatrix(); instSubTruss.setMatrixAt(i, dummy.matrix);
    dummy.position.set(0, ceilingY - 4.3, z + 22.5); dummy.updateMatrix(); instLightStrip.setMatrixAt(i, dummy.matrix);
  }

  instRibW.instanceMatrix.needsUpdate = true; instRibE.instanceMatrix.needsUpdate = true;
  instTopBeam.instanceMatrix.needsUpdate = true; instSubTruss.instanceMatrix.needsUpdate = true;
  instLightStrip.instanceMatrix.needsUpdate = true; instPipes.instanceMatrix.needsUpdate = true;
  targetGroup.add(instRibW, instRibE, instTopBeam, instSubTruss, instLightStrip, instPipes);

  // Largueros longitudinales y pasarela técnica central en el techo
  const catwalk = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.8, halfL * 2), pipeMat);
  catwalk.position.set(0, ceilingY - 6.8, 0);
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, halfL * 2), ribMat);
  railL.position.set(-3.1, ceilingY - 5.8, 0);
  const railR = railL.clone();
  railR.position.x = 3.1;
  targetGroup.add(catwalk, railL, railR);

  if (typeof registerBoxCollider === 'function') {
    registerBoxCollider(0, ceilingY + 2, 0, halfW * 2, 4, halfL * 2, 0);
    registerBoxCollider(0, ceilingY * 0.5, -halfL - 2, halfW * 2, ceilingY, 4, 0);
    registerBoxCollider(0, ceilingY * 0.5, halfL + 2, halfW * 2, ceilingY, 4, 0);
    registerBoxCollider(-halfW - 2, ceilingY * 0.5, 0, 4, ceilingY, halfL * 2, 0);
    registerBoxCollider(halfW + 2, ceilingY * 0.5, 0, 4, ceilingY, halfL * 2, 0);
  }
}

function createScreenFallbackTexture(screenIdx) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 288;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, 512, 288);
  const grad = ctx.createRadialGradient(256, 144, 15, 256, 144, 220);
  grad.addColorStop(0.0, '#f472b6'); grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 288);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.strokeRect(14, 14, 484, 260);
  ctx.font = 'bold 20px sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.fillText('MINMAY LIVE // DYRL FEED 0' + (screenIdx + 1), 256, 150);
  return new THREE.CanvasTexture(canvas);
}

let broadcastScreenState = null;

function drawBroadcastMonitorFrame(ctx, w, h, t) {
  // Fondo degradado escenario nocturno
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#090d1f');
  bgGrad.addColorStop(0.65, '#1e1b4b');
  bgGrad.addColorStop(1, '#311042');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Haces de reflectores láser del escenario moviéndose suavemente
  const beamColors = ['rgba(56, 189, 248, 0.22)', 'rgba(244, 114, 182, 0.22)', 'rgba(250, 204, 21, 0.18)'];
  for (let b = 0; b < 5; b++) {
    const angle = Math.sin(t * 1.1 + b * 1.3) * 0.45;
    const baseX = w * (0.2 + b * 0.15);
    ctx.fillStyle = beamColors[b % beamColors.length];
    ctx.beginPath();
    ctx.moveTo(baseX - 8, h - 34);
    ctx.lineTo(baseX + Math.sin(angle) * 180 - 45, 0);
    ctx.lineTo(baseX + Math.sin(angle) * 180 + 45, 0);
    ctx.lineTo(baseX + 8, h - 34);
    ctx.closePath();
    ctx.fill();
  }

  // Halo luminoso central de escenario
  const pulseR = 68 + Math.sin(t * 4.0) * 6;
  const halo = ctx.createRadialGradient(w * 0.5, h * 0.46, 8, w * 0.5, h * 0.46, pulseR);
  halo.addColorStop(0, 'rgba(244, 114, 182, 0.85)');
  halo.addColorStop(0.55, 'rgba(56, 189, 248, 0.35)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  // Silueta estilizada de idol en escenario (Lynn Minmay)
  const cx = w * 0.5;
  const cy = h * 0.48 + Math.sin(t * 3.2) * 2.5;
  ctx.fillStyle = '#fdf2f8';
  ctx.beginPath();
  ctx.arc(cx, cy - 28, 12, 0, Math.PI * 2); // cabeza
  ctx.fill();
  // Cabello azul largo con movimiento
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx, cy - 30, 14, Math.PI * 0.85, Math.PI * 2.15);
  ctx.lineTo(cx + 22 + Math.sin(t * 3) * 4, cy + 12);
  ctx.lineTo(cx - 22 + Math.sin(t * 3) * 4, cy + 12);
  ctx.closePath();
  ctx.fill();
  // Vestido de escenario
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 14);
  ctx.lineTo(cx + 8, cy - 14);
  ctx.lineTo(cx + 24, cy + 32);
  ctx.lineTo(cx - 24, cy + 32);
  ctx.closePath();
  ctx.fill();

  // Barras de ecualizador de audio a ambos lados
  const bars = 12;
  for (let i = 0; i < bars; i++) {
    const val = 12 + Math.abs(Math.sin(t * 5.5 + i * 0.85)) * 46;
    ctx.fillStyle = (i % 2 === 0) ? '#38bdf8' : '#f472b6';
    ctx.fillRect(24 + i * 11, h - 38 - val, 7, val);
    ctx.fillRect(w - 31 - i * 11, h - 38 - val, 7, val);
  }

  // Banner superior e inferior estilo transmisión TV Macross 1984
  ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
  ctx.fillRect(0, 0, w, 24);
  ctx.fillRect(0, h - 28, w, 28);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(16, 12, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left';
  ctx.fillText('LIVE // SDF-1 MACROSS BROADCAST NETWORK', 28, 16);

  // Cintillo inferior en movimiento
  const ticker = 'LYNN MINMAY SPECIAL CONCERT  ★  DO YOU REMEMBER LOVE?  ★  U.N. SPACY CIVIL DEFENSE  ★  ';
  const scrollX = w - ((t * 55) % (w + 420));
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(ticker + ticker, scrollX, h - 10);

  // Marco exterior
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}

function buildVerticalGiantMonitors(targetGroup) {
  const halfW = INTERIOR_CONFIG.halfHullW || 124;
  const towerGroup = new THREE.Group();
  towerGroup.position.set(-halfW + 5, 0, 0);

  const towerFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.7 });
  const towerBack = new THREE.Mesh(new THREE.BoxGeometry(4.5, 76, 48), towerFrameMat);
  towerBack.position.set(-2.0, 38, 0);
  towerGroup.add(towerBack);

  const neonSideColors = [0xf472b6, 0x38bdf8, 0xfacc15, 0x4ade80];
  for (let s = 0; s < 6; s++) {
    const signMat = new THREE.MeshBasicMaterial({ color: neonSideColors[s % neonSideColors.length] });
    const signL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.5, 2.4), signMat);
    signL.position.set(0.8, 14 + s * 9.5, -24.5);
    const signR = signL.clone(); signR.position.z = 24.5;
    towerGroup.add(signL, signR);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d', { alpha: false });
  drawBroadcastMonitorFrame(ctx, 512, 256, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  broadcastScreenState = { canvas: canvas, ctx: ctx, tex: tex, time: 0, accum: 0 };
  const sharedScreenMat = new THREE.MeshBasicMaterial({ map: tex });

  const yCenters = new Array(19, 41, 63);
  for (let i = 0; i < 3; i++) {
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(38, 20), sharedScreenMat);
    screenMesh.position.set(0.8, yCenters[i], 0);
    screenMesh.rotation.y = Math.PI / 2;
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 40), towerFrameMat);
    bezel.position.set(0.6, yCenters[i] - 10.6, 0);
    towerGroup.add(screenMesh, bezel);
  }
  targetGroup.add(towerGroup);
}


function buildSpaceBattleWindow(targetGroup) {
  spaceWindowExplosions.length = 0;
  spaceExpFrames.length = 0;
  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 10; i++) spaceExpFrames.push(loader.load('./textures/exp' + i + '.webp'));

  const halfW = INTERIOR_CONFIG.halfHullW || 124;
  const ceilingY = INTERIOR_CONFIG.ceilingY || 82;

  const winGroup = new THREE.Group();
  winGroup.position.set(halfW, 0, 0);

  const hullTex = createEngineHullWallTexture();
  hullTex.repeat.set(4, 3);
  const hullWallMat = new THREE.MeshStandardMaterial({
    map: hullTex, emissiveMap: hullTex, emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 0.28, roughness: 0.65, metalness: 0.55
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.65 });

  const lowerWall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 18, 960), hullWallMat);
  lowerWall.position.set(0, 9, 0);
  const upperWall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 18, 960), hullWallMat);
  upperWall.position.set(0, ceilingY - 9, 0);
  winGroup.add(lowerWall, upperWall);

  const winH = ceilingY - 36;
  const winMidY = ceilingY * 0.5;
  const centerPillar = new THREE.Mesh(new THREE.BoxGeometry(3.2, winH, 160), hullWallMat);
  centerPillar.position.set(0, winMidY, 0);
  const endWallN = new THREE.Mesh(new THREE.BoxGeometry(3.2, winH, 160), hullWallMat);
  endWallN.position.set(0, winMidY, -400);
  const endWallS = new THREE.Mesh(new THREE.BoxGeometry(3.2, winH, 160), hullWallMat);
  endWallS.position.set(0, winMidY, 400);
  winGroup.add(centerPillar, endWallN, endWallS);

  const winCentersZ = new Array(-200, 200);
  const glassMat = new THREE.MeshBasicMaterial({
    color: 0x0a2538, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });

  for (let w = 0; w < winCentersZ.length; w++) {
    const wz = winCentersZ.at(w);
    const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(240, winH), glassMat);
    glassMesh.position.set(-0.4, winMidY, wz);
glassMesh.rotation.y = -Math.PI / 2;
glassMesh.renderOrder = -1;
winGroup.add(glassMesh);
for (let mz = wz - 120; mz <= wz + 120; mz += 60) {
const mullion = new THREE.Mesh(new THREE.BoxGeometry(3.5, winH, 2.4), frameMat);
mullion.position.set(0, winMidY, mz);
winGroup.add(mullion);
}
}
const spaceBack = new THREE.Mesh(new THREE.PlaneGeometry(1400, 520), new THREE.MeshBasicMaterial({ color: 0x010206, fog: false }));
spaceBack.position.set(520, 90, 0); spaceBack.rotation.y = -Math.PI / 2; spaceBack.renderOrder = -2;
winGroup.add(spaceBack);
const starPos = new Float32Array(1400 * 3);
for (let s = 0; s < 1400; s++) {
starPos[s * 3] = 45 + Math.random() * 440;
starPos[s * 3 + 1] = -40 + Math.random() * 280;
starPos[s * 3 + 2] = (Math.random() - 0.5) * 1250;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, transparent: false, fog: false }));
stars.renderOrder = -2;
winGroup.add(stars);
spaceWindowExpGroup = new THREE.Group();
winGroup.add(spaceWindowExpGroup);
targetGroup.add(winGroup);
}
let nextSpaceExpTimer = 0.2;
const spaceExpGeo = new THREE.PlaneGeometry(1, 1);
function updateSpaceBattleWindow(delta) {
if (!spaceWindowExpGroup || spaceExpFrames.length === 0) return;
nextSpaceExpTimer -= delta;
if (nextSpaceExpTimer <= 0 && spaceWindowExplosions.length < 18) {
nextSpaceExpTimer = 0.25 + Math.random() * 0.55;
const depthX = 35 + Math.random() * 390, posY = 15 + Math.random() * 145, posZ = (Math.random() - 0.5) * 860;
const scale = 14 + (depthX / 420) * 42 + Math.random() * 14;
const mat = new THREE.MeshBasicMaterial({
map: spaceExpFrames.at(0), transparent: true, blending: THREE.AdditiveBlending,
depthWrite: false, fog: false, side: THREE.DoubleSide
});
const mesh = new THREE.Mesh(spaceExpGeo, mat);
mesh.position.set(depthX, posY, posZ); mesh.rotation.y = -Math.PI / 2; mesh.scale.set(scale, scale, 1);
mesh.renderOrder = -1;
spaceWindowExpGroup.add(mesh);
const dur = 0.55 + Math.random() * 0.35;
spaceWindowExplosions.push({ mesh: mesh, mat: mat, life: dur, maxLife: dur });
}
for (let i = spaceWindowExplosions.length - 1; i >= 0; i--) {
const ex = spaceWindowExplosions.at(i);
ex.life -= delta;
const progress = 1.0 - Math.max(0, ex.life / ex.maxLife);
ex.mat.map = spaceExpFrames.at(Math.min(spaceExpFrames.length - 1, Math.floor(progress * spaceExpFrames.length)));
if (ex.life <= 0) {
spaceWindowExpGroup.remove(ex.mesh); ex.mat.dispose(); spaceWindowExplosions.splice(i, 1);
}
}
}

function createEverydaySignTexture(idx) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const ctx = c.getContext('2d');
  const signs = [
    { bg: '#f8fafc', border: '#1e3a8a', header: '#1d4ed8', title: 'MACROSS', sub: 'SECTOR 07' },
    { bg: '#fefce8', border: '#78350f', header: '#b45309', title: 'CAFETERIA', sub: 'STARLIGHT' },
    { bg: '#f1f5f9', border: '#14532d', header: '#15803d', title: 'PARQUE', sub: 'PLAZA CENTRAL' }
  ];
  const st = signs[idx % signs.length];
  ctx.fillStyle = st.bg; ctx.fillRect(0, 0, 128, 256);
  ctx.strokeStyle = st.border; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 120, 248);
  ctx.fillStyle = st.header; ctx.fillRect(14, 18, 100, 64);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(st.title, 64, 56);
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 15px sans-serif';
  ctx.fillText(st.sub, 64, 130);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(24, 155, 80, 6);
  ctx.fillRect(24, 172, 64, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 2;
  return tex;
}

function createEverydayShopTexture(idx) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  const shops = [
    { wall: '#e2e8f0', awning: '#b91c1c', label: 'PANADERIA // BAKERY' },
    { wall: '#fef3c7', awning: '#1e40af', label: 'CAFETERIA // COFFEE' },
    { wall: '#f1f5f9', awning: '#166534', label: 'RAMEN // COMIDAS' },
    { wall: '#ede9fe', awning: '#7c2d12', label: 'LIBRERIA // BOOKS' }
  ];
  const sh = shops[idx % shops.length];
  ctx.fillStyle = sh.wall; ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = sh.awning; ctx.fillRect(0, 0, 256, 30);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(sh.label, 128, 20);
  // Ventanas iluminadas cálidas
  ctx.fillStyle = '#fef9c3';
  ctx.fillRect(18, 42, 92, 58);
  ctx.fillRect(126, 42, 62, 58);
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 3;
  ctx.strokeRect(18, 42, 92, 58);
  ctx.strokeRect(126, 42, 62, 58);
  // Puerta de madera
  ctx.fillStyle = '#78350f';
  ctx.fillRect(202, 42, 38, 86);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 2;
  return tex;
}

function buildCutoutDetailsLevel0(targetGroup) {
  const innerEdgeX = (INTERIOR_CONFIG.roadWidth * 0.5) + INTERIOR_CONFIG.sidewalkWidth;
  const lawnTex = createProceduralLawnTexture();
  lawnTex.repeat.set(3, 8);
  const grassMat = new THREE.MeshStandardMaterial({
    map: lawnTex, color: 0xffffff, emissive: new THREE.Color(0x0f2912), emissiveIntensity: 0.3, roughness: 0.9
  });

  // Solo 3 recortes llevan parque con pinos y carteles; los otros 5 llevan comercios y puestos de comida
  const allCutouts = [
    { sign: -1, z0: -232, z1: -200, depth: 9, bevel: 9, hasPark: true },
    { sign: -1, z0: -88,  z1: -56,  depth: 9, bevel: 9, hasPark: false },
    { sign: -1, z0: 56,   z1: 88,   depth: 9, bevel: 9, hasPark: true },
    { sign: -1, z0: 200,  z1: 232,  depth: 9, bevel: 9, hasPark: false },
    { sign: 1,  z0: -280, z1: -248, depth: 9, bevel: 9, hasPark: false },
    { sign: 1,  z0: -136, z1: -104, depth: 9, bevel: 9, hasPark: true },
    { sign: 1,  z0: 104,  z1: 136,  depth: 9, bevel: 9, hasPark: false },
    { sign: 1,  z0: 248,  z1: 280,  depth: 9, bevel: 9, hasPark: false }
  ];

  const pineCoords = [];
  const signCoords = [];
  const shopMats = [0, 1, 2, 3].map(k => new THREE.MeshStandardMaterial({ map: createEverydayShopTexture(k), roughness: 0.7 }));
  const boothWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const boothTopMats = [0xb91c1c, 0x1e40af, 0x166534].map(col => new THREE.MeshStandardMaterial({ color: col, roughness: 0.75 }));

  for (let i = 0; i < allCutouts.length; i++) {
    const c = allCutouts[i];
    const midZ = (c.z0 + c.z1) * 0.5;
    const flatLen = (c.z1 - c.z0) - c.bevel * 2;
    const backWallX = c.sign * (innerEdgeX + c.depth);

    if (c.hasPark) {
      // Parque dejando franja libre de vereda ocre junto a la calle
      const parkW = c.depth - 1.6;
      const parkL = (c.z1 - c.z0) - c.bevel * 1.15;
      const parkCenterX = c.sign * (innerEdgeX + 1.4 + parkW * 0.5);

      const grassMesh = new THREE.Mesh(new THREE.BoxGeometry(parkW, 0.04, parkL), grassMat);
      grassMesh.position.set(parkCenterX, 0.06, midZ);
      targetGroup.add(grassMesh);

      for (let pz = midZ - parkL * 0.36; pz <= midZ + parkL * 0.36; pz += 4.4) {
        pineCoords.push({ x: parkCenterX - c.sign * 1.1, z: pz });
        if (Math.abs(pz - midZ) > 3.2) pineCoords.push({ x: parkCenterX + c.sign * 1.3, z: pz + 1.6 });
      }

      signCoords.push({ x: c.sign * (innerEdgeX + 0.65), z: midZ - parkL * 0.30, idx: i });
      signCoords.push({ x: c.sign * (innerEdgeX + 0.65), z: midZ + parkL * 0.30, idx: i + 1 });
    } else {
      // Negocios comunes en las paredes del recorte + puestos de comida en la plaza ocre
      const rotY = c.sign < 0 ? (Math.PI / 2) : (-Math.PI / 2);
      const shopCount = Math.max(2, Math.floor(flatLen / 3.2));
      const shopSpan = flatLen / shopCount;

      for (let s = 0; s < shopCount; s++) {
        const sz = (c.z0 + c.bevel) + shopSpan * (s + 0.5);
        const shopPlane = new THREE.Mesh(new THREE.PlaneGeometry(shopSpan - 0.12, 1.55), shopMats[(i + s) % shopMats.length]);
        shopPlane.position.set(backWallX - c.sign * 0.05, 0.85, sz);
        shopPlane.rotation.y = rotY;
        targetGroup.add(shopPlane);
      }

      // 2 Puestos de comida callejeros sobre la vereda ocre del recorte
      const boothOffsets = [-flatLen * 0.24, flatLen * 0.24];
      for (let b = 0; b < boothOffsets.length; b++) {
        const bz = midZ + boothOffsets[b];
        const bx = c.sign * (innerEdgeX + c.depth * 0.48);

        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.52, 2.1), boothWoodMat);
        counter.position.set(bx, 0.30, bz);
        const awning = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 2.3), boothTopMats[(i + b) % boothTopMats.length]);
        awning.position.set(bx, 1.32, bz);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), boothWoodMat);
        p1.position.set(bx - 0.5, 0.9, bz - 0.95);
        const p2 = p1.clone(); p2.position.z = bz + 0.95;
        const p3 = p1.clone(); p3.position.x = bx + 0.5;
        const p4 = p3.clone(); p4.position.z = bz + 0.95;
        targetGroup.add(counter, awning, p1, p2, p3, p4);

        if (typeof registerBoxCollider === 'function') {
          registerBoxCollider(bx, 0.7, bz, 1.35, 1.4, 2.3, 0);
        }
      }
    }
  }

  if (pineCoords.length > 0) {
    const trunkGeo = new THREE.CylinderGeometry(0.10, 0.16, 0.75, 6);
    trunkGeo.translate(0, 0.375, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b281e, roughness: 0.9 });
    const coneLowGeo = new THREE.ConeGeometry(0.75, 1.35, 7);
    coneLowGeo.translate(0, 1.15, 0);
    const coneHighGeo = new THREE.ConeGeometry(0.55, 1.15, 7);
    coneHighGeo.translate(0, 1.85, 0);
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x1e4d26, roughness: 0.82 });

    const instTrunk = new THREE.InstancedMesh(trunkGeo, trunkMat, pineCoords.length);
    const instLow = new THREE.InstancedMesh(coneLowGeo, pineMat, pineCoords.length);
    const instHigh = new THREE.InstancedMesh(coneHighGeo, pineMat, pineCoords.length);
    const dummy = new THREE.Object3D();

    for (let p = 0; p < pineCoords.length; p++) {
      const pc = pineCoords[p];
      const sc = 0.85 + Math.abs(Math.sin(p * 11.3)) * 0.45;
      dummy.position.set(pc.x, 0.08, pc.z);
      dummy.rotation.set(0, p * 0.7, 0);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      instTrunk.setMatrixAt(p, dummy.matrix);
      instLow.setMatrixAt(p, dummy.matrix);
      instHigh.setMatrixAt(p, dummy.matrix);
    }
    instTrunk.instanceMatrix.needsUpdate = true;
    instLow.instanceMatrix.needsUpdate = true;
    instHigh.instanceMatrix.needsUpdate = true;
    targetGroup.add(instTrunk, instLow, instHigh);
  }

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.55, metalness: 0.6 });
  const signMats = [0, 1, 2].map(k => new THREE.MeshStandardMaterial({ map: createEverydaySignTexture(k), roughness: 0.6 }));
  for (let s = 0; s < signCoords.length; s++) {
    const sc = signCoords[s];
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.65, 6), poleMat);
    post.position.set(sc.x, 0.86, sc.z);
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.50), signMats[sc.idx % signMats.length]);
    board.position.set(sc.x, 1.32, sc.z);
    targetGroup.add(post, board);
  }
}

function createLevel2FacadeTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5c6675';
  ctx.fillRect(0, 0, 256, 128);
  // Cornisa intermedia de piso y medio
  ctx.fillStyle = '#3b434e';
  ctx.fillRect(0, 52, 256, 5);

  for (let i = 0; i < 4; i++) {
    const wx = 18 + i * 60;
    // Ventana alta (entrepiso) con luz cálida encendida
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(wx, 14, 34, 26);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(wx + 3, 17, 28, 20);

    if (i === 1) {
      // Puerta de acceso proporcionada al piso y medio
      ctx.fillStyle = '#334155';
      ctx.fillRect(wx + 5, 68, 24, 60);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(wx + 9, 74, 16, 20);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx + 5, 68, 24, 60);
    } else {
      // Ventana principal iluminada
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(wx, 72, 34, 30);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(wx + 3, 75, 28, 24);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}


// Guardamos los edificios elegidos para coronar con cúpula circular en el Pasito 3
const level2DomeCandidates = new Array();

function mergeSimpleGeometries(geoList) {
  let totalVerts = 0;
  const nonIndexed = new Array();
  for (let i = 0; i < geoList.length; i++) {
    const g = geoList.at(i).index ? geoList.at(i).toNonIndexed() : geoList.at(i);
    totalVerts += g.attributes.position.count;
    nonIndexed.push(g);
  }
  const posArr = new Float32Array(totalVerts * 3);
  const normArr = new Float32Array(totalVerts * 3);
  const uvArr = new Float32Array(totalVerts * 2);
  let offset = 0;
  for (let i = 0; i < nonIndexed.length; i++) {
    const g = nonIndexed.at(i);
    const p = g.attributes.position.array;
    const n = g.attributes.normal.array;
    const u = g.attributes.uv ? g.attributes.uv.array : null;
    posArr.set(p, offset * 3);
    normArr.set(n, offset * 3);
    if (u) uvArr.set(u, offset * 2);
    offset += g.attributes.position.count;
    g.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normArr, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
  return merged;
}

function buildIrregularLevel2Buildings(targetGroup) {
  level2DomeCandidates.length = 0;
  level2TerracePolys.length = 0;
  level2CylinderTerraces.length = 0;

  const deckY = INTERIOR_CONFIG.upperDeckY;
  const bldgH = 2.7;
  const topY = deckY + bldgH;

  const roofTex = createBrushedMetalTexture('#4a5462', '#262d36');
  roofTex.repeat.set(0.22, 0.22);
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, color: 0x7c8796, roughness: 0.68, metalness: 0.45 });

  const wallTex = createLevel2FacadeTexture();
  wallTex.repeat.set(0.24, 1);
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    emissiveMap: wallTex,
    emissive: new THREE.Color(0xfef08a),
    emissiveIntensity: 0.35,
    roughness: 0.68,
    metalness: 0.35
  });
  const parapetMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.55, metalness: 0.5 });

  const pt = (x, z) => ({ x: x, z: z });

  // Los 4 edificios cilíndricos en "O" con domo chato
  const oBuildings = new Array(
    { x: -86, z: -255, r: 21 },
    { x: -86, z: 140,  r: 21 },
    { x: 86,  z: -185, r: 21 },
    { x: 86,  z: 245,  r: 21 }
  );

  // Generador compacto de módulos respetando el retiro peatonal sobre los recortes angulares
  const makeModulePoly = (type, cx, cz, hx, hz, flipX) => {
    const sx = flipX ? -1 : 1;
    if (type === 'L') {
      return new Array(
        pt(cx - sx * hx, cz - hz), pt(cx + sx * hx, cz - hz),
        pt(cx + sx * hx, cz + hz), pt(cx + sx * hx * 0.15, cz + hz),
        pt(cx + sx * hx * 0.15, cz - hz * 0.15), pt(cx - sx * hx, cz - hz * 0.15)
      );
    }
    if (type === 'U') {
      return new Array(
        pt(cx - sx * hx, cz - hz), pt(cx + sx * hx, cz - hz),
        pt(cx + sx * hx, cz + hz), pt(cx - sx * hx, cz + hz),
        pt(cx - sx * hx, cz + hz * 0.48), pt(cx + sx * hx * 0.25, cz + hz * 0.48),
        pt(cx + sx * hx * 0.25, cz - hz * 0.48), pt(cx - sx * hx, cz - hz * 0.48)
      );
    }
    if (type === 'T') {
      return new Array(
        pt(cx - hx, cz - hz), pt(cx + hx, cz - hz),
        pt(cx + hx, cz - hz * 0.32), pt(cx + hx * 0.36, cz - hz * 0.32),
        pt(cx + hx * 0.36, cz + hz), pt(cx - hx * 0.36, cz + hz),
        pt(cx - hx * 0.36, cz - hz * 0.32), pt(cx - hx, cz - hz * 0.32)
      );
    }
    if (type === 'HEX') {
      return new Array(
        pt(cx - hx * 0.55, cz - hz), pt(cx + hx * 0.55, cz - hz),
        pt(cx + hx, cz), pt(cx + hx * 0.55, cz + hz),
        pt(cx - hx * 0.55, cz + hz), pt(cx - hx, cz)
      );
    }
    return new Array(
      pt(cx - sx * hx, cz - hz), pt(cx + sx * hx * 0.72, cz - hz * 0.65),
      pt(cx + sx * hx, cz + hz * 0.65), pt(cx - sx * hx, cz + hz)
    );
  };

  // Guardamos los módulos válidos indexados por columna/fila para conectar puentes 100% apoyados
  const placedModules = new Array();
  const shapeTypes = new Array('L', 'U', 'T', 'HEX', 'TRAP');
  const laneCols = new Array(
    { side: -1, colIdx: 0, x: -16.5, hx: 3.8, stepZ: 34 },
    { side: -1, colIdx: 1, x: -38.0, hx: 13.5, stepZ: 44 },
    { side: -1, colIdx: 2, x: -72.0, hx: 16.5, stepZ: 46 },
    { side: -1, colIdx: 3, x: -104.0, hx: 11.5, stepZ: 40 },
    { side: 1,  colIdx: 0, x: 16.5,  hx: 3.8, stepZ: 34 },
    { side: 1,  colIdx: 1, x: 38.0,  hx: 13.5, stepZ: 44 },
    { side: 1,  colIdx: 2, x: 72.0,  hx: 16.5, stepZ: 46 },
    { side: 1,  colIdx: 3, x: 104.0, hx: 11.5, stepZ: 40 }
  );

  for (let c = 0; c < laneCols.length; c++) {
    const col = laneCols.at(c);
    const hz = col.stepZ * 0.43;
    let rowIdx = 0;
    for (let z = -440; z <= 440; z += col.stepZ) {
      rowIdx++;
      // Dejar libre la plaza del Auditorio (x=62, z=-20)
      if (Math.hypot(col.x - 62, z - (-20)) < 56) continue;

      // Verificar que no invada el paseo delantero ni quede volando sobre un recorte angular del Nivel 1
      let overhangsCutout = false;
      for (let dzCheck = -hz; dzCheck <= hz; dzCheck += hz * 0.5) {
        const minSafeX = getUpperDeckInnerDist(col.side, z + dzCheck) + 3.2;
        if (Math.abs(col.x) - col.hx < minSafeX) {
          overhangsCutout = true;
          break;
        }
      }
      if (overhangsCutout) continue;

      // Dejar libre el perímetro de los 4 cilindros con domo
      let hitsCyl = false;
      for (let o = 0; o < oBuildings.length; o++) {
        const ob = oBuildings.at(o);
        if (Math.hypot(col.x - ob.x, z - ob.z) < ob.r + Math.max(col.hx, hz) + 2.8) {
          hitsCyl = true;
          break;
        }
      }
      if (hitsCyl) continue;

      // Usar formas con bordes rectos en columnas 1 y 2 para que los puentes empalmen al ras
      const tName = col.hx < 6
        ? ((rowIdx % 2 === 0) ? 'TRAP' : 'L')
        : (col.colIdx === 1 || col.colIdx === 2
          ? ((rowIdx % 3 === 0) ? 'U' : ((rowIdx % 2 === 0) ? 'L' : 'T'))
          : shapeTypes.at((c * 3 + rowIdx) % shapeTypes.length));

      const poly = makeModulePoly(tName, col.x, z, col.hx, hz, (rowIdx + c) % 2 === 0);
      placedModules.push({ side: col.side, colIdx: col.colIdx, rowIdx: rowIdx, cx: col.x, cz: z, hx: col.hx, hz: hz, pts: poly });
    }
  }

  // Generar puentes aéreos ÚNICAMENTE entre módulos reales existentes (cero puentes flotando)
  const skyBridges = new Array();
  for (let i = 0; i < placedModules.length; i++) {
    const mA = placedModules.at(i);
    // Conectar columna 1 con columna 2 cada 3 filas
    if (mA.colIdx === 1 && mA.rowIdx % 3 === 1) {
      for (let j = 0; j < placedModules.length; j++) {
        const mB = placedModules.at(j);
        if (mB.side === mA.side && mB.colIdx === 2 && Math.abs(mB.cz - mA.cz) < 12) {
          const midZ = (mA.cz + mB.cz) * 0.5;
          if (isPointInPolyXZ(mA.cx + mA.side * (mA.hx - 0.5), midZ, mA.pts) &&
              isPointInPolyXZ(mB.cx - mB.side * (mB.hx - 0.5), midZ, mB.pts)) {
            skyBridges.push({
              x0: mA.cx + mA.side * mA.hx,
              z0: midZ,
              x1: mB.cx - mB.side * mB.hx,
              z1: midZ,
              w: 2.8
            });
          }
          break;
        }
      }
    }
    // Conectar fila consecutiva en la misma columna 1 cada 4 filas
    if (mA.colIdx === 1 && mA.rowIdx % 4 === 2) {
      for (let j = 0; j < placedModules.length; j++) {
        const mNext = placedModules.at(j);
        if (mNext.side === mA.side && mNext.colIdx === 1 && mNext.rowIdx === mA.rowIdx + 1) {
          const bridgeX = mA.cx;
          if (isPointInPolyXZ(bridgeX, mA.cz + mA.hz - 0.5, mA.pts) &&
              isPointInPolyXZ(bridgeX, mNext.cz - mNext.hz + 0.5, mNext.pts)) {
            skyBridges.push({
              x0: bridgeX,
              z0: mA.cz + mA.hz,
              x1: bridgeX,
              z1: mNext.cz - mNext.hz,
              w: 2.8
            });
          }
          break;
        }
      }
    }
  }

  const roofGeos = new Array();
  const wallGeos = new Array();
  const railGeos = new Array();

  const addRailWithBridgeOpenings = (pA, pB) => {
    const dx = pB.x - pA.x;
    const dz = pB.z - pA.z;
    const segLen = Math.hypot(dx, dz);
    if (segLen < 0.2) return;
    const angleY = Math.atan2(dx, dz);

    const gaps = new Array();
    for (let sb = 0; sb < skyBridges.length; sb++) {
      const br = skyBridges.at(sb);
      const ends = new Array({ x: br.x0, z: br.z0 }, { x: br.x1, z: br.z1 });
      for (let e = 0; e < ends.length; e++) {
        const ep = ends.at(e);
        const t = ((ep.x - pA.x) * dx + (ep.z - pA.z) * dz) / (segLen * segLen);
        if (t >= -0.02 && t <= 1.02) {
          const projX = pA.x + t * dx;
          const projZ = pA.z + t * dz;
          if (Math.hypot(ep.x - projX, ep.z - projZ) < 0.6) {
            const centerDist = t * segLen;
            const halfGap = br.w * 0.5 - 0.08;
            gaps.push({ a: Math.max(0, centerDist - halfGap), b: Math.min(segLen, centerDist + halfGap) });
          }
        }
      }
    }

    const pushRailSeg = (dStart, dEnd) => {
      const sLen = dEnd - dStart;
      if (sLen < 0.2) return;
      const midDist = (dStart + dEnd) * 0.5;
      const g = new THREE.BoxGeometry(0.16, 0.28, sLen);
      g.rotateY(angleY);
      g.translate(pA.x + (dx / segLen) * midDist, topY + 0.14, pA.z + (dz / segLen) * midDist);
      railGeos.push(g);
    };

    if (gaps.length === 0) {
      pushRailSeg(0, segLen);
      return;
    }
    gaps.sort((g1, g2) => g1.a - g2.a);
    let cursor = 0;
    for (let g = 0; g < gaps.length; g++) {
      const gp = gaps.at(g);
      pushRailSeg(cursor, gp.a);
      cursor = Math.max(cursor, gp.b);
    }
    pushRailSeg(cursor, segLen);
  };

  for (let b = 0; b < placedModules.length; b++) {
    const pts = placedModules.at(b).pts;
    const shape = new THREE.Shape();
    shape.moveTo(pts.at(0).x, -pts.at(0).z);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts.at(i).x, -pts.at(i).z);
    }
    shape.closePath();

    const extGeo = new THREE.ExtrudeGeometry(shape, { depth: bldgH, bevelEnabled: false });
    extGeo.rotateX(-Math.PI / 2);
    extGeo.translate(0, deckY, 0);

    const nonIdx = extGeo.toNonIndexed();
    const pos = nonIdx.attributes.position;
    const norm = nonIdx.attributes.normal;
    const uv = nonIdx.attributes.uv;
    const rPos = new Array(), rNorm = new Array(), rUv = new Array();
    const wPos = new Array(), wNorm = new Array(), wUv = new Array();

    for (let v = 0; v < pos.count; v++) {
      const ny = norm.getY(v);
      if (Math.abs(ny) > 0.5) {
        rPos.push(pos.getX(v), pos.getY(v), pos.getZ(v));
        rNorm.push(norm.getX(v), ny, norm.getZ(v));
        rUv.push(uv.getX(v), uv.getY(v));
      } else {
        wPos.push(pos.getX(v), pos.getY(v), pos.getZ(v));
        wNorm.push(norm.getX(v), ny, norm.getZ(v));
        wUv.push(uv.getX(v), uv.getY(v));
      }
    }
    extGeo.dispose();
    nonIdx.dispose();

    const gRoof = new THREE.BufferGeometry();
    gRoof.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
gRoof.setAttribute('normal', new THREE.Float32BufferAttribute(rNorm, 3));
gRoof.setAttribute('uv', new THREE.Float32BufferAttribute(rUv, 2));
roofGeos.push(gRoof);
const gWall = new THREE.BufferGeometry();
gWall.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
gWall.setAttribute('normal', new THREE.Float32BufferAttribute(wNorm, 3));
gWall.setAttribute('uv', new THREE.Float32BufferAttribute(wUv, 2));
wallGeos.push(gWall);
level2TerracePolys.push({ pts: pts, topY: topY });
if (b % 3 === 0 && pts.length >= 6) {
const cx = (pts.at(0).x + pts.at(1).x) * 0.5;
const cz = (pts.at(0).z + pts.at(2).z) * 0.5;
if (isPointInPolyXZ(cx, cz, pts)) {
const pent = new THREE.BoxGeometry(3.4, 1.15, 2.8);
pent.translate(cx, topY + 0.575, cz);
railGeos.push(pent);
}
}
for (let i = 0; i < pts.length; i++) {
const pA = pts.at(i);
const pB = pts.at((i + 1) % pts.length);
const dx = pB.x - pA.x;
const dz = pB.z - pA.z;
const segLen = Math.hypot(dx, dz);
if (segLen < 0.2) continue;
addRailWithBridgeOpenings(pA, pB);
if (typeof registerBoxCollider === 'function') {
const midX = (pA.x + pB.x) * 0.5;
const midZ = (pA.z + pB.z) * 0.5;
const angleY = Math.atan2(dx, dz);
registerBoxCollider(midX, deckY + bldgH * 0.5, midZ, 1.25, bldgH - 0.1, segLen + 0.6, angleY);
}
}
}
if (roofGeos.length > 0) targetGroup.add(new THREE.Mesh(mergeSimpleGeometries(roofGeos), roofMat));
if (wallGeos.length > 0) targetGroup.add(new THREE.Mesh(mergeSimpleGeometries(wallGeos), wallMat));
if (railGeos.length > 0) targetGroup.add(new THREE.Mesh(mergeSimpleGeometries(railGeos), parapetMat));
// Los 4 edificios cilíndricos en "O" con domo chato del mismo diámetro que el cilindro
const cylWallTex = createLevel2FacadeTexture();
cylWallTex.repeat.set(5, 1);
const cylWallMat = new THREE.MeshStandardMaterial({
map: cylWallTex,
emissiveMap: cylWallTex,
emissive: new THREE.Color(0xfef08a),
emissiveIntensity: 0.35,
roughness: 0.68,
metalness: 0.35
});
const domeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.55, flatShading: true });
const domeRibMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.65 });
for (let o = 0; o < oBuildings.length; o++) {
const ob = oBuildings.at(o);
const cylGeo = new THREE.CylinderGeometry(ob.r, ob.r, bldgH, 28);
const cylMesh = new THREE.Mesh(cylGeo, new Array(cylWallMat, roofMat, roofMat));
cylMesh.position.set(ob.x, deckY + bldgH * 0.5, ob.z);
const rimGeo = new THREE.TorusGeometry(ob.r, 0.24, 8, 28);
rimGeo.rotateX(Math.PI / 2);
const rimMesh = new THREE.Mesh(rimGeo, domeRibMat);
rimMesh.position.set(ob.x, topY + 0.08, ob.z);
const domeGeo = new THREE.SphereGeometry(ob.r, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.48);
domeGeo.scale(1.0, 0.28, 1.0);
const domeMesh = new THREE.Mesh(domeGeo, domeMat);
domeMesh.position.set(ob.x, topY, ob.z);
targetGroup.add(cylMesh, rimMesh, domeMesh);
level2CylinderTerraces.push({ x: ob.x, z: ob.z, r: ob.r, topY: topY });

if (typeof registerBoxCollider === 'function') {
   const octSide = ob.r * 1.82;
   registerBoxCollider(ob.x, deckY + bldgH * 0.5, ob.z, octSide, bldgH, octSide, 0);
   registerBoxCollider(ob.x, deckY + bldgH * 0.5, ob.z, octSide, bldgH, octSide, Math.PI / 4);
   const domeH = ob.r * 0.28;
   registerBoxCollider(ob.x, topY + domeH * 0.28, ob.z, ob.r * 1.55, domeH * 0.55, ob.r * 1.55, 0);
   registerBoxCollider(ob.x, topY + domeH * 0.72, ob.z, ob.r * 0.95, domeH * 0.45, ob.r * 0.95, 0);
  }
 }

// Puentes aéreos 100% conectados entre módulos válidos
for (let sb = 0; sb < skyBridges.length; sb++) {
const br = skyBridges.at(sb);
const dx = br.x1 - br.x0;
const dz = br.z1 - br.z0;
const span = Math.hypot(dx, dz);
const midX = (br.x0 + br.x1) * 0.5;
const midZ = (br.z0 + br.z1) * 0.5;
const angleY = Math.atan2(dx, dz);
const deckMesh = new THREE.Mesh(new THREE.BoxGeometry(br.w, 0.24, span), roofMat);
deckMesh.position.set(midX, topY - 0.12, midZ);
deckMesh.rotation.y = angleY;
const railL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, span + 0.16), parapetMat);
railL.position.set(-br.w * 0.5 + 0.08, 0.26, 0);
const railR = railL.clone();
railR.position.x = br.w * 0.5 - 0.08;
deckMesh.add(railL, railR);
targetGroup.add(deckMesh);
if (typeof registerBoxCollider === 'function') {
const boxW = Math.abs(dx) > Math.abs(dz) ? span : br.w;
const boxD = Math.abs(dx) > Math.abs(dz) ? br.w : span;
registerBoxCollider(midX, topY - 0.12, midZ, boxW, 0.24, boxD, 0);
}
}
// Pequeñas áreas verdes con pinos en los callejones estrechos
const pocketGrassMat = new THREE.MeshStandardMaterial({ color: 0x225429, roughness: 0.88 });
const pockets = new Array(
pt(-53.5, -335), pt(-53.5, -210), pt(-53.5, -85), pt(-53.5, 40), pt(-53.5, 195), pt(-53.5, 315),
pt(53.5, -335),  pt(53.5, -230),  pt(53.5, -105), pt(53.5, 95),  pt(53.5, 200),  pt(53.5, 325)
);
const trunkGeo = new THREE.CylinderGeometry(0.10, 0.15, 0.75, 6);
trunkGeo.translate(0, 0.375, 0);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b281e, roughness: 0.9 });
const coneLowGeo = new THREE.ConeGeometry(0.72, 1.35, 7);
coneLowGeo.translate(0, 1.15, 0);
const coneHighGeo = new THREE.ConeGeometry(0.52, 1.10, 7);
coneHighGeo.translate(0, 1.82, 0);
const pineMat = new THREE.MeshStandardMaterial({ color: 0x1e4d26, roughness: 0.82 });
const instTrunk = new THREE.InstancedMesh(trunkGeo, trunkMat, pockets.length * 2);
const instLow = new THREE.InstancedMesh(coneLowGeo, pineMat, pockets.length * 2);
const instHigh = new THREE.InstancedMesh(coneHighGeo, pineMat, pockets.length * 2);
const dummy = new THREE.Object3D();
for (let p = 0; p < pockets.length; p++) {
const pk = pockets.at(p);
const patch = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 7.0), pocketGrassMat);
patch.position.set(pk.x, deckY + 0.03, pk.z);
targetGroup.add(patch);
for (let t = 0; t < 2; t++) {
const idx = p * 2 + t;
const tz = pk.z + (t === 0 ? -1.8 : 1.8);
const sc = 0.82 + (p % 3) * 0.14;
dummy.position.set(pk.x, deckY + 0.05, tz);
dummy.rotation.set(0, idx * 0.9, 0);
dummy.scale.set(sc, sc, sc);
dummy.updateMatrix();
instTrunk.setMatrixAt(idx, dummy.matrix);
instLow.setMatrixAt(idx, dummy.matrix);
instHigh.setMatrixAt(idx, dummy.matrix);
}
}
instTrunk.instanceMatrix.needsUpdate = true;
instLow.instanceMatrix.needsUpdate = true;
instHigh.instanceMatrix.needsUpdate = true;
targetGroup.add(instTrunk, instLow, instHigh);
}

function buildPedestrianWalkwayMarkings(targetGroup) {
  const deckY = INTERIOR_CONFIG.upperDeckY + 0.012;
  const len = INTERIOR_CONFIG.length;
  const halfL = len * 0.5;

  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, polygonOffset: true, polygonOffsetFactor: -1 });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xeab308, polygonOffset: true, polygonOffsetFactor: -1 });

  // Corredores peatonales libres entre las columnas de edificios (|x| = 6.5, 22.5, 53.5, 90.0)
  const lanes = new Array(
    { x: -6.5,  w: 3.6 },
    { x: -22.5, w: 3.4 },
    { x: -53.5, w: 3.4 },
    { x: -90.5, w: 3.4 },
    { x: 6.5,   w: 3.6 },
    { x: 22.5,  w: 3.4 },
    { x: 53.5,  w: 3.4 },
    { x: 90.5,  w: 3.4 }
  );

  // Verificar si un punto (x, z) está 100% libre (fuera de recortes, fuera de edificios L/U/T y fuera de cilindros)
  const isWalkwayFree = (x, z) => {
    const sign = x < 0 ? -1 : 1;
    if (Math.abs(x) < getUpperDeckInnerDist(sign, z) + 0.6) return false;
    if (Math.hypot(x - 62, z - (-20)) < 46) return false;

    for (let i = 0; i < level2TerracePolys.length; i++) {
      if (isPointInPolyXZ(x, z, level2TerracePolys.at(i).pts)) return false;
    }
    for (let c = 0; c < level2CylinderTerraces.length; c++) {
      const cyl = level2CylinderTerraces.at(c);
      if (Math.hypot(x - cyl.x, z - cyl.z) <= cyl.r + 0.8) return false;
    }
    return true;
  };

  const guideMatricesW = new Array();
  const guideMatricesY = new Array();
  const zebraMatrices = new Array();
  const dummy = new THREE.Object3D();
  const stepZ = 4.0;

  for (let l = 0; l < lanes.length; l++) {
    const ln = lanes.at(l);
    const halfSpan = ln.w * 0.44;
    let segCount = 0;

    for (let z = -halfL + 10; z <= halfL - 10; z += stepZ) {
      const okCenter = isWalkwayFree(ln.x, z);
      const okLeft = isWalkwayFree(ln.x - halfSpan, z);
      const okRight = isWalkwayFree(ln.x + halfSpan, z);

      if (!okCenter || !okLeft || !okRight) {
        segCount = 0;
        continue;
      }
      segCount++;

      // Líneas guía laterales continuas siguiendo solo el corredor libre
      dummy.position.set(ln.x - halfSpan, deckY, z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(0.12, stepZ, 1);
      dummy.updateMatrix();
      guideMatricesW.push(dummy.matrix.clone());

      dummy.position.set(ln.x + halfSpan, deckY, z);
      dummy.updateMatrix();
      guideMatricesY.push(dummy.matrix.clone());

      // Paso de cebra cada 10 tramos libres (solo donde el corredor está despejado)
      if (segCount % 10 === 5) {
        for (let b = -halfSpan + 0.35; b <= halfSpan - 0.35; b += 0.48) {
          dummy.position.set(ln.x + b, deckY + 0.002, z);
          dummy.scale.set(0.24, 1.5, 1);
          dummy.updateMatrix();
          zebraMatrices.push(dummy.matrix.clone());
        }
      }
    }
  }

  const unitPlane = new THREE.PlaneGeometry(1, 1);
  if (guideMatricesW.length > 0) {
    const instW = new THREE.InstancedMesh(unitPlane, whiteLineMat, guideMatricesW.length);
    for (let i = 0; i < guideMatricesW.length; i++) instW.setMatrixAt(i, guideMatricesW.at(i));
    instW.instanceMatrix.needsUpdate = true;
    targetGroup.add(instW);
  }
  if (guideMatricesY.length > 0) {
    const instY = new THREE.InstancedMesh(unitPlane, yellowLineMat, guideMatricesY.length);
    for (let i = 0; i < guideMatricesY.length; i++) instY.setMatrixAt(i, guideMatricesY.at(i));
    instY.instanceMatrix.needsUpdate = true;
    targetGroup.add(instY);
  }
  if (zebraMatrices.length > 0) {
    const instZ = new THREE.InstancedMesh(unitPlane, whiteLineMat, zebraMatrices.length);
    for (let i = 0; i < zebraMatrices.length; i++) instZ.setMatrixAt(i, zebraMatrices.at(i));
    instZ.instanceMatrix.needsUpdate = true;
    targetGroup.add(instZ);
  }
}

function buildLevel3TerracePavilions(targetGroup) {
  level3Pavilions.length = 0;
  level3PolyTerraces.length = 0;
  const pavH = 1.85; // 1 piso de altura sobre las terrazas del Nivel 2

  const wallTex = createLevel2FacadeTexture();
  wallTex.repeat.set(0.32, 0.52);
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    emissiveMap: wallTex,
    emissive: new THREE.Color(0xfef08a),
    emissiveIntensity: 0.38,
    roughness: 0.65,
    metalness: 0.35
  });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x7c8796, roughness: 0.65, metalness: 0.45 });
  const domeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.42, metalness: 0.58, flatShading: true });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.65 });
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x1e4d26, roughness: 0.85 });

  const pt = (x, z) => ({ x: x, z: z });
  const makeMiniPoly = (kind, cx, cz, hx, hz) => {
    if (kind === 'L') {
      return new Array(
        pt(cx - hx, cz - hz), pt(cx + hx, cz - hz),
        pt(cx + hx, cz + hz), pt(cx + hx * 0.1, cz + hz),
        pt(cx + hx * 0.1, cz - hz * 0.1), pt(cx - hx, cz - hz * 0.1)
      );
    }
    if (kind === 'U') {
      return new Array(
        pt(cx - hx, cz - hz), pt(cx + hx, cz - hz),
        pt(cx + hx, cz + hz), pt(cx - hx, cz + hz),
        pt(cx - hx, cz + hz * 0.45), pt(cx + hx * 0.2, cz + hz * 0.45),
        pt(cx + hx * 0.2, cz - hz * 0.45), pt(cx - hx, cz - hz * 0.45)
      );
    }
    return new Array(
      pt(cx - hx, cz - hz), pt(cx + hx, cz - hz),
      pt(cx + hx, cz - hz * 0.3), pt(cx + hx * 0.35, cz - hz * 0.3),
      pt(cx + hx * 0.35, cz + hz), pt(cx - hx * 0.35, cz + hz),
      pt(cx - hx * 0.35, cz - hz * 0.3), pt(cx - hx, cz - hz * 0.3)
    );
  };

  const roofGeos = new Array();
  const wallGeos = new Array();
  const railGeos = new Array();
  const miniKinds = new Array('L', 'U', 'T');

  for (let i = 0; i < level2TerracePolys.length; i++) {
    // Usar 2 de cada 3 terrazas grandes del Nivel 2 (1 con domo, 1 con forma L/U/T)
    if (i % 3 === 2) continue;

    const poly = level2TerracePolys.at(i);
    const pts = poly.pts;
    if (!pts || pts.length < 4) continue;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let k = 0; k < pts.length; k++) {
      minX = Math.min(minX, pts.at(k).x);
      maxX = Math.max(maxX, pts.at(k).x);
      minZ = Math.min(minZ, pts.at(k).z);
      maxZ = Math.max(maxZ, pts.at(k).z);
    }
    const cx = (minX + maxX) * 0.5;
    const cz = (minZ + maxZ) * 0.5;
    const baseY = poly.topY;
    const topY = baseY + pavH;

    if (i % 3 === 0) {
      // Pabellón circular con domo
      const pavR = 4.6;
      const checkR = pavR + 0.8;
      const fitsInside =
        isPointInPolyXZ(cx, cz, pts) &&
        isPointInPolyXZ(cx + checkR, cz, pts) &&
        isPointInPolyXZ(cx - checkR, cz, pts) &&
        isPointInPolyXZ(cx, cz + checkR, pts) &&
        isPointInPolyXZ(cx, cz - checkR, pts);
      if (!fitsInside) continue;

      const bodyGeo = new THREE.CylinderGeometry(pavR, pavR, pavH, 12);
      const bodyMesh = new THREE.Mesh(bodyGeo, new Array(wallMat, roofMat, roofMat));
      bodyMesh.position.set(cx, baseY + pavH * 0.5, cz);

      const rimGeo = new THREE.TorusGeometry(pavR, 0.16, 6, 12);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.set(cx, topY + 0.05, cz);

      const domeGeo = new THREE.SphereGeometry(pavR, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48);
      domeGeo.scale(1.0, 0.36, 1.0);
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.set(cx, topY, cz);

      const bush1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), shrubMat);
      bush1.position.set(cx + pavR + 0.45, baseY + 0.28, cz - 0.8);
      const bush2 = bush1.clone();
      bush2.position.z = cz + 0.8;

      targetGroup.add(bodyMesh, rimMesh, domeMesh, bush1, bush2);
      level3Pavilions.push({ x: cx, z: cz, r: pavR, topY: topY });

        if (typeof registerBoxCollider === 'function') {
        const octSide = pavR * 1.82;
        registerBoxCollider(cx, baseY + pavH * 0.5, cz, octSide, pavH, octSide, 0);
        registerBoxCollider(cx, baseY + pavH * 0.5, cz, octSide, pavH, octSide, Math.PI / 4);
        const domeH = pavR * 0.36;
        registerBoxCollider(cx, topY + domeH * 0.28, cz, pavR * 1.55, domeH * 0.55, pavR * 1.55, 0);
        registerBoxCollider(cx, topY + domeH * 0.72, cz, pavR * 0.95, domeH * 0.45, pavR * 0.95, 0);
      }
	 }
     
	else {
      // Edificios de 1 piso en forma de L, U o T sobre la terraza del Nivel 2
      const spanX = maxX - minX;
      const spanZ = maxZ - minZ;
      if (spanX < 16 || spanZ < 18) continue;

      const hx = Math.min(8.5, spanX * 0.32);
      const hz = Math.min(9.5, spanZ * 0.32);
      const kind = miniKinds.at(i % miniKinds.length);
      const mPts = makeMiniPoly(kind, cx, cz, hx, hz);

      // Verificar que todos los vértices y el centro caigan dentro de la terraza que lo sostiene
      let allInside = isPointInPolyXZ(cx, cz, pts);
      for (let v = 0; v < mPts.length; v++) {
        if (!isPointInPolyXZ(mPts.at(v).x, mPts.at(v).z, pts)) {
          allInside = false;
          break;
        }
      }
      if (!allInside) continue;

      const shape = new THREE.Shape();
      shape.moveTo(mPts.at(0).x, -mPts.at(0).z);
      for (let v = 1; v < mPts.length; v++) {
        shape.lineTo(mPts.at(v).x, -mPts.at(v).z);
      }
      shape.closePath();

      const extGeo = new THREE.ExtrudeGeometry(shape, { depth: pavH, bevelEnabled: false });
      extGeo.rotateX(-Math.PI / 2);
      extGeo.translate(0, baseY, 0);

      const nonIdx = extGeo.toNonIndexed();
      const pos = nonIdx.attributes.position;
      const norm = nonIdx.attributes.normal;
      const uv = nonIdx.attributes.uv;
      const rPos = new Array(), rNorm = new Array(), rUv = new Array();
      const wPos = new Array(), wNorm = new Array(), wUv = new Array();

      for (let v = 0; v < pos.count; v++) {
        const ny = norm.getY(v);
        if (Math.abs(ny) > 0.5) {
          rPos.push(pos.getX(v), pos.getY(v), pos.getZ(v));
          rNorm.push(norm.getX(v), ny, norm.getZ(v));
          rUv.push(uv.getX(v), uv.getY(v));
        } else {
          wPos.push(pos.getX(v), pos.getY(v), pos.getZ(v));
          wNorm.push(norm.getX(v), ny, norm.getZ(v));
          wUv.push(uv.getX(v), uv.getY(v));
        }
      }
      extGeo.dispose();
      nonIdx.dispose();

      const gRoof = new THREE.BufferGeometry();
      gRoof.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
      gRoof.setAttribute('normal', new THREE.Float32BufferAttribute(rNorm, 3));
      gRoof.setAttribute('uv', new THREE.Float32BufferAttribute(rUv, 2));
      roofGeos.push(gRoof);

      const gWall = new THREE.BufferGeometry();
      gWall.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
      gWall.setAttribute('normal', new THREE.Float32BufferAttribute(wNorm, 3));
      gWall.setAttribute('uv', new THREE.Float32BufferAttribute(wUv, 2));
      wallGeos.push(gWall);

      level3PolyTerraces.push({ pts: mPts, topY: topY });

      for (let e = 0; e < mPts.length; e++) {
        const pA = mPts.at(e);
        const pB = mPts.at((e + 1) % mPts.length);
        const dx = pB.x - pA.x;
        const dz = pB.z - pA.z;
        const segLen = Math.hypot(dx, dz);
        if (segLen < 0.2) continue;

        const midX = (pA.x + pB.x) * 0.5;
        const midZ = (pA.z + pB.z) * 0.5;
        const angleY = Math.atan2(dx, dz);

        const rGeo = new THREE.BoxGeometry(0.14, 0.24, segLen);
        rGeo.rotateY(angleY);
        rGeo.translate(midX, topY + 0.12, midZ);
        railGeos.push(rGeo);

        if (typeof registerBoxCollider === 'function') {
          registerBoxCollider(midX, baseY + pavH * 0.5, midZ, 1.1, pavH - 0.1, segLen + 0.4, angleY);
        }
      }
    }
  }

  if (roofGeos.length > 0) targetGroup.add(new THREE.Mesh(mergeSimpleGeometries(roofGeos), roofMat));
  if (wallGeos.length > 0) targetGroup.add(new THREE.Mesh(mergeSimpleGeometries(wallGeos), wallMat));
  if (railGeos.length > 0) targetGroup.add(new THREE.Mesh(mergeSimpleGeometries(railGeos), rimMat));
}


function buildMacrossInteriorEnvironment(scene, targetGroup) {
scene.background = new THREE.Color(0x030712);
scene.fog = new THREE.FogExp2(0x060d1f, 0.00095);
if (typeof dirLight !== 'undefined' && dirLight) { dirLight.position.set(80, 220, 60); dirLight.color.setHex(0x93c5fd); dirLight.intensity = 0.55; }
if (typeof ambientLight !== 'undefined' && ambientLight) { ambientLight.color.setHex(0x1e293b); ambientLight.intensity = 0.42; }
if (typeof hemiLight !== 'undefined' && hemiLight) { hemiLight.color.setHex(0x38bdf8); hemiLight.groundColor.setHex(0x0f172a); hemiLight.intensity = 0.38; }
const toonGradient = (typeof createAnimeToonGradient === 'function') ? createAnimeToonGradient() : null;
buildAvenueAndSidewalks(targetGroup, toonGradient);
buildUpperCityDecksAndShops(targetGroup);
buildCutoutDetailsLevel0(targetGroup);
buildStraightBridgesWithStairs(targetGroup);
buildOpenDomeAuditorium(targetGroup);
buildIrregularLevel2Buildings(targetGroup);
buildLevel3TerracePavilions(targetGroup);
buildPedestrianWalkwayMarkings(targetGroup);
buildSDF1EngineVault(targetGroup);
buildVerticalGiantMonitors(targetGroup);
}

let vidFrameAccum = 0;

function updateInteriorEnvironment(delta) {
  if (auditoriumLaserGroup) auditoriumLaserGroup.rotation.y += 0.12 * delta;
  updateSpaceBattleWindow(delta);

  if (broadcastScreenState) {
    broadcastScreenState.time += delta;
    broadcastScreenState.accum += delta;
    if (broadcastScreenState.accum >= (1 / 15)) {
      broadcastScreenState.accum = 0;
      drawBroadcastMonitorFrame(broadcastScreenState.ctx, 512, 256, broadcastScreenState.time);
      broadcastScreenState.tex.needsUpdate = true;
    }
  }
}


