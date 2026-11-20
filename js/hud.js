const hudCanvas = document.getElementById('hudCanvas');
const hudCtx = hudCanvas.getContext('2d');

function resizeHudCanvas() {
  hudCanvas.width = window.innerWidth;
  hudCanvas.height = window.innerHeight;
}
resizeHudCanvas();

function drawDYRLEnemyHexagon(sx, sy, radius, distNum, subNum) {
  hudCtx.save();
  hudCtx.translate(sx, sy);

  hudCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  hudCtx.shadowBlur = 5;

  hudCtx.strokeStyle = '#ffffff';
  hudCtx.lineWidth = 2.2;
  hudCtx.lineCap = 'round';
  hudCtx.lineJoin = 'round';

  const r = radius;
  const p0 = { x: Math.cos(0) * r, y: Math.sin(0) * r };
  const p1 = { x: Math.cos(Math.PI / 3) * r, y: Math.sin(Math.PI / 3) * r };
  const p2 = { x: Math.cos((2 * Math.PI) / 3) * r, y: Math.sin((2 * Math.PI) / 3) * r };
  const p3 = { x: Math.cos(Math.PI) * r, y: Math.sin(Math.PI) * r };
  const p4 = { x: Math.cos((4 * Math.PI) / 3) * r, y: Math.sin((4 * Math.PI) / 3) * r };
  const p5 = { x: Math.cos((5 * Math.PI) / 3) * r, y: Math.sin((5 * Math.PI) / 3) * r };

  hudCtx.beginPath();
  hudCtx.moveTo(p0.x, p0.y);
  hudCtx.lineTo(p1.x, p1.y);
  hudCtx.lineTo(p2.x, p2.y);
  hudCtx.lineTo(p3.x, p3.y);
  hudCtx.lineTo(p4.x, p4.y);
  hudCtx.lineTo(p5.x, p5.y);
  hudCtx.closePath();
  hudCtx.stroke();
  hudCtx.beginPath();
  hudCtx.moveTo(-r * 1.85, p4.y);
  hudCtx.lineTo(-r * 1.25, p4.y);
  hudCtx.stroke();

  const rad40 = (40 * Math.PI) / 180;
  const stemLen = r * 1.15;
  const hookLen = r * 0.52;

  const stemEndX = p1.x + Math.sin(rad40) * stemLen;
  const stemEndY = p1.y + Math.cos(rad40) * stemLen;
  const hookEndX = stemEndX - Math.cos(rad40) * hookLen;
  const hookEndY = stemEndY + Math.sin(rad40) * hookLen;

  hudCtx.beginPath();
  hudCtx.moveTo(p1.x, p1.y);
  hudCtx.lineTo(stemEndX, stemEndY);
  hudCtx.lineTo(hookEndX, hookEndY);
  hudCtx.stroke();

  hudCtx.font = 'bold 10px Conthrax, sans-serif';
  hudCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  hudCtx.fillText(String(distNum), r * 1.18, r * 0.08);
  hudCtx.fillText(String(subNum), r * 0.85, r * 0.95);
  hudCtx.restore();
}

function drawSeekerBrackets(sx, sy, spreadOffset, isLocked, enemyId, lockIndex) {
  const color = isLocked ? '#ef4444' : '#ffffff';
  const innerX = 27 + spreadOffset;
  const halfH = 18 + spreadOffset * 0.5;
  const tip45 = 9;

  hudCtx.save();
  hudCtx.translate(sx, sy);
  hudCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  hudCtx.shadowBlur = 6;
  hudCtx.strokeStyle = color;
  hudCtx.lineWidth = isLocked ? 3.2 : 2.6;
  hudCtx.lineCap = 'round';
  hudCtx.lineJoin = 'round';
  hudCtx.beginPath();
  hudCtx.moveTo(-innerX + tip45, -halfH - tip45);
  hudCtx.lineTo(-innerX, -halfH);
  hudCtx.lineTo(-innerX, halfH);
  hudCtx.lineTo(-innerX + tip45, halfH + tip45);
  hudCtx.stroke();

  hudCtx.beginPath();
  hudCtx.moveTo(innerX - tip45, -halfH - tip45);
  hudCtx.lineTo(innerX, -halfH);
  hudCtx.lineTo(innerX, halfH);
  hudCtx.lineTo(innerX - tip45, halfH + tip45);
  hudCtx.stroke();

  hudCtx.font = 'bold 9px Conthrax, sans-serif';
  hudCtx.fillStyle = color;
  const statusLabel = isLocked ? ('LOCK-' + lockIndex + ' // ' + enemyId) : ('SCAN // ' + enemyId);
  hudCtx.fillText(statusLabel, -innerX, -halfH - tip45 - 6);
  hudCtx.restore();
}

