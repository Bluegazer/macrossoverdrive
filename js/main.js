const hudEl = document.getElementById('hud');
const fpsEl = document.getElementById('fpsBox');
const startScreenEl = document.getElementById('startScreen');
const uiPanelEl = document.getElementById('ui');

const keys = {};
const keyboardHeldActions = new Set();
let gamepadHeldActions = new Set();
let suppressNextGamepadFrame = false;
const continuousControlActions = ['moveForward', 'moveBack', 'moveLeft', 'moveRight', 'turnLeft', 'turnRight', 'verticalUp', 'verticalDown', 'gunpod', 'missiles', 'brake', 'slowdown'];
let isGameStarted = false;
let isPaused = false;
let restartDeclined = false;
let gamepadFocusedElement = null;
let introOrbitAngle = 0.65;
let manualHourOffset = 0;
const timeOfDayStorageKey = 'macrossvoxp-time-of-day-v1';
const validTimeOfDayModes = ['real', 'morning', 'midday', 'afternoon', 'night'];
let timeOfDayMode = (() => {
  try {
    const saved = localStorage.getItem(timeOfDayStorageKey);
    return validTimeOfDayModes.includes(saved) ? saved : 'real';
  } catch (_) {
    return 'real';
  }
})();

const preloadBoxEl = document.getElementById('assetPreloadBox');
const preloadTextEl = document.getElementById('assetPreloadText');
const preloadBarEl = document.getElementById('assetPreloadBar');
const btnStartInitEl = document.getElementById('btnStartGame');
if (btnStartInitEl) btnStartInitEl.style.opacity = '0.45';

const sharedLoadingManager = new THREE.LoadingManager();
THREE.DefaultLoadingManager = sharedLoadingManager;

sharedLoadingManager.onProgress = (url, loaded, total) => {
  const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 100;
  if (preloadTextEl) preloadTextEl.textContent = 'PRECARGANDO MODELOS 3D... ' + pct + '%';
  if (preloadBarEl) preloadBarEl.style.width = pct + '%';
};

sharedLoadingManager.onLoad = () => {
  if (preloadTextEl) preloadTextEl.textContent = 'COMPILANDO SHADERS GPU...';
  if (preloadBarEl) preloadBarEl.style.width = '100%';
  requestAnimationFrame(() => {
    try { renderer.compile(scene, camera); } catch (e) {}
    if (preloadBoxEl) preloadBoxEl.style.display = 'none';
    if (btnStartInitEl) {
      btnStartInitEl.disabled = false;
      btnStartInitEl.textContent = 'INICIAR MISIÓN';
      btnStartInitEl.style.opacity = '1';
      btnStartInitEl.focus({ preventScroll: true });
    }
  });
};

function detectHardwareProfile() {
  let gpuName = '';
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      gpuName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
      const loseExt = gl.getExtension('WEBGL_lose_context');
      if (loseExt) loseExt.loseContext();
    }
  } catch (e) {}

  const g = gpuName.toLowerCase();
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 4;
  const isDedicated = /(nvidia|geforce|rtx|gtx|radeon rx|arc a\d)/i.test(g);
  const isWeakIgpu = /(uhd|hd graphics|radeon\(tm\) r[357]|mali|adreno|swiftshader|llvmpipe)/i.test(g) || mem <= 4 || (cores <= 4 && !/vega|iris/i.test(g));

  if (isDedicated) return { tier: 'HIGH', antialias: true, maxDpr: 1.75 };
  if (isWeakIgpu) return { tier: 'LOW', antialias: false, maxDpr: 1.0 };
  return { tier: 'MEDIUM', antialias: true, maxDpr: 1.25 };
}

const hwProfile = detectHardwareProfile();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.25, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: hwProfile.antialias, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, hwProfile.maxDpr));
document.body.appendChild(renderer.domElement);

switchEnvironmentMap(scene, 'MAPA_1');

const ambientLight = new THREE.AmbientLight(0x7c93ad, 0.56);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0x5299c7, 0x28323e, 0.48);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xfff1d6, 1.65);
dirLight.position.set(180, 220, 120);
scene.add(dirLight);
if (typeof updateDayNightCycle === 'function') {
  updateDayNightCycle(scene, ambientLight, hemiLight, dirLight, manualHourOffset, timeOfDayMode);
}

