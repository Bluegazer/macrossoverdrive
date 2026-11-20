const MP_NAME_KEY = 'macrossvoxp-pilot-name-v1';

const mpState = {
  active: false,
  isHost: false,
  country: 'AR',
  pilotName: 'PILOT-01',
  rivalName: 'RIVAL',
  rivalCountry: 'AR',
  rivalArmor: 140,
  rivalMaxArmor: 140,
  rivalMesh: null,
  rivalMixer: null,
  rivalAction: null,
  rivalClipDur: 0,
  rivalMode: 'FIGHTER',
  targetPos: new THREE.Vector3(0, 38, -140),
  targetQuat: new THREE.Quaternion(),
  peer: null,
  conn: null,
  sendTimer: 0,
  matchEnded: false,
  victory: false
};

function detectLocalCountryCode() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Argentina') || tz.includes('Buenos_Aires') || tz.includes('Cordoba') || tz.includes('Mendoza')) return 'AR';
    if (tz.includes('Santiago')) return 'CL';
    if (tz.includes('Montevideo')) return 'UY';
    if (tz.includes('Sao_Paulo')) return 'BR';
    if (tz.includes('Mexico')) return 'MX';
    if (tz.includes('Bogota')) return 'CO';
    if (tz.includes('Lima')) return 'PE';
    if (tz.includes('Madrid')) return 'ES';
  } catch (e) {}
  return 'AR';
}
function initMultiplayerUI() {
  const mpScreen = document.getElementById('multiplayerScreen');
  const btnOpen = document.getElementById('btnMultiplayer');
  const btnClose = document.getElementById('btnCloseMp');
  const btnBack = document.getElementById('btnBackMp');
  const nameInput = document.getElementById('mpPilotName');
  const countryBadge = document.getElementById('mpCountryBadge');
  const btnCreate = document.getElementById('btnCreateRoom');
  const btnCopy = document.getElementById('btnCopyRoomCode');
  const btnJoin = document.getElementById('btnJoinRoom');
  const codeOut = document.getElementById('mpRoomCodeOut');
  const codeIn = document.getElementById('mpRoomCodeIn');

  mpState.country = detectLocalCountryCode();
  if (countryBadge) countryBadge.textContent = 'REGIÓN: ' + mpState.country;

  fetch('https://ipwho.is')
    .then((r) => r.json())
    .then((d) => {
      if (d && d.success && d.country_code) {
        mpState.country = String(d.country_code).toUpperCase();
        if (countryBadge) countryBadge.textContent = 'REGIÓN: ' + mpState.country;
      }
    })
    .catch(() => {});

  try {
    const savedName = localStorage.getItem(MP_NAME_KEY);
    if (savedName && nameInput) nameInput.value = savedName;
  } catch (e) {}

  if (btnOpen && mpScreen) {
    btnOpen.addEventListener('click', () => mpScreen.classList.remove('hidden'));
  }
  const closeMp = () => { if (mpScreen) mpScreen.classList.add('hidden'); };
  if (btnClose) btnClose.addEventListener('click', closeMp);
  if (btnBack) btnBack.addEventListener('click', closeMp);

  if (btnCreate) btnCreate.addEventListener('click', () => createMultiplayerRoom(nameInput, codeOut));
  if (btnJoin) btnJoin.addEventListener('click', () => joinMultiplayerRoom(nameInput, codeIn));
  if (btnCopy && codeOut) {
    btnCopy.addEventListener('click', () => {
      if (!codeOut.value) return;
      navigator.clipboard?.writeText(codeOut.value).catch(() => {});
      setMpStatus('Código ' + codeOut.value + ' copiado. Pásalo a tu rival de ' + mpState.country + '.');
    });
  }
}
function setMpStatus(msg, isError) {
  const el = document.getElementById('mpStatusText');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#f87171' : '#38bdf8';
}

function readPilotName(nameInput) {
  const raw = (nameInput && nameInput.value ? nameInput.value : '').trim().toUpperCase();
  const clean = raw.replace(/[^A-Z0-9 _-]/g, '').slice(0, 16) || ('PILOT-' + Math.floor(10 + Math.random() * 89));
  mpState.pilotName = clean;
  try { localStorage.setItem(MP_NAME_KEY, clean); } catch (e) {}
  return clean;
}

