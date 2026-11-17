const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
const soundBuffers = {};

let sfxMasterGain = null;
let sfxVolumeLevel = 0.80;

let bgmMasterGain = null;
let bgmVolumeLevel = 0.65;
let bgmEnabled = true;
let bgmSource = null;

let engineSource = null;
let engineGain = null;

let gunpodSource = null;
let gunpodGain = null;

let lockOnSource = null;
let lockOnGain = null;

let warningCooldown = 0;

const SOUND_FILES = {
  bgm: './sounds/DogF.ogg',
  boost: './sounds/Boost.ogg',
  gunpod: './sounds/Gunpod.ogg',
  heavyLaser: './sounds/HeavyLaser.ogg',
  lightLaser: './sounds/LightLaser.ogg',
  lockOn: './sounds/LockOn.ogg',
  missileLaunch: './sounds/MissileLaunch.ogg',
  missileWarning: './sounds/MissileWarning.ogg',
  transform: './sounds/Transform.ogg',
  engine: './sounds/ValkyrieEngine.ogg'
};

function setSFXVolume(percent) {
  sfxVolumeLevel = Math.max(0, Math.min(1, percent / 100));
  if (audioCtx && sfxMasterGain) {
    sfxMasterGain.gain.setTargetAtTime(sfxVolumeLevel, audioCtx.currentTime, 0.04);
  }
}

function setBGMVolume(percent) {
  bgmVolumeLevel = Math.max(0, Math.min(1, percent / 100));
  if (audioCtx && bgmMasterGain && bgmEnabled) {
    bgmMasterGain.gain.setTargetAtTime(bgmVolumeLevel, audioCtx.currentTime, 0.04);
  }
}

function toggleMusic() {
  bgmEnabled = !bgmEnabled;
}

function startBGMLoop() {
  if (!audioCtx || !soundBuffers.bgm || bgmSource) return;

  bgmSource = audioCtx.createBufferSource();
  bgmSource.buffer = soundBuffers.bgm;
  bgmSource.loop = true;

  bgmSource.connect(bgmMasterGain);
  bgmSource.start(0);
}

function initAudioSystem() {
  if (audioCtx) return;
  audioCtx = new AudioCtx();

  sfxMasterGain = audioCtx.createGain();
  sfxMasterGain.gain.value = sfxVolumeLevel;
  sfxMasterGain.connect(audioCtx.destination);

  bgmMasterGain = audioCtx.createGain();
  bgmMasterGain.gain.value = bgmEnabled ? bgmVolumeLevel : 0;
  bgmMasterGain.connect(audioCtx.destination);

  for (const key in SOUND_FILES) {
    fetch(SOUND_FILES[key])
      .then((res) => res.arrayBuffer())
      .then((data) => audioCtx.decodeAudioData(data))
      .then((buffer) => {
        soundBuffers[key] = buffer;
        if (key === 'engine') startEngineLoop();
        if (key === 'bgm') startBGMLoop();
      })
      .catch(() => {});
  }
}

function unlockAudio() {
  if (!audioCtx) initAudioSystem();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

window.addEventListener('keydown', unlockAudio, { once: true });
window.addEventListener('mousedown', unlockAudio, { once: true });

function playSFX(name, volume, pitchVariation) {
  if (!audioCtx || !soundBuffers[name]) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const source = audioCtx.createBufferSource();
  source.buffer = soundBuffers[name];

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume !== undefined ? volume : 0.75;

  if (pitchVariation) {
    source.playbackRate.value = 1.0 + (Math.random() - 0.5) * pitchVariation;
  }

  source.connect(gainNode);
  gainNode.connect(sfxMasterGain || audioCtx.destination);
  source.start(0);
}
function updateGunpodAudio(isFiring) {
  if (!audioCtx || !soundBuffers.gunpod) return;

  if (isFiring) {
    if (!gunpodSource) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      gunpodSource = audioCtx.createBufferSource();
      gunpodSource.buffer = soundBuffers.gunpod;
      gunpodSource.loop = true;

      gunpodGain = audioCtx.createGain();
      gunpodGain.gain.setValueAtTime(0.55, audioCtx.currentTime);

      gunpodSource.connect(gunpodGain);
      gunpodGain.connect(sfxMasterGain || audioCtx.destination);
      gunpodSource.start(0);
    }
  } else if (gunpodSource) {
    const srcToStop = gunpodSource;
    const gainToFade = gunpodGain;
    gunpodSource = null;
    gunpodGain = null;

    const now = audioCtx.currentTime;
    gainToFade.gain.setValueAtTime(gainToFade.gain.value, now);
    gainToFade.gain.linearRampToValueAtTime(0.0, now + 0.06);
    setTimeout(() => {
      try { srcToStop.stop(); } catch (e) {}
    }, 70);
  }
}

