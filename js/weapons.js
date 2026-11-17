const bullets = new Array();
const enemyBullets = new Array();
const missiles = new Array();
const explosions = new Array();
const sparks = new Array();
const enemies = new Array();

const MAX_MULTI_LOCK = 4;
const lockedEnemies = new Array();
let score = 0;

let playerArmor = 100;
const playerMaxArmor = 100;
let armorDamageFlash = 0;
let armorRegenDelay = 0;

let isPlayerDying = false;
let isGameOver = false;
let deathExplosionTimer = 0;

let gunCooldown = 0;
let missileCooldown = 0;
let muzzleFlashTimer = 0;

let muzzleGroup = null;
let smokeInstMesh = null;
const MAX_SMOKE = 480;
const smokePool = new Array(MAX_SMOKE);
const dummyObj = new THREE.Object3D();
let smokeCursor = 0;

function createBeamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0.0, 'rgba(234, 88, 12, 0.0)');
  grad.addColorStop(0.15, 'rgba(249, 115, 22, 1.0)');
  grad.addColorStop(0.85, 'rgba(234, 88, 12, 1.0)');
  grad.addColorStop(1.0, 'rgba(194, 65, 12, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(4, 0, 24, 128);
  ctx.fillStyle = 'rgba(255, 140, 30, 1.0)';
  ctx.fillRect(11, 12, 10, 104);
  return new THREE.CanvasTexture(canvas);
}

function createSoftCircleTexture(innerColor, midColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 1, 32, 32, 31);
  grad.addColorStop(0.0, innerColor);
  grad.addColorStop(0.55, midColor);
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function createSparkBloomTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.22, 'rgba(255, 245, 180, 0.95)');
  grad.addColorStop(0.55, 'rgba(255, 140, 20, 0.45)');
  grad.addColorStop(1.0, 'rgba(255, 80, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

const beamTex = createBeamTexture();
const flashTex = createSoftCircleTexture('rgba(255, 230, 190, 1.0)', 'rgba(249, 115, 22, 0.85)');
const uniformSmokeTex = createSoftCircleTexture('rgba(255, 255, 255, 0.92)', 'rgba(230, 240, 255, 0.55)');
const sparkBloomTex = createSparkBloomTexture();

const beamMat = new THREE.MeshBasicMaterial({
  map: beamTex,
  color: 0xff6a00,
  transparent: true,
  blending: THREE.NormalBlending,
  depthWrite: false,
  side: THREE.DoubleSide
});

const enemyBeamMat = new THREE.MeshBasicMaterial({
  map: beamTex, color: 0xff3344, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
});
const beamPlaneGeo = new THREE.PlaneGeometry(0.14, 1.4);
beamPlaneGeo.rotateX(-Math.PI / 2);

const sparkGeo = new THREE.PlaneGeometry(0.042, 0.042);
const impactSparkLight = new THREE.PointLight(0xffaa33, 0, 4.5);

const texLoader = new THREE.TextureLoader();
const explosionFrames = new Array();
const explosionPlaneGeo = new THREE.PlaneGeometry(4.2, 4.2);

for (let i = 1; i <= 10; i++) {
  explosionFrames.push(texLoader.load('./textures/exp' + i + '.webp'));
}

const missileBodyGeo = new THREE.CylinderGeometry(0.022, 0.025, 0.34, 6);
missileBodyGeo.rotateX(Math.PI / 2);
const missileBodyMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });

const missileTipGeo = new THREE.ConeGeometry(0.023, 0.09, 6);
missileTipGeo.rotateX(-Math.PI / 2);
missileTipGeo.translate(0, 0, -0.21);
const missileTipMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

const missileFlameGeo = new THREE.PlaneGeometry(0.18, 0.18);
const missileFlameMat = new THREE.MeshBasicMaterial({
  map: flashTex, color: 0xff8800, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
});