function destroyMpConnection() {
  mpState.active = false;
  mpState.matchEnded = false;
  mpState.victory = false;
  if (mpState.conn) { try { mpState.conn.close(); } catch (e) {} mpState.conn = null; }
  if (mpState.peer) { try { mpState.peer.destroy(); } catch (e) {} mpState.peer = null; }
  if (mpState.rivalMesh && typeof scene !== 'undefined') {
    scene.remove(mpState.rivalMesh);
    mpState.rivalMesh = null;
  }
}

function createMultiplayerRoom(nameInput, codeOut) {
  if (typeof Peer !== 'function') { setMpStatus('Error: librería PeerJS no cargada.', true); return; }
  destroyMpConnection();
  readPilotName(nameInput);

  const num = Math.floor(1000 + Math.random() * 9000);
  const roomCode = mpState.country + '-' + num;
  if (codeOut) codeOut.value = roomCode;
  setMpStatus('Abriendo enlace satelital ' + roomCode + '...');

  const peer = new Peer('macross-od-' + roomCode.toLowerCase());
  mpState.peer = peer;
  mpState.isHost = true;

  peer.on('open', () => {
    setMpStatus('Sala ' + roomCode + ' activa. Esperando rival de ' + mpState.country + '...');
  });

  peer.on('connection', (conn) => {
    if (mpState.conn && mpState.conn.open) {
      conn.on('open', () => { conn.send({ type: 'REJECT', reason: 'PARTIDA EN CURSO' }); setTimeout(() => conn.close(), 150); });
      return;
    }
    mpState.conn = conn;
    setupPeerDataChannel(conn);
  });

  peer.on('error', (err) => setMpStatus('Error de red: ' + (err.type || err.message), true));
}
function joinMultiplayerRoom(nameInput, codeIn) {
  if (typeof Peer !== 'function') { setMpStatus('Error: librería PeerJS no cargada.', true); return; }
  const code = (codeIn && codeIn.value ? codeIn.value : '').trim().toUpperCase();
  if (!/^[A-Z]{2}-\d{4}$/.test(code)) {
    setMpStatus('Formato inválido. Usa el código de 4 dígitos (Ej: AR-4829).', true);
    return;
  }
  const roomCountry = code.slice(0, 2);
  if (roomCountry !== mpState.country) {
    setMpStatus('Bloqueado por región: la sala es de [' + roomCountry + '] y tu región es [' + mpState.country + '].', true);
    return;
  }

  destroyMpConnection();
  readPilotName(nameInput);
  setMpStatus('Conectando a sala ' + code + '...');

  const peer = new Peer();
  mpState.peer = peer;
  mpState.isHost = false;

  peer.on('open', () => {
    const conn = peer.connect('macross-od-' + code.toLowerCase(), { reliable: false });
    mpState.conn = conn;
    setupPeerDataChannel(conn);
  });

  peer.on('error', () => setMpStatus('No se encontró la sala ' + code + ' o ya inició.', true));
}

function setupPeerDataChannel(conn) {
  conn.on('open', () => {
    const mapChoice = (typeof selectedMapId !== 'undefined') ? selectedMapId : 'MAPA_1';
    conn.send({
      type: 'HELLO',
      name: mpState.pilotName,
      country: mpState.country,
      mapId: mapChoice
    });
  });

  conn.on('data', (pkt) => handleMpPacket(pkt, conn));

  conn.on('close', () => {
    if (mpState.active && !mpState.matchEnded) {
      mpState.matchEnded = true;
      mpState.victory = true;
    }
  });
}
function handleMpPacket(pkt, conn) {
  if (!pkt || !pkt.type) return;

  if (pkt.type === 'REJECT') {
    setMpStatus('Sala rechazada: ' + (pkt.reason || 'OCUPADA'), true);
    destroyMpConnection();
    return;
  }

  if (pkt.type === 'HELLO') {
    if (pkt.country !== mpState.country) {
      conn.send({ type: 'REJECT', reason: 'PAÍS DISTINTO (' + pkt.country + ')' });
      setTimeout(destroyMpConnection, 150);
      return;
    }
    mpState.rivalName = pkt.name || 'RIVAL';
    mpState.rivalCountry = pkt.country || mpState.country;

    if (!mpState.isHost) {
      conn.send({ type: 'HELLO_ACK', name: mpState.pilotName, country: mpState.country });
      launchMultiplayerMatch(pkt.mapId || 'MAPA_1');
    }
    return;
  }

  if (pkt.type === 'HELLO_ACK' && mpState.isHost) {
    mpState.rivalName = pkt.name || 'RIVAL';
    mpState.rivalCountry = pkt.country || mpState.country;
    const mapChoice = (typeof selectedMapId !== 'undefined') ? selectedMapId : 'MAPA_1';
    launchMultiplayerMatch(mapChoice);
    return;
  }

  if (pkt.type === 'STATE' && mpState.active) {
    mpState.targetPos.set(pkt.px, pkt.py, pkt.pz);
    mpState.targetQuat.set(pkt.qx, pkt.qy, pkt.qz, pkt.qw);
    mpState.rivalMode = pkt.mode || 'FIGHTER';
    mpState.rivalArmor = typeof pkt.hp === 'number' ? pkt.hp : mpState.rivalArmor;
    if (mpState.rivalArmor <= 0 && !mpState.matchEnded) {
      mpState.matchEnded = true;
      mpState.victory = true;
    }
    return;
  }

  if (pkt.type === 'FIRE_GUN' && mpState.active) {
    spawnRivalGunBolt(pkt);
	}
 if (pkt.type === 'FIRE_MSL' && mpState.active) {
    spawnRivalMissileSalvo(pkt);
  }
}