function drawEnemyMissileMarkers(w, h, camera, playerContainer) {
  if (typeof enemyMissiles === 'undefined' || enemyMissiles.length === 0) return;

  const projVec = new THREE.Vector3();
  const blink = (Math.floor(performance.now() / 110) % 2 === 0);

  for (let i = 0; i < enemyMissiles.length; i++) {
    const em = enemyMissiles.at(i);
    projVec.copy(em.mesh.position).project(camera);
    if (projVec.z > 1) continue;

    const sx = (projVec.x * 0.5 + 0.5) * w;
    const sy = (-(projVec.y * 0.5) + 0.5) * h;
    if (sx < -30 || sx > w + 30 || sy < -30 || sy > h + 30) continue;

    const dist = em.mesh.position.distanceTo(playerContainer.position);
    const isDangerClose = dist < 26;
    const circleColor = isDangerClose ? (blink ? '#ef4444' : '#fca5a5') : '#ffffff';
    const radius = isDangerClose ? 13 : 10;
    hudCtx.save();
    hudCtx.translate(sx, sy);
    hudCtx.shadowColor = isDangerClose ? 'rgba(239, 68, 68, 0.95)' : 'rgba(0, 0, 0, 0.95)';
    hudCtx.shadowBlur = isDangerClose ? 8 : 5;
    hudCtx.strokeStyle = circleColor;
    hudCtx.lineWidth = isDangerClose ? 2.6 : 2.0;
    hudCtx.beginPath();
    hudCtx.arc(0, 0, radius, 0, Math.PI * 2);
    hudCtx.stroke();

    hudCtx.font = 'bold 8.5px Conthrax, sans-serif';
    hudCtx.fillStyle = circleColor;
    hudCtx.fillText(isDangerClose ? 'WARN' : 'MSL', radius + 5, 3);
    hudCtx.restore();
  }
}

