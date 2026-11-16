const hudEl = document.getElementById('hud');
const fpsEl = document.getElementById('fpsBox');
const keys = {};
let isPaused = false;
let restartDeclined = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060b19);
scene.fog = new THREE.FogExp2(0x060b19, 0.007);
scene.add(new THREE.GridHelper(300, 120, 0x2563eb, 0x1e293b));

const starCount = 260;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPositions[i * 3]     = (Math.random() - 0.5) * 200;
  starPositions[i * 3 + 1] = Math.random() * 80 + 2;
  starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
}
const starsGeo = new THREE.BufferGeometry();
starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starsMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.7 });
scene.add(new THREE.Points(starsGeo, starsMat));

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 400);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
dirLight.position.set(30, 50, 30);
scene.add(dirLight);

const playerContainer = new THREE.Group();
playerContainer.position.set(0, 10, 0);
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

  if (isPaused || (typeof isPlayerDying !== 'undefined' && isPlayerDying)) return;
  keys[code] = true;

  if (key === 'f') transformTo('FIGHTER');
  if (key === 'g') transformTo('GERWALK');
  if (key === 'b') transformTo('BATTROID');
  if (key === 'e') triggerGunpodMelee();
  if (code === 'Numpad5' || code === 'NumpadClear') startAcceleration();
  if (code === 'Numpad8' || code === 'NumpadUp') triggerFullStop();
  if (code === 'Numpad0' || code === 'NumpadInsert') startReverseGerwalk();
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
  keys[e.code] = false;
  if (e.code === 'Numpad5' || e.code === 'NumpadClear') stopAcceleration();
  if (e.code === 'Numpad0' || e.code === 'NumpadInsert') stopReverseGerwalk();
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
    updatePlayerAnimation(delta);
    updateEnemies(delta, playerContainer);
    updateWeapons(delta, scene, camera, playerContainer, velocity, keys);
    updatePlayerPhysics(delta, playerContainer, visualTiltGroup, camera, keys, hudEl);
  }

  const isFullStop = Boolean(keys['Numpad8'] || keys['NumpadUp']);
  const hasIncoming = (typeof enemyBullets !== 'undefined' && enemyBullets.length > 0);
  const isFiringGun = Boolean(keys['ShiftLeft'] || keys['ShiftRight']);
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
      hasIncoming,
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
