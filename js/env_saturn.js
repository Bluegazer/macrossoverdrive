let saturnPlanetGroup = null;
let saturnRingDiscMesh = null;
let saturnRingInstMesh = null;
let saturnDustPoints = null;
let saturnStarsPoints = null;
const saturnRingAsteroids = new Array();

const saturnDummy = new THREE.Object3D();
const SATURN_CENTER = new THREE.Vector3(-80, 55, -1350);
const RING_TILT_X = 0.14;
const RING_TILT_Z = 0.18;
const RING_REF_DIST = 1470;

function computeRingWorldPos(radius, angle, yOffset) {
  const lx = Math.cos(angle) * radius;
  const lz = Math.sin(angle) * radius;
  const cosZ = Math.cos(RING_TILT_Z);
  const sinZ = Math.sin(RING_TILT_Z);
  const rx = lx * cosZ - yOffset * sinZ;
  const ry = lx * sinZ + yOffset * cosZ;
  const cosX = Math.cos(RING_TILT_X);
  const sinX = Math.sin(RING_TILT_X);
  const fy = ry * cosX - lz * sinX;
  const fz = ry * sinX + lz * cosX;
  return {
    x: SATURN_CENTER.x + rx,
    y: SATURN_CENTER.y + fy,
    z: SATURN_CENTER.z + fz
  };
}


