const I18N_STORAGE_KEY = 'macrossvoxp-lang-v1';

const I18N_DICT = {
  es: {
    startBtn: 'INICIAR MISIÓN', loadingBtn: 'CARGANDO SISTEMAS...', optionsBtn: 'OPCIONES', mpBtn: 'COMBATE 1 VS 1',
    mapLabel: 'TEATRO DE OPERACIONES', mapBtn1: 'MAPA 1', mapBtn2: 'MAPA 2', mapBtn3: 'MAPA 3',
    map1: '01 // ISLA SOUTH ATARIA', map2: '02 // ÓRBITA DE SATURNO', map3: '03 // MACROSS CITY INTERIOR (DYRL)',
    startHint: 'ENTER / A: ACEPTAR · CRUCETA O STICK: MOVER · B: VOLVER', backBlog: 'Regresar a la Bitácora',
    mpTitle: 'COMBATE 1 VS 1', mpSub: 'DUELO DIRECTO POR CÓDIGO DE SALA · SIN IA', mpNameLbl: 'NOMBRE DE PILOTO:',
    mpCreateTitle: '1. CREAR SALA (HOST)', mpCreateBtn: 'GENERAR CÓDIGO DE SALA', mpCopyBtn: 'COPIAR',
    mpCopyLinkBtn: 'COPIAR LINK DE INVITACIÓN', mpJoinTitle: '2. UNIRSE A SALA (INVITADO)',
    mpJoinPh: 'CÓDIGO O LINK (EJ: AR-4829)', mpJoinBtn: 'CONECTAR AL RIVAL',
    mpStatusInit: 'Ingresa tu nombre y crea una sala o pega el código de tu rival.',
    mpFooterNote: 'El mapa elegido en el menú principal será usado por el creador de la sala.', backMenu: 'VOLVER AL MENÚ',
    optTitle: 'OPCIONES', optSub: 'VF-1A VALKYRIE // CONFIGURACIÓN DE CONTROLES',
    tabControls: 'CONTROLES', tabAudio: 'SONIDO Y MÚSICA', tabGame: 'JUEGO',
    tabKeyboard: 'TECLADO COMPLETO', tabGamepad: 'MANDO',
    kbTitle: 'TECLADO DE PC // ASIGNACIONES ILUMINADAS', bindTitle: 'ASIGNACIONES POR CONTEXTO',
    bindHelp: 'Pulsa CAMBIAR y luego la nueva tecla, o selecciónala en el esquema.',
    gpTitle: 'MANDO // ASIGNACIONES CONFIGURABLES', gpHelp: 'Selecciona CAMBIAR y presiona el botón o mueve el eje.',
    rebindBtn: 'CAMBIAR', btnReset: 'RESTAURAR PREDETERMINADOS', btnSave: 'GUARDAR CONFIGURACIÓN',
    btnContinue: 'CONTINUAR JUGANDO', btnExitTitle: 'SALIR AL MENÚ PRINCIPAL',
    audioTitle: 'SONIDO Y MÚSICA', audioHelp: 'Ajusta el volumen y prueba las pistas antes de iniciar la misión.',
    sfxLbl: 'EFECTOS', bgmLbl: 'MÚSICA', testerLbl: 'REPRODUCTOR DE PRUEBA',
    trackMenu: 'Música del menú', trackMission: 'Música de la misión',
    hudTitle: 'ESTILO DE HUD // COCKPIT',
    hudHelp: 'Elige entre la cabina táctica completa (Simulador) o la vista directa con asistencia de Gunpod en Gerwalk y Battroid (Arcade PS2).',
    hudLabel: 'MODO DE INTERFAZ', hudOptSim: 'Simulador', hudOptArc: 'Arcade',
    langTitle: 'IDIOMA // LANGUAGE', langHelp: 'Detecta automáticamente el idioma de tu navegador o elige uno manualmente.',
    langLabel: 'IDIOMA DE INTERFAZ', langAuto: 'Automático (Navegador)',
    todTitle: 'HORA DEL DÍA · MAPA 1', todHelp: 'Elige si South Ataria sigue la hora local de tu PC o si prefieres fijar el momento.',
    todLabel: 'SISTEMA HORARIO', todReal: 'Hora real del PC', todMorning: 'Mañana', todMidday: 'Mediodía', todAfternoon: 'Tarde', todNight: 'Noche',
    todNote: 'La selección se guarda automáticamente para la próxima partida.',
    optGlobalFoot: 'Controles: cambios al instante · Mando: cruceta o stick mueve, A acepta y B vuelve.',
    grpFlight: 'VUELO', grpTransform: 'TRANSFORMACIÓN', grpAttack: 'ATAQUE', grpSystems: 'SISTEMAS', grpCamera: 'CÁMARA', grpMenu: 'MENÚ Y MISIÓN',
    optTag: 'U.N. SPACY // SISTEMA DE VUELO', mpTag: 'U.N. SPACY // ENLACE P2P WEBRTC',
    legFlight: 'Vuelo', legTransform: 'Transformación', legAttack: 'Ataque', legSystems: 'Sistemas', legMenu: 'Menú', legListen: 'En edición',
    audioStatusInit: 'Reproductor de prueba · inicia la reproducción cuando quieras.'
  },
  en: {
    startBtn: 'START MISSION', loadingBtn: 'LOADING SYSTEMS...', optionsBtn: 'OPTIONS', mpBtn: '1 VS 1 COMBAT',
    mapLabel: 'THEATER OF OPERATIONS', mapBtn1: 'MAP 1', mapBtn2: 'MAP 2', mapBtn3: 'MAP 3',
    map1: '01 // SOUTH ATARIA ISLAND', map2: '02 // SATURN ORBIT', map3: '03 // MACROSS CITY INTERIOR (DYRL)',
    startHint: 'ENTER / A: ACCEPT · D-PAD OR STICK: MOVE · B: BACK', backBlog: 'Back to Logbook',
    mpTitle: '1 VS 1 COMBAT', mpSub: 'DIRECT ROOM CODE DUEL · NO AI', mpNameLbl: 'PILOT NAME:',
    mpCreateTitle: '1. CREATE ROOM (HOST)', mpCreateBtn: 'GENERATE ROOM CODE', mpCopyBtn: 'COPY',
    mpCopyLinkBtn: 'COPY INVITE LINK', mpJoinTitle: '2. JOIN ROOM (GUEST)',
    mpJoinPh: 'CODE OR LINK (EX: US-4829)', mpJoinBtn: 'CONNECT TO RIVAL',
    mpStatusInit: 'Enter your pilot name and create a room or paste your rival code.',
    mpFooterNote: 'The map selected by the host will be used for the match.', backMenu: 'BACK TO MENU',
    optTitle: 'OPTIONS', optSub: 'VF-1A VALKYRIE // CONTROL CONFIGURATION',
    tabControls: 'CONTROLS', tabAudio: 'SOUND & MUSIC', tabGame: 'GAME',
    tabKeyboard: 'FULL KEYBOARD', tabGamepad: 'GAMEPAD',
    kbTitle: 'PC KEYBOARD // HIGHLIGHTED BINDINGS', bindTitle: 'CONTEXT BINDINGS',
    bindHelp: 'Click CHANGE and press the new key, or select it on the keyboard layout.',
    gpTitle: 'GAMEPAD // CONFIGURABLE BINDINGS', gpHelp: 'Click CHANGE and press a button or move an axis.',
    rebindBtn: 'CHANGE', btnReset: 'RESTORE DEFAULTS', btnSave: 'SAVE SETTINGS',
    btnContinue: 'RESUME GAME', btnExitTitle: 'EXIT TO MAIN MENU',
    audioTitle: 'SOUND & MUSIC', audioHelp: 'Adjust volume levels and preview tracks before starting.',
    sfxLbl: 'SFX', bgmLbl: 'MUSIC', testerLbl: 'SOUND TESTER',
    trackMenu: 'Menu Theme', trackMission: 'Mission Theme',
    hudTitle: 'HUD STYLE // COCKPIT',
    hudHelp: 'Choose between full tactical cockpit (Simulator) or streamlined view with Gunpod lock assist in Gerwalk & Battroid (Arcade PS2).',
    hudLabel: 'INTERFACE MODE', hudOptSim: 'Simulator', hudOptArc: 'Arcade',
    langTitle: 'LANGUAGE // IDIOMA', langHelp: 'Automatically detects your browser language or lets you choose manually.',
    langLabel: 'INTERFACE LANGUAGE', langAuto: 'Automatic (Browser)',
    todTitle: 'TIME OF DAY · MAP 1', todHelp: 'Choose whether South Ataria follows your local PC clock or a fixed time.',
    todLabel: 'TIME SYSTEM', todReal: 'Local PC Time', todMorning: 'Morning', todMidday: 'Midday', todAfternoon: 'Afternoon', todNight: 'Night',
    todNote: 'Selection is saved automatically for your next session.',
    optGlobalFoot: 'Controls: instant changes · Gamepad: D-pad/Stick moves, A accepts, B goes back.',
    grpFlight: 'FLIGHT', grpTransform: 'TRANSFORMATION', grpAttack: 'ATTACK', grpSystems: 'SYSTEMS', grpCamera: 'CAMERA', grpMenu: 'MENU & MISSION',
    optTag: 'U.N. SPACY // FLIGHT SYSTEM', mpTag: 'U.N. SPACY // WEBRTC P2P LINK',
    legFlight: 'Flight', legTransform: 'Transformation', legAttack: 'Attack', legSystems: 'Systems', legMenu: 'Menu', legListen: 'Listening',
    audioStatusInit: 'Sound tester · start playback whenever you want.'
  },
  zh: {
    startBtn: '开始任务', loadingBtn: '系统加载中...', optionsBtn: '选项设置', mpBtn: '1 VS 1 对战',
    mapLabel: '作战区域', mapBtn1: '地图 1', mapBtn2: '地图 2', mapBtn3: '地图 3',
    map1: '01 // 南阿塔利亚岛', map2: '02 // 土星轨道', map3: '03 // 麦克罗斯市内部 (DYRL)',
    startHint: 'ENTER / A: 确认 · 十字键/摇杆: 移动 · B: 返回', backBlog: '返回日志主页',
    mpTitle: '1 VS 1 在线对战', mpSub: '房间代码直连决斗 · 无AI', mpNameLbl: '飞行员代号:',
    mpCreateTitle: '1. 创建房间 (房主)', mpCreateBtn: '生成房间代码', mpCopyBtn: '复制',
    mpCopyLinkBtn: '复制邀请链接', mpJoinTitle: '2. 加入房间 (访客)',
    mpJoinPh: '输入代码或链接 (例: CN-4829)', mpJoinBtn: '连接对手',
    mpStatusInit: '输入代号并创建房间，或粘贴对手的房间代码。',
    mpFooterNote: '对战将使用房主选择的作战地图。', backMenu: '返回主菜单',
    optTitle: '选项', optSub: 'VF-1A VALKYRIE // 操作控制配置',
    tabControls: '按键控制', tabAudio: '音效与音乐', tabGame: '游戏设置',
    tabKeyboard: '完整键盘', tabGamepad: '手柄设置',
    kbTitle: 'PC键盘 // 已分配按键高亮', bindTitle: '情境按键分配',
    bindHelp: '点击“更改”后按下新按键，或直接在键盘图上选择。',
    gpTitle: '手柄 // 可自定义按键', gpHelp: '点击“更改”后按下手柄按键或推动摇杆。',
    rebindBtn: '更改', btnReset: '恢复默认', btnSave: '保存设置',
    btnContinue: '继续游戏', btnExitTitle: '返回主菜单',
    audioTitle: '音效与音乐', audioHelp: '在开始任务前调整音量并试听音轨。',
    sfxLbl: '音效', bgmLbl: '音乐', testerLbl: '试听播放器',
    trackMenu: '主菜单音乐', trackMission: '任务战斗音乐',
    hudTitle: 'HUD 界面风格 // COCKPIT',
    hudHelp: '选择完整战术座舱（模拟模式）或带有 Gerwalk/Battroid 机炮辅助锁定的简洁视图（街机 PS2 模式）。',
    hudLabel: '界面模式', hudOptSim: '模拟模式', hudOptArc: '街机模式',
    langTitle: '语言 // LANGUAGE', langHelp: '自动检测浏览器语言或手动选择界面语言。',
    langLabel: '界面语言', langAuto: '自动 (浏览器语言)',
    todTitle: '昼夜时间 · 地图 1', todHelp: '选择南阿塔利亚岛跟随电脑本地时间或固定时段。',
    todLabel: '时间系统', todReal: '电脑本地时间', todMorning: '早晨', todMidday: '正午', todAfternoon: '傍晚', todNight: '夜晚',
    todNote: '所选设置将自动保存至下次游戏。',
    optGlobalFoot: '控制设置即时生效 · 手柄: 方向键移动，A确认，B返回。',
    grpFlight: '飞行控制', grpTransform: '形态变形', grpAttack: '武器攻击', grpSystems: '系统功能', grpCamera: '视角镜头', grpMenu: '菜单与任务',
    optTag: 'U.N. SPACY // 飞行系统', mpTag: 'U.N. SPACY // WEBRTC 直连',
    legFlight: '飞行', legTransform: '变形', legAttack: '攻击', legSystems: '系统', legMenu: '菜单', legListen: '编辑中',
    audioStatusInit: '试听播放器 · 随时点击播放测试音效。'
  },

  ja: {
    startBtn: 'ミッション開始', loadingBtn: 'システム読込中...', optionsBtn: 'オプション', mpBtn: '1 VS 1 対戦',
    mapLabel: '作戦エリア', mapBtn1: 'マップ 1', mapBtn2: 'マップ 2', mapBtn3: 'マップ 3',
    map1: '01 // 南アタリア島', map2: '02 // 土星軌道', map3: '03 // マクロス・シティ内部 (DYRL)',
    startHint: 'ENTER / A: 決定 · 十字キー/スティック: 移動 · B: 戻る', backBlog: 'ログブックへ戻る',
    mpTitle: '1 VS 1 オンライン対戦', mpSub: 'ルームコード直接通信デュエル · AIなし', mpNameLbl: 'パイロット名:',
    mpCreateTitle: '1. ルーム作成 (ホスト)', mpCreateBtn: 'ルームコード生成', mpCopyBtn: 'コピー',
    mpCopyLinkBtn: '招待リンクをコピー', mpJoinTitle: '2. ルーム参加 (ゲスト)',
    mpJoinPh: 'コードまたはURL (例: JP-4829)', mpJoinBtn: 'ライバルに接続',
    mpStatusInit: 'パイロット名を入力し、ルームを作成するかコードを入力してください。',
    mpFooterNote: 'ホストが選択したマップで対戦が開始されます。', backMenu: 'メニューに戻る',
    optTitle: 'オプション', optSub: 'VF-1A VALKYRIE // コントロール設定',
    tabControls: '操作設定', tabAudio: 'サウンド・BGM', tabGame: 'ゲーム設定',
    tabKeyboard: 'キーボード', tabGamepad: 'ゲームパッド',
    kbTitle: 'PCキーボード // 割り当てキー表示', bindTitle: 'コンテキスト別キー割り当て',
    bindHelp: '「変更」を押してから新しいキーを入力するか、キーボード図から選択してください。',
    gpTitle: 'ゲームパッド // ボタン割り当て設定', gpHelp: '「変更」を押してからボタンまたはスティックを入力してください。',
    rebindBtn: '変更', btnReset: '初期設定に戻す', btnSave: '設定を保存',
    btnContinue: 'ゲームを再開', btnExitTitle: 'タイトルへ戻る',
    audioTitle: 'サウンド・BGM', audioHelp: 'ミッション開始前に音量調整とサウンドテストが行えます。',
    sfxLbl: '効果音', bgmLbl: 'BGM', testerLbl: 'サウンドテスト',
    trackMenu: 'メニューBGM', trackMission: 'ミッションBGM',
    hudTitle: 'HUD スタイル // COCKPIT',
    hudHelp: 'フル機能コックピット（シミュレーター）か、ガウォーク・バトロイド時のガンポッド補正付きシンプル表示（アーケードPS2）を選択します。',
    hudLabel: 'インターフェースモード', hudOptSim: 'シミュレーター', hudOptArc: 'アーケード',
    langTitle: '言語 // LANGUAGE', langHelp: 'ブラウザの言語を自動検出するか、手動で選択できます。',
    langLabel: '表示言語', langAuto: '自動 (ブラウザ設定)',
    todTitle: '時間帯設定 · マップ 1', todHelp: '南アタリア島の時間帯をPCの現在時刻にするか固定するか選択します。',
    todLabel: '時間システム', todReal: 'PCの現在時刻', todMorning: '朝', todMidday: '昼', todAfternoon: '夕方', todNight: '夜',
    todNote: '設定は次回プレイ時にも自動的に保存されます。',
    optGlobalFoot: '操作は即時反映 · パッド: 十字キーで移動、Aで決定、Bで戻る。',
    grpFlight: 'フライト操作', grpTransform: '三段変形', grpAttack: '攻撃・武装', grpSystems: 'システム', grpCamera: 'カメラ視点', grpMenu: 'メニュー・任務',
    optTag: 'U.N. SPACY // フライトシステム', mpTag: 'U.N. SPACY // WEBRTC P2P通信',
    legFlight: 'フライト', legTransform: '変形', legAttack: '攻撃', legSystems: 'システム', legMenu: 'メニュー', legListen: '入力待機',
    audioStatusInit: 'サウンドテスト · いつでも再生テストが可能です。'
  }
};
const I18N_ACTIONS = {
  moveForward: { es: 'Avanzar / empuje', en: 'Forward / Throttle Up', zh: '前进 / 增加推力', ja: '前進 / スロットル上昇' },
  moveBack: { es: 'Retroceder / reducir empuje', en: 'Backward / Throttle Down', zh: '后退 / 降低推力', ja: '後退 / スロットル低下' },
  moveLeft: { es: 'Lateral / guiñada izq.', en: 'Strafe / Yaw Left', zh: '左平移 / 左偏航', ja: '左移動 / 左ヨー旋回' },
  moveRight: { es: 'Lateral / guiñada der.', en: 'Strafe / Yaw Right', zh: '右平移 / 右偏航', ja: '右移動 / 右ヨー旋回' },
  turnLeft: { es: 'Rotación / giro izq.', en: 'Roll / Turn Left', zh: '左翻滚 / 左转向', ja: '左ロール / 左旋回' },
  turnRight: { es: 'Rotación / giro der.', en: 'Roll / Turn Right', zh: '右翻滚 / 右转向', ja: '右ロール / 右旋回' },
  verticalUp: { es: 'Subir / cabeceo', en: 'Ascend / Pitch Up', zh: '爬升 / 机头上仰', ja: '上昇 / ピッチアップ' },
  verticalDown: { es: 'Bajar / cabeceo', en: 'Descend / Pitch Down', zh: '下降 / 机头下俯', ja: '下降 / ピッチダウン' },
  gerwalkUp: { es: 'Subir en Gerwalk', en: 'Ascend (Gerwalk)', zh: 'Gerwalk爬升', ja: 'ガウォーク上昇' },
  gerwalkDown: { es: 'Bajar en Gerwalk', en: 'Descend (Gerwalk)', zh: 'Gerwalk下降', ja: 'ガウォーク下降' },
  turbo: { es: 'Turbo (mantener)', en: 'Boost / Afterburner (Hold)', zh: '涡轮加速 (按住)', ja: 'ブースト / アフターバーナー (長押し)' },
  reverse: { es: 'Reversa (Gerwalk)', en: 'Quick Reverse (Gerwalk)', zh: '快速倒飞 (Gerwalk)', ja: '急後退 (ガウォーク)' },
  slowdown: { es: 'Desacelerar adicional', en: 'Extra Deceleration', zh: '额外减速', ja: '追加減速' },
  strafeLeft: { es: 'Lateral / guiñada izq.', en: 'Strafe / Yaw Left', zh: '左平移 / 左偏航', ja: '左ストライフ / ヨー' },
  strafeRight: { es: 'Lateral / guiñada der.', en: 'Strafe / Yaw Right', zh: '右平移 / 右偏航', ja: '右ストライフ / ヨー' },
  descend: { es: 'Descenso adicional', en: 'Extra Descend', zh: '额外下降', ja: '追加下降' },
  fighter: { es: 'Modo Fighter', en: 'Fighter Mode', zh: 'Fighter 战机形态', ja: 'ファイター形態' },
  gerwalk: { es: 'Modo Gerwalk', en: 'Gerwalk Mode', zh: 'Gerwalk 半人形形态', ja: 'ガウォーク形態' },
  battroid: { es: 'Modo Battroid', en: 'Battroid Mode', zh: 'Battroid 机器人形态', ja: 'バトロイド形態' },
  transformPrevious: { es: 'Transformación anterior', en: 'Previous Transformation', zh: '上一变形形态', ja: '前の形態へ変形' },
  transformNext: { es: 'Transformación siguiente', en: 'Next Transformation', zh: '下一变形形态', ja: '次の形態へ変形' },
  gunpod: { es: 'Disparo Gunpod', en: 'Fire Gunpod GU-11', zh: '射击 Gunpod 机炮', ja: 'ガンポッド射撃' },
  melee: { es: 'Golpe cuerpo a cuerpo', en: 'Melee Strike (Battroid)', zh: '近战格斗重击', ja: '格闘攻撃 (バトロイド)' },
  missiles: { es: 'Lanzar micro-misiles', en: 'Launch Micro-Missiles', zh: '发射微型导弹', ja: 'マイクロミサイル発射' },
  missileType: { es: 'Cambiar tipo de misil', en: 'Switch Missile Type', zh: '切换导弹类型', ja: 'ミサイル種別切替' },
  tracking: { es: 'Auto-rastreo (Battroid)', en: 'Auto-Tracking (Battroid)', zh: '自动锁定追踪 (Battroid)', ja: 'オート追尾 (バトロイド)' },
  targetLock: { es: 'Fijar objetivos (Battroid)', en: 'Target Lock Hold (Battroid)', zh: '按住锁定目标 (Battroid)', ja: 'ターゲットロック維持 (バトロイド)' },
  chaff: { es: 'Chaff / Flares (contramedidas)', en: 'Chaff / Flares (Countermeasures)', zh: '箔条/热诱弹 (干扰弹)', ja: 'チャフ / フレア (対ミサイル)' },
  brake: { es: 'Frenado total', en: 'Full Stop Brake', zh: '完全急停制动', ja: 'フルストップ制動' },
  pause: { es: 'Pausa', en: 'Pause', zh: '暂停游戏', ja: 'ポーズ' },
  music: { es: 'Música', en: 'Toggle Music', zh: '切换音乐', ja: 'BGMオン/オフ' },
  advanceTime: { es: 'Adelantar reloj', en: 'Advance Clock (+2h)', zh: '快进时间 (+2小时)', ja: '時計を進める (+2時間)' },
  cameraMissiles: { es: 'Vista de misiles entrantes', en: 'Incoming Missiles View', zh: '来袭导弹视角', ja: '接近ミサイル視点' },
  cameraEnemy: { es: 'Vista de enemigo cercano', en: 'Closest Enemy View', zh: '最近敌机视角', ja: '最寄り敵機視点' },
  cameraLeft: { es: 'Cámara a la izquierda', en: 'Camera Left', zh: '视角向左', ja: 'カメラ左' },
  cameraRight: { es: 'Cámara a la derecha', en: 'Camera Right', zh: '视角向右', ja: 'カメラ右' },
  startMission: { es: 'Iniciar misión', en: 'Start Mission', zh: '开始任务', ja: 'ミッション開始' },
  returnMenu: { es: 'Volver al inicio', en: 'Return to Title', zh: '返回主界面', ja: 'タイトルへ戻る' },
  restartAfterDefeat: { es: 'Reiniciar tras derrota', en: 'Restart After Defeat', zh: '战败后重新开始', ja: '撃墜後にリスタート' },
  menuAfterDefeat: { es: 'Menú tras derrota', en: 'Menu After Defeat', zh: '战败后返回菜单', ja: '撃墜後にメニューへ' }
};
let activeLang = 'es';

