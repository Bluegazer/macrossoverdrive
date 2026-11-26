const MP_NAME_KEY = 'macrossvoxp-pilot-name-v1';

const mpState = {
  active: false,
  isHost: false,
  country: 'AR',
  countryReady: false,
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
  pingMs: 0,
  pingTimer: 0,
  matchEnded: false,
  victory: false,
  hostGameMode: 'SIM',
  savedLocalHudMode: null
};

const MP_STATUS_I18N = {
  es: {
    copiedCode: (c, r) => 'Código ' + c + ' copiado. Pásalo a tu rival de ' + r + '.',
    copiedLink: (r) => 'Link de invitación copiado. Compártelo con tu rival de ' + r + '.',
    linkDetected: (c) => 'Enlace detectado (' + c + '). Verificando región y sistemas...',
    noPeerJs: 'Error: librería PeerJS no cargada.',
    openingRoom: (c) => 'Abriendo enlace satelital ' + c + '...',
    roomReady: (c, m, r) => 'Sala ' + c + ' (' + m + ') lista. Esperando rival de ' + r + '...',
    netError: (e) => 'Error de red: ' + e,
    badFormat: 'Formato inválido. Usa el código de 4 dígitos (Ej: AR-4829).',
    regionBlocked: (rc, mc) => 'Bloqueado por región: la sala es de [' + rc + '] y tu región es [' + mc + '].',
    connecting: (c) => 'Conectando a sala ' + c + '...',
    notFound: (c) => 'No se encontró la sala ' + c + ' o ya inició.',
    rejected: (r) => 'Sala rechazada: ' + r
  },
  en: {
    copiedCode: (c, r) => 'Code ' + c + ' copied. Share it with your ' + r + ' rival.',
    copiedLink: (r) => 'Invite link copied. Share it with your ' + r + ' rival.',
    linkDetected: (c) => 'Invite link detected (' + c + '). Verifying region and systems...',
    noPeerJs: 'Error: PeerJS library not loaded.',
    openingRoom: (c) => 'Opening satellite link ' + c + '...',
    roomReady: (c, m, r) => 'Room ' + c + ' (' + m + ') ready. Waiting for ' + r + ' rival...',
    netError: (e) => 'Network error: ' + e,
    badFormat: 'Invalid format. Use the 4-digit code (Ex: US-4829).',
    regionBlocked: (rc, mc) => 'Region locked: room is [' + rc + '] and your region is [' + mc + '].',
    connecting: (c) => 'Connecting to room ' + c + '...',
    notFound: (c) => 'Room ' + c + ' not found or already started.',
    rejected: (r) => 'Room rejected: ' + r
  },
  zh: {
    copiedCode: (c, r) => '代码 ' + c + ' 已复制。请发送给你的 ' + r + ' 地区对手。',
    copiedLink: (r) => '邀请链接已复制。请分享给你的 ' + r + ' 地区对手。',
    linkDetected: (c) => '检测到邀请链接 (' + c + ')。正在验证地区与系统...',
    noPeerJs: '错误：PeerJS 网络库未加载。',
    openingRoom: (c) => '正在开启卫星链路 ' + c + '...',
    roomReady: (c, m, r) => '房间 ' + c + ' (' + m + ') 已就绪。正在等待 ' + r + ' 地区对手...',
    netError: (e) => '网络错误：' + e,
    badFormat: '格式无效。请输入4位房间代码（例：CN-4829）。',
    regionBlocked: (rc, mc) => '地区限制：该房间属于 [' + rc + ']，而你的地区是 [' + mc + ']。',
    connecting: (c) => '正在连接房间 ' + c + '...',
    notFound: (c) => '未找到房间 ' + c + ' 或对战已开始。',
    rejected: (r) => '房间拒绝连接：' + r
  },
  ja: {
    copiedCode: (c, r) => 'コード ' + c + ' をコピーしました。' + r + ' 地域のライバルに送ってください。',
    copiedLink: (r) => '招待リンクをコピーしました。' + r + ' 地域のライバルに共有してください。',
    linkDetected: (c) => '招待リンクを検出 (' + c + ')。地域とシステムを確認中...',
    noPeerJs: 'エラー：PeerJSライブラリが読み込まれていません。',
    openingRoom: (c) => '衛星リンク ' + c + ' を開設中...',
    roomReady: (c, m, r) => 'ルーム ' + c + ' (' + m + ') 準備完了。' + r + ' 地域のライバルを待機中...',
    netError: (e) => 'ネットワークエラー：' + e,
    badFormat: '無効な形式です。4桁のコードを入力してください（例：JP-4829）。',
    regionBlocked: (rc, mc) => '地域制限：ルームは [' + rc + '] 用ですが、あなたの地域は [' + mc + '] です。',
    connecting: (c) => 'ルーム ' + c + ' に接続中...',
    notFound: (c) => 'ルーム ' + c + ' が見つからないか、既に対戦中です。',
    rejected: (r) => '接続が拒否されました：' + r
  }
};