function createSpaceStarfield(targetGroup) {
  const starCount = 2600;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const c = new THREE.Color();

  for (let i = 0; i < starCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const radius = 1850 + Math.random() * 450;

    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const tint = Math.random();
    const brightness = 0.45 + Math.random() * 0.55;
    if (tint < 0.25) c.setRGB(0.75 * brightness, 0.88 * brightness, 1.0 * brightness);
    else if (tint < 0.45) c.setRGB(1.0 * brightness, 0.94 * brightness, 0.80 * brightness);
    else c.setRGB(brightness, brightness, brightness);

    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 3.2, sizeAttenuation: true, vertexColors: true,
    transparent: false, depthWrite: true, fog: false
  });

  saturnStarsPoints = new THREE.Points(starGeo, starMat);
  targetGroup.add(saturnStarsPoints);
}
function buildProceduralSaturnRings(targetGroup) {
  saturnRingAsteroids.length = 0;

  const rockGeo = new THREE.DodecahedronGeometry(1.0, 0);
  const posAttr = rockGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const jitter = 0.78 + Math.abs(Math.sin(vx * 12.7 + vy * 7.3 + vz * 5.1)) * 0.45;
    posAttr.setXYZ(i, vx * jitter, vy * jitter * 0.65, vz * jitter);
  }
  rockGeo.computeVertexNormals();

  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe, roughness: 0.88, metalness: 0.05, flatShading: true
  });
  const totalFragments = 3200;
  saturnRingInstMesh = new THREE.InstancedMesh(rockGeo, ringMat, totalFragments);
  saturnRingInstMesh.frustumCulled = false;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // Cinturón de asteroides navegable desde r = 850u (justo fuera del anillo texturizado de 825u) hasta 1680u
  const bands = new Array(
    { rMin: 850,  rMax: 1120, weight: 0.28, palette: new Array(0x64748b, 0x7c8ea6, 0x94a3b8) },
    { rMin: 1130, rMax: 1450, weight: 0.47, palette: new Array(0xcbd5e1, 0x93c5fd, 0xd6cfc2) },
    { rMin: 1460, rMax: 1680, weight: 0.25, palette: new Array(0x94a3b8, 0x60a5fa, 0x9ca3af) }
  );
  for (let i = 0; i < totalFragments; i++) {
    const roll = Math.random();
    let chosenBand = bands.at(1);
    if (roll < bands.at(0).weight) chosenBand = bands.at(0);
    else if (roll > bands.at(0).weight + bands.at(1).weight) chosenBand = bands.at(2);

    const radius = chosenBand.rMin + Math.random() * (chosenBand.rMax - chosenBand.rMin);
    const arcSpread = (Math.random() < 0.82)
      ? (Math.PI * 0.5 + (Math.random() - 0.5) * 1.15)
      : (Math.random() * Math.PI * 2);

    const thicknessY = (Math.random() - 0.5) * 54;
    const wp = computeRingWorldPos(radius, arcSpread, thicknessY);

    if (Math.hypot(wp.x - 0, wp.y - 38, wp.z - 120) < 28) continue;
    const isLargeRock = (Math.random() < 0.08 && Math.hypot(wp.x, wp.z - 120) < 420);
    const sx = isLargeRock ? (5.5 + Math.random() * 6.0) : (0.55 + Math.random() * 2.1);
    const sy = sx * (0.55 + Math.random() * 0.45);
    const sz = sx * (0.7 + Math.random() * 0.5);

    const rotX = Math.random() * Math.PI * 2;
    const rotY = Math.random() * Math.PI * 2;
    const rotZ = Math.random() * Math.PI * 2;

    dummy.position.set(wp.x, wp.y, wp.z);
    dummy.rotation.set(rotX, rotY, rotZ);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    saturnRingInstMesh.setMatrixAt(i, dummy.matrix);

    const hex = chosenBand.palette.at(Math.floor(Math.random() * chosenBand.palette.length));
    color.setHex(hex);
    saturnRingInstMesh.setColorAt(i, color);

    if (isLargeRock && typeof registerBoxCollider === 'function') {
      registerBoxCollider(wp.x, wp.y, wp.z, sx * 1.4, sy * 1.4, sz * 1.4, rotY);
    }

    saturnRingAsteroids.push({
      radius: radius, angle: arcSpread, yOffset: thicknessY,
      speed: (0.003 + Math.random() * 0.002) * (1300 / radius),
      sx: sx, sy: sy, sz: sz, rotX: rotX, rotY: rotY, rotZ: rotZ,
      rotSpeed: (Math.random() - 0.5) * 0.35,
      isStaticCollider: isLargeRock
    });
  }

  saturnRingInstMesh.instanceMatrix.needsUpdate = true;
  if (saturnRingInstMesh.instanceColor) saturnRingInstMesh.instanceColor.needsUpdate = true;
  targetGroup.add(saturnRingInstMesh);
}
function buildSaturnRingDustLayer(targetGroup) {
  const dustCount = 4500;
  const positions = new Float32Array(dustCount * 3);
  const colors = new Float32Array(dustCount * 3);
  const c = new THREE.Color();

  for (let i = 0; i < dustCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 360;
    positions[i * 3 + 1] = 38 + (Math.random() - 0.5) * 240;
    positions[i * 3 + 2] = 120 + (Math.random() - 0.5) * 360;

    const shade = 0.35 + Math.random() * 0.35;
    c.setRGB(shade * 0.88, shade * 0.94, shade * 1.05);
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const dustMat = new THREE.PointsMaterial({
    size: 0.42, sizeAttenuation: true, vertexColors: true,
    transparent: false, depthWrite: true, fog: true
  });

  saturnDustPoints = new THREE.Points(dustGeo, dustMat);
  saturnDustPoints.frustumCulled = false;
  targetGroup.add(saturnDustPoints);
}
function loadSaturnPlanetModel(targetGroup) {
  saturnPlanetGroup = new THREE.Group();
  saturnPlanetGroup.position.copy(SATURN_CENTER);
  saturnPlanetGroup.rotation.z = RING_TILT_Z;
  saturnPlanetGroup.rotation.x = RING_TILT_X;
  targetGroup.add(saturnPlanetGroup);

  const texLoader = new THREE.TextureLoader();
  const saturnTex = texLoader.load('./textures/saturn.webp');
  saturnTex.anisotropy = 4;

  const sphereGeo = new THREE.SphereGeometry(360, 96, 64);
  const sphereMat = new THREE.MeshStandardMaterial({
    map: saturnTex, roughness: 0.85, metalness: 0.04, fog: false
  });
  saturnPlanetGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

  // Disco de 1650u (radio exterior 825u) coplanar con el cinturón de asteroides (r >= 850u)
  const ringsTex = texLoader.load('./textures/saturn_rings.webp');
  ringsTex.anisotropy = 4;

  const discGeo = new THREE.PlaneGeometry(1650, 1650);
  discGeo.rotateX(-Math.PI / 2);

  const discMat = new THREE.MeshStandardMaterial({
    map: ringsTex,
    alphaTest: 0.15,
    transparent: false,
    depthWrite: true,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
    fog: false
  });
  saturnRingDiscMesh = new THREE.Mesh(discGeo, discMat);
  saturnPlanetGroup.add(saturnRingDiscMesh);
}
function buildSaturnOrbitEnvironment(scene, targetGroup) {
  scene.background = new THREE.Color(0x010308);
  scene.fog = new THREE.FogExp2(0x020612, 0.00028);

  if (typeof dirLight !== 'undefined' && dirLight) {
    dirLight.position.set(480, 160, 180);
    dirLight.color.setHex(0xfff7ed);
    dirLight.intensity = 1.45;
  }
  if (typeof ambientLight !== 'undefined' && ambientLight) {
    ambientLight.color.setHex(0x1e293b);
    ambientLight.intensity = 0.24;
  }
  if (typeof hemiLight !== 'undefined' && hemiLight) {
    hemiLight.color.setHex(0x38bdf8);
    hemiLight.groundColor.setHex(0x02040a);
    hemiLight.intensity = 0.22;
  }

  createSpaceStarfield(targetGroup);
  loadSaturnPlanetModel(targetGroup);
  buildProceduralSaturnRings(targetGroup);
  buildSaturnRingDustLayer(targetGroup);
}

function updateSaturnEnvironment(delta) {
  if (saturnPlanetGroup && saturnPlanetGroup.children.length > 0) {
    saturnPlanetGroup.children.at(0).rotation.y += 0.012 * delta;
  }

  if (saturnDustPoints && typeof camera !== 'undefined' && camera) {
    const posAttr = saturnDustPoints.geometry.attributes.position;
    const cx = camera.position.x;
    const cy = camera.position.y;
    const cz = camera.position.z;
    for (let i = 0; i < posAttr.count; i++) {
      let px = posAttr.getX(i);
      let py = posAttr.getY(i);
      let pz = posAttr.getZ(i);
      if (px - cx > 180) px -= 360; else if (px - cx < -180) px += 360;
      if (py - cy > 120) py -= 240; else if (py - cy < -120) py += 240;
      if (pz - cz > 180) pz -= 360; else if (pz - cz < -180) pz += 360;
      posAttr.setXYZ(i, px, py, pz);
    }
    posAttr.needsUpdate = true;
  }

  if (typeof playerContainer !== 'undefined' && playerContainer && typeof velocity !== 'undefined') {
    const toPlayer = playerContainer.position.clone().sub(SATURN_CENTER);
    const dist = toPlayer.length();
    if (dist < 385 && dist > 0.01) {
      toPlayer.normalize();
      playerContainer.position.copy(SATURN_CENTER).addScaledVector(toPlayer, 385);
      const vn = velocity.dot(toPlayer);
      if (vn < 0) velocity.addScaledVector(toPlayer, -vn * 1.25);
    }
  }

  if (saturnRingInstMesh && saturnRingAsteroids.length > 0) {
    for (let i = 0; i < saturnRingAsteroids.length; i++) {
      const a = saturnRingAsteroids.at(i);
      if (a.isStaticCollider) continue;

      a.angle += a.speed * delta;
      a.rotX += a.rotSpeed * delta;
      a.rotY += a.rotSpeed * delta;

      const wp = computeRingWorldPos(a.radius, a.angle, a.yOffset);
      saturnDummy.position.set(wp.x, wp.y, wp.z);
      saturnDummy.rotation.set(a.rotX, a.rotY, a.rotZ);
      saturnDummy.scale.set(a.sx, a.sy, a.sz);
      saturnDummy.updateMatrix();
      saturnRingInstMesh.setMatrixAt(i, saturnDummy.matrix);
    }
    saturnRingInstMesh.instanceMatrix.needsUpdate = true;
  }
}
