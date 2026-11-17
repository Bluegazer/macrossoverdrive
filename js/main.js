const hudEl = document.getElementById('hud');
const fpsEl = document.getElementById('fpsBox');
const keys = {};
let isPaused = false;
let restartDeclined = false;

const scene = new THREE.Scene();
buildSouthAtariaEnvironment(scene);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.25, 1400);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xdbeafe, 0.85));
const dirLight = new THREE.DirectionalLight(0xfff3d6, 2.6);
dirLight.position.set(140, 160, 80);
scene.add(dirLight);

const playerContainer = new THREE.Group();
playerContainer.position.set(0, 28, 80);
scene.add(playerContainer);

const visualTiltGroup = new THREE.Group();
playerContainer.add(visualTiltGroup);

initWeaponsAndEnemies(scene, playerContainer);
loadPlayerModel(visualTiltGroup);

function togglePause() {
  if (isPlayerDying || isGameOver) return;
  isPaused = !isPaused;
  clock.getDelta();
}

document.getElementById('btnFighter').addEventListener('click', () => { if (!isPaused && !isPlayerDying && !isGameOver) transformTo('FIGHTER'); });
document.getElementById('btnGerwalk').addEventListener('click', () => { if (!isPaused && !isPlayerDying && !isGameOver) transformTo('GERWALK'); });
document.getElementById('btnBattroid').addEventListener('click', () => { if (!isPaused && !isPlayerDying && !isGameOver) transformTo('BATTROID'); });
document.getElementById('btnMelee').addEventListener('click', () => { if (!isPaused && !isPlayerDying && !isGameOver) triggerGunpodMelee(); });
document.getElementById('btnStop').addEventListener('click', () => { if (!isPaused && !isPlayerDying && !isGameOver) triggerFullStop(); });

const btnSweep = document.getElementById('btnSweep');
btnSweep.addEventListener('mousedown', () => { if (!isPaused && !isPlayerDying && !isGameOver) startAcceleration(); });
btnSweep.addEventListener('mouseup', stopAcceleration);
btnSweep.addEventListener('mouseleave', stopAcceleration);

const sliderSFX = document.getElementById('sliderSFX');
if (sliderSFX) {
  sliderSFX.addEventListener('input', (e) => {
    if (typeof setSFXVolume === 'function') setSFXVolume(Number(e.target.value));
  });
  sliderSFX.addEventListener('change', (e) => e.target.blur());
}

const sliderBGM = document.getElementById('sliderBGM');
if (sliderBGM) {
  sliderBGM.addEventListener('input', (e) => {
    if (typeof setBGMVolume === 'function') setBGMVolume(Number(e.target.value));
  });
  sliderBGM.addEventListener('change', (e) => e.target.blur());
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') e.preventDefault();

  const key = (e.key || '').toLowerCase();
  const code = e.code || '';

  if (typeof isGameOver !== 'undefined' && isGameOver) {
    if (key === 'y' || code === 'KeyY') {
      window.location.reload();
    } else if (key === 'n' || code === 'KeyN') {
      restartDeclined = true;
    }
    return;
  }

  if (e.repeat) return;

  if (key === 'p' || code === 'KeyP') {
    togglePause();
    return;
  }

  if (key === 'm' || code === 'KeyM') {
    if (typeof toggleMusic === 'function') toggleMusic();
    return;
  }

  if (isPaused || (typeof isPlayerDying !== 'undefined' && isPlayerDying)) return;
  keys[code] = true;

  if (key === 'f') transformTo('FIGHTER');
  if (key === 'g') transformTo('GERWALK');
  if (key === 'b') transformTo('BATTROID');
  if (key === 'e') triggerGunpodMelee();
  if (key === 't' || code === 'KeyT') startAcceleration();
  if (key === 'x' || code === 'KeyX') triggerFullStop();
  if (key === 'r' || code === 'KeyR') startReverseGerwalk();
  if (key === 'n' || code === 'KeyN') {
    if (typeof cycleBattroidTracking === 'function') cycleBattroidTracking();
  }
}, true);

window.addEventListener('click', (e) => {
  if (typeof isGameOver !== 'undefined' && isGameOver) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    if (Math.abs(e.clientY - (cy + 38)) < 28) {
      if (Math.abs(e.clientX - (cx - 78)) < 55) {
        window.location.reload();
      } else if (Math.abs(e.clientX - (cx + 78)) < 55) {
        restartDeclined = true;
      }
    }
  }
});

window.addEventListener('keyup', (e) => {
  const key = (e.key || '').toLowerCase();
  const code = e.code || '';
  keys[code] = false;
  if (key === 't' || code === 'KeyT') stopAcceleration();
  if (key === 'r' || code === 'KeyR') stopReverseGerwalk();
});
let fpsFrames = 0;
let fpsTime = 0;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const rawDelta = clock.getDelta();
  const delta = isPaused ? 0 : Math.min(rawDelta, 0.05);

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