function drawBattroidTrackReticle(w, h, camera) {
  if (typeof currentMode === 'undefined' || currentMode !== 'BATTROID') return;
  if (typeof battroidTrackMode === 'undefined' || battroidTrackMode === 'NONE') return;
  if (typeof battroidTrackedTarget === 'undefined' || !battroidTrackedTarget || !battroidTrackedTarget.mesh) return;

  const projVec = new THREE.Vector3().copy(battroidTrackedTarget.mesh.position).project(camera);
  if (projVec.z > 1) return;

  const sx = (projVec.x * 0.5 + 0.5) * w;
  const sy = (-(projVec.y * 0.5) + 0.5) * h;
  const r = 24;

  hudCtx.save();
  hudCtx.translate(sx, sy);
  hudCtx.shadowColor = 'rgba(250, 204, 21, 0.9)';
  hudCtx.shadowBlur = 8;
  hudCtx.strokeStyle = '#facc15';
  hudCtx.lineWidth = 2.0;

  hudCtx.beginPath();
  hudCtx.moveTo(0, -r); hudCtx.lineTo(r, 0); hudCtx.lineTo(0, r); hudCtx.lineTo(-r, 0);
  hudCtx.closePath();
  hudCtx.stroke();

  hudCtx.font = 'bold 8.5px Conthrax, sans-serif';
  hudCtx.fillStyle = '#facc15';
  hudCtx.fillText('AUTO // ' + battroidTrackMode, -r, r + 13);
  hudCtx.restore();
}
function drawWeaponStatusPanel(w) {
  const boxW = 295, boxH = 196, x = w - boxW - 15, y = 15, cut = 10;
  const hp = (typeof playerArmor !== 'undefined') ? playerArmor : 100;
  const maxHp = (typeof playerMaxArmor !== 'undefined') ? playerMaxArmor : 100;
  const dmgFlash = (typeof armorDamageFlash !== 'undefined') ? armorDamageFlash : 0;
  const armorRatio = Math.max(0, Math.min(1, hp / maxHp));

  hudCtx.save();
  hudCtx.beginPath();
  hudCtx.moveTo(x + cut, y); hudCtx.lineTo(x + boxW, y);
  hudCtx.lineTo(x + boxW, y + boxH - cut); hudCtx.lineTo(x + boxW - cut, y + boxH);
  hudCtx.lineTo(x, y + boxH); hudCtx.lineTo(x, y + cut);
  hudCtx.closePath();

  hudCtx.fillStyle = dmgFlash > 0 ? 'rgba(127, 29, 29, 0.88)' : 'rgba(6, 12, 24, 0.84)';
  hudCtx.fill();

  const frameColor = (dmgFlash > 0 || armorRatio <= 0.25) ? '#ef4444' : '#38bdf8';
  hudCtx.shadowColor = frameColor;
  hudCtx.shadowBlur = dmgFlash > 0 ? 14 : 8;
  hudCtx.strokeStyle = frameColor;
  hudCtx.lineWidth = 1.6;
  hudCtx.stroke();

  hudCtx.shadowBlur = 0;
  hudCtx.font = 'bold 9.5px Conthrax, sans-serif';
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('ARMOR', x + 14, y + 22);

  let armorColor = '#22c55e', armorTag = Math.round(armorRatio * 100) + '% // OK';
  if (armorRatio <= 0.25) { armorColor = '#ef4444'; armorTag = Math.round(armorRatio * 100) + '% // CRITICAL'; }
  else if (armorRatio <= 0.55) { armorColor = '#f59e0b'; armorTag = Math.round(armorRatio * 100) + '% // DAMAGED'; }

  hudCtx.shadowColor = armorColor;
  hudCtx.shadowBlur = 6;
  hudCtx.fillStyle = armorColor;
  hudCtx.fillText(armorTag, x + 135, y + 22);
  const barX = x + 14, barY = y + 29, barW = boxW - 28, barH = 11;
  hudCtx.shadowBlur = 0;
  hudCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  hudCtx.fillRect(barX, barY, barW, barH);
  hudCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  hudCtx.lineWidth = 1;
  hudCtx.strokeRect(barX, barY, barW, barH);

  hudCtx.shadowColor = armorColor;
  hudCtx.shadowBlur = 6;
  hudCtx.fillStyle = armorColor;
  hudCtx.fillRect(barX + 2, barY + 2, (barW - 4) * armorRatio, barH - 4);

  hudCtx.shadowBlur = 0;
  hudCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  hudCtx.beginPath();
  hudCtx.moveTo(x + 12, y + 50); hudCtx.lineTo(x + boxW - 12, y + 50);
  hudCtx.stroke();

  const isFiringGun = (typeof muzzleFlashTimer !== 'undefined' && muzzleFlashTimer > 0);
  hudCtx.font = 'bold 10px Conthrax, sans-serif';
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('GUN: GU-11', x + 14, y + 72);
  hudCtx.shadowColor = isFiringGun ? 'rgba(250, 204, 21, 0.9)' : 'rgba(34, 197, 94, 0.8)';
  hudCtx.shadowBlur = 6;
  hudCtx.fillStyle = isFiringGun ? '#facc15' : '#22c55e';
  hudCtx.fillText(isFiringGun ? 'FIRING // INF' : 'READY // INF', x + 135, y + 72);

  hudCtx.shadowBlur = 0;
  hudCtx.beginPath();
  hudCtx.moveTo(x + 12, y + 86); hudCtx.lineTo(x + boxW - 12, y + 86);
  hudCtx.stroke();
  const lockCount = (typeof lockedEnemies !== 'undefined') ? lockedEnemies.length : 0;
  const hasLock = lockCount > 0;
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('MSL: ' + (typeof getCurrentMissileType === 'function' ? getCurrentMissileType() : 'AMM-1'), x + 14, y + 110);
  hudCtx.shadowColor = hasLock ? 'rgba(239, 68, 68, 0.9)' : 'rgba(56, 189, 248, 0.6)';
  hudCtx.shadowBlur = 6;
  hudCtx.fillStyle = hasLock ? '#ef4444' : '#94a3b8';
  hudCtx.fillText(hasLock ? ('LOCK [' + lockCount + '/4]') : 'STBY', x + 135, y + 110);

  for (let i = 0; i < 4; i++) {
    hudCtx.fillStyle = (i < lockCount) ? '#ef4444' : 'rgba(51, 65, 85, 0.6)';
    hudCtx.fillRect(x + 232 + i * 12, y + 100, 8, 12);
  }

  hudCtx.shadowBlur = 0;
  hudCtx.beginPath();
  hudCtx.moveTo(x + 12, y + 124); hudCtx.lineTo(x + boxW - 12, y + 124);
  hudCtx.stroke();

  const isBattroid = (typeof currentMode !== 'undefined' && currentMode === 'BATTROID');
  const tMode = (typeof battroidTrackMode !== 'undefined') ? battroidTrackMode : 'NONE';
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('TRACK [N]', x + 14, y + 148);

  let trackLabel = 'N/A (B-ONLY)', trackColor = '#64748b';
  if (isBattroid) {
    if (tMode === 'ENEMY') { trackLabel = 'ENEMY // AUTO'; trackColor = '#22c55e'; }
    else if (tMode === 'MISSILE') { trackLabel = 'MISSILE // AUTO'; trackColor = '#facc15'; }
    else { trackLabel = 'NONE // MANUAL'; trackColor = '#94a3b8'; }
  }
  hudCtx.shadowColor = trackColor;
  hudCtx.shadowBlur = (isBattroid && tMode !== 'NONE') ? 6 : 0;
  hudCtx.fillStyle = trackColor;
  hudCtx.fillText(trackLabel, x + 135, y + 148);
  hudCtx.shadowBlur = 0;
  hudCtx.beginPath();
  hudCtx.moveTo(x + 12, y + 160); hudCtx.lineTo(x + boxW - 12, y + 160);
  hudCtx.stroke();

  const isFighterMode = (typeof currentMode !== 'undefined' && currentMode === 'FIGHTER');
  const cCooldown = (typeof chaffCooldown !== 'undefined') ? chaffCooldown : 0;
  const cActive = (typeof chaffFlares !== 'undefined' && chaffFlares.length > 0);
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('CHAFF [C]', x + 14, y + 183);

  let chaffLabel = 'N/A (F-ONLY)', chaffColor = '#64748b';
  if (isFighterMode) {
    if (cActive) { chaffLabel = 'DEPLOYED // FLARE'; chaffColor = '#facc15'; }
    else if (cCooldown > 0) { chaffLabel = 'RELOAD // ' + cCooldown.toFixed(1) + 'S'; chaffColor = '#f59e0b'; }
    else { chaffLabel = 'READY // DECOY'; chaffColor = '#22c55e'; }
  }
  hudCtx.shadowColor = chaffColor;
  hudCtx.shadowBlur = (isFighterMode && (cActive || cCooldown <= 0)) ? 6 : 0;
  hudCtx.fillStyle = chaffColor;
  hudCtx.fillText(chaffLabel, x + 135, y + 183);
  hudCtx.restore();
}