function mpMsg(key, a, b, c) {
  const lang = (typeof activeLang !== 'undefined' && MP_STATUS_I18N[activeLang]) ? activeLang : 'es';
  const entry = MP_STATUS_I18N[lang][key] || MP_STATUS_I18N.es[key];
  return (typeof entry === 'function') ? entry(a, b, c) : entry;
}

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
    const lang = (navigator.language || '').split('-');
    if (lang[1] && lang[1].length === 2 && /^[A-Za-z]{2}$/.test(lang[1])) {
    return lang[1].toUpperCase();
    }
  } catch (e) {}
  return 'GL';
}

function initMultiplayerUI() {
  const mpScreen = document.getElementById('multiplayerScreen');
  const startSc = document.getElementById('startScreen');
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
      mpState.countryReady = true;
    })
    .catch(() => { mpState.countryReady = true; });

  try {
    const savedName = localStorage.getItem(MP_NAME_KEY);
    if (savedName && nameInput) nameInput.value = savedName;
  } catch (e) {}

  const mpMapSelect = document.getElementById('mpMapSelect');
  if (mpMapSelect) {
    mpMapSelect.addEventListener('change', () => {
      if (typeof selectedMapId !== 'undefined') selectedMapId = mpMapSelect.value;
    });
  }

  const mpModeButtons = document.querySelectorAll('#mpGameModeGroup [data-mp-mode]');
  const syncMpModeButtons = (mode) => {
    mpState.hostGameMode = (mode === 'ARCADE') ? 'ARCADE' : 'SIM';
    mpModeButtons.forEach((b) => b.classList.toggle('active', b.dataset.mpMode === mpState.hostGameMode));
  };
  mpModeButtons.forEach((btn) => {
    btn.addEventListener('click', () => syncMpModeButtons(btn.dataset.mpMode));
  });

  if (btnOpen && mpScreen) {
    btnOpen.addEventListener('click', () => {
      if (mpMapSelect && typeof selectedMapId !== 'undefined') mpMapSelect.value = selectedMapId;
      syncMpModeButtons(typeof hudStyleMode !== 'undefined' ? hudStyleMode : 'SIM');
      if (startSc) startSc.classList.add('hidden');
      mpScreen.classList.remove('hidden');
    });
  }

  const closeMp = () => {
    if (mpScreen) mpScreen.classList.add('hidden');
    if (startSc && !mpState.active) startSc.classList.remove('hidden');
  };
  if (btnClose) btnClose.addEventListener('click', closeMp);
  if (btnBack) btnBack.addEventListener('click', closeMp);

  if (btnCreate) btnCreate.addEventListener('click', () => createMultiplayerRoom(nameInput, codeOut));
  if (btnJoin) btnJoin.addEventListener('click', () => joinMultiplayerRoom(nameInput, codeIn));

  if (btnCopy && codeOut) {
    btnCopy.addEventListener('click', () => {
      if (!codeOut.value) return;
      navigator.clipboard?.writeText(codeOut.value).catch(() => {});
      setMpStatus(mpMsg('copiedCode', codeOut.value, mpState.country));
    });
  }

  const btnCopyLink = document.getElementById('btnCopyRoomLink');
  if (btnCopyLink && codeOut) {
    btnCopyLink.addEventListener('click', () => {
      if (!codeOut.value) return;
      const inviteUrl = window.location.origin + window.location.pathname + '?room=' + codeOut.value;
      navigator.clipboard?.writeText(inviteUrl).catch(() => {});
      setMpStatus(mpMsg('copiedLink', mpState.country));
    });
  }

  const urlRoom = new URLSearchParams(window.location.search).get('room');
  if (urlRoom && /^[A-Za-z]{2}-\d{4}$/.test(urlRoom.trim())) {
    if (startSc) startSc.classList.add('hidden');
    if (mpScreen) mpScreen.classList.remove('hidden');
    if (codeIn) codeIn.value = urlRoom.trim().toUpperCase();
    setMpStatus(mpMsg('linkDetected', codeIn.value));
    const waitReady = setInterval(() => {
      const startBtn = document.getElementById('btnStartGame');
      if ((!startBtn || !startBtn.disabled) && mpState.countryReady) {
        clearInterval(waitReady);
        joinMultiplayerRoom(nameInput, codeIn);
      }
    }, 300);
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
  const hudSel = document.getElementById('hudStyleModeSelect');
  if (hudSel) hudSel.disabled = false;
  if (mpState.savedLocalHudMode && typeof hudStyleMode !== 'undefined') {
    hudStyleMode = mpState.savedLocalHudMode;
    if (hudSel) hudSel.value = hudStyleMode;
    mpState.savedLocalHudMode = null;
  }
  if (mpState.conn) { try { mpState.conn.close(); } catch (e) {} mpState.conn = null; }
  if (mpState.peer) { try { mpState.peer.destroy(); } catch (e) {} mpState.peer = null; }
  if (mpState.rivalMesh && typeof scene !== 'undefined') {
    scene.remove(mpState.rivalMesh);
    mpState.rivalMesh = null;
  }
}