const ZIGZAG_ANGLES_DEG = new Array(20, 35, 45, 60);
function initWeaponsAndEnemies(scene, playerContainer) {
  playerContainer.add(impactSparkLight);

  muzzleGroup = new THREE.Group();
  const muzzleMat = new THREE.MeshBasicMaterial({
    map: flashTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  const mPlane1 = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), muzzleMat);
  const mPlane2 = mPlane1.clone();
  mPlane2.rotateY(Math.PI / 2);
  const mPlane3 = mPlane1.clone();
  mPlane3.rotateX(Math.PI / 2);
  muzzleGroup.add(mPlane1, mPlane2, mPlane3);
  muzzleGroup.position.set(0, -0.15, -0.85);
  muzzleGroup.visible = false;
  playerContainer.add(muzzleGroup);

  const smokeInstGeo = new THREE.PlaneGeometry(0.16, 0.16);
  const smokeInstMat = new THREE.MeshBasicMaterial({
    map: uniformSmokeTex, transparent: true, opacity: 0.72, depthWrite: false
  });
  smokeInstMesh = new THREE.InstancedMesh(smokeInstGeo, smokeInstMat, MAX_SMOKE);
  smokeInstMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  smokeInstMesh.frustumCulled = false;
  scene.add(smokeInstMesh);

  for (let i = 0; i < MAX_SMOKE; i++) {
    smokePool[i] = { active: false, pos: new THREE.Vector3(), life: 0, maxLife: 1, baseScale: 1 };
    dummyObj.scale.set(0, 0, 0);
    dummyObj.updateMatrix();
    smokeInstMesh.setMatrixAt(i, dummyObj.matrix);
  }
  smokeInstMesh.instanceMatrix.needsUpdate = true;

  const podBodyGeo = new THREE.SphereGeometry(0.95, 10, 8);
  const podBodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
  const podEyeGeo = new THREE.SphereGeometry(0.32, 8, 8);
  const podEyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const podFinGeo = new THREE.BoxGeometry(2.4, 0.18, 0.6);

  for (let i = 0; i < 6; i++) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(podBodyGeo, podBodyMat);
    const eye = new THREE.Mesh(podEyeGeo, podEyeMat);
    eye.position.set(0, 0.15, 0.82);
    const fin = new THREE.Mesh(podFinGeo, podBodyMat);
    group.add(body, eye, fin);

    const angle = (i / 6) * Math.PI * 2;
    const radius = 38 + (i % 3) * 18;
    group.position.set(Math.cos(angle) * radius, 8 + (i % 4) * 5, -35 - i * 14);
    scene.add(group);

    enemies.push({
      id: 'TGT-0' + (i + 1),
      mesh: group,
      hp: 3,
      orbitAngle: angle,
      orbitRadius: radius,
      orbitSpeed: (i % 2 === 0 ? 1 : -1) * (0.22 + (i % 3) * 0.06),
      baseY: group.position.y,
      respawnTimer: 0,
      fireCooldown: 1.5 + Math.random() * 2.5,
      lockProgress: 0,
      seekerX: window.innerWidth / 2,
      seekerY: window.innerHeight / 2
    });
  }
}

function fireGunpod(scene, playerContainer, velocity) {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(playerContainer.quaternion);
  const offset = new THREE.Vector3(0, -0.15, -0.9).applyQuaternion(playerContainer.quaternion);

  const boltGroup = new THREE.Group();
  const p1 = new THREE.Mesh(beamPlaneGeo, beamMat);
  const p2 = p1.clone();
  p2.rotateZ(Math.PI / 2);
  boltGroup.add(p1, p2);

  boltGroup.position.copy(playerContainer.position).add(offset);
  boltGroup.quaternion.copy(playerContainer.quaternion);
  scene.add(boltGroup);

  bullets.push({ mesh: boltGroup, vel: forward.multiplyScalar(125).add(velocity), life: 1.5 });

  muzzleGroup.visible = true;
  muzzleGroup.rotation.z = Math.random() * Math.PI;
  const s = 0.8 + Math.random() * 0.5;
  muzzleGroup.scale.set(s, s, s);
  muzzleFlashTimer = 0.04;
}

function fireEnemyBolt(scene, enemy, playerContainer) {
  const boltGroup = new THREE.Group();
  const p1 = new THREE.Mesh(beamPlaneGeo, enemyBeamMat);
  const p2 = p1.clone();
  p2.rotateZ(Math.PI / 2);
  boltGroup.add(p1, p2);

  boltGroup.position.copy(enemy.mesh.position);
  boltGroup.lookAt(playerContainer.position);
  scene.add(boltGroup);

  const dir = new THREE.Vector3().subVectors(playerContainer.position, enemy.mesh.position).normalize();
  dir.x += (Math.random() - 0.5) * 0.09;
  dir.y += (Math.random() - 0.5) * 0.09;
  dir.z += (Math.random() - 0.5) * 0.09;
  dir.normalize();

  enemyBullets.push({ mesh: boltGroup, vel: dir.multiplyScalar(58), life: 2.2 });
}

function pickRandomZigAngleRad() {
  const idx = Math.floor(Math.random() * ZIGZAG_ANGLES_DEG.length);
  return THREE.MathUtils.degToRad(ZIGZAG_ANGLES_DEG[idx]);
}