function updateLockOnAudio(hasLock) {
  if (!audioCtx || !soundBuffers.lockOn) return;

  if (hasLock) {
    if (!lockOnSource) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      lockOnSource = audioCtx.createBufferSource();
      lockOnSource.buffer = soundBuffers.lockOn;
      lockOnSource.loop = true;

      lockOnGain = audioCtx.createGain();
      lockOnGain.gain.setValueAtTime(0.65, audioCtx.currentTime);

      lockOnSource.connect(lockOnGain);
      lockOnGain.connect(sfxMasterGain || audioCtx.destination);
      lockOnSource.start(0);
    }
  } else if (lockOnSource) {
    const srcToStop = lockOnSource;
    const gainToFade = lockOnGain;
    lockOnSource = null;
    lockOnGain = null;

    const now = audioCtx.currentTime;
    gainToFade.gain.setValueAtTime(gainToFade.gain.value, now);
    gainToFade.gain.linearRampToValueAtTime(0.0, now + 0.05);
    setTimeout(() => {
      try { srcToStop.stop(); } catch (e) {}
    }, 60);
  }
}

function startEngineLoop() {
  if (!audioCtx || !soundBuffers.engine || engineSource) return;

  engineSource = audioCtx.createBufferSource();
  engineSource.buffer = soundBuffers.engine;
  engineSource.loop = true;

  engineGain = audioCtx.createGain();
  engineGain.gain.value = 0.15;

  engineSource.connect(engineGain);
  engineGain.connect(sfxMasterGain || audioCtx.destination);
  engineSource.start(0);
}

function updateEngineAudio(delta, isPaused, isFullStop, isAccelerating, currentMode, throttle, speed, hasIncomingFire, isFiringGun, hasLockedTargets) {
  if (!audioCtx) return;

  const isDead = (typeof isPlayerDying !== 'undefined' && isPlayerDying) || (typeof isGameOver !== 'undefined' && isGameOver);

  // Control de volumen suave para DogF.ogg (baja a 25% en pausa y se apaga al morir o silenciar con M)
  if (bgmMasterGain) {
    let targetBgmVol = bgmEnabled ? bgmVolumeLevel : 0.0;
    if (isDead) targetBgmVol = 0.0;
    else if (isPaused) targetBgmVol *= 0.25;
    bgmMasterGain.gain.setTargetAtTime(targetBgmVol, audioCtx.currentTime, 0.1);
  }

  if (isPaused || isDead) {
    if (engineGain) engineGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.08);
    updateGunpodAudio(false);
    updateLockOnAudio(false);
    return;
  }

  updateGunpodAudio(isFiringGun);
  updateLockOnAudio(hasLockedTargets);

  if (!engineSource || !engineGain) return;

  let targetVol = 0.18;
  let targetPitch = 0.85;

  if (isFullStop) {
    targetVol = 0.05;
    targetPitch = 0.65;
  } else if (isAccelerating) {
    targetVol = 0.42;
    targetPitch = 1.45;
  } else if (currentMode === 'FIGHTER') {
    targetVol = 0.16 + throttle * 0.22;
    targetPitch = 0.85 + throttle * 0.48;
  } else if (currentMode === 'GERWALK') {
    targetVol = 0.24;
    targetPitch = 1.05;
  } else if (currentMode === 'BATTROID') {
    targetVol = speed > 1.0 ? 0.22 : 0.12;
    targetPitch = speed > 1.0 ? 1.0 : 0.8;
  }

  engineGain.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.1);
  engineSource.playbackRate.setTargetAtTime(targetPitch, audioCtx.currentTime, 0.12);

  if (warningCooldown > 0) warningCooldown -= delta;
  if (hasIncomingFire && warningCooldown <= 0) {
    playSFX('missileWarning', 0.65, 0);
    warningCooldown = 2.2;
  }
}