function launchMultiplayerMatch(mapId) {
  mpState.active = true;
  mpState.matchEnded = false;
  mpState.victory = false;
  mpState.rivalArmor = 140;

  const mpScreen = document.getElementById('multiplayerScreen');
  if (mpScreen) mpScreen.classList.add('hidden');

  if (typeof switchEnvironmentMap === 'function' && typeof scene !== 'undefined') {
    switchEnvironmentMap(scene, mapId);
  }

  // Ocultar IA en modo 1 vs 1
  if (typeof enemies !== 'undefined') {
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].respawnTimer = 999999;
      enemies[i].mesh.visible = false;
    }
  }

  spawnRivalValkyrie();

  if (typeof playerContainer !== 'undefined') {
    const startZ = mpState.isHost ? 140 : -140;
    const startY = (mapId === 'MAPA_3') ? 34 : 42;
    playerContainer.position.set(0, startY, startZ);
    playerContainer.rotation.set(0, mpState.isHost ? 0 : Math.PI, 0);
    mpState.targetPos.set(0, startY, -startZ);
  }

  if (typeof startMission === 'function') startMission();
}

function spawnRivalValkyrie() {
  if (mpState.rivalMesh && typeof scene !== 'undefined') scene.remove(mpState.rivalMesh);
  const group = new THREE.Group();
  mpState.rivalMesh = group;
  if (typeof scene !== 'undefined') scene.add(group);

  if (typeof THREE.GLTFLoader !== 'function') return;
  const loader = new THREE.GLTFLoader();
  loader.load('./models/vf1a.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    if (size > 0) { const s = 1.6 / size; model.scale.set(s, s, s); }
    model.rotation.y = Math.PI;
    group.add(model);

    const clip = gltf.animations && gltf.animations[0];
    if (clip) {
      mpState.rivalMixer = new THREE.AnimationMixer(model);
      mpState.rivalClipDur = clip.duration;
      mpState.rivalAction = mpState.rivalMixer.clipAction(clip);
      mpState.rivalAction.play();
    }
  });
}
function spawnRivalGunBolt(pkt) {
  if (typeof scene === 'undefined' || typeof enemyBullets === 'undefined') return;
  const boltGroup = new THREE.Group();
  const p1 = new THREE.Mesh(enemyLaserGeo, enemyBeamMat);
  const p2 = p1.clone();
  p2.rotateZ(Math.PI / 2);
  boltGroup.add(p1, p2);
  boltGroup.position.set(pkt.ox, pkt.oy, pkt.oz);
  const vel = new THREE.Vector3(pkt.vx, pkt.vy, pkt.vz);
  boltGroup.lookAt(boltGroup.position.clone().add(vel));
  scene.add(boltGroup);
  enemyBullets.push({ mesh: boltGroup, vel: vel, life: 1.6 });
}