function drawPropulsionPanel(h) {
  const boxW = 305, boxH = 92, x = 15, y = h - boxH - 15, cut = 10;
  const thr = (typeof throttle !== 'undefined') ? throttle : 0;
  const accel = (typeof isAccelerating !== 'undefined') ? isAccelerating : false;
  const heat = (typeof turboHeat !== 'undefined') ? turboHeat : 0;
  const overheat = (typeof isOverheated !== 'undefined') ? isOverheated : false;
  const spdKmh = (typeof velocity !== 'undefined') ? Math.round(velocity.length() * 45) : 0;

  hudCtx.save();
  hudCtx.beginPath();
  hudCtx.moveTo(x, y); hudCtx.lineTo(x + boxW - cut, y); hudCtx.lineTo(x + boxW, y + cut);
  hudCtx.lineTo(x + boxW, y + boxH); hudCtx.lineTo(x + cut, y + boxH); hudCtx.lineTo(x, y + boxH - cut);
  hudCtx.closePath();
  hudCtx.fillStyle = 'rgba(6, 12, 24, 0.84)';
  hudCtx.fill();
  const borderCol = overheat ? '#ef4444' : (heat > 0.75 ? '#f59e0b' : '#38bdf8');
  hudCtx.shadowColor = borderCol;
  hudCtx.shadowBlur = overheat ? 12 : 8;
  hudCtx.strokeStyle = borderCol;
  hudCtx.lineWidth = 1.6;
  hudCtx.stroke();

  hudCtx.shadowBlur = 0;
  hudCtx.font = 'bold 9.5px Conthrax, sans-serif';
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('THROTTLE', x + 14, y + 22);
  hudCtx.fillStyle = accel ? '#ff7b29' : '#22c55e';
  hudCtx.fillText(accel ? ('MAX // ' + spdKmh + ' KM/H') : (Math.round(thr * 100) + '% // ' + spdKmh + ' KM/H'), x + 115, y + 22);

  const barX = x + 14, barW = boxW - 28, thrBarY = y + 29, barH = 11;
  hudCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  hudCtx.fillRect(barX, thrBarY, barW, barH);
  hudCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  hudCtx.lineWidth = 1;
  hudCtx.strokeRect(barX, thrBarY, barW, barH);

  const fillRatio = accel ? 1.0 : Math.max(0, Math.min(1, thr));
  hudCtx.shadowColor = accel ? '#ff7b29' : '#22c55e';
  hudCtx.shadowBlur = 6;
  hudCtx.fillStyle = accel ? '#ff7b29' : '#22c55e';
  hudCtx.fillRect(barX + 2, thrBarY + 2, (barW - 4) * fillRatio, barH - 4);

  hudCtx.shadowBlur = 0;
  hudCtx.fillStyle = overheat ? '#ef4444' : '#94a3b8';
  hudCtx.fillText('TURBINE HEAT', x + 14, y + 60);

  const blink = (Math.floor(performance.now() / 160) % 2 === 0);
  let heatStatus = Math.round(heat * 100) + '% // NOMINAL', heatColor = '#38bdf8';
  if (overheat) { heatStatus = blink ? 'OVERHEAT // COOLING' : 'LOCKED // COOLING'; heatColor = '#ef4444'; }
  else if (heat > 0.75) { heatStatus = Math.round(heat * 100) + '% // HEAT WARN'; heatColor = '#f59e0b'; }
  else if (heat > 0.35) { heatStatus = Math.round(heat * 100) + '% // WARM'; heatColor = '#facc15'; }

  hudCtx.shadowColor = heatColor;
  hudCtx.shadowBlur = overheat ? 10 : 5;
  hudCtx.fillStyle = heatColor;
  hudCtx.fillText(heatStatus, x + 128, y + 60);
  const heatBarY = y + 67;
  hudCtx.shadowBlur = 0;
  hudCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  hudCtx.fillRect(barX, heatBarY, barW, barH);
  hudCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  hudCtx.strokeRect(barX, heatBarY, barW, barH);
  hudCtx.shadowColor = heatColor;
  hudCtx.shadowBlur = 7;
  hudCtx.fillStyle = heatColor;
  hudCtx.fillRect(barX + 2, heatBarY + 2, (barW - 4) * Math.min(1, heat), barH - 4);
  hudCtx.restore();
}

