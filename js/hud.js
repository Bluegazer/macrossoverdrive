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

function drawMissilePodIcon(x, y, w, h, mType, hasLock) {
  const accent = hasLock ? '#ef4444' : '#38bdf8';
  const fillCol = hasLock ? '#fca5a5' : '#bae6fd';
  const cut = 6;

  hudCtx.save();
  hudCtx.beginPath();
  hudCtx.moveTo(x + cut, y); hudCtx.lineTo(x + w, y);
  hudCtx.lineTo(x + w, y + h - cut); hudCtx.lineTo(x + w - cut, y + h);
  hudCtx.lineTo(x, y + h); hudCtx.lineTo(x, y + cut);
  hudCtx.closePath();
  hudCtx.fillStyle = hasLock ? 'rgba(69, 10, 10, 0.78)' : 'rgba(8, 24, 48, 0.85)';
  hudCtx.fill();
  hudCtx.strokeStyle = accent;
  hudCtx.lineWidth = 1.4;
  hudCtx.stroke();

  const cx = x + w * 0.5;
  const cy = y + h * 0.5;

  const drawWarhead = (wx, wy, r, doubleRing) => {
    hudCtx.beginPath();
    hudCtx.arc(wx, wy, r, 0, Math.PI * 2);
    if (doubleRing) {
      hudCtx.strokeStyle = fillCol;
      hudCtx.lineWidth = 1.3;
      hudCtx.stroke();
      hudCtx.beginPath();
      hudCtx.arc(wx, wy, r * 0.62, 0, Math.PI * 2);
      hudCtx.stroke();
    } else {
      hudCtx.fillStyle = fillCol;
      hudCtx.fill();
    }
    hudCtx.strokeStyle = '#060c18';
    hudCtx.lineWidth = 1.6;
    hudCtx.beginPath();
    hudCtx.moveTo(wx - r * 0.55, wy);
    hudCtx.lineTo(wx + r * 0.55, wy);
    hudCtx.stroke();
  };

  if (mType === 'PESADO') {
    drawWarhead(cx - 11, cy - 6, 7.2, true);
    drawWarhead(cx + 11, cy - 6, 7.2, true);
    drawWarhead(cx, cy + 8, 7.2, true);
  } else if (mType === 'ESPECIAL') {
    hudCtx.strokeStyle = accent;
    hudCtx.lineWidth = 1.2;
    hudCtx.strokeRect(cx - 20, cy - 11, 40, 22);
    drawWarhead(cx - 10, cy, 6.8, true);
    drawWarhead(cx + 10, cy, 6.8, true);
  } else {
    hudCtx.strokeStyle = fillCol;
    hudCtx.lineWidth = 1.4;
    hudCtx.strokeRect(cx - 18, cy - 13, 36, 26);
    drawWarhead(cx - 10, cy - 6.5, 4.3, false);
    drawWarhead(cx + 10, cy - 6.5, 4.3, false);
    drawWarhead(cx, cy, 4.3, false);
    drawWarhead(cx - 10, cy + 6.5, 4.3, false);
    drawWarhead(cx + 10, cy + 6.5, 4.3, false);
  }
  hudCtx.restore();
}