function createMultiplayerRoom(nameInput, codeOut) {
  if (typeof Peer !== 'function') { setMpStatus(mpMsg('noPeerJs'), true); return; }
  destroyMpConnection();
  readPilotName(nameInput);

  const num = Math.floor(1000 + Math.random() * 9000);
  const roomCode = mpState.country + '-' + num;
  if (codeOut) codeOut.value = roomCode;
  setMpStatus(mpMsg('openingRoom', roomCode));

  const peer = new Peer('macross-od-' + roomCode.toLowerCase());
  mpState.peer = peer;
  mpState.isHost = true;

  peer.on('open', () => {
    const mapSel = document.getElementById('mpMapSelect');
    const mapLabel = (mapSel && mapSel.selectedOptions && mapSel.selectedOptions[0]) ? mapSel.selectedOptions[0].textContent : 'MAPA 1';
    setMpStatus(mpMsg('roomReady', roomCode, mapLabel, mpState.country));
  });

  peer.on('connection', (conn) => {
    if (mpState.conn && mpState.conn.open) {
      conn.on('open', () => { conn.send({ type: 'REJECT', reason: 'PARTIDA EN CURSO' }); setTimeout(() => conn.close(), 150); });
      return;
    }
    mpState.conn = conn;
    setupPeerDataChannel(conn);
  });

  peer.on('error', (err) => setMpStatus(mpMsg('netError', err.type || err.message), true));
}

function joinMultiplayerRoom(nameInput, codeIn) {
  if (typeof Peer !== 'function') { setMpStatus(mpMsg('noPeerJs'), true); return; }
  const rawInput = (codeIn && codeIn.value ? codeIn.value : '').trim().toUpperCase();
  const match = rawInput.match(/([A-Z]{2}-\d{4})/);
  const code = match ? match[1] : '';
  if (!code) {
    setMpStatus(mpMsg('badFormat'), true);
    return;
  }
  const roomCountry = code.slice(0, 2);
  if (roomCountry !== mpState.country) {
    setMpStatus(mpMsg('regionBlocked', roomCountry, mpState.country), true);
    return;
  }

  destroyMpConnection();
  readPilotName(nameInput);
  setMpStatus(mpMsg('connecting', code));

  const peer = new Peer();
  mpState.peer = peer;
  mpState.isHost = false;

  peer.on('open', () => {
    const conn = peer.connect('macross-od-' + code.toLowerCase(), { reliable: false });
    mpState.conn = conn;
    setupPeerDataChannel(conn);
  });

  peer.on('error', () => setMpStatus(mpMsg('notFound', code), true));
}

