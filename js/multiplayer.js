const MP_NAME_KEY = 'macrossvoxp-pilot-name-v1';
const IS_DISCORD_ACTIVITY = window.location.hostname.endsWith('discordsays.com');

function createConfiguredPeer(customId) {
  if (!IS_DISCORD_ACTIVITY) {
    return customId ? new Peer(customId) : new Peer();
  }
  const opts = {
    host: window.location.hostname,
    port: 443,
    path: '/peerjs',
    secure: true
  };
  return customId ? new Peer(customId, opts) : new Peer(opts);
}

const mpState = {

  active: false,
  isHost: false,
  maxPlayers: 2,
  myId: 'host',
  myTeam: 'BLUE',
  mySlot: 0,
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
  lobbyPlayers: [],
  peers: new Map(),
  players: new Map(),
  cachedValkyrieGltf: null,
  processedShots: new Set(),
  peer: null,
  conn: null,
  sendTimer: 0,
  pingMs: 0,
  pingTimer: 0,
  matchEnded: false,
  victory: false,
  winningTeam: null,
  hostGameMode: 'SIM',
  savedLocalHudMode: null
};
const MP_STATUS_I18N = {
  es: {
    copiedCode: (c, r) => 'Código ' + c + ' copiado. Pásalo a tus pilotos de ' + r + '.',
    copiedLink: (r) => 'Link de invitación copiado. Compártelo con pilotos de ' + r + '.',
    linkDetected: (c) => 'Enlace detectado (' + c + '). Verificando región y sistemas...',
    noPeerJs: 'Error: librería PeerJS no cargada.',
    openingRoom: (c) => 'Abriendo enlace satelital ' + c + '...',
    roomReady: (c, m, r) => 'Sala ' + c + ' (' + m + ') lista. Esperando pilotos de ' + r + '...',
    netError: (e) => 'Error de red: ' + e,
    badFormat: 'Formato inválido. Usa el código de 4 dígitos (Ej: AR-4829).',
    regionBlocked: (rc, mc) => 'Bloqueado por región: la sala es de [' + rc + '] y tu región es [' + mc + '].',
    connecting: (c) => 'Conectando a sala ' + c + '...',
    notFound: (c) => 'No se encontró la sala ' + c + ' o ya inició.',
    rejected: (r) => 'Sala rechazada: ' + r,
    lobbyFull: 'Sala completa (6/6). Listo para iniciar el combate.',
    lobbyWaiting: (n, max) => 'En sala (' + n + '/' + max + ' pilotos). Esperando escuadrones completos...'
  },
  en: {
    copiedCode: (c, r) => 'Code ' + c + ' copied. Share it with ' + r + ' pilots.',
    copiedLink: (r) => 'Invite link copied. Share it with ' + r + ' pilots.',
    linkDetected: (c) => 'Invite link detected (' + c + '). Verifying region and systems...',
    noPeerJs: 'Error: PeerJS library not loaded.',
    openingRoom: (c) => 'Opening satellite link ' + c + '...',
    roomReady: (c, m, r) => 'Room ' + c + ' (' + m + ') ready. Waiting for ' + r + ' pilots...',
    netError: (e) => 'Network error: ' + e,
    badFormat: 'Invalid format. Use the 4-digit code (Ex: US-4829).',
    regionBlocked: (rc, mc) => 'Region locked: room is [' + rc + '] and your region is [' + mc + '].',
    connecting: (c) => 'Connecting to room ' + c + '...',
    notFound: (c) => 'Room ' + c + ' not found or already started.',
    rejected: (r) => 'Room rejected: ' + r,
    lobbyFull: 'Room full (6/6). Ready to launch combat.',
    lobbyWaiting: (n, max) => 'In lobby (' + n + '/' + max + ' pilots). Waiting for full squadrons...'
  },
  zh: {
    copiedCode: (c, r) => '代码 ' + c + ' 已复制。请发送给 ' + r + ' 地区飞行员。',
    copiedLink: (r) => '邀请链接已复制。请分享给 ' + r + ' 地区飞行员。',
    linkDetected: (c) => '检测到邀请链接 (' + c + ')。正在验证地区与系统...',
    noPeerJs: '错误：PeerJS 网络库未加载。',
    openingRoom: (c) => '正在开启卫星链路 ' + c + '...',
    roomReady: (c, m, r) => '房间 ' + c + ' (' + m + ') 已就绪。正在等待 ' + r + ' 地区飞行员...',
    netError: (e) => '网络错误：' + e,
    badFormat: '格式无效。请输入4位房间代码（例：CN-4829）。',
    regionBlocked: (rc, mc) => '地区限制：该房间属于 [' + rc + ']，而你的地区是 [' + mc + ']。',
    connecting: (c) => '正在连接房间 ' + c + '...',
    notFound: (c) => '未找到房间 ' + c + ' 或对战已开始。',
    rejected: (r) => '房间拒绝连接：' + r,
    lobbyFull: '房间已满 (6/6)，可以开始战斗。',
    lobbyWaiting: (n, max) => '等待中 (' + n + '/' + max + ' 飞行员)...'
  },
  ja: {
    copiedCode: (c, r) => 'コード ' + c + ' をコピーしました。' + r + ' 地域のパイロットに送ってください。',
    copiedLink: (r) => '招待リンクをコピーしました。' + r + ' 地域のパイロットに共有してください。',
    linkDetected: (c) => '招待リンクを検出 (' + c + ')。地域とシステムを確認中...',
    noPeerJs: 'エラー：PeerJSライブラリが読み込まれていません。',
    openingRoom: (c) => '衛星リンク ' + c + ' を開設中...',
    roomReady: (c, m, r) => 'ルーム ' + c + ' (' + m + ') 準備完了。' + r + ' 地域のパイロットを待機中...',
    netError: (e) => 'ネットワークエラー：' + e,
    badFormat: '無効な形式です。4桁のコードを入力してください（例：JP-4829）。',
    regionBlocked: (rc, mc) => '地域制限：ルームは [' + rc + '] 用ですが、あなたの地域は [' + mc + '] です。',
    connecting: (c) => 'ルーム ' + c + ' に接続中...',
    notFound: (c) => 'ルーム ' + c + ' が見つからないか、既に対戦中です。',
    rejected: (r) => '接続が拒否されました：' + r,
    lobbyFull: 'メンバー揃いました (6/6)。出撃可能です。',
    lobbyWaiting: (n, max) => '待機中 (' + n + '/' + max + ' パイロット)...'
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

function openMpModalWithMode(maxPlayers) {
  const mpScreen = document.getElementById('multiplayerScreen');
  const startSc = document.getElementById('startScreen');
  const mpMapSelect = document.getElementById('mpMapSelect');
  const squadLobby = document.getElementById('mpSquadLobby');
  const titleEl = document.getElementById('mpTitle');
  const subEl = document.querySelector('#multiplayerScreen .options-subtitle');

  mpState.maxPlayers = (maxPlayers === 6) ? 6 : 2;
  if (mpMapSelect && typeof selectedMapId !== 'undefined') mpMapSelect.value = selectedMapId;

  const mpModeButtons = document.querySelectorAll('#mpGameModeGroup [data-mp-mode]');
  const curMode = (typeof hudStyleMode !== 'undefined') ? hudStyleMode : 'SIM';
  mpState.hostGameMode = (curMode === 'ARCADE') ? 'ARCADE' : 'SIM';
  mpModeButtons.forEach((b) => b.classList.toggle('active', b.dataset.mpMode === mpState.hostGameMode));
    if (mpState.maxPlayers === 6) {
    if (titleEl) titleEl.textContent = (typeof t === 'function') ? t('mpTitle3v3') : 'COMBATE 3 VS 3';
    if (subEl) subEl.textContent = (typeof t === 'function') ? t('mpSub3v3') : 'ESCUADRONES 3 VS 3 · ELIMINACIÓN DIRECTA (6/6)';
    const sqHdr = document.getElementById('mpSquadHeader');
    const bTitle = document.getElementById('mpBlueTeamTitle');
    const rTitle = document.getElementById('mpRedTeamTitle');
    const swBtn = document.getElementById('btnSwitchTeam');
    if (sqHdr && typeof t === 'function') sqHdr.textContent = t('mpSquadHeader');
    if (bTitle && typeof t === 'function') bTitle.textContent = t('mpBlueTeam');
    if (rTitle && typeof t === 'function') rTitle.textContent = t('mpRedTeam');
    if (swBtn && typeof t === 'function') swBtn.textContent = t('mpSwitchTeam');
    if (squadLobby) squadLobby.classList.remove('hidden');
  } else {
    if (titleEl) titleEl.textContent = (typeof t === 'function') ? t('mpTitle') : 'COMBATE 1 VS 1';
    if (subEl) subEl.textContent = (typeof t === 'function') ? t('mpSub') : 'DUELO DIRECTO POR CÓDIGO DE SALA · SIN IA';
    if (squadLobby) squadLobby.classList.add('hidden');
  }

  renderSquadLobbyUI();
  if (startSc) startSc.classList.add('hidden');
  if (mpScreen) mpScreen.classList.remove('hidden');
}

function renderSquadLobbyUI() {
  const squadLobby = document.getElementById('mpSquadLobby');
  if (!squadLobby) return;
  if (mpState.maxPlayers !== 6) {
    squadLobby.classList.add('hidden');
    return;
  }
  squadLobby.classList.remove('hidden');

  const blueBox = document.getElementById('mpBlueSlots');
  const redBox = document.getElementById('mpRedSlots');
  const countBadge = document.getElementById('mpPlayerCountBadge');
  const startBtn = document.getElementById('btnStart3v3Match');

  const blueList = mpState.lobbyPlayers.filter((p) => p.team === 'BLUE');
  const redList = mpState.lobbyPlayers.filter((p) => p.team === 'RED');
  const totalCount = mpState.lobbyPlayers.length;
  const tr = (k, fb) => (typeof t === 'function') ? t(k) : fb;

  if (countBadge) countBadge.textContent = totalCount + ' / 6 ' + tr('mpPilotsUnit', 'PILOTOS');
  const waitSlotTxt = tr('mpWaitSlot', 'ESPERANDO PILOTO...');
  const buildSlotHtml = (list, color) => {
    let html = '';
    for (let i = 0; i < 3; i++) {
      const p = list[i];
      if (p) {
        const isMe = (p.id === mpState.myId);
        const tag = p.id === 'host' ? ' [HOST]' : (isMe ? ' [YOU]' : '');
        html += '<div style="padding: 5px 8px; background: rgba(15,23,42,0.9); border-left: 3px solid ' + color + '; color: #fff;">' +
          '0' + (i + 1) + ' · <b>' + p.name + '</b><span style="color:#facc15; font-size:9px;">' + tag + '</span></div>';
      } else {
        html += '<div style="padding: 5px 8px; background: rgba(2,6,23,0.6); border-left: 3px solid #334155; color: #64748b;">' +
          '0' + (i + 1) + ' · ' + waitSlotTxt + '</div>';
      }
    }
    return html;
  };

  if (blueBox) blueBox.innerHTML = buildSlotHtml(blueList, '#38bdf8');
  if (redBox) redBox.innerHTML = buildSlotHtml(redList, '#ef4444');

  if (startBtn) {
    const isReady6 = (totalCount === 6 && blueList.length === 3 && redList.length === 3);
    const waitPilotsTxt = tr('mpWaitPilots', 'ESPERANDO PILOTOS') + ' (' + totalCount + '/6)';
    if (!mpState.isHost && totalCount > 0) {
      startBtn.disabled = true;
      startBtn.style.opacity = '0.6';
      startBtn.textContent = isReady6 ? tr('mpWaitHostBtn', 'ESPERANDO QUE EL HOST INICIE...') : waitPilotsTxt;
    } else {
      startBtn.disabled = !isReady6;
      startBtn.style.opacity = isReady6 ? '1' : '0.45';
      startBtn.textContent = isReady6 ? tr('mpStart3v3Btn', 'INICIAR BATALLA 3 VS 3 (6/6)') : waitPilotsTxt;
    }
  }
}

function initMultiplayerUI() {
  const mpScreen = document.getElementById('multiplayerScreen');
  const startSc = document.getElementById('startScreen');
  const btnOpen1v1 = document.getElementById('btnMultiplayer');
  const btnOpen3v3 = document.getElementById('btnMultiplayer3v3');
  const btnClose = document.getElementById('btnCloseMp');
  const btnBack = document.getElementById('btnBackMp');
  const nameInput = document.getElementById('mpPilotName');
  const countryBadge = document.getElementById('mpCountryBadge');
  const btnCreate = document.getElementById('btnCreateRoom');
  const btnCopy = document.getElementById('btnCopyRoomCode');
  const btnJoin = document.getElementById('btnJoinRoom');
  const btnSwitchTeam = document.getElementById('btnSwitchTeam');
  const btnStart3v3 = document.getElementById('btnStart3v3Match');
  const codeOut = document.getElementById('mpRoomCodeOut');
  const codeIn = document.getElementById('mpRoomCodeIn');

  mpState.country = detectLocalCountryCode();
  if (countryBadge) countryBadge.textContent = 'REGIÓN: ' + mpState.country;

  if (IS_DISCORD_ACTIVITY) {
    mpState.countryReady = true;
  } else {
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
  }


  try {
    const savedName = localStorage.getItem(MP_NAME_KEY);
    if (savedName && nameInput) nameInput.value = savedName;
  } catch (e) {}
    const mpMapSelect = document.getElementById('mpMapSelect');
  if (mpMapSelect) {
    mpMapSelect.addEventListener('change', () => {
      if (!mpState.isHost && mpState.lobbyPlayers.length > 0) return;
      if (typeof selectedMapId !== 'undefined') selectedMapId = mpMapSelect.value;
      if (mpState.isHost && mpState.maxPlayers === 6 && mpState.lobbyPlayers.length > 0) broadcastLobbyState();
    });
  }

  const mpModeButtons = document.querySelectorAll('#mpGameModeGroup [data-mp-mode]');
  mpModeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!mpState.isHost && mpState.lobbyPlayers.length > 0) return;
      mpState.hostGameMode = (btn.dataset.mpMode === 'ARCADE') ? 'ARCADE' : 'SIM';
      mpModeButtons.forEach((b) => b.classList.toggle('active', b.dataset.mpMode === mpState.hostGameMode));
      if (mpState.isHost && mpState.maxPlayers === 6 && mpState.lobbyPlayers.length > 0) broadcastLobbyState();
    });
  });


  if (btnOpen1v1) btnOpen1v1.addEventListener('click', () => openMpModalWithMode(2));
  if (btnOpen3v3) btnOpen3v3.addEventListener('click', () => openMpModalWithMode(6));

  const closeMp = () => {
    if (!mpState.active) destroyMpConnection();
    if (mpScreen) mpScreen.classList.add('hidden');
    if (startSc && !mpState.active) startSc.classList.remove('hidden');
  };
  if (btnClose) btnClose.addEventListener('click', closeMp);
  if (btnBack) btnBack.addEventListener('click', closeMp);

  if (btnCreate) btnCreate.addEventListener('click', () => createMultiplayerRoom(nameInput, codeOut));
  if (btnJoin) btnJoin.addEventListener('click', () => joinMultiplayerRoom(nameInput, codeIn));
  if (btnSwitchTeam) {
    btnSwitchTeam.addEventListener('click', () => {
      if (mpState.maxPlayers !== 6 || mpState.lobbyPlayers.length === 0) return;
      const desiredTeam = (mpState.myTeam === 'BLUE') ? 'RED' : 'BLUE';
      if (mpState.isHost) {
        const countDesired = mpState.lobbyPlayers.filter((p) => p.team === desiredTeam).length;
        if (countDesired < 3) {
          const me = mpState.lobbyPlayers.find((p) => p.id === 'host');
          if (me) { me.team = desiredTeam; mpState.myTeam = desiredTeam; }
          broadcastLobbyState();
        }
      } else if (mpState.conn && mpState.conn.open) {
        mpState.conn.send({ type: 'SWITCH_TEAM', team: desiredTeam });
      }
    });
  }

  if (btnStart3v3) {
    btnStart3v3.addEventListener('click', () => {
      if (!mpState.isHost || mpState.maxPlayers !== 6) return;
      const blueCount = mpState.lobbyPlayers.filter((p) => p.team === 'BLUE').length;
      const redCount = mpState.lobbyPlayers.filter((p) => p.team === 'RED').length;
      if (mpState.lobbyPlayers.length !== 6 || blueCount !== 3 || redCount !== 3) return;

      assignSquadSlots();
      const mapChoice = (typeof selectedMapId !== 'undefined') ? selectedMapId : 'MAPA_1';
      const gMode = mpState.hostGameMode || 'SIM';
      broadcastToPeers({ type: 'START_3V3', mapId: mapChoice, gameMode: gMode, roster: mpState.lobbyPlayers });
      launchMultiplayerMatch(mapChoice, gMode, mpState.lobbyPlayers);
    });
  }
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
      const modeParam = (mpState.maxPlayers === 6) ? '&mode=3v3' : '';
      const inviteUrl = window.location.origin + window.location.pathname + '?room=' + codeOut.value + modeParam;
      navigator.clipboard?.writeText(inviteUrl).catch(() => {});
      setMpStatus(mpMsg('copiedLink', mpState.country));
    });
  }

  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get('room');
  const urlMode = params.get('mode');
  if (urlRoom && /^[A-Za-z]{2}-\d{4}$/.test(urlRoom.trim())) {
    openMpModalWithMode(urlMode === '3v3' ? 6 : 2);
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

function clearRemotePlayers() {
  mpState.players.forEach((p) => {
    if (p.mesh && typeof scene !== 'undefined') scene.remove(p.mesh);
  });
  mpState.players.clear();
  if (mpState.rivalMesh && typeof scene !== 'undefined') {
    scene.remove(mpState.rivalMesh);
    mpState.rivalMesh = null;
  }
}
function destroyMpConnection() {
  mpState.active = false;
  mpState.matchEnded = false;
  mpState.victory = false;
  mpState.winningTeam = null;
  mpState.lobbyPlayers = [];
  mpState.processedShots.clear();

  const hudSel = document.getElementById('hudStyleModeSelect');
  if (hudSel) hudSel.disabled = false;
  const mpMapSel = document.getElementById('mpMapSelect');
  if (mpMapSel) mpMapSel.disabled = false;
  document.querySelectorAll('#mpGameModeGroup [data-mp-mode]').forEach((b) => { b.disabled = false; b.style.opacity = '1'; });
  if (mpState.savedLocalHudMode && typeof hudStyleMode !== 'undefined') {
    hudStyleMode = mpState.savedLocalHudMode;
    if (hudSel) hudSel.value = hudStyleMode;
    mpState.savedLocalHudMode = null;
  }

  mpState.peers.forEach((c) => { try { c.close(); } catch (e) {} });
  mpState.peers.clear();
  if (mpState.conn) { try { mpState.conn.close(); } catch (e) {} mpState.conn = null; }
  if (mpState.peer) { try { mpState.peer.destroy(); } catch (e) {} mpState.peer = null; }
  clearRemotePlayers();
  renderSquadLobbyUI();
}

function broadcastToPeers(pkt, excludeId) {
  mpState.peers.forEach((conn, peerId) => {
    if (excludeId && peerId === excludeId) return;
    if (conn && conn.open) {
      try { conn.send(pkt); } catch (e) {}
    }
  });
}

function assignSquadSlots() {
  let blueIdx = 0;
  let redIdx = 3;
  for (let i = 0; i < mpState.lobbyPlayers.length; i++) {
    const p = mpState.lobbyPlayers[i];
    if (p.team === 'BLUE') p.slot = blueIdx++;
    else p.slot = redIdx++;
  }
}

function broadcastLobbyState() {
  assignSquadSlots();
  renderSquadLobbyUI();
  const n = mpState.lobbyPlayers.length;
  setMpStatus(n === 6 ? mpMsg('lobbyFull') : mpMsg('lobbyWaiting', n, 6), false);
  const mapChoice = (typeof selectedMapId !== 'undefined') ? selectedMapId : 'MAPA_1';
  broadcastToPeers({
    type: 'LOBBY_STATE',
    maxPlayers: mpState.maxPlayers,
    gameMode: mpState.hostGameMode || 'SIM',
    mapId: mapChoice,
    roster: mpState.lobbyPlayers
  });
}


function createMultiplayerRoom(nameInput, codeOut) {
  if (typeof Peer !== 'function') { setMpStatus(mpMsg('noPeerJs'), true); return; }
  destroyMpConnection();
  readPilotName(nameInput);

  const num = Math.floor(1000 + Math.random() * 9000);
  const roomCode = mpState.country + '-' + num;
  if (codeOut) codeOut.value = roomCode;
  setMpStatus(mpMsg('openingRoom', roomCode));

  const peer = createConfiguredPeer('macross-od-' + roomCode.toLowerCase());
  mpState.peer = peer;
  mpState.isHost = true;
  mpState.myId = 'host';
  mpState.myTeam = 'BLUE';
  mpState.mySlot = 0;

  mpState.lobbyPlayers = [{
    id: 'host', name: mpState.pilotName, country: mpState.country,
    team: 'BLUE', slot: 0, hp: 140, alive: true
  }];
  renderSquadLobbyUI();

  peer.on('open', () => {
    const mapSel = document.getElementById('mpMapSelect');
    const mapLabel = (mapSel && mapSel.selectedOptions && mapSel.selectedOptions[0]) ? mapSel.selectedOptions[0].textContent : 'MAPA 1';
    setMpStatus(mpMsg('roomReady', roomCode, mapLabel, mpState.country));
  });
  peer.on('connection', (conn) => setupPeerDataChannel(conn));
  peer.on('error', (err) => setMpStatus(mpMsg('netError', err.type || err.message), true));
}
function joinMultiplayerRoom(nameInput, codeIn) {
  if (typeof Peer !== 'function') { setMpStatus(mpMsg('noPeerJs'), true); return; }
  const rawInput = (codeIn && codeIn.value ? codeIn.value : '').trim().toUpperCase();
  const match = rawInput.match(/([A-Z]{2}-\d{4})/);
  const code = match ? match[1] : '';
  if (!code) { setMpStatus(mpMsg('badFormat'), true); return; }
  const roomCountry = code.slice(0, 2);
  if (roomCountry !== mpState.country) {
    setMpStatus(mpMsg('regionBlocked', roomCountry, mpState.country), true);
    return;
  }

  destroyMpConnection();
  readPilotName(nameInput);
  setMpStatus(mpMsg('connecting', code));

  const peer = createConfiguredPeer();
  mpState.peer = peer;
  mpState.isHost = false;

  peer.on('open', (myPeerId) => {
    mpState.myId = myPeerId;
    const conn = peer.connect('macross-od-' + code.toLowerCase(), { reliable: true });
    mpState.conn = conn;
    setupPeerDataChannel(conn);
  });
  peer.on('error', () => setMpStatus(mpMsg('notFound', code), true));
}

function setupPeerDataChannel(conn) {
  conn.on('open', () => {
    if (!mpState.isHost) {
      conn.send({ type: 'HELLO', id: mpState.myId, name: mpState.pilotName, country: mpState.country });
    }
  });
  conn.on('data', (pkt) => handleMpPacket(pkt, conn));
  conn.on('close', () => {
    if (mpState.isHost) {
      const deadId = conn.peer;
      mpState.peers.delete(deadId);
      if (!mpState.active) {
        mpState.lobbyPlayers = mpState.lobbyPlayers.filter((p) => p.id !== deadId);
        if (mpState.maxPlayers === 6) broadcastLobbyState();
      } else {
        const rp = mpState.players.get(deadId);
        if (rp) { rp.hp = 0; rp.alive = false; if (rp.mesh) rp.mesh.visible = false; }
        checkTeamElimination();
      }
    } else if (mpState.active && !mpState.matchEnded) {
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

  if (pkt.type === 'HELLO' && mpState.isHost) {
    if (pkt.country !== mpState.country) {
      conn.send({ type: 'REJECT', reason: 'PAÍS DISTINTO (' + pkt.country + ')' });
      setTimeout(() => { try { conn.close(); } catch (e) {} }, 150);
      return;
    }
    if (mpState.active || mpState.lobbyPlayers.length >= mpState.maxPlayers) {
      conn.send({ type: 'REJECT', reason: mpState.active ? 'PARTIDA EN CURSO' : 'SALA LLENA' });
      setTimeout(() => { try { conn.close(); } catch (e) {} }, 150);
      return;
    }
    const clientId = pkt.id || conn.peer;
    mpState.peers.set(clientId, conn);

    if (mpState.maxPlayers === 2) {
      mpState.conn = conn;
      mpState.rivalName = pkt.name || 'RIVAL';
      mpState.rivalCountry = pkt.country || mpState.country;
      const mapChoice = (typeof selectedMapId !== 'undefined') ? selectedMapId : 'MAPA_1';
      conn.send({ type: 'HELLO_1V1_START', name: mpState.pilotName, country: mpState.country, mapId: mapChoice, gameMode: mpState.hostGameMode || 'SIM' });
      launchMultiplayerMatch(mapChoice, mpState.hostGameMode || 'SIM');
    } else {
      const blueCount = mpState.lobbyPlayers.filter((p) => p.team === 'BLUE').length;
      const redCount = mpState.lobbyPlayers.filter((p) => p.team === 'RED').length;
      mpState.lobbyPlayers.push({
        id: clientId, name: pkt.name || 'PILOT', country: pkt.country,
        team: (blueCount <= redCount) ? 'BLUE' : 'RED', slot: mpState.lobbyPlayers.length, hp: 140, alive: true
      });
      broadcastLobbyState();
    }
    return;
  }
  if (pkt.type === 'HELLO_1V1_START' && !mpState.isHost) {
    mpState.maxPlayers = 2;
    mpState.rivalName = pkt.name || 'RIVAL';
    mpState.rivalCountry = pkt.country || mpState.country;
    launchMultiplayerMatch(pkt.mapId || 'MAPA_1', pkt.gameMode || 'SIM');
    return;
  }

    if (pkt.type === 'LOBBY_STATE' && !mpState.isHost) {
    mpState.maxPlayers = pkt.maxPlayers || 6;
    if (pkt.gameMode) {
      mpState.hostGameMode = (pkt.gameMode === 'ARCADE') ? 'ARCADE' : 'SIM';
      document.querySelectorAll('#mpGameModeGroup [data-mp-mode]').forEach((b) => {
        b.classList.toggle('active', b.dataset.mpMode === mpState.hostGameMode);
        b.disabled = true;
        b.style.opacity = (b.dataset.mpMode === mpState.hostGameMode) ? '1' : '0.4';
      });
    }
    const mpMapSel = document.getElementById('mpMapSelect');
    if (mpMapSel && pkt.mapId) { mpMapSel.value = pkt.mapId; mpMapSel.disabled = true; }
    mpState.lobbyPlayers = Array.isArray(pkt.roster) ? pkt.roster : [];
    const me = mpState.lobbyPlayers.find((p) => p.id === mpState.myId);
    if (me) { mpState.myTeam = me.team; mpState.mySlot = me.slot; }
    renderSquadLobbyUI();
    const n = mpState.lobbyPlayers.length;
    setMpStatus(n === 6 ? mpMsg('lobbyFull') : mpMsg('lobbyWaiting', n, 6), false);
    return;
  }


  if (pkt.type === 'SWITCH_TEAM' && mpState.isHost && !mpState.active) {
    const p = mpState.lobbyPlayers.find((item) => item.id === conn.peer);
    const targetTeam = pkt.team === 'RED' ? 'RED' : 'BLUE';
    if (p && p.team !== targetTeam && mpState.lobbyPlayers.filter((i) => i.team === targetTeam).length < 3) {
      p.team = targetTeam;
      broadcastLobbyState();
    }
    return;
  }

  if (pkt.type === 'START_3V3' && !mpState.isHost) {
    mpState.maxPlayers = 6;
    mpState.lobbyPlayers = Array.isArray(pkt.roster) ? pkt.roster : [];
    const me = mpState.lobbyPlayers.find((p) => p.id === mpState.myId);
    if (me) { mpState.myTeam = me.team; mpState.mySlot = me.slot; }
    launchMultiplayerMatch(pkt.mapId || 'MAPA_1', pkt.gameMode || 'SIM', mpState.lobbyPlayers);
    return;
  }
  if (pkt.type === 'STATE' && mpState.active) {
    if (mpState.maxPlayers === 2) {
      mpState.targetPos.set(pkt.px, pkt.py, pkt.pz);
      mpState.targetQuat.set(pkt.qx, pkt.qy, pkt.qz, pkt.qw);
      mpState.rivalMode = pkt.mode || 'FIGHTER';
      mpState.rivalArmor = typeof pkt.hp === 'number' ? pkt.hp : mpState.rivalArmor;
      if (mpState.rivalArmor <= 0 && !mpState.matchEnded) { mpState.matchEnded = true; mpState.victory = true; }
    } else {
      const senderId = pkt.id || conn.peer;
      const rp = mpState.players.get(senderId);
      if (rp) {
        rp.targetPos.set(pkt.px, pkt.py, pkt.pz);
        rp.targetQuat.set(pkt.qx, pkt.qy, pkt.qz, pkt.qw);
        rp.mode = pkt.mode || 'FIGHTER';
        if (typeof pkt.hp === 'number') {
          rp.hp = pkt.hp;
          if (rp.hp <= 0 && rp.alive) {
            rp.alive = false;
            if (rp.mesh) {
              if (typeof spawnExplosion === 'function') spawnExplosion(scene, camera, rp.mesh.position, 1.4);
              rp.mesh.visible = false;
            }
          }
        }
      }
      if (mpState.isHost) { broadcastToPeers(pkt, senderId); checkTeamElimination(); }
    }
    return;
  }

  if (pkt.type === 'FIRE_GUN' && mpState.active) {
    if (mpState.isHost && mpState.maxPlayers === 6) broadcastToPeers(pkt, pkt.id || conn.peer);
    spawnRivalGunBolt(pkt);
    return;
  }

  if (pkt.type === 'FIRE_MSL' && mpState.active) {
    if (mpState.isHost && mpState.maxPlayers === 6) broadcastToPeers(pkt, pkt.id || conn.peer);
    spawnRivalMissileSalvo(pkt);
    return;
  }
  if (pkt.type === 'RIVAL_HIT' && mpState.active) {
    if (mpState.maxPlayers === 2) {
      if (typeof damagePlayerArmor === 'function' && typeof playerContainer !== 'undefined') damagePlayerArmor(scene, camera, playerContainer, pkt.dmg || 9);
    } else {
      if (pkt.shotId && mpState.processedShots.has(pkt.shotId)) return;
      if (pkt.shotId) mpState.processedShots.add(pkt.shotId);
      if (pkt.targetId === mpState.myId) {
        if (typeof damagePlayerArmor === 'function' && typeof playerContainer !== 'undefined') damagePlayerArmor(scene, camera, playerContainer, pkt.dmg || 9);
      } else if (mpState.isHost) {
        const targetConn = mpState.peers.get(pkt.targetId);
        if (targetConn && targetConn.open) targetConn.send(pkt);
      }
    }
    return;
  }

  if (pkt.type === 'MATCH_OVER_3V3' && mpState.active && !mpState.matchEnded) {
    mpState.matchEnded = true;
    mpState.winningTeam = pkt.winningTeam;
    mpState.victory = (pkt.winningTeam === mpState.myTeam);
    return;
  }

  if (pkt.type === 'PING' && conn && conn.open) { conn.send({ type: 'PONG', t: pkt.t }); return; }
  if (pkt.type === 'PONG' && typeof pkt.t === 'number') { mpState.pingMs = Math.max(1, Math.round(performance.now() - pkt.t)); return; }
}

function checkTeamElimination() {
  if (!mpState.isHost || mpState.maxPlayers !== 6 || mpState.matchEnded) return;
  let blueAlive = 0, redAlive = 0;
  const myHp = (typeof playerArmor !== 'undefined') ? playerArmor : 140;
  if (myHp > 0 && !(typeof isGameOver !== 'undefined' && isGameOver)) {
    if (mpState.myTeam === 'BLUE') blueAlive++; else redAlive++;
  }
  mpState.players.forEach((p) => { if (p.alive && p.hp > 0) { if (p.team === 'BLUE') blueAlive++; else redAlive++; } });
  if (blueAlive === 0 || redAlive === 0) {
    const winner = (blueAlive > 0) ? 'BLUE' : 'RED';
    mpState.matchEnded = true; mpState.winningTeam = winner; mpState.victory = (winner === mpState.myTeam);
    broadcastToPeers({ type: 'MATCH_OVER_3V3', winningTeam: winner });
  }
}
function getSpawnTransformForSlot(slot, mapId) {
  const isBlue = (slot < 3);
  const lane = slot % 3;
  return {
    x: (lane - 1) * 18,
    y: (mapId === 'MAPA_3') ? 34 : 42,
    z: isBlue ? 140 : -140,
    rotY: isBlue ? 0 : Math.PI
  };
}

function launchMultiplayerMatch(mapId, matchGameMode, roster) {
  mpState.active = true;
  mpState.matchEnded = false;
  mpState.victory = false;
  mpState.winningTeam = null;
  mpState.rivalArmor = 140;

  const targetMode = (matchGameMode === 'ARCADE') ? 'ARCADE' : 'SIM';
  if (typeof hudStyleMode !== 'undefined') {
    if (mpState.savedLocalHudMode === null) mpState.savedLocalHudMode = hudStyleMode;
    hudStyleMode = targetMode;
  }
  const hudSel = document.getElementById('hudStyleModeSelect');
  if (hudSel) { hudSel.value = targetMode; hudSel.disabled = true; }

  const mpScreen = document.getElementById('multiplayerScreen');
  if (mpScreen) mpScreen.classList.add('hidden');
  if (typeof switchEnvironmentMap === 'function' && typeof scene !== 'undefined' && (typeof activeMapId === 'undefined' || activeMapId !== mapId)) {
  switchEnvironmentMap(scene, mapId);
}
 if (typeof enemies !== 'undefined') {
    for (let i = 0; i < enemies.length; i++) { enemies[i].respawnTimer = 999999; enemies[i].mesh.visible = false; }
  }
  clearRemotePlayers();
  if (mpState.maxPlayers === 2) {
    spawnRivalValkyrie();
    if (typeof playerContainer !== 'undefined') {
      const startZ = mpState.isHost ? 140 : -140;
      const startY = (mapId === 'MAPA_3') ? 34 : 42;
      playerContainer.position.set(0, startY, startZ);
      playerContainer.rotation.set(0, mpState.isHost ? 0 : Math.PI, 0);
      mpState.targetPos.set(0, startY, -startZ);
    }
  } else {
    const list = roster || mpState.lobbyPlayers;
    for (let i = 0; i < list.length; i++) {
      const entry = list[i];
      const sp = getSpawnTransformForSlot(entry.slot, mapId);
      if (entry.id === mpState.myId) {
        mpState.myTeam = entry.team; mpState.mySlot = entry.slot;
        if (typeof playerContainer !== 'undefined') { playerContainer.position.set(sp.x, sp.y, sp.z); playerContainer.rotation.set(0, sp.rotY, 0); }
      } else {
        spawnSquadronValkyrie(entry, sp);
      }
    }
  }
  if (typeof startMission === 'function') startMission();
}

function attachClonedValkyrieToGroup(gltf, targetGroup, onReady) {
  const sourceScene = gltf.scene;
  const model = (typeof cloneSkinnedScene === 'function') ? cloneSkinnedScene(sourceScene) : sourceScene.clone(true);
  if (!mpState._cachedVf1Scale) {
    const box = new THREE.Box3().setFromObject(sourceScene);
    const size = box.getSize(new THREE.Vector3()).length();
    mpState._cachedVf1Scale = size > 0 ? (1.6 / size) : 0.022;
  }
  const s = mpState._cachedVf1Scale;
  model.scale.set(s, s, s);
  model.rotation.y = Math.PI;
  targetGroup.add(model);
  const clip = gltf.animations && gltf.animations[0];
  let mixer = null, action = null, clipDur = 0;
  if (clip) { mixer = new THREE.AnimationMixer(model); clipDur = clip.duration; action = mixer.clipAction(clip); action.play(); }
  if (onReady) onReady(mixer, action, clipDur);
}
function spawnRivalValkyrie() {
  const group = new THREE.Group();
  mpState.rivalMesh = group;
  if (typeof scene !== 'undefined') scene.add(group);
  if (typeof THREE.GLTFLoader !== 'function') return;
  new THREE.GLTFLoader().load('./models/vf1a.glb', (gltf) => {
    mpState.cachedValkyrieGltf = gltf;
    attachClonedValkyrieToGroup(gltf, group, (m, a, d) => { mpState.rivalMixer = m; mpState.rivalAction = a; mpState.rivalClipDur = d; });
  });
}

function spawnSquadronValkyrie(entry, spawnPos) {
  const group = new THREE.Group();
  group.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
  group.rotation.set(0, spawnPos.rotY, 0);
  if (typeof scene !== 'undefined') scene.add(group);

  const playerObj = {
    id: entry.id, name: entry.name || 'PILOT', country: entry.country || mpState.country,
    team: entry.team || 'BLUE', slot: entry.slot || 0, hp: 140, maxHp: 140, alive: true,
    mesh: group, mixer: null, action: null, clipDur: 0, mode: 'FIGHTER',
    targetPos: new THREE.Vector3(spawnPos.x, spawnPos.y, spawnPos.z), targetQuat: group.quaternion.clone(), lockProgress: 0
  };
  mpState.players.set(entry.id, playerObj);

  const onReady = (gltf) => attachClonedValkyrieToGroup(gltf, group, (m, a, d) => { playerObj.mixer = m; playerObj.action = a; playerObj.clipDur = d; });
  if (mpState.cachedValkyrieGltf) onReady(mpState.cachedValkyrieGltf);
  else if (typeof THREE.GLTFLoader === 'function') new THREE.GLTFLoader().load('./models/vf1a.glb', (g) => { mpState.cachedValkyrieGltf = g; onReady(g); });
}

function sendMpPacket(pkt) {
  if (!mpState.active) return;
  if (mpState.maxPlayers === 2) { if (mpState.conn && mpState.conn.open) mpState.conn.send(pkt); }
  else if (mpState.isHost) broadcastToPeers(pkt);
  else if (mpState.conn && mpState.conn.open) mpState.conn.send(pkt);
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
  enemyBullets.push({ mesh: boltGroup, vel: vel, life: 1.6, team: pkt.team || null });
}

function notifyMpGunpodShot(origin, vel) {
  if (!mpState.active) return;
  sendMpPacket({ type: 'FIRE_GUN', id: mpState.myId, team: mpState.myTeam, ox: origin.x, oy: origin.y, oz: origin.z, vx: vel.x, vy: vel.y, vz: vel.z });
}

function notifyMpMissileSalvo(origin, profileId) {
  if (!mpState.active) return;
  sendMpPacket({ type: 'FIRE_MSL', id: mpState.myId, team: mpState.myTeam, ox: origin.x, oy: origin.y, oz: origin.z, profile: profileId || 'LIGERO' });
}

function spawnRivalMissileSalvo(pkt) {
  if (typeof scene === 'undefined' || typeof enemyMissiles === 'undefined' || typeof playerContainer === 'undefined') return;
  if (mpState.maxPlayers === 6 && pkt.team && pkt.team === mpState.myTeam) return;
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
    enemyMissiles.push({ mesh: mGroup, lastTailPos: spawnPos.clone(), speed: pkt.profile === 'PESADO' ? 26 : 32, life: 4.5, homingTimer: 2.4, isLockedOn: true, minDistToPlayer: spawnPos.distanceTo(playerContainer.position), overshot: false });
  }
}
function updateMultiplayer(delta, playerContainer) {
  if (!mpState.active) return;

  if (mpState.maxPlayers === 2) {
    if (mpState.rivalMesh) {
      mpState.rivalMesh.position.lerp(mpState.targetPos, Math.min(1.0, 16.0 * delta));
      mpState.rivalMesh.quaternion.slerp(mpState.targetQuat, Math.min(1.0, 16.0 * delta));
      if (mpState.rivalMixer && mpState.rivalAction && mpState.rivalClipDur > 0) {
        const f = mpState.rivalMode === 'BATTROID' ? 29 : (mpState.rivalMode === 'GERWALK' ? 14 : 0);
        mpState.rivalAction.paused = false; mpState.rivalAction.time = (f / 91) * mpState.rivalClipDur;
        mpState.rivalMixer.update(0); mpState.rivalAction.paused = true;
      }
    }
    if (mpState.rivalMesh && typeof bullets !== 'undefined') {
      const segStart = new THREE.Vector3(), segVec = new THREE.Vector3(), closest = new THREE.Vector3(), rivalCenter = mpState.rivalMesh.position;
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        segVec.copy(b.vel).multiplyScalar(delta); segStart.copy(b.mesh.position).sub(segVec);
        const lenSq = segVec.lengthSq(), t = lenSq > 0 ? Math.max(0, Math.min(1, rivalCenter.clone().sub(segStart).dot(segVec) / lenSq)) : 0;
        closest.copy(segStart).addScaledVector(segVec, t);
        if (closest.distanceTo(rivalCenter) < 2.2) {
          if (typeof spawnImpactSparks === 'function') spawnImpactSparks(scene, camera, closest);
          mpState.rivalArmor = Math.max(0, mpState.rivalArmor - 9);
          if (mpState.conn && mpState.conn.open) mpState.conn.send({ type: 'RIVAL_HIT', dmg: 9 });
          scene.remove(b.mesh); bullets.splice(i, 1);
        }
      }
    }
  } else {
    mpState.players.forEach((rp) => {
      if (!rp.alive || !rp.mesh) return;
      rp.mesh.position.lerp(rp.targetPos, Math.min(1.0, 16.0 * delta));
      rp.mesh.quaternion.slerp(rp.targetQuat, Math.min(1.0, 16.0 * delta));
      if (rp.mixer && rp.action && rp.clipDur > 0) {
        const f = rp.mode === 'BATTROID' ? 29 : (rp.mode === 'GERWALK' ? 14 : 0);
        rp.action.paused = false; rp.action.time = (f / 91) * rp.clipDur;
        rp.mixer.update(0); rp.action.paused = true;
      }
    });
    if (typeof bullets !== 'undefined') {
      const segStart = new THREE.Vector3(), segVec = new THREE.Vector3(), closest = new THREE.Vector3();
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        segVec.copy(b.vel).multiplyScalar(delta); segStart.copy(b.mesh.position).sub(segVec);
        const lenSq = segVec.lengthSq();
        let hitAny = false;
        mpState.players.forEach((rp) => {
          if (hitAny || !rp.alive || !rp.mesh || rp.team === mpState.myTeam) return;
          const t = lenSq > 0 ? Math.max(0, Math.min(1, rp.mesh.position.clone().sub(segStart).dot(segVec) / lenSq)) : 0;
          closest.copy(segStart).addScaledVector(segVec, t);
          if (closest.distanceTo(rp.mesh.position) < 2.2) {
            if (typeof spawnImpactSparks === 'function') spawnImpactSparks(scene, camera, closest);
            rp.hp = Math.max(0, rp.hp - 9);
            sendMpPacket({ type: 'RIVAL_HIT', targetId: rp.id, dmg: 9, shotId: mpState.myId + '-' + Math.round(performance.now()) + '-' + i });
            hitAny = true;
          }
        });
        if (hitAny) { scene.remove(b.mesh); bullets.splice(i, 1); }
      }
    }
    if (mpState.isHost) checkTeamElimination();
  }

  const lockedMode = mpState.hostGameMode || 'SIM';
  if (typeof hudStyleMode !== 'undefined' && hudStyleMode !== lockedMode) hudStyleMode = lockedMode;
  const activeHudSel = document.getElementById('hudStyleModeSelect');
  if (activeHudSel && !activeHudSel.disabled) { activeHudSel.value = lockedMode; activeHudSel.disabled = true; }

  mpState.pingTimer += delta;

  if (mpState.pingTimer >= 1.0 && mpState.conn && mpState.conn.open) { mpState.pingTimer = 0; mpState.conn.send({ type: 'PING', t: performance.now() }); }

  mpState.sendTimer += delta;
  if (mpState.sendTimer >= 0.033 && playerContainer) {
    mpState.sendTimer = 0;
    const myHp = (typeof playerArmor !== 'undefined') ? Math.round(playerArmor) : 140;
    if (mpState.maxPlayers === 2 && myHp <= 0 && !mpState.matchEnded) { mpState.matchEnded = true; mpState.victory = false; }
    sendMpPacket({ type: 'STATE', id: mpState.myId, team: mpState.myTeam, px: playerContainer.position.x, py: playerContainer.position.y, pz: playerContainer.position.z, qx: playerContainer.quaternion.x, qy: playerContainer.quaternion.y, qz: playerContainer.quaternion.z, qw: playerContainer.quaternion.w, mode: (typeof currentMode !== 'undefined') ? currentMode : 'FIGHTER', hp: myHp });
  }
}

window.addEventListener('DOMContentLoaded', initMultiplayerUI);