function planNextZigTarget(missileObj) {
  const yawAngle = pickRandomZigAngleRad() * missileObj.zigSign;
  const pitchAngle = (pickRandomZigAngleRad() * 0.6) * (Math.random() < 0.5 ? 1 : -1);
  const euler = new THREE.Euler(pitchAngle, yawAngle, 0, 'YXZ');
  const offsetQuat = new THREE.Quaternion().setFromEuler(euler);
  missileObj.targetQuat.copy(missileObj.baseQuat).multiply(offsetQuat);
  missileObj.zigSign *= -1;
  missileObj.zigTimer = 0.36 + Math.random() * 0.18;
}

function fireMicroMissiles(scene, playerContainer) {
  const activeTargets = lockedEnemies.filter((e) => e && e.respawnTimer <= 0);
  const offsets = new Array(
    new THREE.Vector3(-0.65, -0.04, -0.15),
    new THREE.Vector3(0.65, -0.04, -0.15),
    new THREE.Vector3(-0.42, -0.04, -0.15),
    new THREE.Vector3(0.42, -0.04, -0.15)
  );
  offsets.forEach((localOff, idx) => {
    const worldOff = localOff.clone().applyQuaternion(playerContainer.quaternion);
    const mGroup = new THREE.Group();

    const body = new THREE.Mesh(missileBodyGeo, missileBodyMat);
    const tip = new THREE.Mesh(missileTipGeo, missileTipMat);
    const flame = new THREE.Mesh(missileFlameGeo, missileFlameMat);
    flame.position.set(0, 0, 0.2);
    mGroup.add(body, tip, flame);

    const spawnPos = playerContainer.position.clone().add(worldOff);
    mGroup.position.copy(spawnPos);
    mGroup.quaternion.copy(playerContainer.quaternion);
    scene.add(mGroup);

    const assignedEnemy = activeTargets.length > 0
      ? activeTargets[idx % activeTargets.length]
      : null;

    missiles.push({
      mesh: mGroup,
      lastTailPos: spawnPos.clone(),
      baseQuat: playerContainer.quaternion.clone(),
      targetQuat: playerContainer.quaternion.clone(),
      targetEnemy: assignedEnemy,
      speed: 38,
      life: 3.4,
      straightTimer: 0.26,
      zigTimer: 0,
      zigCount: 0,
      zigSign: (idx % 2 === 0 ? 1 : -1)
    });
  });

  if (typeof playSFX === 'function') playSFX('missileLaunch', 0.8, 0.05);
}
function spawnSmokeParticle(pos, scale) {
  const p = smokePool[smokeCursor];
  smokeCursor = (smokeCursor + 1) % MAX_SMOKE;
  p.active = true;
  p.pos.copy(pos);
  p.life = 1.1;
  p.maxLife = 1.1;
  p.baseScale = scale;
}

const tmpLerpPos = new THREE.Vector3();
const tmpForward = new THREE.Vector3();
const tmpTailPos = new THREE.Vector3();
const tmpLookMat = new THREE.Matrix4();
const tmpTargetQuat = new THREE.Quaternion();

function spawnUniformSmokeSegment(startPos, endPos, distFromPlayer) {
  const segmentDist = startPos.distanceTo(endPos);
  const steps = Math.min(8, Math.max(1, Math.ceil(segmentDist / 0.16)));
  const isFar = distFromPlayer > 32;
  const farFactor = isFar ? Math.min(1.0, (distFromPlayer - 32) / 55) : 0.0;
  const baseScale = isFar ? (1.0 + farFactor * 1.1) : 1.0;

  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    tmpLerpPos.lerpVectors(startPos, endPos, t);
    spawnSmokeParticle(tmpLerpPos, baseScale);
  }
}