function setupPeerDataChannel(conn) {
  conn.on('open', () => {
    const mapChoice = (typeof selectedMapId !== 'undefined') ? selectedMapId : 'MAPA_1';
    conn.send({
      type: 'HELLO',
      name: mpState.pilotName,
      country: mpState.country,
      mapId: mapChoice,
      gameMode: mpState.hostGameMode || 'SIM'
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
    setMpStatus(mpMsg('rejected', pkt.reason || 'OCUPADA'), true);
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
      launchMultiplayerMatch(pkt.mapId || 'MAPA_1', pkt.gameMode || 'SIM');
    }
    return;
  }

  if (pkt.type === 'HELLO_ACK' && mpState.isHost) {
    if (pkt.country !== mpState.country) {
      conn.send({ type: 'REJECT', reason: 'PAÍS DISTINTO (' + pkt.country + ')' });
      setTimeout(destroyMpConnection, 150);
      return;
    }
    mpState.rivalName = pkt.name || 'RIVAL';
    mpState.rivalCountry = pkt.country || mpState.country;
    const mapChoice = (typeof selectedMapId !== 'undefined') ? selectedMapId : 'MAPA_1';
    launchMultiplayerMatch(mapChoice, mpState.hostGameMode || 'SIM');
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

  if (pkt.type === 'RIVAL_HIT' && mpState.active) {
    if (typeof damagePlayerArmor === 'function' && typeof playerContainer !== 'undefined') {
      damagePlayerArmor(scene, camera, playerContainer, pkt.dmg || 9);
    }
  }

  if (pkt.type === 'PING' && conn && conn.open) {
    conn.send({ type: 'PONG', t: pkt.t });
    return;
  }

  if (pkt.type === 'PONG' && typeof pkt.t === 'number') {
    mpState.pingMs = Math.max(1, Math.round(performance.now() - pkt.t));
    return;
  }
}
function launchMultiplayerMatch(mapId, matchGameMode) {
  mpState.active = true;
  mpState.matchEnded = false;
  mpState.victory = false;
  mpState.rivalArmor = 140;

  const targetMode = (matchGameMode === 'ARCADE') ? 'ARCADE' : 'SIM';
  if (typeof hudStyleMode !== 'undefined') {
    if (mpState.savedLocalHudMode === null) mpState.savedLocalHudMode = hudStyleMode;
    hudStyleMode = targetMode;
  }
  const hudSel = document.getElementById('hudStyleModeSelect');
  if (hudSel) {
    hudSel.value = targetMode;
    hudSel.disabled = true;
  }

  const mpScreen = document.getElementById('multiplayerScreen');
  if (mpScreen) mpScreen.classList.add('hidden');

  if (typeof switchEnvironmentMap === 'function' && typeof scene !== 'undefined') {
    switchEnvironmentMap(scene, mapId);
  }

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
  const p1 = new THREE.Mesh(beamPlaneGeo, beamMat);
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

  if (mpState.rivalMesh && typeof bullets !== 'undefined') {
    const segStart = new THREE.Vector3();
    const segVec = new THREE.Vector3();
    const closest = new THREE.Vector3();
    const rivalCenter = mpState.rivalMesh.position;

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      segVec.copy(b.vel).multiplyScalar(delta);
      segStart.copy(b.mesh.position).sub(segVec);
      const lenSq = segVec.lengthSq();
      const t = lenSq > 0 ? Math.max(0, Math.min(1, rivalCenter.clone().sub(segStart).dot(segVec) / lenSq)) : 0;
      closest.copy(segStart).addScaledVector(segVec, t);

      if (closest.distanceTo(rivalCenter) < 2.2) {
        if (typeof spawnImpactSparks === 'function') spawnImpactSparks(scene, camera, closest);
        mpState.rivalArmor = Math.max(0, mpState.rivalArmor - 9);
        if (mpState.conn && mpState.conn.open) mpState.conn.send({ type: 'RIVAL_HIT', dmg: 9 });
        scene.remove(b.mesh);
        bullets.splice(i, 1);
      }
    }
  }

  mpState.pingTimer += delta;
  if (mpState.pingTimer >= 1.0 && mpState.conn && mpState.conn.open) {
    mpState.pingTimer = 0;
    mpState.conn.send({ type: 'PING', t: performance.now() });
  }

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