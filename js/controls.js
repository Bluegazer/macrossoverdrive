(() => {
  const defaults = {
    moveForward: 'KeyW', moveBack: 'KeyS', moveLeft: 'KeyA', moveRight: 'KeyD',
    turnLeft: 'ArrowLeft', turnRight: 'ArrowRight', verticalUp: 'ArrowUp', verticalDown: 'ArrowDown',
    fighter: 'KeyF', gerwalk: 'KeyG', battroid: 'KeyB',
    gunpod: 'ShiftLeft', melee: 'KeyE', missiles: 'Space', missileType: 'Tab', chaff: 'KeyC',
    turbo: 'KeyT', reverse: 'KeyR', tracking: 'KeyN', brake: 'KeyX',
    pause: 'KeyP', music: 'KeyM', advanceTime: 'KeyH',
    startMission: 'Enter', returnMenu: 'Escape', restartAfterDefeat: 'KeyY', menuAfterDefeat: 'KeyN'
  };
  const gamepadDefaults = {
    moveForward: 'button12', moveBack: 'button13', moveLeft: 'axis2-', moveRight: 'axis2+',
    turnLeft: 'axis0-', turnRight: 'axis0+', verticalUp: 'axis1+', verticalDown: 'axis1-',
    gerwalkUp: 'axis3-', gerwalkDown: 'axis3+',
    transformPrevious: 'button14', transformNext: 'button15',
    gunpod: 'button2', missiles: 'button1', targetLock: 'button0', melee: 'button3', chaff: 'button11',
    missileType: 'button8', turbo: 'button7', reverse: 'button6', slowdown: 'none', brake: 'none',
    strafeLeft: 'button4', strafeRight: 'button5', descend: 'none',
    cameraMissiles: 'none', cameraEnemy: 'none', cameraLeft: 'none', cameraRight: 'none',
    pause: 'button9',
    startMission: 'button9', returnMenu: 'none', restartAfterDefeat: 'button0', menuAfterDefeat: 'button1'
  };
  const categories = {
    moveForward: 'flight', moveBack: 'flight', moveLeft: 'flight', moveRight: 'flight',
    turnLeft: 'flight', turnRight: 'flight', verticalUp: 'flight', verticalDown: 'flight', gerwalkUp: 'flight', gerwalkDown: 'flight', turbo: 'flight', reverse: 'flight',
    fighter: 'transform', gerwalk: 'transform', battroid: 'transform', transformPrevious: 'transform', transformNext: 'transform',
    gunpod: 'attack', melee: 'attack', missiles: 'attack', tracking: 'attack', targetLock: 'attack', missileType: 'attack',
    brake: 'systems', pause: 'systems', music: 'systems', advanceTime: 'systems', chaff: 'systems', cameraMissiles: 'systems', cameraEnemy: 'systems', cameraLeft: 'systems', cameraRight: 'systems',
    strafeLeft: 'flight', strafeRight: 'flight', descend: 'flight', slowdown: 'flight',
    startMission: 'menu', returnMenu: 'menu', restartAfterDefeat: 'menu', menuAfterDefeat: 'menu'
  };
  const stateKeys = {
    moveForward: 'KeyW', moveBack: 'KeyS', moveLeft: 'KeyA', moveRight: 'KeyD',
    turnLeft: 'ArrowLeft', turnRight: 'ArrowRight', verticalUp: 'ArrowUp', verticalDown: 'ArrowDown',
    gunpod: 'ShiftLeft', missiles: 'Space', brake: 'KeyX', slowdown: 'GamepadSlowdown'
  };
  // ---------- Modelo de asignaciones por modo de transformación ----------
  // Las acciones de vuelo tienen un botón propio en cada modo (id = 'accion@MODO').
  // El resto (transformación, ataque, sistemas, cámara, menú) son globales.
  // El motor no cambia: cada id resuelve a la misma acción base de siempre.
  const SCOPED_MODES = ['FIGHTER', 'GERWALK', 'BATTROID'];
  const kbFlight = ['moveForward', 'moveBack', 'moveLeft', 'moveRight', 'turnLeft', 'turnRight', 'verticalUp', 'verticalDown', 'turbo', 'brake'];
   const kbModeActions = {
    FIGHTER: [...kbFlight, 'reverse'],
    GERWALK: [...kbFlight, 'reverse'],
    BATTROID: [...kbFlight, 'reverse']
  };
  const padModeActions = {
    FIGHTER: ['moveForward', 'moveBack', 'turnLeft', 'turnRight', 'verticalUp', 'verticalDown', 'strafeLeft', 'strafeRight', 'turbo', 'reverse', 'slowdown', 'brake'],
    GERWALK: ['moveForward', 'moveBack', 'moveLeft', 'moveRight', 'strafeLeft', 'strafeRight', 'gerwalkUp', 'gerwalkDown', 'verticalUp', 'verticalDown', 'turbo', 'reverse', 'slowdown', 'descend', 'brake'],
    BATTROID: ['moveForward', 'moveBack', 'turnLeft', 'turnRight', 'strafeLeft', 'strafeRight', 'verticalUp', 'verticalDown', 'descend', 'turbo', 'reverse', 'brake']
  };
  const kbScoped = new Set(Object.values(kbModeActions).flat());
  const padScoped = new Set(Object.values(padModeActions).flat());
    const kbModeLabelsI18N = {
    es: {
      FIGHTER: { moveForward: 'Acelerar / empuje', moveBack: 'Desacelerar / reducir empuje', moveLeft: 'Guiñada izquierda', moveRight: 'Guiñada derecha', turnLeft: 'Alabeo izquierda', turnRight: 'Alabeo derecha', verticalUp: 'Cabeceo: nariz arriba', verticalDown: 'Cabeceo: nariz abajo', turbo: 'Booster / postquemador (mantener)', reverse: 'Freno / reversa Gerwalk', brake: 'Frenado total' },
      GERWALK: { moveForward: 'Avanzar', moveBack: 'Retroceder', moveLeft: 'Desplazamiento lateral izq.', moveRight: 'Desplazamiento lateral der.', turnLeft: 'Girar eje vertical izq.', turnRight: 'Girar eje vertical der.', verticalUp: 'Subir altitud', verticalDown: 'Bajar altitud', turbo: 'Propulsión continua (mantener)', reverse: 'Reversa', brake: 'Frenado total' },
      BATTROID: { moveForward: 'Avanzar / caminar', moveBack: 'Retroceder', moveLeft: 'Desplazamiento lateral izq.', moveRight: 'Desplazamiento lateral der.', turnLeft: 'Girar eje vertical izq.', turnRight: 'Girar eje vertical der.', verticalUp: 'Elevar / salto vertical', verticalDown: 'Descender', turbo: 'Impulso / booster direccional', reverse: 'Freno / reversa Gerwalk', brake: 'Frenar impulso' }
    },
    en: {
      FIGHTER: { moveForward: 'Accelerate / Throttle Up', moveBack: 'Decelerate / Throttle Down', moveLeft: 'Yaw Left', moveRight: 'Yaw Right', turnLeft: 'Roll Left', turnRight: 'Roll Right', verticalUp: 'Pitch: Nose Up', verticalDown: 'Pitch: Nose Down', turbo: 'Afterburner / Boost (Hold)', reverse: 'Gerwalk Brake / Reverse', brake: 'Full Stop' },
      GERWALK: { moveForward: 'Move Forward', moveBack: 'Move Backward', moveLeft: 'Strafe Left', moveRight: 'Strafe Right', turnLeft: 'Turn Left', turnRight: 'Turn Right', verticalUp: 'Ascend Altitude', verticalDown: 'Descend Altitude', turbo: 'Continuous Thrust (Hold)', reverse: 'Reverse', brake: 'Full Stop' },
      BATTROID: { moveForward: 'Walk / Advance', moveBack: 'Move Backward', moveLeft: 'Strafe Left', moveRight: 'Strafe Right', turnLeft: 'Turn Left', turnRight: 'Turn Right', verticalUp: 'Ascend / Vertical Jump', verticalDown: 'Descend', turbo: 'Directional Dash / Boost', reverse: 'Gerwalk Brake / Reverse', brake: 'Stop Dash' }
    },
    zh: {
      FIGHTER: { moveForward: '加速 / 增加推力', moveBack: '减速 / 降低推力', moveLeft: '左偏航', moveRight: '右偏航', turnLeft: '左翻滚', turnRight: '右翻滚', verticalUp: '俯仰：机头上仰', verticalDown: '俯仰：机头下俯', turbo: '加力燃烧室 (按住)', reverse: 'Gerwalk 制动 / 倒飞', brake: '完全急停' },
      GERWALK: { moveForward: '前进', moveBack: '后退', moveLeft: '向左平移', moveRight: '向右平移', turnLeft: '向左转向', turnRight: '向右转向', verticalUp: '爬升高度', verticalDown: '降低高度', turbo: '持续推进 (按住)', reverse: '倒飞', brake: '完全急停' },
      BATTROID: { moveForward: '行走 / 前进', moveBack: '后退', moveLeft: '向左平移', moveRight: '向右平移', turnLeft: '向左转向', turnRight: '向右转向', verticalUp: '上升 / 垂直推进', verticalDown: '下降', turbo: '方向推进冲刺', reverse: 'Gerwalk 制动 / 倒飞', brake: '停止冲刺' }
    },
    ja: {
      FIGHTER: { moveForward: '加速 / スロットル上昇', moveBack: '減速 / スロットル低下', moveLeft: '左ヨー旋回', moveRight: '右ヨー旋回', turnLeft: '左ロール', turnRight: '右ロール', verticalUp: 'ピッチ：機首上げ', verticalDown: 'ピッチ：機首下げ', turbo: 'アフターバーナー (長押し)', reverse: 'ガウォーク制動 / 後退', brake: 'フルストップ' },
      GERWALK: { moveForward: '前進', moveBack: '後退', moveLeft: '左ストライフ', moveRight: '右ストライフ', turnLeft: '左旋回', turnRight: '右旋回', verticalUp: '高度上昇', verticalDown: '高度下降', turbo: '連続推進 (長押し)', reverse: '後退', brake: 'フルストップ' },
      BATTROID: { moveForward: '歩行 / 前進', moveBack: '後退', moveLeft: '左ストライフ', moveRight: '右ストライフ', turnLeft: '左旋回', turnRight: '右旋回', verticalUp: '上昇 / バーニアジャンプ', verticalDown: '下降', turbo: '方向ダッシュ / ブースト', reverse: 'ガウォーク制動 / 後退', brake: 'ダッシュ停止' }
    }
  };
  const padModeLabelsI18N = {
    es: {
      FIGHTER: { moveForward: 'Empuje (acelerar)', moveBack: 'Reducir empuje', turnLeft: 'Alabeo izquierda', turnRight: 'Alabeo derecha', verticalUp: 'Cabeceo: subir nariz', verticalDown: 'Cabeceo: bajar nariz', strafeLeft: 'Guiñada izquierda', strafeRight: 'Guiñada derecha', turbo: 'Booster (mantener)', reverse: 'Freno / reversa Gerwalk', slowdown: 'Desacelerar adicional', brake: 'Frenado total' },
      GERWALK: { moveForward: 'Avanzar', moveBack: 'Retroceder', moveLeft: 'Girar izquierda', moveRight: 'Girar derecha', strafeLeft: 'Desplazamiento lateral izq.', strafeRight: 'Desplazamiento lateral der.', gerwalkUp: 'Subir altitud', gerwalkDown: 'Bajar altitud', verticalUp: 'Eje vertical: subir', verticalDown: 'Eje vertical: bajar', turbo: 'Propulsión (mantener)', reverse: 'Reversa (mantener)', slowdown: 'Desacelerar adicional', descend: 'Descenso adicional', brake: 'Frenado total' },
      BATTROID: { moveForward: 'Avanzar / caminar', moveBack: 'Retroceder', turnLeft: 'Girar izquierda', turnRight: 'Girar derecha', strafeLeft: 'Desplazamiento lateral izq.', strafeRight: 'Desplazamiento lateral der.', verticalUp: 'Elevar (eje vertical)', verticalDown: 'Descender (eje vertical)', descend: 'Descenso adicional', turbo: 'Impulso / booster', reverse: 'Freno / reversa Gerwalk', brake: 'Frenar impulso' }
    },
    en: {
      FIGHTER: { moveForward: 'Thrust (Accelerate)', moveBack: 'Reduce Thrust', turnLeft: 'Roll Left', turnRight: 'Roll Right', verticalUp: 'Pitch: Nose Up', verticalDown: 'Pitch: Nose Down', strafeLeft: 'Yaw Left', strafeRight: 'Yaw Right', turbo: 'Boost (Hold)', reverse: 'Gerwalk Brake / Reverse', slowdown: 'Extra Deceleration', brake: 'Full Stop' },
      GERWALK: { moveForward: 'Move Forward', moveBack: 'Move Backward', moveLeft: 'Turn Left', moveRight: 'Turn Right', strafeLeft: 'Strafe Left', strafeRight: 'Strafe Right', gerwalkUp: 'Ascend Altitude', gerwalkDown: 'Descend Altitude', verticalUp: 'Vertical Axis: Up', verticalDown: 'Vertical Axis: Down', turbo: 'Thrust (Hold)', reverse: 'Reverse (Hold)', slowdown: 'Extra Deceleration', descend: 'Extra Descend', brake: 'Full Stop' },
      BATTROID: { moveForward: 'Walk / Advance', moveBack: 'Move Backward', turnLeft: 'Turn Left', turnRight: 'Turn Right', strafeLeft: 'Strafe Left', strafeRight: 'Strafe Right', verticalUp: 'Ascend (Vertical Axis)', verticalDown: 'Descend (Vertical Axis)', descend: 'Extra Descend', turbo: 'Boost / Dash', reverse: 'Gerwalk Brake / Reverse', brake: 'Stop Dash' }
    },
    zh: {
      FIGHTER: { moveForward: '推力 (加速)', moveBack: '降低推力', turnLeft: '左翻滚', turnRight: '右翻滚', verticalUp: '俯仰：机头上仰', verticalDown: '俯仰：机头下俯', strafeLeft: '左偏航', strafeRight: '右偏航', turbo: '涡轮加速 (按住)', reverse: 'Gerwalk 制动 / 倒飞', slowdown: '额外减速', brake: '完全急停' },
      GERWALK: { moveForward: '前进', moveBack: '后退', moveLeft: '向左转向', moveRight: '向右转向', strafeLeft: '向左平移', strafeRight: '向右平移', gerwalkUp: '爬升高度', gerwalkDown: '降低高度', verticalUp: '垂直轴：上升', verticalDown: '垂直轴：下降', turbo: '推进 (按住)', reverse: '倒飞 (按住)', slowdown: '额外减速', descend: '额外下降', brake: '完全急停' },
      BATTROID: { moveForward: '行走 / 前进', moveBack: '后退', turnLeft: '向左转向', turnRight: '向右转向', strafeLeft: '向左平移', strafeRight: '向右平移', verticalUp: '上升 (垂直轴)', verticalDown: '下降 (垂直轴)', descend: '额外下降', turbo: '冲刺 / 推进', reverse: 'Gerwalk 制动 / 倒飞', brake: '停止冲刺' }
    },
    ja: {
      FIGHTER: { moveForward: '推力 (加速)', moveBack: '推力低下', turnLeft: '左ロール', turnRight: '右ロール', verticalUp: 'ピッチ：機首上げ', verticalDown: 'ピッチ：機首下げ', strafeLeft: '左ヨー旋回', strafeRight: '右ヨー旋回', turbo: 'ブースト (長押し)', reverse: 'ガウォーク制動 / 後退', slowdown: '追加減速', brake: 'フルストップ' },
      GERWALK: { moveForward: '前進', moveBack: '後退', moveLeft: '左旋回', moveRight: '右旋回', strafeLeft: '左ストライフ', strafeRight: '右ストライフ', gerwalkUp: '高度上昇', gerwalkDown: '高度下降', verticalUp: '垂直軸：上昇', verticalDown: '垂直軸：下降', turbo: '推進 (長押し)', reverse: '後退 (長押し)', slowdown: '追加減速', descend: '追加下降', brake: 'フルストップ' },
      BATTROID: { moveForward: '歩行 / 前進', moveBack: '後退', moveLeft: '左ストライフ', moveRight: '右ストライフ', turnLeft: '左旋回', turnRight: '右旋回', verticalUp: '上昇 (垂直軸)', verticalDown: '下降 (垂直軸)', descend: '追加下降', turbo: 'ブースト / ダッシュ', reverse: 'ガウォーク制動 / 後退', brake: 'ダッシュ停止' }
    }
  };
  const kbModeLabels = kbModeLabelsI18N.es;
  const padModeLabels = padModeLabelsI18N.es;
  window.getModeActionLabel = (action, mode, isPad, lang) => {
    const l = (lang && kbModeLabelsI18N[lang]) ? lang : 'es';
    const src = isPad ? padModeLabelsI18N[l] : kbModeLabelsI18N[l];
    return (mode && src[mode] && src[mode][action]) ? src[mode][action] : null;
  };
  
  function baseOf(id) { return id.split('@')[0]; }
  function modeOf(id) { return id.includes('@') ? id.split('@')[1] : null; }
  function bindingId(action, mode, device) {
    const scoped = device === 'gamepad' ? padScoped : kbScoped;
    return scoped.has(action) && mode ? `${action}@${mode}` : action;
  }
  function expandDefaults(base, modeActions, scoped) {
    const out = {};
    Object.keys(base).forEach(action => { if (!scoped.has(action)) out[action] = base[action]; });
    Object.entries(modeActions).forEach(([mode, list]) => list.forEach(action => { out[`${action}@${mode}`] = base[action]; }));
    return out;
  }
  function currentFlightMode() {
    try { return typeof currentMode !== 'undefined' ? currentMode : null; } catch (_) { return null; }
  }

  const kbDefaults = expandDefaults(defaults, kbModeActions, kbScoped);
  const padDefaults = expandDefaults(gamepadDefaults, padModeActions, padScoped);
  const storageKey = 'macrossvoxp-keyboard-controls-v2';
  const gamepadStorageKey = 'macrossvoxp-gamepad-controls-v5';
  const legacyStorageKey = 'macrossvoxp-keyboard-controls-v1';
  const legacyGamepadStorageKey = 'macrossvoxp-gamepad-controls-v4';
  const actionNames = Object.keys(kbDefaults);
  const gamepadActionNames = Object.keys(padDefaults);
  const gamepadDiagramObjects = {
    xbox: document.getElementById('gamepadDiagramXbox'),
    ps2: document.getElementById('gamepadDiagramPs2')
  };
  const gamepadDiagramPaths = {
    xbox: {
      'axis1-': ['path129', 'path128'], 'axis1+': ['path117', 'path116'],
      'axis0-': ['path121', 'path120'], 'axis0+': ['path123', 'path122'],
      'axis3-': ['path131', 'path130'], 'axis3+': ['path115', 'path114'],
      'axis2-': ['path125', 'path124'], 'axis2+': ['path127', 'path126'],
      button0: ['path133', 'path132'], button1: ['path139', 'path138'],
      button2: ['path137', 'path136'], button3: ['path153', 'path152'],
      button4: ['path113', 'path112'], button5: ['path111', 'path110'],
      button6: ['path109', 'path108'], button7: ['path107', 'path106'],
      button8: ['path141', 'path140'], button9: ['path143', 'path142'],
      button10: ['path145', 'path144'],
      button11: ['path119', 'path118'],
      button12: ['path151', 'path150'], button13: ['path135', 'path134'],
      button14: ['path147', 'path146'], button15: ['path149', 'path148']
    },
    ps2: {
      'axis1-': ['path46', 'path45'], 'axis1+': ['path30', 'path29'],
      'axis0-': ['path38', 'path37'], 'axis0+': ['path40', 'path39'],
      'axis3-': ['path48', 'path47'], 'axis3+': ['path32', 'path31'],
      'axis2-': ['path42', 'path41'], 'axis2+': ['path44', 'path43'],
      button0: ['path50', 'path49'], button1: ['path56', 'path55'],
      button2: ['path54', 'path53'], button3: ['path69', 'path68'],
      button4: ['path26', 'path25'], button5: ['path28', 'path27'],
      button6: ['path22', 'path21'], button7: ['path24', 'path23'],
      button8: ['path64', 'path63'], button9: ['path62', 'path61'],
      button10: ['path34', 'path33'], button11: ['path36', 'path35'],
      button12: ['path66', 'path65'], button13: ['path52', 'path51'],
      button14: ['path58', 'path57'], button15: ['path60', 'path59']
    }
  };
  const gamepadDiagramColors = {
    flight: '#38bdf8', transform: '#f59e0b', attack: '#f87171',
    systems: '#22c55e', menu: '#94a3b8', neutral: '#163d56'
  };
  let activeGamepadDiagram = 'xbox';
  let lastDetectedGamepadDiagram = null;
  let gamepadMissingSince = null;
  const labelMap = {
    KeyW: 'W', KeyS: 'S', KeyA: 'A', KeyD: 'D', KeyF: 'F', KeyG: 'G', KeyB: 'B', KeyE: 'E',
    KeyT: 'T', KeyR: 'R', KeyN: 'N', KeyX: 'X', KeyP: 'P', KeyM: 'M', KeyH: 'H', KeyY: 'Y',
    ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', ShiftLeft: 'SHIFT IZQ.', ShiftRight: 'SHIFT DER.',
    Space: 'ESPACIO', Tab: 'TAB', Escape: 'ESC', Enter: 'ENTER', NumpadEnter: 'NUM ENTER', NumpadAdd: 'NUM +',
    NumpadSubtract: 'NUM −', NumpadMultiply: 'NUM ×', NumpadDivide: 'NUM ÷', NumpadDecimal: 'NUM .', NumLock: 'NUM LOCK',
    none: 'SIN ASIGNAR', ControlLeft: 'CTRL IZQ.', ControlRight: 'CTRL DER.', AltLeft: 'ALT IZQ.', AltRight: 'ALT GR', MetaLeft: 'WIN'
  };
  const padButtonNames = {
    0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT',
    8: 'SELEC. / ATRÁS', 9: 'INICIO', 10: 'L3 · CLIC', 11: 'R3 · CLIC',
    12: 'CRUCETA ↑', 13: 'CRUCETA ↓', 14: 'CRUCETA ←', 15: 'CRUCETA →'
  };
  const flightModes = ['FIGHTER', 'GERWALK', 'BATTROID'];
  const actionContexts = {
    startMission: ['TITLE'],
    returnMenu: flightModes,
    restartAfterDefeat: ['DEFEAT'],
    menuAfterDefeat: ['DEFEAT'],
    tracking: ['BATTROID'],
    targetLock: ['BATTROID'],
    reverse: ['GERWALK'],
    moveLeft: ['GERWALK'], moveRight: ['GERWALK'],
    turnLeft: ['FIGHTER', 'BATTROID'], turnRight: ['FIGHTER', 'BATTROID'],
    gerwalkUp: ['GERWALK'],
    gerwalkDown: ['GERWALK'],
    strafeLeft: ['GERWALK', 'BATTROID'],
    strafeRight: ['GERWALK', 'BATTROID'],
    descend: ['GERWALK', 'BATTROID'],
    slowdown: ['FIGHTER', 'GERWALK'],
    transformPrevious: ['FIGHTER', 'GERWALK'],
    cameraMissiles: flightModes,
    cameraEnemy: flightModes,
    cameraLeft: flightModes,
    cameraRight: flightModes
  };
  const actionScopeLabels = {
    moveForward: 'FIGHTER: ACELERAR · OTROS: AVANZAR', moveBack: 'FIGHTER: FRENAR · OTROS: RETROCEDER',
    moveLeft: 'FIGHTER: GUIÑADA · OTROS: GIRO', moveRight: 'FIGHTER: GUIÑADA · OTROS: GIRO',
    turnLeft: 'FIGHTER: ALABEO · OTROS: GIRO', turnRight: 'FIGHTER: ALABEO · OTROS: GIRO',
    verticalUp: 'FIGHTER: CABECEO · OTROS: ASCENSO', verticalDown: 'FIGHTER: CABECEO · OTROS: DESCENSO',
    turbo: 'IMPULSO / PROPULSORES', reverse: 'SOLO GERWALK', tracking: 'SOLO BATTROID',
    targetLock: 'SOLO BATTROID · MANTENER', strafeLeft: 'GERWALK · BATTROID', strafeRight: 'GERWALK · BATTROID',
    descend: 'GERWALK · BATTROID', slowdown: 'FIGHTER · GERWALK',
    transformPrevious: 'SECUENCIA DE MODOS', transformNext: 'SECUENCIA DE MODOS',
    gunpod: 'DURANTE LA PARTIDA · TODOS LOS MODOS', missiles: 'DURANTE LA PARTIDA · TODOS LOS MODOS',
    missileType: 'DURANTE LA PARTIDA · SELECT / BACK', chaff: 'DURANTE LA PARTIDA · R3', brake: 'DURANTE LA PARTIDA',
    startMission: 'MENÚ INICIAL', returnMenu: 'DURANTE LA PARTIDA',
    restartAfterDefeat: 'TRAS DERROTA', menuAfterDefeat: 'TRAS DERROTA',
    pause: 'DURANTE LA PARTIDA', music: 'DURANTE LA PARTIDA', advanceTime: 'DURANTE LA PARTIDA'
  };
  const gamepadScopeLabels = {
    moveForward: 'CRUCETA ↑ · EMPUJE / AVANCE', moveBack: 'CRUCETA ↓ · REDUCIR / RETROCEDER',
    moveLeft: 'GERWALK: GIRO IZQUIERDO', moveRight: 'GERWALK: GIRO DERECHO',
    turnLeft: 'FIGHTER: ALABEO · BATTROID: GIRO IZQ.', turnRight: 'FIGHTER: ALABEO · BATTROID: GIRO DER.',
    verticalUp: 'STICK IZQ. ↓ · SUBIR NARIZ', verticalDown: 'STICK IZQ. ↑ · BAJAR NARIZ',
    gerwalkUp: 'STICK DER. ↑ · SUBIR EN GERWALK', gerwalkDown: 'STICK DER. ↓ · BAJAR EN GERWALK',
    turbo: 'RT · MANTENER TURBO', reverse: 'LT · MANTENER REVERSA GERWALK',
    slowdown: 'SIN ASIGNAR',
    strafeLeft: 'FIGHTER: GIRO CERRADO · OTROS: LATERAL',
    strafeRight: 'FIGHTER: GIRO CERRADO · OTROS: LATERAL',
    descend: 'SIN ASIGNAR', chaff: 'R3 · CHAFF / FLARES'
  };
  const continuousActions = ['moveForward', 'moveBack', 'moveLeft', 'moveRight', 'turnLeft', 'turnRight', 'verticalUp', 'verticalDown', 'gunpod', 'missiles', 'brake'];

  const optionsScreen = document.getElementById('optionsScreen');
  const statusEl = document.getElementById('bindingStatus');
  const startOptionsButton = document.getElementById('btnOptions');
  const optionsButtons = [startOptionsButton, document.getElementById('btnOptionsHud')].filter(Boolean);
  const closeButtons = [document.getElementById('btnCloseOptions'), document.getElementById('btnBackOptions')].filter(Boolean);
  const tabs = [...document.querySelectorAll('[data-options-tab]')];
  const categoryTabs = [...document.querySelectorAll('[data-options-category]')];
  let optionsOpen = false;
  let pauseOptionsOpen = false;
  let listeningAction = null;
  let listeningPadAction = null;
  let optionsTrigger = startOptionsButton;
  let previousPadSnapshot = { buttons: [], axes: [] };
  let previousPadActions = new Set();
  let previousMenuAccept = false;
  let previousMenuBack = false;
  let lastMenuDirection = null;
  let lastMenuDirectionAt = 0;
  initBindingRows();
  let bindings = readMap(storageKey, kbDefaults, legacyStorageKey);
  let gamepadBindings = readMap(gamepadStorageKey, padDefaults, legacyGamepadStorageKey);

  // Lee las asignaciones guardadas. Si no hay datos nuevos, migra las antiguas:
  // el botón que tenía una acción pasa a cada modo donde esa acción existe.
  function readMap(key, fallback, legacyKey) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      const legacy = saved ? null : JSON.parse(localStorage.getItem(legacyKey) || 'null');
      const candidate = { ...fallback };
      Object.keys(fallback).forEach(id => {
        if (saved && typeof saved[id] === 'string') candidate[id] = saved[id];
        else if (legacy && typeof legacy[baseOf(id)] === 'string') candidate[id] = legacy[baseOf(id)];
      });
      return candidate;
    } catch (_) {
      return { ...fallback };
    }
  }

  // Genera las secciones VUELO · FIGHTER / GERWALK / BATTROID y limpia filas obsoletas.
  function initBindingRows() {
    [['keyboardPane', false], ['gamepadPane', true]].forEach(([paneId, isPad]) => {
      const pane = document.getElementById(paneId);
      const anchor = pane?.querySelector('.binding-group > h4.group-flight')?.closest('.binding-group');
      if (anchor) {
        const lists = isPad ? padModeActions : kbModeActions;
        const labels = isPad ? padModeLabels : kbModeLabels;
        const fragment = document.createDocumentFragment();
        SCOPED_MODES.forEach(mode => {
          const section = document.createElement('section');
          section.className = 'binding-group mode-group';
          section.dataset.mode = mode;
          const heading = document.createElement('h4');
          heading.className = 'group-flight';
          heading.dataset.mode = mode;
          heading.textContent = ({ FIGHTER: 'Fighter', GERWALK: 'GERWALK', BATTROID: 'Battroid' })[mode] || mode;
          section.appendChild(heading);
          lists[mode].forEach(action => {
            const row = document.createElement('div');
            row.className = isPad ? 'gamepad-binding-row' : 'binding-row';
            row.dataset.bindingId = `${action}@${mode}`;
            row.dataset.mode = mode;
            const name = document.createElement('span');
            name.textContent = labels[mode][action] || action;
            const value = document.createElement('kbd');
            value.className = isPad ? 'pad-binding-value' : 'binding-value';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = isPad ? 'pad-rebind-button' : 'rebind-button';
            button.textContent = 'CAMBIAR';
            row.append(name, value, button);
            section.appendChild(row);
          });
          fragment.appendChild(section);
        });
        anchor.replaceWith(fragment);

        // Distribuye los bloques por peso para mantener equilibradas las dos columnas.
        const columnSelector = isPad ? '.pad-binding-column' : '.binding-column';
        const columns = Array.from(pane.querySelectorAll(columnSelector));
        const modeGroups = {};
        pane.querySelectorAll('.binding-group.mode-group').forEach(group => { modeGroups[group.dataset.mode] = group; });
        const ordinaryGroups = Array.from(pane.querySelectorAll('.binding-group:not(.mode-group)'));
        const groupWithHeading = className => ordinaryGroups.find(group => group.querySelector('.' + className));
        const transformGroup = groupWithHeading('group-transform');
        const attackGroup = groupWithHeading('group-attack');
        const systemsGroup = groupWithHeading('group-systems');
        const menuGroup = groupWithHeading('group-menu');
        if (columns.length >= 2 && modeGroups.FIGHTER && modeGroups.GERWALK && modeGroups.BATTROID &&
            transformGroup && attackGroup && systemsGroup && menuGroup) {
          columns[0].replaceChildren(modeGroups.FIGHTER, modeGroups.GERWALK, transformGroup);
          columns[1].replaceChildren(modeGroups.BATTROID, attackGroup, systemsGroup, menuGroup);
        }
      }
      const known = isPad ? padDefaults : kbDefaults;
      pane?.querySelectorAll(isPad ? '.gamepad-binding-row[data-pad-action]' : '.binding-row[data-action]').forEach(row => {
        const id = isPad ? row.dataset.padAction : row.dataset.action;
        if (!(id in known)) { row.remove(); return; } // acción ahora por modo
        row.dataset.bindingId = id;
      });
    });
  }

  function validCode(code) {
    return code === 'none' || (typeof code === 'string' && /^[A-Za-z][A-Za-z0-9]{0,23}$/.test(code));
  }

  function keyLabel(code) {
    if (!code || code === 'none') return (typeof t === 'function') ? t('unassigned') : 'SIN ASIGNAR';
    if (labelMap[code]) return labelMap[code];
    if (code.startsWith('Numpad')) return `NUM ${code.slice(6).toUpperCase()}`;
    return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Arrow/, '').toUpperCase();
  }

  function padLabel(input) {
    if (!input || input === 'none') return (typeof t === 'function') ? t('unassigned') : 'SIN ASIGNAR';
    if (input.startsWith('button')) return padButtonNames[input.slice(6)] || `BOTÓN ${Number(input.slice(6)) + 1}`;
    const match = input.match(/^axis([0-3])([+-])$/);
    if (!match) return input.toUpperCase();
    const axisIdx = Number(match.at(1));
    const dirIdx = match.at(2) === '-' ? 0 : 1;
    const labels = [
      ['STICK IZQ. ←', 'STICK IZQ. →'], ['STICK IZQ. ↑', 'STICK IZQ. ↓'],
      ['STICK DER. ←', 'STICK DER. →'], ['STICK DER. ↑', 'STICK DER. ↓']
    ];
    return labels.at(axisIdx).at(dirIdx);
  }

  function contextsFor(id, device) {
    const mode = modeOf(id);
    if (mode) return [mode];
    const action = baseOf(id);
    if (actionContexts[action]) return actionContexts[action];
    if (action === 'startMission') return ['TITLE'];
    if (action === 'restartAfterDefeat' || action === 'menuAfterDefeat') return ['DEFEAT'];
    return flightModes;
  }

  function mayShare(first, second, device) {
    const a = baseOf(first);
    const b = baseOf(second);
    if (device === 'gamepad' && ((a === 'missiles' && b === 'targetLock') || (a === 'targetLock' && b === 'missiles'))) return true;
    const firstContexts = contextsFor(first, device);
    const secondContexts = contextsFor(second, device);
    return !firstContexts.some(context => secondContexts.includes(context));
  }

  function conflictsFor(map, device) {
    const conflicts = new Set();
    const names = Object.keys(map);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i];
        const b = names[j];
        if (!map[a] || map[a] === 'none' || map[a] !== map[b] || mayShare(a, b, device)) continue;
        conflicts.add(a);
        conflicts.add(b);
      }
    }
    return conflicts;
  }

  function allConflicts() {
    return { keyboard: conflictsFor(bindings, 'keyboard'), gamepad: conflictsFor(gamepadBindings, 'gamepad') };
  }

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('error', isError);
  }

  function shakePanel() {
    const panel = document.querySelector('.options-panel');
    if (!panel) return;
    panel.classList.remove('is-shaking');
    void panel.offsetWidth;
    panel.classList.add('is-shaking');
    setTimeout(() => panel.classList.remove('is-shaking'), 360);
  }

  function updateConflictUI() {
    const conflicts = allConflicts();
    document.querySelectorAll('.binding-row[data-binding-id]').forEach(row => {
      const conflict = conflicts.keyboard.has(row.dataset.bindingId);
      row.classList.toggle('has-conflict', conflict);
      row.querySelector('.binding-value').classList.toggle('has-conflict', conflict);
    });
    document.querySelectorAll('.gamepad-binding-row[data-binding-id]').forEach(row => {
      const conflict = conflicts.gamepad.has(row.dataset.bindingId);
      row.classList.toggle('has-conflict', conflict);
      row.querySelector('.pad-binding-value').classList.toggle('has-conflict', conflict);
    });
    document.querySelectorAll('.keyboard-key[data-key-code]').forEach(button => {
      button.classList.toggle('has-conflict', [...conflicts.keyboard].some(action => bindings[action] === button.dataset.keyCode));
    });
    const activeCategory = document.querySelector('[data-options-category].active')?.dataset.optionsCategory;
    const activeDevice = document.querySelector('[data-options-tab].active')?.dataset.optionsTab;
    let visibleConflicts = new Set();
    let visibleName = '';
    if (optionsOpen && activeCategory === 'controlsOptions') {
      if (activeDevice === 'gamepadPane') {
        visibleConflicts = conflicts.gamepad;
        visibleName = 'mando';
      } else {
        visibleConflicts = conflicts.keyboard;
        visibleName = 'teclado';
      }
    }
    if (visibleConflicts.size) {
      setStatus(`Hay ${visibleConflicts.size} asignaciones del ${visibleName} en conflicto. Están marcadas en rojo; corrígelas para guardar o salir.`, true);
    } else if (statusEl?.classList.contains('error')) {
      setStatus('');
    }
    return conflicts;
  }

  function hasAnyConflict() {
    const conflicts = allConflicts();
    return conflicts.keyboard.size > 0 || conflicts.gamepad.size > 0;
  }

  function revealConflictTab() {
    const conflicts = allConflicts();
    if (conflicts.gamepad.size) {
      const tab = categoryTabs.find(button => button.dataset.optionsCategory === 'controlsOptions');
      if (tab && !tab.classList.contains('active')) openCategory(tab);
      const deviceTab = tabs.find(button => button.dataset.optionsTab === 'gamepadPane');
      if (deviceTab && !deviceTab.classList.contains('active')) openTab(deviceTab);
    } else if (conflicts.keyboard.size) {
      const tab = categoryTabs.find(button => button.dataset.optionsCategory === 'controlsOptions');
      if (tab && !tab.classList.contains('active')) openCategory(tab);
      const deviceTab = tabs.find(button => button.dataset.optionsTab === 'keyboardPane');
      if (deviceTab && !deviceTab.classList.contains('active')) openTab(deviceTab);
    }
    updateConflictUI();
    shakePanel();
  }

  function idsForCode(code) {
    return actionNames.filter(id => bindings[id] === code);
  }

  // Acciones activadas por una tecla en el modo actual (o en todos con allModes).
  function actionsForCode(code, options = {}) {
    const mode = options.allModes ? null : currentFlightMode();
    const found = [];
    idsForCode(code).forEach(id => {
      const idMode = modeOf(id);
      if (idMode && mode && idMode !== mode) return;
      const action = baseOf(id);
      if (!found.includes(action)) found.push(action);
    });
    return found;
  }

  // Acciones del mando para una entrada, en todos los modos (se usa para colorear el esquema).
  function actionsForPadInput(input) {
    const found = [];
    gamepadActionNames.forEach(id => {
      if (gamepadBindings[id] !== input || input === 'none') return;
      const action = baseOf(id);
      if (!found.includes(action)) found.push(action);
    });
    return found;
  }

  function kbValue(action, mode) {
    return bindings[bindingId(action, mode || currentFlightMode() || 'FIGHTER', 'keyboard')] || 'none';
  }

  function renderGamepadDiagram() {
    const controller = gamepadDiagramObjects[activeGamepadDiagram];
    const svgDocument = controller?.contentDocument;
    if (!svgDocument) return;
    const base = svgDocument.getElementById('path1');
    if (base) base.style.fill = gamepadDiagramColors.flight;
    // These are the uncolored, combined control traces left beneath the pieces
    // separated in the supplied SVG. The separate pieces below are the only
    // elements whose colors follow the player's bindings.
    const combinedXboxTrace = svgDocument.getElementById('path105');
    if (combinedXboxTrace) combinedXboxTrace.style.display = 'none';
    const traceSpeck = svgDocument.getElementById(activeGamepadDiagram === 'xbox' ? 'path105-6' : 'path67');
    if (traceSpeck) traceSpeck.style.display = 'none';

    svgDocument.querySelectorAll('path').forEach(zone => {
      if (zone === base || zone === combinedXboxTrace || zone === traceSpeck) return;
      zone.style.fill = gamepadDiagramColors.neutral;
      zone.style.fillOpacity = '0.4';
    });

    const pathsByInput = gamepadDiagramPaths[activeGamepadDiagram];
    Object.entries(pathsByInput).forEach(([input, ids]) => {
      const actions = actionsForPadInput(input);
      const action = actions[0];
      const color = action ? gamepadDiagramColors[categories[action]] : gamepadDiagramColors.neutral;
      ids.forEach(id => {
        const zone = svgDocument.getElementById(id);
        if (!zone) return;
        zone.style.fill = color;
        zone.style.fillOpacity = action ? '0.88' : '0.4';
      });
    });
  }

  function renderHelp() {
    const help = document.getElementById('controlsHelp');
    if (!help) return;
    const k = (action, mode) => keyLabel(kbValue(action, mode));
    const flightLine = (mode, title, moveNames) => `<b>${title}:</b> ${k('moveForward', mode)}/${k('moveBack', mode)} ${moveNames[0]} | ${k('moveLeft', mode)}/${k('moveRight', mode)} ${moveNames[1]} | ${k('turnLeft', mode)}/${k('turnRight', mode)} ${moveNames[2]} | ${k('verticalUp', mode)}/${k('verticalDown', mode)} ${moveNames[3]}<br>`;
    help.innerHTML = flightLine('FIGHTER', 'FIGHTER', ['THROTTLE', 'YAW', 'ROLL', 'PITCH']) +
      flightLine('GERWALK', 'GERWALK', ['AVANCE', 'LATERAL', 'GIRAR', 'SUBIR/BAJAR']) +
      flightLine('BATTROID', 'BATTROID', ['AVANCE', 'LATERAL', 'GIRAR', 'ELEVAR/DESCENDER']) +
      `<b>MODOS:</b> ${k('fighter')} FIGHTER | ${k('gerwalk')} GERWALK | ${k('battroid')} BATTROID<br>` +
      `<b>SISTEMAS:</b> ${k('turbo')} TURBO | ${k('reverse', 'GERWALK')} REVERSA | ${k('brake')} STOP | ${k('pause')} PAUSA | ${k('music')} MÚSICA | ${k('advanceTime')} +2 H<br>` +
      `<b>COMBATE:</b> ${k('gunpod')} GUNPOD | ${k('missiles')} MISILES | ${k('missileType')} TIPO MSL | ${k('tracking')} RASTREO (B) | ${k('melee')} GOLPE<br>` +
      `<b>MENÚ:</b> ${k('startMission')} INICIAR | ${k('returnMenu')} SALIR | ${k('restartAfterDefeat')}/${k('menuAfterDefeat')} TRAS DERROTA`;
    document.querySelectorAll('[data-binding-label]').forEach(el => { el.textContent = keyLabel(kbValue(el.dataset.bindingLabel, el.dataset.mode)); });
  }

  function renderKeyboard() {
    document.querySelectorAll('.keyboard-key[data-key-code]').forEach(button => {
      const code = button.dataset.keyCode;
      const usedActions = idsForCode(code).map(baseOf);
      button.classList.remove('is-bound', 'is-listening', 'category-flight', 'category-transform', 'category-attack', 'category-systems', 'category-menu');
      if (usedActions.length) {
        button.classList.add('is-bound');
        new Set(usedActions.map(action => categories[action])).forEach(category => button.classList.add(`category-${category}`));
      }
      if (listeningAction && bindings[listeningAction] === code) button.classList.add('is-listening');
    });
  }

  function renderBindings() {
    document.querySelectorAll('.binding-row[data-binding-id]').forEach(row => {
      const id = row.dataset.bindingId;
      row.dataset.category = categories[baseOf(id)];
      updateScopeLabel(row, baseOf(id), false);
      const kbUnassigned = !bindings[id] || bindings[id] === 'none';
      row.querySelector('.binding-value').textContent = keyLabel(bindings[id] || 'none');
      row.classList.toggle('is-unassigned', kbUnassigned);
      row.querySelector('.binding-value').classList.toggle('is-unassigned', kbUnassigned);
      row.classList.toggle('is-listening', id === listeningAction);
      row.querySelector('.rebind-button').textContent = id === listeningAction
        ? ((typeof t === 'function') ? t('listeningKey') : 'PULSA TECLA')
        : ((typeof t === 'function') ? t('rebindBtn') : 'CAMBIAR');
    });
    document.querySelectorAll('.gamepad-binding-row[data-binding-id]').forEach(row => {
      const id = row.dataset.bindingId;
      row.dataset.category = categories[baseOf(id)];
      updateScopeLabel(row, baseOf(id), true);
      const padUnassigned = !gamepadBindings[id] || gamepadBindings[id] === 'none';
      row.querySelector('.pad-binding-value').textContent = padLabel(gamepadBindings[id]);
      row.classList.toggle('is-unassigned', padUnassigned);
      row.querySelector('.pad-binding-value').classList.toggle('is-unassigned', padUnassigned);
      row.classList.toggle('is-listening', id === listeningPadAction);
      row.querySelector('.pad-rebind-button').textContent = id === listeningPadAction
        ? ((typeof t === 'function') ? t('listeningPad') : 'PRESIONA')
        : ((typeof t === 'function') ? t('rebindBtn') : 'CAMBIAR');
    });
    renderKeyboard();
    renderGamepadDiagram();
    renderHelp();
    updateConflictUI();
  }

  function updateScopeLabel(row, action, isGamepad) {
    if (row.dataset.mode) return; // las filas por modo ya tienen su etiqueta propia
    const name = row.querySelector(':scope > span');
    const label = isGamepad ? (gamepadScopeLabels[action] || actionScopeLabels[action]) : actionScopeLabels[action];
    if (!name || !label) return;
    let scope = name.querySelector('.binding-scope');
    if (!scope) {
      scope = document.createElement('small');
      scope.className = 'binding-scope';
      name.appendChild(scope);
    }
    scope.textContent = label;
  }

  function persistAll() {
    updateConflictUI();
    if (hasAnyConflict()) {
      revealConflictTab();
      return false;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(bindings));
      localStorage.setItem(gamepadStorageKey, JSON.stringify(gamepadBindings));
      setStatus('Configuración de teclado y mando guardada en este navegador.');
      return true;
    } catch (_) {
      setStatus('No se pudo guardar. El navegador bloqueó el almacenamiento local.', true);
      return false;
    }
  }


  // ---------- Ventanita de asignación: ASIGNAR / LIMPIAR / CANCELAR ----------
  let rebindTarget = null;
  let captureArmed = false;
  let rebindModal = null;
  function rowName(id, device) {
    const selector = device === 'gamepad'
      ? '.gamepad-binding-row[data-binding-id="' + id + '"]'
      : '.binding-row[data-binding-id="' + id + '"]';
    const span = document.querySelector(selector + ' > span');
    if (!span) return baseOf(id);
    let text = '';
    span.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) text += node.textContent; });
    const mode = modeOf(id);
    return (text.trim() || baseOf(id)) + (mode ? ' (' + mode + ')' : '');
  }
  function ensureRebindModal() {
    if (rebindModal) return rebindModal;
    rebindModal = document.createElement('div');
    rebindModal.id = 'rebindModal';
    rebindModal.className = 'rebind-modal';
    rebindModal.hidden = true;
    rebindModal.setAttribute('role', 'alertdialog');
    rebindModal.setAttribute('aria-live', 'polite');
    rebindModal.innerHTML =
      '<div class="rebind-modal-backdrop"></div>' +
      '<section class="rebind-modal-card">' +
      '<p class="rebind-modal-title"></p>' +
      '<div class="rebind-modal-values"><span>ACTUAL <kbd data-rm="current"></kbd></span><span>NUEVA <kbd data-rm="new">—</kbd></span></div>' +
      '<p class="rebind-modal-hint"></p>' +
      '<div class="rebind-modal-actions">' +
      '<button type="button" data-rm-action="assign" class="options-save">ASIGNAR</button>' +
      '<button type="button" data-rm-action="clear" class="options-secondary">LIMPIAR</button>' +
      '<button type="button" data-rm-action="cancel" class="options-secondary">CANCELAR</button>' +
      '</div></section>';
    optionsScreen.appendChild(rebindModal);
    rebindModal.querySelector('[data-rm-action="assign"]').addEventListener('click', startCapture);
    rebindModal.querySelector('[data-rm-action="clear"]').addEventListener('click', clearListening);
    rebindModal.querySelector('[data-rm-action="cancel"]').addEventListener('click', cancelListening);
    return rebindModal;
  }
  function openRebindModal(device, action) {
    const modal = ensureRebindModal();
    rebindTarget = { device, action };
    captureArmed = false;
    listeningAction = null;
    listeningPadAction = null;
    const current = device === 'gamepad' ? padLabel(gamepadBindings[action]) : keyLabel(bindings[action]);
    const tr = (k, fb) => (typeof t === 'function') ? t(k) : fb;
    modal.querySelector('.rebind-modal-title').textContent = rowName(action, device);
    modal.querySelector('.rebind-modal-values').innerHTML =
      '<span>' + tr('rmCurrent', 'ACTUAL') + ' <kbd data-rm="current">' + current + '</kbd></span>' +
      '<span>' + tr('rmNew', 'NUEVA') + ' <kbd data-rm="new">—</kbd></span>';
    modal.querySelector('.rebind-modal-hint').textContent = tr('rmHintInit', 'Elige ASIGNAR para capturar una entrada, LIMPIAR para dejarla libre o CANCELAR para conservarla.');
    modal.querySelector('.rebind-modal-hint').classList.remove('is-warning');
    const assignButton = modal.querySelector('[data-rm-action="assign"]');
    assignButton.disabled = false;
    assignButton.textContent = device === 'gamepad' ? tr('rmAssignBtn', 'ASIGNAR BOTÓN') : tr('rmAssignKey', 'ASIGNAR TECLA');
    modal.querySelector('[data-rm-action="clear"]').textContent = tr('rmClear', 'LIMPIAR');
    modal.querySelector('[data-rm-action="cancel"]').textContent = tr('rmCancel', 'CANCELAR');

    modal.hidden = false;
    if (device === 'gamepad') {
      window.dispatchEvent(new CustomEvent('macross:focus-element', { detail: { element: assignButton } }));
    } else {
      assignButton.focus({ preventScroll: true });
    }
  }
  function closeRebindModal() {
    rebindTarget = null;
    captureArmed = false;
    listeningAction = null;
    listeningPadAction = null;
    if (rebindModal) rebindModal.hidden = true;
  }
  function startCapture() {
    if (!rebindTarget || captureArmed) return;
    captureArmed = true;
    listeningAction = rebindTarget.device === 'keyboard' ? rebindTarget.action : null;
    listeningPadAction = rebindTarget.device === 'gamepad' ? rebindTarget.action : null;
    const hint = rebindModal.querySelector('.rebind-modal-hint');
    const assignButton = rebindModal.querySelector('[data-rm-action="assign"]');
    rebindModal.querySelector('[data-rm="new"]').textContent = '—';
    assignButton.textContent = 'ESPERANDO…';
    assignButton.disabled = true;
    hint.textContent = rebindTarget.device === 'gamepad'
      ? 'Presiona el botón o mueve el stick que quieras asignar. B cancela.'
      : 'Presiona la tecla que quieras asignar. ESC cancela.';
    hint.classList.remove('is-warning');
    if (rebindTarget.device === 'gamepad') {
      previousPadSnapshot = snapshotPad(getConnectedGamepad());
      const status = document.getElementById('gamepadStatus');
      if (status && !getConnectedGamepad()) status.textContent = 'No se detecta el mando. Conéctalo y presiona un botón para asignarlo.';
    }
    renderBindings();
  }
  function setPending(device, action, value) {
    if (!captureArmed || !rebindTarget || rebindTarget.device !== device || rebindTarget.action !== action) return;
    closeRebindModal();
    if (device === 'gamepad') assignGamepad(action, value);
    else assignKeyboard(action, value);
  }
  function clearListening() {
    if (!rebindTarget) return;
    const { device, action } = rebindTarget;
    closeRebindModal();
    if (device === 'gamepad') assignGamepad(action, 'none');
    else assignKeyboard(action, 'none');
    if (!hasAnyConflict()) setStatus('Función dejada sin asignar. Puedes salir; no se usará hasta que le asignes un botón.');
  }
  function cancelListeningSilently() { closeRebindModal(); }
  function cancelListening() {
    const wasRebinding = Boolean(rebindTarget);
    closeRebindModal();
    if (wasRebinding) { setStatus('Cambio cancelado.'); renderBindings(); }
  }
  function beginKeyboardListening(action) {
    openRebindModal('keyboard', action);
    renderBindings();
  }
  function beginGamepadListening(action) {
    openRebindModal('gamepad', action);
    renderBindings();
  }
  function assignKeyboard(action, code) {
    if (!validCode(code)) return false;
    bindings[action] = code;
    listeningAction = null;
    renderBindings();
    if (allConflicts().keyboard.size) return false;
    if (code !== 'none') setStatus(`${keyLabel(code)} asignada. Guarda los cambios para conservarlos.`, false);
    return true;
  }

  function assignGamepad(action, input) {
    gamepadBindings[action] = input;
    listeningPadAction = null;
    renderBindings();
    if (allConflicts().gamepad.size) return false;
    if (input !== 'none') setStatus(`${padLabel(input)} asignado. Guarda los cambios para conservarlos.`, false);
    return true;
  }

  function openTab(tab) {
    tabs.forEach(button => {
      const active = button === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.options-pane').forEach(pane => {
      const active = pane.id === tab.dataset.optionsTab;
      pane.classList.toggle('active', active);
      pane.hidden = !active;
    });
    cancelListeningSilently();
    renderBindings();
  }

  function diagramTypeForGamepad(pad) {
    const id = String(pad?.id || '').toLowerCase();
    return /(xbox|xinput|microsoft|045e)/.test(id) ? 'xbox' : 'ps2';
  }

  function syncGamepadDiagram(pad) {
    let nextType;
    if (pad?.connected) {
      gamepadMissingSince = null;
      nextType = diagramTypeForGamepad(pad);
    } else {
      // Browsers can report a new connection event just before getGamepads()
      // refreshes its snapshot. Keep the current diagram briefly during that gap.
      if (lastDetectedGamepadDiagram === null) return;
      if (gamepadMissingSince === null) gamepadMissingSince = performance.now();
      if (performance.now() - gamepadMissingSince < 900) return;
      gamepadMissingSince = null;
      nextType = null;
    }
    if (nextType === lastDetectedGamepadDiagram) return;
    lastDetectedGamepadDiagram = nextType;

    const gamepadTab = tabs.find(tab => tab.dataset.optionsTab === 'gamepadPane');
    if (gamepadTab) gamepadTab.hidden = !nextType;
    if (!nextType) {
      const activeTab = document.querySelector('[data-options-tab].active');
      if (activeTab?.dataset.optionsTab === 'gamepadPane') {
        const keyboardTab = tabs.find(tab => tab.dataset.optionsTab === 'keyboardPane');
        if (keyboardTab) openTab(keyboardTab);
      }
      return;
    }

    activeGamepadDiagram = nextType;
    Object.entries(gamepadDiagramObjects).forEach(([name, controller]) => {
      if (controller) controller.hidden = name !== nextType;
    });
    renderGamepadDiagram();
  }

  function openCategory(tab) {
    categoryTabs.forEach(button => {
      const active = button === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.options-category-panel').forEach(panel => {
      const active = panel.id === tab.dataset.optionsCategory;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
    cancelListeningSilently();
    if (tab.dataset.optionsCategory !== 'audioOptions') {
      const tester = document.getElementById('soundTester');
      if (tester) tester.pause();
    }
    renderBindings();
  }

  function showOptions(trigger, fromPause = false) {
    optionsTrigger = trigger || null;
    pauseOptionsOpen = fromPause;
    optionsOpen = true;
    cancelListeningSilently();
    optionsScreen.classList.remove('hidden');
    setStatus(fromPause
      ? 'Partida en pausa · los cambios se aplican al instante.'
      : 'Los controles se aplican al instante; los volúmenes se guardan automáticamente.');
    document.getElementById('btnContinueGame').hidden = !fromPause;
    document.getElementById('btnExitToTitle').hidden = !fromPause;
    document.getElementById('btnBackOptions').hidden = fromPause;
    renderBindings();
    window.dispatchEvent(new CustomEvent('macross:clear-inputs'));
    if (fromPause) {
      document.getElementById('btnCloseOptions').setAttribute('aria-label', 'Continuar jugando');
      document.dispatchEvent(new CustomEvent('macross:options-opened', { detail: { pause: true } }));
    } else {
      document.getElementById('btnCloseOptions').setAttribute('aria-label', 'Volver al menú');
      document.getElementById('btnCloseOptions').focus();
    }
  }

  function openOptions(event) {
    showOptions(event.currentTarget, false);
  }

  function openPauseOptions() {
    showOptions(null, true);
  }

  function closeOptions() {
    updateConflictUI();
    if (hasAnyConflict()) {
      revealConflictTab();
      return false;
    }
    const wasPauseMenu = pauseOptionsOpen;
    optionsOpen = false;
    pauseOptionsOpen = false;
    cancelListeningSilently();
    optionsScreen.classList.add('hidden');
    const tester = document.getElementById('soundTester');
    if (tester) tester.pause();
    setStatus('');
    window.dispatchEvent(new CustomEvent('macross:clear-inputs'));
    if (wasPauseMenu) {
      window.dispatchEvent(new CustomEvent('macross:resume-game'));
      document.activeElement?.blur();
    }
    if (optionsTrigger?.isConnected && !optionsTrigger.closest('.hidden')) optionsTrigger.focus();
    else if (!wasPauseMenu && startOptionsButton) startOptionsButton.focus();
    return true;
  }

  optionsButtons.forEach(button => button.addEventListener('click', openOptions));
  closeButtons.forEach(button => button.addEventListener('click', closeOptions));
  document.getElementById('btnContinueGame')?.addEventListener('click', closeOptions);
  tabs.forEach(tab => tab.addEventListener('click', () => openTab(tab)));
  categoryTabs.forEach(tab => tab.addEventListener('click', () => openCategory(tab)));
  Object.values(gamepadDiagramObjects).filter(Boolean).forEach(controller => controller.addEventListener('load', renderGamepadDiagram));
  window.addEventListener('gamepadconnected', event => syncGamepadDiagram(event.gamepad));
  window.addEventListener('gamepaddisconnected', () => syncGamepadDiagram(getConnectedGamepad()));
  window.addEventListener('focus', () => syncGamepadDiagram(getConnectedGamepad()));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncGamepadDiagram(getConnectedGamepad());
  });
  document.getElementById('btnSaveControls').addEventListener('click', persistAll);
  document.getElementById('btnResetControls').addEventListener('click', () => {
    bindings = { ...kbDefaults };
    gamepadBindings = { ...padDefaults };
    cancelListeningSilently();
    renderBindings();
    if (persistAll()) setStatus('Controles predeterminados restaurados y guardados.');
  });

  document.querySelectorAll('.rebind-button').forEach(button => button.addEventListener('click', () => beginKeyboardListening(button.closest('.binding-row').dataset.bindingId)));
  document.querySelectorAll('.pad-rebind-button').forEach(button => button.addEventListener('click', () => beginGamepadListening(button.closest('.gamepad-binding-row').dataset.bindingId)));
  document.querySelectorAll('.keyboard-key[data-key-code]').forEach(button => button.addEventListener('click', () => {
    if (listeningAction) setPending('keyboard', listeningAction, button.dataset.keyCode);
  }));

  window.addEventListener('keydown', event => {
    if (!optionsOpen) return;
    if (captureArmed && listeningAction) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.code === 'Escape') cancelListening();
      else if (validCode(event.code)) setPending('keyboard', listeningAction, event.code);
      return;
    }
    if (captureArmed && listeningPadAction && event.code === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      cancelListening();
      return;
    }
    if (rebindTarget && !captureArmed && event.code === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      cancelListening();
      return;
    }
    if (rebindModal && !rebindModal.hidden && (event.code === 'Enter' || event.code === 'Space')) {
      const button = document.activeElement?.closest('button');
      if (button && rebindModal.contains(button) && !button.disabled) {
        event.preventDefault();
        event.stopImmediatePropagation();
        button.click();
        return;
      }
    }
    if (event.code === 'Tab') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.code === 'Escape') closeOptions();
  }, true);

  window.addEventListener('keyup', event => {
    if (optionsOpen) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  function getConnectedGamepad() {
    if (!navigator.getGamepads) return null;
    return [...navigator.getGamepads()].find(pad => pad && pad.connected) || null;
  }

  function snapshotPad(pad) {
    if (!pad) return { buttons: [], axes: [] };
    return {
      buttons: pad.buttons.map(button => Boolean(button.pressed || button.value > 0.55)),
      axes: pad.axes.map(value => Math.abs(value) > 0.28 ? value : 0)
    };
  }

  function readMenuDirection(pad) {
    if (!pad) return null;
    const dpad = [
      ['up', 12], ['down', 13], ['left', 14], ['right', 15]
    ];
    for (const [direction, index] of dpad) {
      const button = pad.buttons[index];
      if (button && (button.pressed || button.value > 0.55)) return direction;
    }
    const x = pad.axes[0] || 0;
    const y = pad.axes[1] || 0;
    if (Math.max(Math.abs(x), Math.abs(y)) < 0.58) return null;
    if (Math.abs(x) > Math.abs(y)) return x < 0 ? 'left' : 'right';
    return y < 0 ? 'up' : 'down';
  }

  function detectNewPadInput(pad) {
    if (!pad) return null;
    const current = snapshotPad(pad);
    for (let i = 0; i < current.buttons.length; i++) {
      if (current.buttons[i] && !previousPadSnapshot.buttons[i]) {
        previousPadSnapshot = current;
        return `button${i}`;
      }
    }
    for (let i = 0; i < pad.axes.length; i++) {
      const value = pad.axes[i];
      const old = previousPadSnapshot.axes[i] || 0;
      if (Math.abs(value) > 0.68 && Math.abs(old) < 0.35) {
        previousPadSnapshot = current;
        return `axis${i}${value < 0 ? '-' : '+'}`;
      }
    }
    previousPadSnapshot = current;
    return null;
  }

  function inputIsDown(pad, input) {
    if (input.startsWith('button')) {
      const button = pad.buttons[Number(input.slice(6))];
      return Boolean(button && (button.pressed || button.value > 0.45));
    }
    const match = input.match(/^axis([0-3])([+-])$/);
    if (!match) return false;
    const value = pad.axes[Number(match[1])] || 0;
    return match[2] === '-' ? value < -0.28 : value > 0.28;
  }

  function pollGamepad() {
    const pad = getConnectedGamepad();
    syncGamepadDiagram(pad);
    const direction = readMenuDirection(pad);
    const now = performance.now();
    let menuDirection = null;
    if (direction) {
      if (direction !== lastMenuDirection || now - lastMenuDirectionAt >= 260) {
        menuDirection = direction;
        lastMenuDirectionAt = now;
      }
      lastMenuDirection = direction;
    } else {
      lastMenuDirection = null;
    }
    const acceptDown = Boolean(pad?.buttons[0] && (pad.buttons[0].pressed || pad.buttons[0].value > 0.55));
    const backDown = Boolean(pad?.buttons[1] && (pad.buttons[1].pressed || pad.buttons[1].value > 0.55));
    const menuAccept = acceptDown && !previousMenuAccept;
    const menuBack = backDown && !previousMenuBack;
    previousMenuAccept = acceptDown;
    previousMenuBack = backDown;
    if (menuDirection || menuAccept || menuBack) {
      window.dispatchEvent(new CustomEvent('macross:gamepad-menu-input', {
        detail: { direction: menuDirection, accept: menuAccept, back: menuBack }
      }));
    }
    const status = document.getElementById('gamepadStatus');
    if (status) {
      const nextStatus = pad ? `Mando conectado · ${pad.id.replace(/\s+/g, ' ').slice(0, 48)}` : 'Mando desconectado · conecta el control para probarlo.';
      if (!listeningPadAction) status.textContent = nextStatus;
    }
    if (optionsOpen && captureArmed && listeningPadAction) {
      const input = detectNewPadInput(pad);
      if (input) setPending('gamepad', listeningPadAction, input);
    }

    const pressedActions = new Set();
    if (pad && !optionsOpen) {
      const flightMode = currentFlightMode();
      gamepadActionNames.forEach(id => {
        const idMode = modeOf(id);
        if (idMode && flightMode && idMode !== flightMode) return;
        const input = gamepadBindings[id];
        if (input && input !== 'none' && inputIsDown(pad, input)) pressedActions.add(baseOf(id));
      });
    }
    window.dispatchEvent(new CustomEvent('macross:gamepad-frame', { detail: { pressedActions: [...pressedActions] } }));
    previousPadActions = pressedActions;
    requestAnimationFrame(pollGamepad);
  }

  window.gameControls = {
    getBinding: (action, mode) => kbValue(action, mode),
    getActionsForCode: actionsForCode,
    getActionsForCodeAllModes: code => actionsForCode(code, { allModes: true }),
    getStateKey: action => stateKeys[action],
    getActionsForGamepadInput: actionsForPadInput,
    getGamepadBinding: (action, mode) => gamepadBindings[bindingId(action, mode || currentFlightMode() || 'FIGHTER', 'gamepad')],
    getGamepadDiagramType: () => lastDetectedGamepadDiagram,
    keyLabel,
    gamepadLabel: padLabel,
    hasConflicts: hasAnyConflict,
    isOptionsOpen: () => optionsOpen,
    isListening: () => captureArmed,
    openPauseOptions,
    closeOptions,
    refreshTranslations: renderBindings
  };

  renderBindings();
  requestAnimationFrame(pollGamepad);
})();