function spawnImpactSparks(scene, camera, pos) {
  impactSparkLight.position.set(
    (Math.random() - 0.5) * 0.3,
    0.15,
    (Math.random() - 0.5) * 0.3
  );
  impactSparkLight.intensity = 4.2;

  for (let i = 0; i < 24; i++) {
    const isWhiteHot = (i % 3 !== 0);
    const mat = new THREE.MeshBasicMaterial({
      map: sparkBloomTex,
      color: isWhiteHot ? 0xffffff : 0xff9922,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(sparkGeo, mat);
    mesh.position.copy(pos);
    mesh.position.x += (Math.random() - 0.5) * 0.08;
    mesh.position.y += (Math.random() - 0.5) * 0.08;
    mesh.position.z += (Math.random() - 0.5) * 0.08;
    mesh.quaternion.copy(camera.quaternion);
    scene.add(mesh);

    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    const speed = 7.5 + Math.random() * 6.5;

    sparks.push({
      mesh: mesh,
      mat: mat,
      vel: dir.multiplyScalar(speed),
      life: 0.16 + Math.random() * 0.08,
      maxLife: 0.24
    });
  }
}

function spawnExplosion(scene, camera, pos, scaleMult) {
  if (explosionFrames.length === 0) return;
  const s = scaleMult || 1.0;

  const mat = new THREE.MeshBasicMaterial({
    map: explosionFrames[0],
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(explosionPlaneGeo, mat);
  mesh.position.copy(pos);
  mesh.scale.set(s, s, s);
  mesh.quaternion.copy(camera.quaternion);
  scene.add(mesh);

  explosions.push({
    mesh: mesh,
    mat: mat,
    life: 0.52,
    maxLife: 0.52
  });
}

function damagePlayerArmor(scene, camera, playerContainer, dmg) {
  if (isPlayerDying || isGameOver) return;

  playerArmor = Math.max(0, playerArmor - dmg);
  armorDamageFlash = 0.35;
  armorRegenDelay = 3.5;

  spawnImpactSparks(scene, camera, playerContainer.position);

  if (playerArmor <= 0) {
    isPlayerDying = true;
    deathExplosionTimer = 0;
    if (typeof isAccelerating !== 'undefined' && isAccelerating) stopAcceleration();
    spawnExplosion(scene, camera, playerContainer.position, 1.2);
  }
}

function damageEnemy(scene, camera, enemy, dmg) {
  if (enemy.respawnTimer > 0) return;
  enemy.hp -= dmg;
  if (enemy.hp <= 0) {
    spawnExplosion(scene, camera, enemy.mesh.position, 1.0);
    enemy.mesh.visible = false;
    enemy.respawnTimer = 4.0;
    enemy.lockProgress = 0;
    score += 100;
  }
}
function updateEnemies(delta, playerContainer) {
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.respawnTimer > 0) {
      e.respawnTimer -= delta;
      if (e.respawnTimer <= 0) {
        e.hp = 3;
        e.mesh.visible = true;
      }
      continue;
    }
    e.orbitAngle += e.orbitSpeed * delta;
    e.mesh.position.x = Math.cos(e.orbitAngle) * e.orbitRadius;
    e.mesh.position.z = -50 + Math.sin(e.orbitAngle) * e.orbitRadius;
    e.mesh.position.y = e.baseY + Math.sin(e.orbitAngle * 2.5) * 3.5;
    e.mesh.lookAt(playerContainer.position);

    const dist = e.mesh.position.distanceTo(playerContainer.position);
    if (dist < 75 && !isPlayerDying && !isGameOver) {
      e.fireCooldown -= delta;
      if (e.fireCooldown <= 0) {
        fireEnemyBolt(scene, e, playerContainer);
        e.fireCooldown = 2.4 + Math.random() * 2.2;
      }
    }
  }
}

function updateWeapons(delta, scene, camera, playerContainer, velocity, keys) {
  if (gunCooldown > 0) gunCooldown -= delta;
  if (missileCooldown > 0) missileCooldown -= delta;
  if (armorDamageFlash > 0) armorDamageFlash = Math.max(0, armorDamageFlash - delta);
  if (impactSparkLight.intensity > 0) {
    impactSparkLight.intensity = Math.max(0, impactSparkLight.intensity - 16.0 * delta);
  }

  if (!isPlayerDying && !isGameOver && playerArmor > 0) {
    if (armorRegenDelay > 0) {
      armorRegenDelay -= delta;
    } else if (playerArmor < playerMaxArmor) {
      playerArmor = Math.min(playerMaxArmor, playerArmor + 8.0 * delta);
    }
  }

  if (muzzleFlashTimer > 0) {
    muzzleFlashTimer -= delta;
    if (muzzleFlashTimer <= 0) muzzleGroup.visible = false;
  }

  if (!isPlayerDying && !isGameOver) {
    if (keys['ShiftLeft'] && gunCooldown <= 0) {
      fireGunpod(scene, playerContainer, velocity);
      gunCooldown = 0.085;
    }
    if (keys['Space'] && missileCooldown <= 0) {
      fireMicroMissiles(scene, playerContainer);
      missileCooldown = 0.55;
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.mesh.position.addScaledVector(b.vel, delta);
    b.life -= delta;

    let hit = false;
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (e.respawnTimer <= 0 && b.mesh.position.distanceTo(e.mesh.position) < 1.8) {
        damageEnemy(scene, camera, e, 1);
        hit = true;
        break;
      }
    }

    if (hit || b.life <= 0) {
      scene.remove(b.mesh);
      bullets.splice(i, 1);
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    eb.mesh.position.addScaledVector(eb.vel, delta);
    eb.life -= delta;

    let hitPlayer = false;
    if (!isPlayerDying && !isGameOver && eb.mesh.position.distanceTo(playerContainer.position) < 1.15) {
      damagePlayerArmor(scene, camera, playerContainer, 15);
      hitPlayer = true;
    }

    if (hitPlayer || eb.life <= 0) {
      scene.remove(eb.mesh);
      enemyBullets.splice(i, 1);
    }
  }

  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];

    if (m.straightTimer > 0) {
      m.straightTimer -= delta;
      if (m.straightTimer <= 0) planNextZigTarget(m);
    } else if (m.targetEnemy && m.targetEnemy.respawnTimer <= 0 && m.zigCount >= 2) {
      tmpLookMat.lookAt(m.mesh.position, m.targetEnemy.mesh.position, new THREE.Vector3(0, 1, 0));
      tmpTargetQuat.setFromRotationMatrix(tmpLookMat);
      m.mesh.quaternion.slerp(tmpTargetQuat, 8.5 * delta);
    } else {
      m.zigTimer -= delta;
      if (m.zigTimer <= 0) {
        planNextZigTarget(m);
        m.zigCount++;
      }
      m.mesh.quaternion.slerp(m.targetQuat, 11.0 * delta);
    }

    tmpForward.set(0, 0, -1).applyQuaternion(m.mesh.quaternion);
    m.speed += 28 * delta;
    m.mesh.position.addScaledVector(tmpForward, m.speed * delta);

    tmpTailPos.copy(m.mesh.position).addScaledVector(tmpForward, -0.18);
    const distFromPlayer = m.mesh.position.distanceTo(playerContainer.position);
    spawnUniformSmokeSegment(m.lastTailPos, tmpTailPos, distFromPlayer);
    m.lastTailPos.copy(tmpTailPos);

    let hit = false;
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (e.respawnTimer <= 0 && m.mesh.position.distanceTo(e.mesh.position) < 2.2) {
        damageEnemy(scene, camera, e, 3);
        hit = true;
        break;
      }
    }

    m.life -= delta;
    if (hit || m.life <= 0) {
      scene.remove(m.mesh);
      missiles.splice(i, 1);
    }
  }

  let anyUpdated = false;
  for (let i = 0; i < MAX_SMOKE; i++) {
    const p = smokePool[i];
    if (!p.active) continue;
    anyUpdated = true;
    p.life -= delta;
    if (p.life <= 0) {
      p.active = false;
      dummyObj.scale.set(0, 0, 0);
      dummyObj.updateMatrix();
      smokeInstMesh.setMatrixAt(i, dummyObj.matrix);
    } else {
      const lifeRatio = p.life / p.maxLife;
      const scale = p.baseScale * (lifeRatio > 0.45 ? 1.0 : (lifeRatio / 0.45));
      dummyObj.position.copy(p.pos);
      dummyObj.quaternion.copy(camera.quaternion);
      dummyObj.scale.set(scale, scale, scale);
      dummyObj.updateMatrix();
      smokeInstMesh.setMatrixAt(i, dummyObj.matrix);
    }
  }
  if (anyUpdated) smokeInstMesh.instanceMatrix.needsUpdate = true;

  for (let i = sparks.length - 1; i >= 0; i--) {
    const sp = sparks[i];
    sp.life -= delta;
    sp.vel.multiplyScalar(1.0 - 2.5 * delta);
    sp.mesh.position.addScaledVector(sp.vel, delta);
    sp.mesh.quaternion.copy(camera.quaternion);
    sp.mat.opacity = Math.max(0, sp.life / sp.maxLife);
    if (sp.life <= 0) {
      scene.remove(sp.mesh);
      sp.mat.dispose();
      sparks.splice(i, 1);
    }
  }

  for (let i = explosions.length - 1; i >= 0; i--) {
    const ex = explosions[i];
    ex.life -= delta;
    ex.mesh.quaternion.copy(camera.quaternion);

    const total = explosionFrames.length;
    if (total > 0) {
      const progress = 1.0 - Math.max(0, ex.life / ex.maxLife);
      const frameIndex = Math.min(total - 1, Math.floor(progress * total));
      ex.mat.map = explosionFrames[frameIndex];
    }

    if (ex.life <= 0) {
      scene.remove(ex.mesh);
      ex.mat.dispose();
      explosions.splice(i, 1);
    }
  }
}