function resolveInitialLang() {
  try {
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    if (saved && I18N_DICT[saved]) return saved;
  } catch (e) {}
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ja')) return 'ja';
  return 'en';
}

function t(key) {
  return (I18N_DICT[activeLang] && I18N_DICT[activeLang][key]) || I18N_DICT.es[key] || key;
}

function applyTranslations(langCode) {
  activeLang = I18N_DICT[langCode] ? langCode : resolveInitialLang();
  document.documentElement.lang = activeLang;

  if (typeof MAP_TITLES !== 'undefined') {
    MAP_TITLES.MAPA_1 = t('map1');
    MAP_TITLES.MAPA_2 = t('map2');
    MAP_TITLES.MAPA_3 = t('map3');
  }

  const setTxt = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = t(key); };
  const setSel = (sel, key) => { const el = document.querySelector(sel); if (el) el.textContent = t(key); };

  const startBtn = document.getElementById('btnStartGame');
  if (startBtn) startBtn.textContent = startBtn.disabled ? t('loadingBtn') : t('startBtn');
  setTxt('btnOptions', 'optionsBtn');
  setTxt('btnMultiplayer', 'mpBtn');
  setSel('.map-selector-label', 'mapLabel');
  setSel('[data-map="MAPA_1"]', 'mapBtn1');
  setSel('[data-map="MAPA_2"]', 'mapBtn2');
  setSel('[data-map="MAPA_3"]', 'mapBtn3');
  const selMap = document.getElementById('selectedMapTitle');
  if (selMap && typeof selectedMapId !== 'undefined') selMap.textContent = t(selectedMapId === 'MAPA_2' ? 'map2' : (selectedMapId === 'MAPA_3' ? 'map3' : 'map1'));
  setSel('.start-hint', 'startHint');
  setTxt('btnBitacora', 'backBlog');
  setTxt('mpTitle', 'mpTitle');
  setSel('#multiplayerScreen .options-tag', 'mpTag');
  setSel('#multiplayerScreen .options-subtitle', 'mpSub');
  setSel('label[for="mpPilotName"]', 'mpNameLbl');
  setTxt('btnCreateRoom', 'mpCreateBtn');
  setTxt('btnCopyRoomCode', 'mpCopyBtn');
  setTxt('btnCopyRoomLink', 'mpCopyLinkBtn');
  setTxt('btnJoinRoom', 'mpJoinBtn');
  setTxt('mpStatusText', 'mpStatusInit');
  setTxt('btnBackMp', 'backMenu');
  setSel('#multiplayerScreen .options-footer span', 'mpFooterNote');

  const mpBoxes = document.querySelectorAll('#multiplayerScreen > section > div:nth-of-type(2) > div > div:first-child');
  if (mpBoxes[0]) mpBoxes[0].textContent = t('mpCreateTitle');
  if (mpBoxes[1]) mpBoxes[1].textContent = t('mpJoinTitle');

  const mpMapSel = document.getElementById('mpMapSelect');
  if (mpMapSel && mpMapSel.options.length >= 3) {
    mpMapSel.options[0].textContent = t('map1');
    mpMapSel.options[1].textContent = t('map2');
    mpMapSel.options[2].textContent = t('map3');
  }
  const cBadge = document.getElementById('mpCountryBadge');
  if (cBadge && typeof mpState !== 'undefined') {
    const regPrefix = activeLang === 'en' ? 'REGION: ' : (activeLang === 'zh' ? '地区: ' : (activeLang === 'ja' ? '地域: ' : 'REGIÓN: '));
    cBadge.textContent = regPrefix + mpState.country;
  }
  const codeIn = document.getElementById('mpRoomCodeIn');
  if (codeIn) codeIn.placeholder = t('mpJoinPh');

  setTxt('optionsTitle', 'optTitle');
  setSel('#optionsScreen .options-tag', 'optTag');
  setSel('#optionsScreen .options-subtitle', 'optSub');
  setSel('[data-options-category="controlsOptions"]', 'tabControls');
  setSel('[data-options-category="audioOptions"]', 'tabAudio');
  setSel('[data-options-category="gameOptions"]', 'tabGame');
  setTxt('keyboardTab', 'tabKeyboard');
  setTxt('gamepadTab', 'tabGamepad');
  setTxt('keyboardTitle', 'kbTitle');
  setTxt('bindingsTitle', 'bindTitle');
  setSel('.bindings-section .options-help', 'bindHelp');
  setTxt('gamepadTitle', 'gpTitle');
  setSel('.gamepad-section .options-help', 'gpHelp');
  setTxt('btnResetControls', 'btnReset');
  setTxt('btnSaveControls', 'btnSave');
  setTxt('btnContinueGame', 'btnContinue');
  setTxt('btnExitToTitle', 'btnExitTitle');
  setTxt('btnBackOptions', 'backMenu');
  setSel('.options-global-footer span', 'optGlobalFoot');

  const legItems = document.querySelectorAll('.key-legend span');
  const legKeys = ['legFlight', 'legTransform', 'legAttack', 'legSystems', 'legMenu', 'legListen'];
  legItems.forEach((span, idx) => {
    const dot = span.querySelector('.legend-dot');
    if (dot && legKeys[idx]) {
      span.textContent = t(legKeys[idx]);
      span.prepend(dot);
    }
  });

  setSel('#audioOptions .options-section-title', 'audioTitle');
  setSel('#audioOptions .options-help', 'audioHelp');
  setTxt('audioStatus', 'audioStatusInit');
  const sliders = document.querySelectorAll('#audioOptions .audio-slider-box span');
  if (sliders[0]) sliders[0].textContent = t('sfxLbl');
  if (sliders[1]) sliders[1].textContent = t('bgmLbl');
  setSel('label[for="soundTestTrack"]', 'testerLbl');
  const trackSel = document.getElementById('soundTestTrack');
  if (trackSel && trackSel.options.length >= 2) {
    trackSel.options[0].textContent = t('trackMenu');
    trackSel.options[1].textContent = t('trackMission');
  }

  setTxt('hudModeSectionTitle', 'hudTitle');
  setTxt('hudModeSectionHelp', 'hudHelp');
  setTxt('hudModeSelectLabel', 'hudLabel');
  const hudModeSel = document.getElementById('hudStyleModeSelect');
  if (hudModeSel && hudModeSel.options.length >= 2) {
    hudModeSel.options[0].textContent = t('hudOptSim');
    hudModeSel.options[1].textContent = t('hudOptArc');
  }

  setTxt('i18nSectionTitle', 'langTitle');
  setTxt('i18nSectionHelp', 'langHelp');
  setTxt('i18nSelectLabel', 'langLabel');
  const langSel = document.getElementById('languageModeSelect');
  if (langSel && langSel.options.length >= 1) langSel.options[0].textContent = t('langAuto');

  const gameTitles = document.querySelectorAll('#gameOptions .options-section-title');
  const gameHelps = document.querySelectorAll('#gameOptions .options-help');
  if (gameTitles.length >= 1) gameTitles[gameTitles.length - 1].textContent = t('todTitle');
  if (gameHelps.length >= 1) gameHelps[gameHelps.length - 1].textContent = t('todHelp');

  setSel('label[for="timeOfDayMode"] span', 'todLabel');
  const todSel = document.getElementById('timeOfDayMode');
  if (todSel && todSel.options.length >= 5) {
    todSel.options[0].textContent = t('todReal');
    todSel.options[1].textContent = t('todMorning');
    todSel.options[2].textContent = t('todMidday');
    todSel.options[3].textContent = t('todAfternoon');
    todSel.options[4].textContent = t('todNight');
  }
  setSel('.time-of-day-note', 'todNote');

  document.querySelectorAll('.group-flight').forEach(el => { el.textContent = t('grpFlight'); });
  document.querySelectorAll('.group-transform').forEach(el => { el.textContent = t('grpTransform'); });
  document.querySelectorAll('.group-attack').forEach(el => { el.textContent = t('grpAttack'); });
  document.querySelectorAll('.group-systems').forEach(el => { el.textContent = t('grpSystems'); });
  document.querySelectorAll('.group-menu').forEach(el => { el.textContent = t('grpMenu'); });
  document.querySelectorAll('.rebind-button, .pad-rebind-button').forEach(el => { el.textContent = t('rebindBtn'); });
  document.querySelectorAll('[data-action], [data-pad-action]').forEach(row => {
    const act = row.dataset.action || row.dataset.padAction;
    const span = row.querySelector(':scope > span');
    if (span && I18N_ACTIONS[act] && I18N_ACTIONS[act][activeLang]) {
      const small = span.querySelector('.binding-scope');
      if (small) small.style.display = activeLang === 'es' ? '' : 'none';
      span.textContent = I18N_ACTIONS[act][activeLang];
      if (small) span.appendChild(small);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const initLang = resolveInitialLang();
  applyTranslations(initLang);
  setTimeout(() => applyTranslations(activeLang), 120);

  const langSel = document.getElementById('languageModeSelect');
  if (langSel) {
    try { langSel.value = localStorage.getItem(I18N_STORAGE_KEY) || 'auto'; } catch (e) {}
    langSel.addEventListener('change', () => {
      const val = langSel.value;
      try {
        if (val === 'auto') localStorage.removeItem(I18N_STORAGE_KEY);
        else localStorage.setItem(I18N_STORAGE_KEY, val);
      } catch (e) {}
      applyTranslations(val === 'auto' ? resolveInitialLang() : val);
    });
  }
});