const playerContainer = new THREE.Group();
playerContainer.position.set(0, 38, 120);
scene.add(playerContainer);

const visualTiltGroup = new THREE.Group();
playerContainer.add(visualTiltGroup);

initWeaponsAndEnemies(scene, playerContainer);
loadPlayerModel(visualTiltGroup);


function startMission() {
  if (isGameStarted) return;
  isGameStarted = true;
  restartDeclined = false;
  if (typeof stopTitleMusic === 'function') stopTitleMusic();
  if (startScreenEl) startScreenEl.classList.add('hidden');
  if (uiPanelEl) uiPanelEl.classList.remove('hidden');
  if (fpsEl) fpsEl.classList.remove('hidden');
  if (typeof unlockAudio === 'function') unlockAudio();
  if (typeof playSFX === 'function') playSFX('transform', 0.85, 0);
  clock.getDelta();
}
function returnToStartScreen() {
  isGameStarted = false;
  isPaused = false;
  restartDeclined = false;
  for (const k in keys) keys[k] = false;
  if (typeof destroyMpConnection === 'function') destroyMpConnection();


  if (typeof silenceAllCombatAudio === 'function') {
    silenceAllCombatAudio();
  }
  if (typeof resetPlayerMission === 'function') {
    resetPlayerMission(playerContainer, visualTiltGroup);
  }
  if (typeof clearAllProjectiles === 'function') {
    clearAllProjectiles(scene);
  }
  if (typeof hudCtx !== 'undefined' && typeof hudCanvas !== 'undefined') {
    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
  }

  if (uiPanelEl) uiPanelEl.classList.add('hidden');
  if (fpsEl) fpsEl.classList.add('hidden');
  if (startScreenEl) startScreenEl.classList.remove('hidden');

  if (typeof playTitleMusic === 'function') {
    playTitleMusic();
  }
}

const btnStartGame = document.getElementById('btnStartGame');
if (btnStartGame) {
  btnStartGame.addEventListener('click', startMission);
}

function togglePause() {
  if (!isGameStarted || isPlayerDying || isGameOver) return;
  if (isPaused) return;
  isPaused = true;
  clock.getDelta();
  if (window.gameControls?.openPauseOptions) window.gameControls.openPauseOptions();
}

window.addEventListener('macross:resume-game', () => {
  isPaused = false;
  clock.getDelta();
});

document.getElementById('btnExitToTitle')?.addEventListener('click', () => {
  if (window.gameControls?.closeOptions?.() === false) return;
  returnToStartScreen();
  btnStartGame?.focus();
});

const timeOfDaySelect = document.getElementById('timeOfDayMode');
if (timeOfDaySelect) {
  timeOfDaySelect.value = timeOfDayMode;
  timeOfDaySelect.addEventListener('change', () => {
    const selectedMode = timeOfDaySelect.value;
    if (!validTimeOfDayModes.includes(selectedMode)) return;
    timeOfDayMode = selectedMode;
    try { localStorage.setItem(timeOfDayStorageKey, timeOfDayMode); } catch (_) {}
    updateDayNightCycle(scene, ambientLight, hemiLight, dirLight, manualHourOffset, timeOfDayMode);
  });
}

let selectedMapId = 'MAPA_1';

const MAP_TITLES = {
  MAPA_1: '01 // ISLA SOUTH ATARIA',
  MAPA_2: '02 // ÓRBITA DE SATURNO',
  MAPA_3: '03 // MACROSS CITY INTERIOR (DYRL)'
};

const mapSelectButtons = document.querySelectorAll('.map-select-btn');
const selectedMapTitleEl = document.getElementById('selectedMapTitle');

mapSelectButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mapKey = btn.dataset.map;
    if (!mapKey || mapKey === selectedMapId) return;

    selectedMapId = mapKey;
    mapSelectButtons.forEach((b) => b.classList.toggle('active', b === btn));
    if (selectedMapTitleEl) {
      selectedMapTitleEl.textContent = MAP_TITLES[mapKey] || mapKey;
    }

    if (typeof switchEnvironmentMap === 'function') {
      switchEnvironmentMap(scene, selectedMapId);
    }
  });
});