function drawPauseOverlay(w, h) {
  const cx = w / 2, cy = h / 2, boxW = 340, boxH = 115, x = cx - boxW / 2, y = cy - boxH / 2, cut = 14;
  hudCtx.save();
  hudCtx.fillStyle = 'rgba(2, 6, 23, 0.55)';
  hudCtx.fillRect(0, 0, w, h);
  hudCtx.beginPath();
  hudCtx.moveTo(x + cut, y); hudCtx.lineTo(x + boxW - cut, y); hudCtx.lineTo(x + boxW, y + cut);
  hudCtx.lineTo(x + boxW, y + boxH - cut); hudCtx.lineTo(x + boxW - cut, y + boxH);
  hudCtx.lineTo(x + cut, y + boxH); hudCtx.lineTo(x, y + boxH - cut); hudCtx.lineTo(x, y + cut);
  hudCtx.closePath();
  hudCtx.fillStyle = 'rgba(6, 12, 24, 0.92)';
  hudCtx.fill();
  hudCtx.shadowColor = 'rgba(56, 189, 248, 0.9)';
  hudCtx.shadowBlur = 14;
  hudCtx.strokeStyle = '#38bdf8';
  hudCtx.lineWidth = 2.0;
  hudCtx.stroke();
  hudCtx.textAlign = 'center';
  hudCtx.textBaseline = 'middle';
  hudCtx.font = 'bold 26px Conthrax, sans-serif';
  hudCtx.fillStyle = '#ffffff';
  hudCtx.fillText('PAUSA', cx, cy + 2);
  hudCtx.font = 'bold 9.5px Conthrax, sans-serif';
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('SYSTEM STANDBY // PRESIONA [P]', cx, cy + 40);
  hudCtx.restore();
}
function drawRestartOverlay(w, h) {
  const cx = w / 2, cy = h / 2, boxW = 390, boxH = 145, x = cx - boxW / 2, y = cy - boxH / 2, cut = 14;
  const declined = (typeof restartDeclined !== 'undefined') ? restartDeclined : false;
  hudCtx.save();
  hudCtx.fillStyle = 'rgba(2, 6, 23, 0.65)';
  hudCtx.fillRect(0, 0, w, h);
  hudCtx.beginPath();
  hudCtx.moveTo(x + cut, y); hudCtx.lineTo(x + boxW - cut, y); hudCtx.lineTo(x + boxW, y + cut);
  hudCtx.lineTo(x + boxW, y + boxH - cut); hudCtx.lineTo(x + boxW - cut, y + boxH);
  hudCtx.lineTo(x + cut, y + boxH); hudCtx.lineTo(x, y + boxH - cut); hudCtx.lineTo(x, y + cut);
  hudCtx.closePath();
  hudCtx.fillStyle = 'rgba(15, 6, 10, 0.92)';
  hudCtx.fill();
  hudCtx.strokeStyle = '#ef4444';
  hudCtx.lineWidth = 2.2;
  hudCtx.stroke();
  hudCtx.textAlign = 'center';
  hudCtx.textBaseline = 'middle';
  hudCtx.font = 'bold 10px Conthrax, sans-serif';
  hudCtx.fillStyle = '#f87171';
  hudCtx.fillText('VF-1A DESTROYED // SYSTEM FAILURE', cx, cy - 42);
  hudCtx.font = 'bold 24px Conthrax, sans-serif';
  hudCtx.fillStyle = '#ffffff';
  hudCtx.fillText('RESTART?', cx, cy - 6);
  hudCtx.font = 'bold 14px Conthrax, sans-serif';
  const padType = window.gameControls?.getGamepadDiagramType?.();
  const yesLabel = padType === 'xbox' ? '[A] SÍ' : padType === 'ps2' ? '[×] SÍ' : '[Y] YES';
  const noLabel = padType === 'xbox' ? '[B] NO' : padType === 'ps2' ? '[○] NO' : '[N] NO';
  hudCtx.strokeStyle = '#38bdf8';
  hudCtx.lineWidth = 2;
  hudCtx.strokeRect(cx + (declined ? 34 : -122), cy + 22, 88, 32);
  hudCtx.fillStyle = !declined ? '#22c55e' : '#64748b';
  hudCtx.fillText(yesLabel, cx - 78, cy + 38);
  hudCtx.fillStyle = declined ? '#ef4444' : '#94a3b8';
  hudCtx.fillText(noLabel, cx + 78, cy + 38);
  hudCtx.restore();
}
const saturnSunImg = new Image();
saturnSunImg.src = './textures/sun.webp';