function drawWeaponStatusPanel(w) {
  const isArcade = (typeof hudStyleMode !== 'undefined' && hudStyleMode === 'ARCADE');
  const boxW = 295, boxH = isArcade ? 146 : 250, x = w - boxW - 15, y = 15, cut = 10;
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

  let mslTopY = y + 74;

  if (!isArcade) {
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
    mslTopY = y + 110;
  }

  const lang = (typeof activeLang !== 'undefined') ? activeLang : 'es';
  const curMslType = (typeof getCurrentMissileType === 'function') ? getCurrentMissileType() : 'LIGERO';
  const mslNames = {
    LIGERO: { es: 'LIGERO', en: 'LIGHT', zh: '轻型', ja: '軽量' },
    PESADO: { es: 'PESADO', en: 'HEAVY', zh: '重型', ja: '重量' },
    ESPECIAL: { es: 'ESPECIAL', en: 'SPECIAL', zh: '特种', ja: '特殊' }
  };
  const mslLabel = (mslNames[curMslType] && mslNames[curMslType][lang]) || curMslType;
  const salvoWord = lang === 'en' ? 'SALVO' : (lang === 'zh' ? '齐射' : (lang === 'ja' ? '斉射' : 'SALVA'));

  const lockCount = (typeof lockedEnemies !== 'undefined') ? lockedEnemies.length : 0;
  const hasLock = lockCount > 0;
  hudCtx.font = 'bold 10px Conthrax, sans-serif';
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('MSL: ' + mslLabel, x + 14, mslTopY);
  hudCtx.shadowColor = hasLock ? 'rgba(239, 68, 68, 0.9)' : 'rgba(56, 189, 248, 0.6)';
  hudCtx.shadowBlur = 6;
  hudCtx.fillStyle = hasLock ? '#ef4444' : '#94a3b8';
  hudCtx.fillText(hasLock ? ('LOCK [' + lockCount + '/4]') : 'STBY', x + 135, mslTopY);

  for (let i = 0; i < 4; i++) {
    hudCtx.fillStyle = (i < lockCount) ? '#ef4444' : 'rgba(51, 65, 85, 0.6)';
    hudCtx.fillRect(x + 232 + i * 12, mslTopY - 10, 8, 12);
  }

  const podY = mslTopY + 8;
  drawMissilePodIcon(x + 14, podY, 56, 38, curMslType, hasLock);
  hudCtx.shadowBlur = 0;
  hudCtx.font = 'bold 9px Conthrax, sans-serif';
  hudCtx.fillStyle = '#94a3b8';
  hudCtx.fillText('POD: ' + mslLabel + ' [TAB]', x + 80, podY + 15);
  hudCtx.fillStyle = hasLock ? '#fca5a5' : '#38bdf8';
  hudCtx.fillText(curMslType === 'PESADO' ? (salvoWord + ': 01 // HEAVY') : (salvoWord + ': 04 // MULTI'), x + 80, podY + 31);

  if (!isArcade) {
    hudCtx.shadowBlur = 0;
    hudCtx.beginPath();
    hudCtx.moveTo(x + 12, y + 166); hudCtx.lineTo(x + boxW - 12, y + 166);
    hudCtx.stroke();

    const isBattroid = (typeof currentMode !== 'undefined' && currentMode === 'BATTROID');
    const tMode = (typeof battroidTrackMode !== 'undefined') ? battroidTrackMode : 'NONE';
    hudCtx.font = 'bold 10px Conthrax, sans-serif';
    hudCtx.fillStyle = '#38bdf8';
    hudCtx.fillText('TRACK [N]', x + 14, y + 190);

    let trackLabel = 'N/A (B-ONLY)', trackColor = '#64748b';
    if (isBattroid) {
      if (tMode === 'ENEMY') { trackLabel = 'ENEMY // AUTO'; trackColor = '#22c55e'; }
      else if (tMode === 'MISSILE') { trackLabel = 'MISSILE // AUTO'; trackColor = '#facc15'; }
      else { trackLabel = 'NONE // MANUAL'; trackColor = '#94a3b8'; }
    }
    hudCtx.shadowColor = trackColor;
    hudCtx.shadowBlur = (isBattroid && tMode !== 'NONE') ? 6 : 0;
    hudCtx.fillStyle = trackColor;
    hudCtx.fillText(trackLabel, x + 135, y + 190);
    hudCtx.shadowBlur = 0;
    hudCtx.beginPath();
    hudCtx.moveTo(x + 12, y + 202); hudCtx.lineTo(x + boxW - 12, y + 202);
    hudCtx.stroke();

    const isFighterMode = (typeof currentMode !== 'undefined' && currentMode === 'FIGHTER');
    const cCooldown = (typeof chaffCooldown !== 'undefined') ? chaffCooldown : 0;
    const cActive = (typeof chaffFlares !== 'undefined' && chaffFlares.length > 0);
    hudCtx.fillStyle = '#38bdf8';
    hudCtx.fillText('CHAFF [C]', x + 14, y + 225);

    let chaffLabel = 'N/A (F-ONLY)', chaffColor = '#64748b';
    if (isFighterMode) {
      if (cActive) { chaffLabel = 'DEPLOYED // FLARE'; chaffColor = '#facc15'; }
      else if (cCooldown > 0) { chaffLabel = 'RELOAD // ' + cCooldown.toFixed(1) + 'S'; chaffColor = '#f59e0b'; }
      else { chaffLabel = 'READY // DECOY'; chaffColor = '#22c55e'; }
    }
    hudCtx.shadowColor = chaffColor;
    hudCtx.shadowBlur = (isFighterMode && (cActive || cCooldown <= 0)) ? 6 : 0;
    hudCtx.fillStyle = chaffColor;
    hudCtx.fillText(chaffLabel, x + 135, y + 225);
  }

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

  const isArcadeHud = (typeof hudStyleMode !== 'undefined' && hudStyleMode === 'ARCADE');
  const blink = (Math.floor(performance.now() / 160) % 2 === 0);
  let heatStatus = Math.round(heat * 100) + '% // NOMINAL', heatColor = '#38bdf8';
  if (overheat) {
    if (!isArcadeHud && accel) {
      heatStatus = blink ? 'OVERHEAT // HULL DMG' : 'CRITICAL // THERMAL';
    } else {
      heatStatus = blink ? 'OVERHEAT // COOLING' : (isArcadeHud ? 'LOCKED // COOLING' : 'HIGH TEMP // COOLING');
    }
    heatColor = '#ef4444';
  } else if (heat > 0.75) {
    heatStatus = Math.round(heat * 100) + '% // HEAT WARN';
    heatColor = '#f59e0b';
  } else if (heat > 0.35) {
    heatStatus = Math.round(heat * 100) + '% // WARM';
    heatColor = '#facc15';
  }

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

function drawTacticalRadarBox(w, h, playerContainer, enemies) {
  const boxW = 148, boxH = 160, x = w - boxW - 15, y = h - boxH - 58, cut = 10;
  const rcx = x + boxW * 0.5, rcy = y + boxH * 0.5 + 8, rad = 58;

  hudCtx.save();
  hudCtx.beginPath();
  hudCtx.moveTo(x + cut, y); hudCtx.lineTo(x + boxW, y);
  hudCtx.lineTo(x + boxW, y + boxH - cut); hudCtx.lineTo(x + boxW - cut, y + boxH);
  hudCtx.lineTo(x, y + boxH); hudCtx.lineTo(x, y + cut);
  hudCtx.closePath();
  hudCtx.fillStyle = 'rgba(6, 12, 24, 0.84)';
  hudCtx.fill();
  hudCtx.shadowColor = '#38bdf8';
  hudCtx.shadowBlur = 8;
  hudCtx.strokeStyle = '#38bdf8';
  hudCtx.lineWidth = 1.6;
  hudCtx.stroke();

  hudCtx.shadowBlur = 0;
  hudCtx.font = 'bold 9px Conthrax, sans-serif';
  hudCtx.fillStyle = '#38bdf8';
  hudCtx.fillText('RADAR // 360°', x + 12, y + 16);

  hudCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  hudCtx.lineWidth = 1;
  hudCtx.beginPath(); hudCtx.arc(rcx, rcy, rad, 0, Math.PI * 2); hudCtx.stroke();
  hudCtx.beginPath(); hudCtx.arc(rcx, rcy, rad * 0.5, 0, Math.PI * 2); hudCtx.stroke();
  hudCtx.beginPath();
  hudCtx.moveTo(rcx - rad, rcy); hudCtx.lineTo(rcx + rad, rcy);
  hudCtx.moveTo(rcx, rcy - rad); hudCtx.lineTo(rcx, rcy + rad);
  hudCtx.stroke();

  hudCtx.fillStyle = 'rgba(56, 189, 248, 0.14)';
  hudCtx.beginPath();
  hudCtx.moveTo(rcx, rcy);
  hudCtx.arc(rcx, rcy, rad, -Math.PI * 0.5 - 0.52, -Math.PI * 0.5 + 0.52);
  hudCtx.closePath();
  hudCtx.fill();

  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(playerContainer.quaternion);
  const yaw = Math.atan2(fwd.x, -fwd.z);
  const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  const rangeMax = 160;

  const plotDot = (worldPos, color, size, ring) => {
    const dx = worldPos.x - playerContainer.position.x;
    const dz = worldPos.z - playerContainer.position.z;
    const rx = dx * cosY + dz * sinY;
    const rz = -dx * sinY + dz * cosY;
    const d = Math.hypot(rx, rz);
    const scale = Math.min(1, d / rangeMax);
    const ang = Math.atan2(rx, rz);
    const px = rcx + Math.sin(ang) * (scale * (rad - 5));
    const py = rcy + Math.cos(ang) * (scale * (rad - 5));
    hudCtx.fillStyle = color;
    hudCtx.beginPath(); hudCtx.arc(px, py, size, 0, Math.PI * 2); hudCtx.fill();
    if (ring) {
      hudCtx.strokeStyle = color; hudCtx.lineWidth = 1.2;
      hudCtx.beginPath(); hudCtx.arc(px, py, size + 3, 0, Math.PI * 2); hudCtx.stroke();
    }
  };

  if (typeof mpState !== 'undefined' && mpState.active && mpState.rivalMesh) {
    plotDot(mpState.rivalMesh.position, '#facc15', 3.4, true);
  } else if (enemies) {
    for (let i = 0; i < enemies.length; i++) {
      if (enemies.at(i).respawnTimer <= 0) plotDot(enemies.at(i).mesh.position, '#ef4444', 2.8, false);
    }
  }
  if (typeof enemyMissiles !== 'undefined') {
    for (let i = 0; i < enemyMissiles.length; i++) {
      plotDot(enemyMissiles.at(i).mesh.position, '#fb923c', 2.0, false);
    }
  }

  hudCtx.fillStyle = '#4ade80';
  hudCtx.beginPath();
  hudCtx.moveTo(rcx, rcy - 5); hudCtx.lineTo(rcx + 4, rcy + 4); hudCtx.lineTo(rcx - 4, rcy + 4);
  hudCtx.closePath();
  hudCtx.fill();
  hudCtx.restore();
}

function drawTopCompassTape(w, playerContainer, enemies) {
  const tapeW = 310, tapeH = 34, x = w * 0.5 - tapeW * 0.5, y = 14, cx = w * 0.5;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(playerContainer.quaternion);
  const heading = (Math.atan2(fwd.x, -fwd.z) * (180 / Math.PI) + 360) % 360;
  const pxPerDeg = 3.2;

  hudCtx.save();
  hudCtx.fillStyle = 'rgba(6, 12, 24, 0.72)';
  hudCtx.fillRect(x, y, tapeW, tapeH);
  hudCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  hudCtx.lineWidth = 1.2;
  hudCtx.strokeRect(x, y, tapeW, tapeH);

  hudCtx.beginPath();
  hudCtx.rect(x + 2, y, tapeW - 4, tapeH);
  hudCtx.clip();

  const cardinals = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SO', 270: 'O', 315: 'NO' };
  hudCtx.font = 'bold 9.5px Conthrax, sans-serif';
  hudCtx.textAlign = 'center';

  for (let deg = -60; deg <= 420; deg += 15) {
    let diff = deg - heading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const tx = cx + diff * pxPerDeg;
    if (tx < x - 20 || tx > x + tapeW + 20) continue;

    const normDeg = (deg + 360) % 360;
    const isMajor = (normDeg % 45 === 0);
    hudCtx.strokeStyle = isMajor ? '#38bdf8' : 'rgba(148, 163, 184, 0.55)';
    hudCtx.beginPath();
    hudCtx.moveTo(tx, y + tapeH);
    hudCtx.lineTo(tx, y + tapeH - (isMajor ? 9 : 5));
    hudCtx.stroke();

    if (normDeg % 30 === 0 || isMajor) {
      hudCtx.fillStyle = isMajor ? '#facc15' : '#cbd5e1';
      const lbl = cardinals[normDeg] || String(normDeg).padStart(3, '0');
      hudCtx.fillText(lbl, tx, y + 15);
    }
  }

  let targetPos = null;
  if (typeof mpState !== 'undefined' && mpState.active && mpState.rivalMesh) {
    targetPos = mpState.rivalMesh.position;
  } else if (enemies) {
    let minD = Infinity;
    for (let i = 0; i < enemies.length; i++) {
      if (enemies.at(i).respawnTimer > 0) continue;
      const d = enemies.at(i).mesh.position.distanceTo(playerContainer.position);
      if (d < minD) { minD = d; targetPos = enemies.at(i).mesh.position; }
    }
  }
  if (targetPos) {
    const tBearing = (Math.atan2(targetPos.x - playerContainer.position.x, -(targetPos.z - playerContainer.position.z)) * (180 / Math.PI) + 360) % 360;
    let bDiff = tBearing - heading;
    if (bDiff > 180) bDiff -= 360;
    if (bDiff < -180) bDiff += 360;
    const bx = Math.max(x + 8, Math.min(x + tapeW - 8, cx + bDiff * pxPerDeg));
    hudCtx.fillStyle = '#ef4444';
    hudCtx.beginPath();
    hudCtx.moveTo(bx, y + 2); hudCtx.lineTo(bx + 5, y + 8); hudCtx.lineTo(bx - 5, y + 8);
    hudCtx.closePath();
    hudCtx.fill();
  }
  hudCtx.restore();

  hudCtx.save();
  hudCtx.fillStyle = 'rgba(6, 12, 24, 0.92)';
  hudCtx.strokeStyle = '#22c55e';
  hudCtx.lineWidth = 1.4;
  hudCtx.fillRect(cx - 26, y + tapeH + 5, 52, 16);
  hudCtx.strokeRect(cx - 26, y + tapeH + 5, 52, 16);
  hudCtx.font = 'bold 9.5px Conthrax, sans-serif';
  hudCtx.fillStyle = '#4ade80';
  hudCtx.textAlign = 'center';
  hudCtx.fillText(String(Math.round(heading)).padStart(3, '0') + '°', cx, y + tapeH + 16);
  hudCtx.restore();

}

function drawOffScreenTargetArrow(w, h, camera, playerContainer, enemies) {
  const targets = new Array();

  if (typeof mpState !== 'undefined' && mpState.active && mpState.rivalMesh) {
    targets.push({ pos: mpState.rivalMesh.position, tag: mpState.rivalName || 'RIVAL', isRival: true });
  } else if (enemies) {
    for (let i = 0; i < enemies.length; i++) {
      if (enemies.at(i).respawnTimer > 0) continue;
      targets.push({ pos: enemies.at(i).mesh.position, tag: enemies.at(i).id, isRival: false });
    }
  }
  if (targets.length === 0) return;

  targets.sort((a, b) => a.pos.distanceToSquared(playerContainer.position) - b.pos.distanceToSquared(playerContainer.position));

  const cx = w * 0.5, cy = h * 0.5;
  const maxX = cx - 34, maxY = cy - 34;

  for (let i = 0; i < targets.length; i++) {
    const t = targets.at(i);
    const proj = t.pos.clone().project(camera);
    const sx = (proj.x * 0.5 + 0.5) * w;
    const sy = (-(proj.y * 0.5) + 0.5) * h;

    const inFront = proj.z <= 1;
    if (inFront && sx >= 28 && sx <= w - 28 && sy >= 28 && sy <= h - 28) continue;

    let dx = sx - cx, dy = sy - cy;
    if (!inFront) { dx = -dx; dy = -dy; }

    const ang = Math.atan2(dy, dx);
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const scale = Math.min(
      Math.abs(cos) > 0.001 ? maxX / Math.abs(cos) : 99999,
      Math.abs(sin) > 0.001 ? maxY / Math.abs(sin) : 99999
    );
    const ax = cx + cos * scale;
    const ay = cy + sin * scale;
    const dist = t.pos.distanceTo(playerContainer.position);
    const distM = Math.round(dist * 10);

    // Código de color estilo Macross PS2: Rojo (más cercano/amenaza), Amarillo (media dist.), Blanco (lejano)
    let color = '#ffffff';
    if (t.isRival || (i === 0 && dist < 55) || dist < 40) color = '#ef4444';
    else if (dist < 90 || i === 0) color = '#facc15';

    hudCtx.save();
    hudCtx.translate(ax, ay);
    hudCtx.rotate(ang);
    hudCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    hudCtx.shadowBlur = 5;
    hudCtx.fillStyle = color;
    hudCtx.beginPath();
    hudCtx.moveTo(11, 0); hudCtx.lineTo(-7, -7); hudCtx.lineTo(-3.5, 0); hudCtx.lineTo(-7, 7);
    hudCtx.closePath();
    hudCtx.fill();
    hudCtx.rotate(-ang);

    if (color !== '#ffffff') {
      hudCtx.font = 'bold 8.5px Conthrax, sans-serif';
      hudCtx.fillStyle = color;
      hudCtx.textAlign = 'center';
      hudCtx.fillText((t.isRival ? t.tag + ' ' : '') + distM + 'M', -cos * 22, -sin * 16 + 3);
    }
    hudCtx.restore();
  }
}


function drawMissileAlertBanner(w, h, playerContainer) {
  if (typeof enemyMissiles === 'undefined' || enemyMissiles.length === 0) return;
  if ((typeof isPlayerDying !== 'undefined' && isPlayerDying) || (typeof isGameOver !== 'undefined' && isGameOver)) return;

  let minDist = Infinity;
  for (let i = 0; i < enemyMissiles.length; i++) {
    const em = enemyMissiles.at(i);
    if (!em.isLockedOn) continue;
    const d = em.mesh.position.distanceTo(playerContainer.position);
    if (d < minDist) minDist = d;
  }
  if (minDist > 42) return;

  const blink = (Math.floor(performance.now() / 130) % 2 === 0);
  if (!blink) return;

  const boxW = 310, boxH = 30, x = w * 0.5 - boxW * 0.5, y = h - boxH - 15, cut = 8;
  const isFighter = (typeof currentMode !== 'undefined' && currentMode === 'FIGHTER');
  const tip = isFighter ? 'DEPLOY CHAFF [C]' : 'EVADE // REVERSE [R]';

  hudCtx.save();
  hudCtx.beginPath();
  hudCtx.moveTo(x + cut, y); hudCtx.lineTo(x + boxW, y);
  hudCtx.lineTo(x + boxW, y + boxH - cut); hudCtx.lineTo(x + boxW - cut, y + boxH);
  hudCtx.lineTo(x, y + boxH); hudCtx.lineTo(x, y + cut);
  hudCtx.closePath();
  hudCtx.fillStyle = 'rgba(127, 29, 29, 0.85)';
  hudCtx.fill();
  hudCtx.strokeStyle = '#ef4444';
  hudCtx.lineWidth = 1.6;
  hudCtx.stroke();

  hudCtx.font = 'bold 10px Conthrax, sans-serif';
  hudCtx.fillStyle = '#fef2f2';
  hudCtx.textAlign = 'center';
  hudCtx.fillText('MISSILE ALERT // ' + tip, w * 0.5, y + 19);
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

function drawMultiplayerRivalHUD(w, h, camera, playerContainer, delta) {
  if (typeof mpState === 'undefined' || !mpState.active || !mpState.rivalMesh) return;

  const proj = mpState.rivalMesh.position.clone().project(camera);
  if (proj.z <= 1) {
    const sx = (proj.x * 0.5 + 0.5) * w;
    const sy = (-(proj.y * 0.5) + 0.5) * h;
    const distM = Math.round(mpState.rivalMesh.position.distanceTo(playerContainer.position) * 10);
    drawDYRLEnemyHexagon(sx, sy, 20, distM, Math.max(0, Math.round(mpState.rivalMesh.position.y * 2.4)));

    const isChargingMpLock = Boolean(window.isChargingMissileLock);
    const prevMpProg = mpState.lockProgress || 0;
    if (isChargingMpLock && Math.hypot(sx - w * 0.5, sy - h * 0.5) < 215) {
      mpState.lockProgress = Math.min(1.0, prevMpProg + delta * 2.8);
    } else {
      mpState.lockProgress = 0;
    }
    const isLocked = mpState.lockProgress >= 1.0;
    if (isLocked && prevMpProg < 1.0 && typeof playSFX === 'function') playSFX('lockOn', 0.65, 0);
    if (isChargingMpLock) {
      drawSeekerBrackets(sx, sy, (1.0 - mpState.lockProgress) * 18, isLocked, mpState.rivalName, 1);
    }

    const hpRatio = Math.max(0, Math.min(1, mpState.rivalArmor / (mpState.rivalMaxArmor || 140)));
    const hpColor = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#f59e0b' : '#ef4444');
    const barW = 86, barH = 6;

    hudCtx.save();
    hudCtx.font = 'bold 10px Conthrax, sans-serif';
    hudCtx.textAlign = 'center';
    hudCtx.fillStyle = '#facc15';
    hudCtx.fillText('[' + mpState.rivalCountry + '] ' + mpState.rivalName + ' (' + Math.max(0, Math.round(mpState.rivalArmor)) + ')', sx, sy - 42);
    hudCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    hudCtx.fillRect(sx - barW * 0.5, sy - 36, barW, barH);
    hudCtx.fillStyle = hpColor;
    hudCtx.fillRect(sx - barW * 0.5 + 1, sy - 35, (barW - 2) * hpRatio, barH - 2);
    hudCtx.restore();
  }

    if (mpState.matchEnded) {
    const lang = (typeof activeLang !== 'undefined') ? activeLang : 'es';
    const myName = mpState.pilotName || 'PILOT';
    const enemyName = mpState.rivalName || 'RIVAL';

    let resultText = '';
    let exitHint = 'PRESIONA [ESC] PARA VOLVER AL MENÚ PRINCIPAL';

    if (lang === 'en') {
      resultText = mpState.victory ? (myName + ' WINS // ' + enemyName + ' SHOT DOWN') : (myName + ' LOST // SHOT DOWN BY ' + enemyName);
      exitHint = 'PRESS [ESC] TO RETURN TO MAIN MENU';
    } else if (lang === 'zh') {
      resultText = mpState.victory ? (myName + ' 获胜 // 击落 ' + enemyName) : (myName + ' 战败 // 被 ' + enemyName + ' 击落');
      exitHint = '按 [ESC] 键返回主菜单';
    } else if (lang === 'ja') {
      resultText = mpState.victory ? (myName + ' の勝利 // ' + enemyName + ' を撃墜') : (myName + ' の敗北 // ' + enemyName + ' に撃墜された');
      exitHint = '[ESC] キーでメインメニューに戻る';
    } else {
      resultText = mpState.victory ? ('GANÓ ' + myName + ' // ' + enemyName + ' DERRIBADO') : ('PERDIÓ ' + myName + ' // DERRIBADO POR ' + enemyName);
    }

    hudCtx.save();
    hudCtx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    hudCtx.fillRect(0, h * 0.5 - 55, w, 110);
    hudCtx.textAlign = 'center';
    hudCtx.font = 'bold 24px Conthrax, sans-serif';
    hudCtx.fillStyle = mpState.victory ? '#22c55e' : '#ef4444';
    hudCtx.fillText(resultText, w * 0.5, h * 0.5 - 6);
    hudCtx.font = 'bold 11px Conthrax, sans-serif';
    hudCtx.fillStyle = '#38bdf8';
    hudCtx.fillText(exitHint, w * 0.5, h * 0.5 + 26);
    hudCtx.restore();
  }


}

function drawArcadeGunLockReticle(w, h, camera, playerContainer) {
  if (typeof getArcadeGunLockTarget !== 'function') return;
  const target = getArcadeGunLockTarget(playerContainer);
  if (!target) return;

  const proj = target.pos.clone().project(camera);
  if (proj.z > 1) return;

  const sx = (proj.x * 0.5 + 0.5) * w;
  const sy = (-(proj.y * 0.5) + 0.5) * h;
  const pulse = 1 + Math.sin(performance.now() * 0.015) * 0.08;
  const r = 22 * pulse;

  hudCtx.save();
  hudCtx.strokeStyle = '#f59e0b';
  hudCtx.shadowColor = 'rgba(245, 158, 11, 0.9)';
  hudCtx.shadowBlur = 8;
  hudCtx.lineWidth = 2;

  hudCtx.beginPath();
  hudCtx.arc(sx, sy, r, 0, Math.PI * 2);
  hudCtx.stroke();

  hudCtx.lineWidth = 1.4;
  hudCtx.beginPath();
  hudCtx.arc(sx, sy, r * 0.55, 0, Math.PI * 2);
  hudCtx.stroke();

  hudCtx.beginPath();
  hudCtx.moveTo(sx - r - 6, sy); hudCtx.lineTo(sx - r + 4, sy);
  hudCtx.moveTo(sx + r - 4, sy); hudCtx.lineTo(sx + r + 6, sy);
  hudCtx.moveTo(sx, sy - r - 6); hudCtx.lineTo(sx, sy - r + 4);
  hudCtx.moveTo(sx, sy + r - 4); hudCtx.lineTo(sx, sy + r + 6);
  hudCtx.stroke();

  hudCtx.font = 'bold 9.5px Conthrax, sans-serif';
  hudCtx.fillStyle = '#fbbf24';
  hudCtx.textAlign = 'center';
  hudCtx.fillText('GUN LOCK', sx, sy - r - 9);
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

  const isChargingLock = Boolean(window.isChargingMissileLock);
  const scanRadius = 215;
  const candidates = new Array();
  const projVec = new THREE.Vector3();

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies.at(i);
    if (e.respawnTimer > 0) { e.lockProgress = 0; e.seekerX = cx; e.seekerY = cy; continue; }
    projVec.copy(e.mesh.position).project(camera);
    if (projVec.z > 1) { e.lockProgress = 0; continue; }

    const sx = (projVec.x * 0.5 + 0.5) * w, sy = (-(projVec.y * 0.5) + 0.5) * h;
    const distCenter = Math.hypot(sx - cx, sy - cy);
    const worldDist = Math.round(e.mesh.position.distanceTo(playerContainer.position) * 10);
    const altDiff = Math.max(0, Math.round(e.mesh.position.y * 2.4));
    drawDYRLEnemyHexagon(sx, sy, 18, worldDist, altDiff);

    // Barra de armadura/energía sobre cada enemigo
    const hpRatio = Math.max(0, Math.min(1, (e.hp || 0) / 3));
    const hpColor = hpRatio > 0.6 ? '#22c55e' : (hpRatio > 0.3 ? '#f59e0b' : '#ef4444');
    const barW = 46, barH = 5;
    hudCtx.save();
    hudCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    hudCtx.fillRect(sx - barW * 0.5, sy - 27, barW, barH);
    hudCtx.fillStyle = hpColor;
    hudCtx.fillRect(sx - barW * 0.5 + 1, sy - 26, (barW - 2) * hpRatio, barH - 2);
    hudCtx.restore();

    if (isChargingLock && distCenter < scanRadius) {
      candidates.push({ enemy: e, sx: sx, sy: sy, distCenter: distCenter });
    } else {
      e.lockProgress = 0;
      e.seekerX = cx;
      e.seekerY = cy;
    }
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
    const lerpRate = Math.min(1.0, 14.0 * delta);
    e.seekerX += (item.sx - e.seekerX) * lerpRate;
    e.seekerY += (item.sy - e.seekerY) * lerpRate;

    const prevProg = e.lockProgress || 0;
    if (Math.hypot(item.sx - e.seekerX, item.sy - e.seekerY) < 34) {
      e.lockProgress = Math.min(1.0, prevProg + delta * 3.0);
    }
    const isFullLock = e.lockProgress >= 1.0;
    if (isFullLock) {
      lockedEnemies.push(e);
      if (prevProg < 1.0 && typeof playSFX === 'function') playSFX('lockOn', 0.65, 0);
    }
    drawSeekerBrackets(e.seekerX, e.seekerY, (1.0 - (e.lockProgress || 0)) * 18, isFullLock, e.id, i + 1);
  }


  drawEnemyMissileMarkers(w, h, camera, playerContainer);
  drawBattroidTrackReticle(w, h, camera);
  drawMultiplayerRivalHUD(w, h, camera, playerContainer, delta);

  const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(playerContainer.quaternion);
  const aimProj = playerContainer.position.clone().addScaledVector(forwardVec, 18).project(camera);
  const hudX = (aimProj.z <= 1) ? (aimProj.x * 0.5 + 0.5) * w : cx;
  const hudY = (aimProj.z <= 1) ? (-(aimProj.y * 0.5) + 0.5) * h : (cy - 48);

  const shipProj = playerContainer.position.clone().project(camera);
  const shipSy = (shipProj.z <= 1) ? (-(shipProj.y * 0.5) + 0.5) * h : (cy + 55);

    const isArcadeHud = (typeof hudStyleMode !== 'undefined' && hudStyleMode === 'ARCADE');

  if (!isArcadeHud) {
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
  }

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

  if (isArcadeHud) drawArcadeGunLockReticle(w, h, camera, playerContainer);

  drawWeaponStatusPanel(w);
  drawPropulsionPanel(h);
  drawTacticalRadarBox(w, h, playerContainer, enemies);
  if (!isArcadeHud) drawTopCompassTape(w, playerContainer, enemies);
  drawOffScreenTargetArrow(w, h, camera, playerContainer, enemies);
  drawMissileAlertBanner(w, h, playerContainer);
  
  const lang = (typeof activeLang !== 'undefined') ? activeLang : 'es';
  const topLeftHud = document.getElementById('hud');
  if (topLeftHud && lang !== 'es') {
    let txt = topLeftHud.innerHTML;
    if (lang === 'en') {
      txt = txt.replace('MODO:', 'MODE:').replace('ALTITUD:', 'ALTITUDE:').replace('RUMBO:', 'HEADING:').replace('ENEMIGO CERCANO:', 'CLOSEST TARGET:').replace('SIN BLANCOS', 'NO TARGETS');
    } else if (lang === 'zh') {
      txt = txt.replace('MODO:', '形态:').replace('ALTITUD:', '高度:').replace('RUMBO:', '航向:').replace('ENEMIGO CERCANO:', '最近目标:').replace('SIN BLANCOS', '无目标');
    } else if (lang === 'ja') {
      txt = txt.replace('MODO:', '形態:').replace('ALTITUD:', '高度:').replace('RUMBO:', '方位:').replace('ENEMIGO CERCANO:', '最寄り目標:').replace('SIN BLANCOS', '目標なし');
    }
    if (topLeftHud.innerHTML !== txt) topLeftHud.innerHTML = txt;
  }

  if (typeof isGameOver !== 'undefined' && isGameOver && !(typeof mpState !== 'undefined' && mpState.active)) drawRestartOverlay(w, h);
  else if (isPaused) drawPauseOverlay(w, h);
}