function visibleGamepadMenuItems() {
  if (window.gameControls?.isOptionsOpen()) {
    const candidates = [...document.querySelectorAll('#optionsScreen button, #optionsScreen input, #optionsScreen select')];
    return candidates.filter(element => {
      if (element.disabled || !element.getClientRects().length) return false;
      return !element.closest('[hidden]');
    });
  }
  if (!isGameStarted) {
    return [...document.querySelectorAll('#startScreen button')].filter(element => element.getClientRects().length && !element.disabled);
  }
  return [];
}

function setGamepadMenuFocus(element) {
  document.querySelectorAll('.gamepad-menu-focus').forEach(item => item.classList.remove('gamepad-menu-focus'));
  gamepadFocusedElement = element || null;
  if (!element) return;
  element.classList.add('gamepad-menu-focus');
  element.focus({ preventScroll: true });
}

document.addEventListener('macross:options-opened', event => {
  if (event.detail?.pause) setGamepadMenuFocus(document.getElementById('btnContinueGame'));
});

function stepGamepadMenuFocus(direction) {
  const items = visibleGamepadMenuItems();
  if (!items.length) return;
  let currentIndex = items.indexOf(gamepadFocusedElement);
  if (currentIndex < 0) currentIndex = items.indexOf(document.activeElement);
  const current = currentIndex >= 0 ? items[currentIndex] : document.activeElement;
  if (current instanceof HTMLInputElement && current.type === 'range' && (direction === 'left' || direction === 'right')) {
    const step = Number(current.step) || 1;
    const sign = direction === 'right' ? 1 : -1;
    current.value = String(Math.max(Number(current.min), Math.min(Number(current.max), Number(current.value) + sign * step * 5)));
    current.dispatchEvent(new Event('input', { bubbles: true }));
    setGamepadMenuFocus(current);
    return;
  }
  if (current instanceof HTMLSelectElement && (direction === 'left' || direction === 'right')) {
    const offset = direction === 'right' ? 1 : -1;
    current.selectedIndex = (current.selectedIndex + offset + current.options.length) % current.options.length;
    current.dispatchEvent(new Event('change', { bubbles: true }));
    setGamepadMenuFocus(current);
    return;
  }
  const offset = (direction === 'up' || direction === 'left') ? -1 : 1;
  const nextIndex = currentIndex < 0
    ? (offset > 0 ? 0 : items.length - 1)
    : (currentIndex + offset + items.length) % items.length;
  setGamepadMenuFocus(items[nextIndex]);
}

function acceptGamepadMenuSelection() {
  const items = visibleGamepadMenuItems();
  const target = items.includes(gamepadFocusedElement) ? gamepadFocusedElement : items[0];
  if (!target) return;
  setGamepadMenuFocus(target);
  if (!(target instanceof HTMLInputElement && target.type === 'range')) target.click();
  const focusedAfterClick = document.activeElement;
  if (window.gameControls?.isOptionsOpen() && visibleGamepadMenuItems().includes(focusedAfterClick)) {
    setGamepadMenuFocus(focusedAfterClick);
  }
}

window.addEventListener('macross:gamepad-menu-input', event => {
  const { direction, accept, back } = event.detail || {};
  if (window.gameControls?.isOptionsOpen()) {
    if (back) {
      suppressNextGamepadFrame = true;
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
      return;
    }
    if (window.gameControls.isListening()) return;
    if (direction) stepGamepadMenuFocus(direction);
    if (accept) {
      suppressNextGamepadFrame = true;
      acceptGamepadMenuSelection();
    }
    return;
  }

  if (typeof isGameOver !== 'undefined' && isGameOver) {
    if (direction === 'left' || direction === 'up') restartDeclined = false;
    if (direction === 'right' || direction === 'down') restartDeclined = true;
    if (back) restartDeclined = true;
    if (accept || back) suppressNextGamepadFrame = true;
    if (accept) {
      if (restartDeclined) returnToStartScreen();
      else window.location.reload();
    }
    return;
  }

  if (isPaused) {
    if (back || accept) {
      suppressNextGamepadFrame = true;
      togglePause();
    }
    return;
  }
  if (!isGameStarted) {
    if (direction) stepGamepadMenuFocus(direction);
    if (accept) {
      suppressNextGamepadFrame = true;
      acceptGamepadMenuSelection();
    }
  }
});