const sunShaftsCanvas = document.createElement('canvas');
sunShaftsCanvas.width = 512;
sunShaftsCanvas.height = 512;
(function initSunShaftsBuffer() {
  const sCtx = sunShaftsCanvas.getContext('2d');
  sCtx.save();
  sCtx.filter = 'blur(8px)';
  for (let i = 0; i < 32; i++) {
    const ang = (i / 32) * Math.PI * 2 + Math.sin(i * 5.7) * 0.12;
    const len = 140 + (i % 5) * 24;
    const sp = 0.045 + (i % 3) * 0.02;
    const g = sCtx.createRadialGradient(256, 256, 18, 256, 256, len);
    g.addColorStop(0.0, 'rgba(255, 253, 240, 0.24)');
    g.addColorStop(0.5, 'rgba(254, 240, 185, 0.10)');
    g.addColorStop(1.0, 'rgba(253, 186, 116, 0.0)');
    sCtx.fillStyle = g;
    sCtx.beginPath();
    sCtx.moveTo(256, 256);
    sCtx.lineTo(256 + Math.cos(ang - sp) * len, 256 + Math.sin(ang - sp) * len);
    sCtx.lineTo(256 + Math.cos(ang + sp) * len, 256 + Math.sin(ang + sp) * len);
    sCtx.closePath();
    sCtx.fill();
  }
  sCtx.restore();
})();