function notifyMpGunpodShot(origin, vel) {
  if (!mpState.active || !mpState.conn || !mpState.conn.open) return;
  mpState.conn.send({
    type: 'FIRE_GUN',
    ox: origin.x, oy: origin.y, oz: origin.z,
    vx: vel.x, vy: vel.y, vz: vel.z
  });
}

function notifyMpMissileSalvo(origin, profileId) {
  if (!mpState.active || !mpState.conn || !mpState.conn.open) return;
  mpState.conn.send({
    type: 'FIRE_MSL',
    ox: origin.x, oy: origin.y, oz: origin.z,
    profile: profileId || 'LIGERO'
  });
}

function spawnRivalMissileSalvo(pkt) {
  if (typeof scene === 'undefined' || typeof enemyMissiles === 'undefined' || typeof playerContainer === 'undefined') return;
  const count = (pkt.profile === 'PESADO') ? 1 : 2;
  for (let i = 0; i < count; i++) {
    const mGroup = new THREE.Group();
    const body = new THREE.Mesh(missileBodyGeo, missileBodyMat);
    const tip = new THREE.Mesh(missileTipGeo, missileTipMat);
    const flame = new THREE.Mesh(missileFlameGeo, missileFlameMat);
    flame.position.set(0, 0, 0.2);
    mGroup.add(body, tip, flame);
    mGroup.scale.set(1.45, 1.45, 1.45);

    const spawnPos = new THREE.Vector3(pkt.ox + (i === 0 ? -0.8 : 0.8), pkt.oy, pkt.oz);
    mGroup.position.copy(spawnPos);
    mGroup.lookAt(playerContainer.position);
    mGroup.rotateY(Math.PI);
    scene.add(mGroup);

    enemyMissiles.push({
      mesh: mGroup,
      lastTailPos: spawnPos.clone(),
      speed: pkt.profile === 'PESADO' ? 26 : 32,
      life: 4.5,
      homingTimer: 2.4,
      isLockedOn: true,
      minDistToPlayer: spawnPos.distanceTo(playerContainer.position),
      overshot: false
    });
  }
}


function updateMultiplayer(delta, playerContainer) {
  if (!mpState.active) return;

  // 1. Interpolar posición y pose del Valkyrie rival
  if (mpState.rivalMesh) {
    mpState.rivalMesh.position.lerp(mpState.targetPos, Math.min(1.0, 16.0 * delta));
    mpState.rivalMesh.quaternion.slerp(mpState.targetQuat, Math.min(1.0, 16.0 * delta));

    if (mpState.rivalMixer && mpState.rivalAction && mpState.rivalClipDur > 0) {
      const f = mpState.rivalMode === 'BATTROID' ? 29 : (mpState.rivalMode === 'GERWALK' ? 14 : 0);
      mpState.rivalAction.paused = false;
      mpState.rivalAction.time = (f / 91) * mpState.rivalClipDur;
      mpState.rivalMixer.update(0);
      mpState.rivalAction.paused = true;
    }
  }

  // 2. Comprobar impactos de nuestras balas contra el Valkyrie rival
  if (mpState.rivalMesh && typeof bullets !== 'undefined') {
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (bullets[i].mesh.position.distanceTo(mpState.rivalMesh.position) < 1.65) {
        if (typeof spawnImpactSparks === 'function') spawnImpactSparks(scene, camera, bullets[i].mesh.position);
        scene.remove(bullets[i].mesh);
        bullets.splice(i, 1);
      }
    }
  }

  // 3. Enviar nuestro estado a 30 Hz
  mpState.sendTimer += delta;
  if (mpState.sendTimer >= 0.033 && mpState.conn && mpState.conn.open && playerContainer) {
    mpState.sendTimer = 0;
    const myHp = (typeof playerArmor !== 'undefined') ? Math.round(playerArmor) : 140;
    if (myHp <= 0 && !mpState.matchEnded) { mpState.matchEnded = true; mpState.victory = false; }
    mpState.conn.send({
      type: 'STATE',
      px: playerContainer.position.x, py: playerContainer.position.y, pz: playerContainer.position.z,
      qx: playerContainer.quaternion.x, qy: playerContainer.quaternion.y, qz: playerContainer.quaternion.z, qw: playerContainer.quaternion.w,
      mode: (typeof currentMode !== 'undefined') ? currentMode : 'FIGHTER',
      hp: myHp
    });
  }
}

window.addEventListener('DOMContentLoaded', initMultiplayerUI);