const btnFighter = document.getElementById('btnFighter');
if (btnFighter) btnFighter.addEventListener('click', () => { if (isGameStarted && !isPaused && !isPlayerDying && !isGameOver) transformTo('FIGHTER'); });
const btnGerwalk = document.getElementById('btnGerwalk');
if (btnGerwalk) btnGerwalk.addEventListener('click', () => { if (isGameStarted && !isPaused && !isPlayerDying && !isGameOver) transformTo('GERWALK'); });
const btnBattroid = document.getElementById('btnBattroid');
if (btnBattroid) btnBattroid.addEventListener('click', () => { if (isGameStarted && !isPaused && !isPlayerDying && !isGameOver) transformTo('BATTROID'); });
const btnMelee = document.getElementById('btnMelee');
if (btnMelee) btnMelee.addEventListener('click', () => { if (isGameStarted && !isPaused && !isPlayerDying && !isGameOver) triggerGunpodMelee(); });
const btnStop = document.getElementById('btnStop');
if (btnStop) btnStop.addEventListener('click', () => { if (isGameStarted && !isPaused && !isPlayerDying && !isGameOver) triggerFullStop(); });

const btnSweep = document.getElementById('btnSweep');
if (btnSweep) {
  btnSweep.addEventListener('mousedown', () => { if (isGameStarted && !isPaused && !isPlayerDying && !isGameOver) startAcceleration(); });
  btnSweep.addEventListener('mouseup', stopAcceleration);
  btnSweep.addEventListener('mouseleave', stopAcceleration);
}

const sliderSFX = document.getElementById('sliderSFX');
const initialAudioSettings = typeof getAudioSettings === 'function' ? getAudioSettings() : { sfx: 50, bgm: 50 };
if (sliderSFX) sliderSFX.value = String(initialAudioSettings.sfx);
if (sliderSFX) {
  sliderSFX.addEventListener('input', (e) => {
    if (typeof setSFXVolume === 'function') setSFXVolume(Number(e.target.value));
  });
  sliderSFX.addEventListener('change', (e) => e.target.blur());
}

const sliderBGM = document.getElementById('sliderBGM');
if (sliderBGM) sliderBGM.value = String(initialAudioSettings.bgm);
if (sliderBGM) {
  sliderBGM.addEventListener('input', (e) => {
    const volume = Number(e.target.value);
    if (typeof setBGMVolume === 'function') setBGMVolume(volume);
    const tester = document.getElementById('soundTester');
    if (tester) tester.volume = volume / 100;
  });
  sliderBGM.addEventListener('change', (e) => e.target.blur());
}
const soundTestTrack = document.getElementById('soundTestTrack');
const soundTester = document.getElementById('soundTester');
const audioStatus = document.getElementById('audioStatus');
if (soundTestTrack && soundTester) {
  soundTestTrack.addEventListener('change', () => {
    soundTester.pause();
    soundTester.src = soundTestTrack.value;
    soundTester.load();
    if (audioStatus) audioStatus.textContent = 'Pista lista para reproducir.';
  });
  soundTester.addEventListener('play', () => {
    if (audioStatus) audioStatus.textContent = `Reproduciendo: ${soundTestTrack.selectedOptions[0].textContent}.`;
  });
  soundTester.addEventListener('pause', () => {
    if (audioStatus) audioStatus.textContent = 'Reproductor de prueba pausado.';
  });
  soundTester.addEventListener('error', () => {
    if (audioStatus) audioStatus.textContent = 'No se pudo cargar esta pista.';
  });
  soundTester.volume = sliderBGM ? Number(sliderBGM.value) / 100 : 0.65;
}