function drawSaturnSunLensFlare(w, h, camera, playerContainer) {
  if (typeof activeMapId === 'undefined' || activeMapId !== 'MAPA_2') return;
  if (typeof SUN_DIR_VEC === 'undefined' || !SUN_DIR_VEC) return;

  const projVec = camera.position.clone().addScaledVector(SUN_DIR_VEC, 2000).project(camera);
  if (projVec.z > 1) return;

  if (typeof SATURN_CENTER !== 'undefined') {
    const toSaturn = SATURN_CENTER.clone().sub(camera.position);
    const proj = toSaturn.dot(SUN_DIR_VEC);
    const perpDist = proj > 0 ? Math.hypot(toSaturn.x - SUN_DIR_VEC.x * proj, toSaturn.y - SUN_DIR_VEC.y * proj, toSaturn.z - SUN_DIR_VEC.z * proj) : 999;
    if (proj > 0 && perpDist < 365) return;
  }

  const sx = (projVec.x * 0.5 + 0.5) * w, sy = (-(projVec.y * 0.5) + 0.5) * h;
  const cx = w * 0.5, cy = h * 0.5;
  const distNorm = Math.hypot(sx - cx, sy - cy) / Math.hypot(cx, cy);
  if (distNorm > 1.25) return;

  let shipOcc = 1.0;
  if (playerContainer) {
    const sp = playerContainer.position.clone().project(camera);
    if (sp.z <= 1) {
      const shipDist = Math.hypot(sx - (sp.x * 0.5 + 0.5) * w, sy - (-(sp.y * 0.5) + 0.5) * h);
      if (shipDist < 85) shipOcc = 0.40 + 0.60 * (shipDist / 85);
    }
  }
  const intensity = Math.pow(Math.max(0, 1.0 - distNorm / 1.25), 1.3) * 1.45 * shipOcc;

  hudCtx.save();
  hudCtx.globalCompositeOperation = 'lighter';

  if (saturnSunImg.complete && saturnSunImg.naturalWidth > 0) {
    const sunBloomSize = 110 * Math.min(1.15, intensity);
    hudCtx.globalAlpha = Math.min(0.85, 0.72 * Math.pow(shipOcc, 2.2));
    hudCtx.drawImage(saturnSunImg, sx - sunBloomSize * 0.5, sy - sunBloomSize * 0.5, sunBloomSize, sunBloomSize);
  }

  hudCtx.globalAlpha = Math.min(1.0, intensity);
  const shaftSize = 440 * Math.min(1.2, intensity);
  hudCtx.translate(sx, sy);
  hudCtx.rotate(performance.now() * 0.00004);
  hudCtx.drawImage(sunShaftsCanvas, -shaftSize * 0.5, -shaftSize * 0.5, shaftSize, shaftSize);
  hudCtx.rotate(-performance.now() * 0.00004);
  hudCtx.translate(-sx, -sy);
  hudCtx.globalAlpha = 1.0;

  const ghosts = new Array({ t: 1.35, r: 26, col: '147, 197, 253' }, { t: 1.65, r: 44, col: '253, 224, 71' }, { t: 1.95, r: 18, col: '186, 230, 253' });
  for (let i = 0; i < ghosts.length; i++) {
    const g = ghosts.at(i);
    const gx = sx + (cx - sx) * g.t, gy = sy + (cy - sy) * g.t;
    const gGrad = hudCtx.createRadialGradient(gx, gy, g.r * 0.2, gx, gy, g.r);
    gGrad.addColorStop(0.0, 'rgba(' + g.col + ', ' + Math.min(0.32, 0.16 * intensity) + ')');
    gGrad.addColorStop(0.8, 'rgba(' + g.col + ', ' + Math.min(0.42, 0.24 * intensity) + ')');
    gGrad.addColorStop(1.0, 'rgba(' + g.col + ', 0)');
    hudCtx.fillStyle = gGrad;
    hudCtx.beginPath();
    hudCtx.arc(gx, gy, g.r, 0, Math.PI * 2);
    hudCtx.fill();
  }
  hudCtx.restore();
}
function drawDYRLHud(delta, camera, playerContainer, enemies, isPaused) {
  const w = hudCanvas.width, h = hudCanvas.height, cx = w / 2, cy = h / 2;
  hudCtx.clearRect(0, 0, w, h);
  drawSaturnSunLensFlare(w, h, camera, playerContainer);

  if (typeof armorDamageFlash !== 'undefined' && armorDamageFlash > 0) {
    hudCtx.save();
    hudCtx.strokeStyle = 'rgba(239, 68, 68, ' + Math.min(0.85, armorDamageFlash * 2.5) + ')';
    hudCtx.lineWidth = 14;
    hudCtx.strokeRect(0, 0, w, h);
    hudCtx.restore();
  }

  const scanRadius = 215;
  const candidates = new Array();
  const projVec = new THREE.Vector3();

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies.at(i);
    if (e.respawnTimer > 0) { e.lockProgress = 0; e.seekerX = cx; e.seekerY = cy; continue; }
    projVec.copy(e.mesh.position).project(camera);
    if (projVec.z > 1) { e.lockProgress = Math.max(0, (e.lockProgress || 0) - delta * 2.0); continue; }

    const sx = (projVec.x * 0.5 + 0.5) * w, sy = (-(projVec.y * 0.5) + 0.5) * h;
    const distCenter = Math.hypot(sx - cx, sy - cy);
    const worldDist = Math.round(e.mesh.position.distanceTo(playerContainer.position) * 10);
    const altDiff = Math.max(0, Math.round(e.mesh.position.y * 2.4));
    drawDYRLEnemyHexagon(sx, sy, 18, worldDist, altDiff);

    if (distCenter < scanRadius) candidates.push({ enemy: e, sx: sx, sy: sy, distCenter: distCenter });
    else { e.lockProgress = Math.max(0, (e.lockProgress || 0) - delta * 2.5); e.seekerX = cx; e.seekerY = cy; }
  }

  candidates.sort((a, b) => a.distCenter - b.distCenter);
  const activeBatch = candidates.slice(0, MAX_MULTI_LOCK);
  for (let i = MAX_MULTI_LOCK; i < candidates.length; i++) {
    candidates.at(i).enemy.lockProgress = 0;
    candidates.at(i).enemy.seekerX = cx;
    candidates.at(i).enemy.seekerY = cy;
  }

  lockedEnemies.length = 0;
  for (let i = 0; i < activeBatch.length; i++) {
    const item = activeBatch.at(i), e = item.enemy;
    if (typeof e.seekerX !== 'number') { e.seekerX = cx; e.seekerY = cy; }
    const lerpRate = Math.min(1.0, 12.0 * delta);
    e.seekerX += (item.sx - e.seekerX) * lerpRate;
    e.seekerY += (item.sy - e.seekerY) * lerpRate;
    if (Math.hypot(item.sx - e.seekerX, item.sy - e.seekerY) < 30) {
      e.lockProgress = Math.min(1.0, (e.lockProgress || 0) + delta * 2.4);
    }
    const isFullLock = e.lockProgress >= 1.0;
    if (isFullLock) lockedEnemies.push(e);
    drawSeekerBrackets(e.seekerX, e.seekerY, (1.0 - (e.lockProgress || 0)) * 18, isFullLock, e.id, i + 1);
  }

  drawEnemyMissileMarkers(w, h, camera, playerContainer);
  drawBattroidTrackReticle(w, h, camera);

  const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(playerContainer.quaternion);
  const aimProj = playerContainer.position.clone().addScaledVector(forwardVec, 18).project(camera);
  const hudX = (aimProj.z <= 1) ? (aimProj.x * 0.5 + 0.5) * w : cx;
  const hudY = (aimProj.z <= 1) ? (-(aimProj.y * 0.5) + 0.5) * h : (cy - 48);

  const shipProj = playerContainer.position.clone().project(camera);
  const shipSy = (shipProj.z <= 1) ? (-(shipProj.y * 0.5) + 0.5) * h : (cy + 55);

  const attEuler = new THREE.Euler().setFromQuaternion(playerContainer.quaternion, 'YXZ');
  const rollAngle = attEuler.z;
  const pitchOffset = THREE.MathUtils.clamp(attEuler.x * 135, -85, 85);

  hudCtx.save();
  hudCtx.beginPath();
  hudCtx.rect(0, 0, w, Math.max(80, shipSy - 24));
  hudCtx.clip();

  hudCtx.translate(hudX, hudY);
  hudCtx.beginPath();
  hudCtx.arc(0, 0, 88, 0, Math.PI * 2);
  hudCtx.clip();

  hudCtx.save();
  hudCtx.rotate(-rollAngle);
  hudCtx.translate(0, pitchOffset);
  hudCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  hudCtx.shadowBlur = 5;

  hudCtx.strokeStyle = '#22c55e';
  hudCtx.lineWidth = 2.2;
  hudCtx.beginPath();
  hudCtx.moveTo(-68, 0); hudCtx.lineTo(-22, 0); hudCtx.lineTo(-22, 6);
  hudCtx.moveTo(68, 0);  hudCtx.lineTo(22, 0);  hudCtx.lineTo(22, 6);
  hudCtx.stroke();

  hudCtx.strokeStyle = '#38bdf8';
  hudCtx.lineWidth = 1.8;
  hudCtx.beginPath();
  hudCtx.moveTo(-44, -32); hudCtx.lineTo(-18, -32); hudCtx.lineTo(-18, -27);
  hudCtx.moveTo(44, -32);  hudCtx.lineTo(18, -32);  hudCtx.lineTo(18, -27);
  hudCtx.moveTo(-32, -64); hudCtx.lineTo(-14, -64); hudCtx.lineTo(-14, -59);
  hudCtx.moveTo(32, -64);  hudCtx.lineTo(14, -64);  hudCtx.lineTo(14, -59);
  hudCtx.stroke();

  hudCtx.strokeStyle = '#f59e0b';
  hudCtx.setLineDash(new Array(5, 4));
  hudCtx.beginPath();
  hudCtx.moveTo(-44, 32); hudCtx.lineTo(-18, 32); hudCtx.lineTo(-18, 27);
  hudCtx.moveTo(44, 32);  hudCtx.lineTo(18, 32);  hudCtx.lineTo(18, 27);
  hudCtx.moveTo(-32, 64); hudCtx.lineTo(-14, 64); hudCtx.lineTo(-14, 59);
  hudCtx.moveTo(32, 64);  hudCtx.lineTo(14, 64);  hudCtx.lineTo(14, 59);
  hudCtx.stroke();
  hudCtx.setLineDash(new Array());
  hudCtx.restore();
  hudCtx.restore();

  hudCtx.save();
  hudCtx.translate(hudX, hudY);
  hudCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  hudCtx.shadowBlur = 5;
  hudCtx.strokeStyle = '#4ade80';
  hudCtx.lineWidth = 2.4;
  hudCtx.beginPath();
  hudCtx.moveTo(0, -18); hudCtx.lineTo(0, -6);
  hudCtx.moveTo(0, 6); hudCtx.lineTo(0, 18);
  hudCtx.moveTo(-18, 0); hudCtx.lineTo(-6, 0);
  hudCtx.moveTo(6, 0); hudCtx.lineTo(18, 0);
  hudCtx.stroke();
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillRect(-2, -2, 4, 4);
  hudCtx.restore();

  drawWeaponStatusPanel(w);
  drawPropulsionPanel(h);

  if (typeof isGameOver !== 'undefined' && isGameOver) drawRestartOverlay(w, h);
  else if (isPaused) drawPauseOverlay(w, h);
}