window.addEventListener('keydown', (e) => {
  const code = e.code || '';
  if (window.gameControls.isOptionsOpen()) return;

  if (code === 'KeyC' && isGameStarted && !isPaused && !e.repeat) {
    if (typeof deployChaff === 'function') deployChaff(scene, playerContainer);
    return;
  }

  const actions = window.gameControls.getActionsForCode(code);
  if (code === 'Space' || code === 'Tab' || actions.includes('missiles') || actions.includes('missileType')) e.preventDefault();
  if (!actions.length) return;
  if (actions.includes('advanceTime')) {
    manualHourOffset = (manualHourOffset + 2) % 24;
    if (typeof updateDayNightCycle === 'function') {
      updateDayNightCycle(scene, ambientLight, hemiLight, dirLight, manualHourOffset, timeOfDayMode);
    }
    return;
  }

  if (!isGameStarted) {
    if (actions.includes('startMission')) startMission();
    return;
  }

  if (typeof isGameOver !== 'undefined' && isGameOver) {
    if (actions.includes('restartAfterDefeat')) {
      window.location.reload();
    } else if (actions.includes('menuAfterDefeat') || actions.includes('returnMenu')) {
      returnToStartScreen();
    }
    return;
  }

  if (actions.includes('returnMenu')) {
    returnToStartScreen();
    return;
  }

  if (e.repeat) return;

  if (actions.includes('pause')) {
    togglePause();
    return;
  }

  if (actions.includes('music')) {
    if (typeof toggleMusic === 'function') toggleMusic();
    return;
  }

  if (isPaused || (typeof isPlayerDying !== 'undefined' && isPlayerDying)) return;
  for (const action of continuousControlActions) {
    if (actions.includes(action)) {
      keyboardHeldActions.add(action);
      keys[window.gameControls.getStateKey(action)] = true;
    }
  }
  if (actions.includes('fighter')) transformTo('FIGHTER');
  if (actions.includes('gerwalk')) transformTo('GERWALK');
  if (actions.includes('battroid')) transformTo('BATTROID');
  if (actions.includes('melee')) triggerGunpodMelee();
  if (actions.includes('missileType') && typeof cycleMissileType === 'function') cycleMissileType();
  if (actions.includes('chaff') && typeof deployChaff === 'function') deployChaff(scene, playerContainer);
  if (actions.includes('turbo')) startAcceleration();
  if (actions.includes('brake')) triggerFullStop();
  if (actions.includes('reverse')) startReverseGerwalk();
  if (actions.includes('tracking')) {
    if (typeof cycleBattroidTracking === 'function') cycleBattroidTracking();
  }
}, true);

window.addEventListener('click', (e) => {
  if (!isGameStarted) return;
  if (typeof isGameOver !== 'undefined' && isGameOver) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    if (Math.abs(e.clientY - (cy + 38)) < 28) {
      if (Math.abs(e.clientX - (cx - 78)) < 55) {
        window.location.reload();
      } else if (Math.abs(e.clientX - (cx + 78)) < 55) {
        returnToStartScreen();
      }
    }
  }
});

window.addEventListener('keyup', (e) => {
  const code = e.code || '';
  const actions = window.gameControls.getActionsForCode(code);
  for (const action of continuousControlActions) {
    if (actions.includes(action)) {
      keyboardHeldActions.delete(action);
      keys[window.gameControls.getStateKey(action)] = false;
    }
  }
  if (window.gameControls.isOptionsOpen()) return;
  if (actions.includes('turbo')) stopAcceleration();
  if (actions.includes('reverse')) stopReverseGerwalk();
});
window.addEventListener('macross:clear-inputs', () => {
  keyboardHeldActions.clear();
  gamepadHeldActions.clear();
  for (const action of continuousControlActions) keys[window.gameControls.getStateKey(action)] = false;
  stopAcceleration();
  stopReverseGerwalk();
});

function handleGamepadActionPress(action) {
  if (!isGameStarted) {
    if (action === 'startMission') startMission();
    return;
  }
  if (typeof isGameOver !== 'undefined' && isGameOver) {
    if (action === 'restartAfterDefeat') window.location.reload();
    else if (action === 'menuAfterDefeat' || action === 'returnMenu') returnToStartScreen();
    return;
  }
  if (action === 'returnMenu') { returnToStartScreen(); return; }
  if (action === 'pause') { togglePause(); return; }
  if (action === 'music') { if (typeof toggleMusic === 'function') toggleMusic(); return; }
  if (action === 'advanceTime') {
    manualHourOffset = (manualHourOffset + 2) % 24;
    if (typeof updateDayNightCycle === 'function') updateDayNightCycle(scene, ambientLight, hemiLight, dirLight, manualHourOffset, timeOfDayMode);
    return;
  }
  if (isPaused || (typeof isPlayerDying !== 'undefined' && isPlayerDying)) return;
  if (action === 'fighter') transformTo('FIGHTER');
  if (action === 'gerwalk') transformTo('GERWALK');
  if (action === 'battroid') transformTo('BATTROID');
  if (action === 'transformNext' || action === 'transformPrevious') {
    if (action === 'transformPrevious' && currentMode === 'BATTROID') return;
    const modes = ['FIGHTER', 'GERWALK', 'BATTROID'];
    const currentIndex = Math.max(0, modes.indexOf(currentMode));
    const offset = action === 'transformNext' ? 1 : -1;
    transformTo(modes[(currentIndex + offset + modes.length) % modes.length]);
  }
  if (action === 'melee') triggerGunpodMelee();
  if (action === 'tracking' && typeof cycleBattroidTracking === 'function') cycleBattroidTracking();
  if (action === 'missileType' && typeof cycleMissileType === 'function') cycleMissileType();
  if (action === 'chaff' && typeof deployChaff === 'function') deployChaff(scene, playerContainer);
  if (action.startsWith('camera') && typeof setGamepadCameraView === 'function') setGamepadCameraView(action);
}
window.addEventListener('macross:gamepad-frame', event => {
  const next = new Set(event.detail.pressedActions || []);
  if (suppressNextGamepadFrame) {
    suppressNextGamepadFrame = false;
    for (const action of ['gunpod', 'missiles', 'brake']) {
      keys[window.gameControls.getStateKey(action)] = keyboardHeldActions.has(action);
    }
    gamepadHeldActions = next;
    return;
  }
  for (const action of ['gunpod', 'missiles', 'brake']) {
    const keyCode = window.gameControls.getStateKey(action);
    keys[keyCode] = next.has(action) || keyboardHeldActions.has(action);
  }
  keys.GamepadMoveForward = next.has('moveForward');
  keys.GamepadMoveBack = next.has('moveBack');
  keys.GamepadTurnLeft = next.has('turnLeft');
  keys.GamepadTurnRight = next.has('turnRight');
  keys.GamepadGerwalkTurnLeft = next.has('moveLeft');
  keys.GamepadGerwalkTurnRight = next.has('moveRight');
  keys.GamepadRollLeft = next.has('turnLeft');
  keys.GamepadRollRight = next.has('turnRight');
  keys.GamepadPitchUp = next.has('verticalUp');
  keys.GamepadPitchDown = next.has('verticalDown');
  keys.GamepadGerwalkUp = next.has('gerwalkUp');
  keys.GamepadGerwalkDown = next.has('gerwalkDown');
  keys.GamepadLB = next.has('strafeLeft');
  keys.GamepadRB = next.has('strafeRight');
  keys.GamepadDescend = next.has('descend');
  keys.GamepadTargetLock = next.has('targetLock');
  keys.GamepadThrust = next.has('turbo') && currentMode === 'GERWALK';
  keys.GamepadSlowdown = next.has('slowdown');

  const transformCombo = next.has('transformPrevious') && next.has('transformNext');
  const justTransformCombo = transformCombo && !(gamepadHeldActions.has('transformPrevious') && gamepadHeldActions.has('transformNext'));
  if (justTransformCombo && isGameStarted && !isPaused && !isGameOver && !isPlayerDying) {
    transformTo(currentMode === 'FIGHTER' ? 'BATTROID' : 'FIGHTER');
  }

  if (next.has('turbo') && !gamepadHeldActions.has('turbo') && isGameStarted && !isPaused) {
    if (currentMode === 'BATTROID' && typeof triggerBattroidImpulse === 'function') triggerBattroidImpulse(keys);
    else if (currentMode === 'FIGHTER') startAcceleration();
  }
  if (!next.has('turbo') && gamepadHeldActions.has('turbo')) stopAcceleration();
  if (next.has('reverse') && !gamepadHeldActions.has('reverse') && isGameStarted && !isPaused && !isGameOver && !isPlayerDying) startReverseGerwalk();
  if (!next.has('reverse') && gamepadHeldActions.has('reverse')) stopReverseGerwalk();
  for (const action of next) {
    if (!gamepadHeldActions.has(action)) {
      const isHeldAction = ['turbo', 'reverse', 'slowdown', 'strafeLeft', 'strafeRight', 'descend', 'targetLock', 'gerwalkUp', 'gerwalkDown'].includes(action) || continuousControlActions.includes(action);
      const isTransformAction = action === 'transformPrevious' || action === 'transformNext';
      if (!isHeldAction && !(justTransformCombo && isTransformAction)) handleGamepadActionPress(action);
    }
  }
  gamepadHeldActions = next;
});

let fpsFrames = 0;
let fpsTime = 0;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const rawDelta = clock.getDelta();
  const delta = (isPaused || !isGameStarted || window.gameControls.isOptionsOpen()) ? 0 : Math.min(rawDelta, 0.05);

  if (typeof updateDayNightCycle === 'function') {
    updateDayNightCycle(scene, ambientLight, hemiLight, dirLight, manualHourOffset, timeOfDayMode);
  }

  if (!isGameStarted) {
    const safeDelta = Math.min(rawDelta, 0.05);
    if (typeof updateEnvironment === 'function') updateEnvironment(safeDelta);
    introOrbitAngle += 0.25 * safeDelta;
    const camDist = 3.2;
    camera.position.set(
      playerContainer.position.x + Math.sin(introOrbitAngle) * camDist,
      playerContainer.position.y + 0.85,
      playerContainer.position.z + Math.cos(introOrbitAngle) * camDist
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(playerContainer.position);
    renderer.render(scene, camera);
    return;
  }

  fpsFrames++;
  fpsTime += rawDelta;
  if (fpsTime >= 0.4) {
    const currentFps = Math.round(fpsFrames / fpsTime);
    fpsEl.textContent = 'FPS: ' + currentFps;
    fpsEl.style.color = currentFps >= 50 ? '#4ade80' : (currentFps >= 30 ? '#facc15' : '#f87171');
    fpsFrames = 0;
    fpsTime = 0;
  }

  if (!isPaused) {
    if (typeof updateEnvironment === 'function') updateEnvironment(delta);
    updatePlayerAnimation(delta);
    updateEnemies(delta, playerContainer);
    updateWeapons(delta, scene, camera, playerContainer, velocity, keys);
    updatePlayerPhysics(delta, playerContainer, visualTiltGroup, camera, keys, hudEl);
	if (typeof updateMultiplayer === 'function') updateMultiplayer(delta, playerContainer);

  }

  const isFullStop = Boolean(keys['KeyX']);
  let closestLockedMissileDist = Infinity;
  if (typeof enemyMissiles !== 'undefined' && enemyMissiles.length > 0) {
    for (let i = 0; i < enemyMissiles.length; i++) {
      const em = enemyMissiles[i];
      if (em.isLockedOn) {
        const d = em.mesh.position.distanceTo(playerContainer.position);
        if (d < closestLockedMissileDist) closestLockedMissileDist = d;
      }
    }
  }

  const isFiringGun = Boolean(keys['ShiftLeft']);
  const hasLockedTargets = (typeof lockedEnemies !== 'undefined' && lockedEnemies.length > 0);

  if (typeof updateEngineAudio === 'function') {
    updateEngineAudio(
      delta,
      isPaused,
      isFullStop,
      isAccelerating,
      currentMode,
      throttle,
      velocity.length(),
      closestLockedMissileDist,
      isFiringGun,
      hasLockedTargets
    );
  }

  drawDYRLHud(delta, camera, playerContainer, enemies, isPaused);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeHudCanvas();
});
